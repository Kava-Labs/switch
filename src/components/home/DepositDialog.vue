<template>
  <section class="dialog-container">
    <div class="backdrop" @click="cancelDeposit"></div>
    <transition name="prompt2" mode="out-in" appear>
      <section v-if="feeEstimate" class="deposit-dialog dialog">
        <header class="deposit-dialog__header">Deposit</header>
        <main>
          <p class="deposit-dialog__custody-notice">
            Deposit funds onto your card to enable swapping and instant
            streaming payments.
          </p>
          <p
            class="deposit-dialog__custody-notice deposit-dialog__custody-notice--bold"
          >
            Only you have access to these funds.
          </p>
          <AmountInput
            class="deposit-dialog__amount-input"
            :amount="depositAmount"
            :amount-usd="helperText"
            :asset-code="uplink.unit().symbol"
            :focused="true"
            @input="handleDepositAmountInput"
          />
        </main>
        <footer class="deposit-dialog__actions">
          <m-button
            class="deposit-dialog__actions__cancel-button"
            @click="cancelDeposit"
            >Cancel</m-button
          >
          <m-button
            class="deposit-dialog__actions__accept-button"
            raised
            @click="acceptDeposit"
            >Deposit</m-button
          >
        </footer>
      </section>
    </transition>
    <transition name="fade" mode="out-in" appear>
      <div v-if="!feeEstimate" class="spinner" />
    </transition>
  </section>
</template>

<script>
import Vue from 'vue'
import BigNumber from 'bignumber.js'
import AmountInput from '@/components/swap/AmountInput.vue'
import { convert, usd } from '@kava-labs/crypto-rate-utils'

const MAX_DEPOSIT_AMOUNT = usd(10)

export default {
  components: { AmountInput },
  props: {
    routeInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      depositAmount: null,
      feeEstimate: null
    }
  },
  computed: {
    uplink() {
      return this.$store.state.uplinks.find(
        uplink => uplink.id === this.routeInfo.id
      )
    },
    helperText() {
      const showHelperText =
        this.depositAmount &&
        !new BigNumber(this.depositAmount).isNaN() &&
        new BigNumber(this.depositAmount).isGreaterThan(0) &&
        this.feeEstimate
      if (!showHelperText) {
        return null
      }

      const usdAmount = convert(
        this.uplink.unit(this.depositAmount),
        usd(),
        this.$store.getters.rateApi
      ).toFixed(2, BigNumber.ROUND_CEIL)

      const feeEstimate = convert(
        this.uplink.unit(this.feeEstimate),
        usd(),
        this.$store.getters.rateApi
      ).toFixed(4, BigNumber.ROUND_CEIL)

      return '$' + usdAmount + ' + $' + feeEstimate + ' fee*'
    }
  },
  async created() {
    // Generate a fee esimate as if we were depositing
    const amount = convert(
      usd(1),
      this.uplink.unit(),
      this.$store.getters.rateApi
    ).decimalPlaces(this.uplink.unit().exchangeUnit, BigNumber.ROUND_DOWN)

    this.feeEstimate = await new Promise((resolve, reject) => {
      this.$store.state.api
        .deposit({
          uplink: this.uplink.getInternal(),
          amount,
          authorize: ({ fee }) => {
            resolve(fee)
            return Promise.reject()
          }
        })
        .then(reject, reject)
    }).catch(err => {
      this.$store.commit('SHOW_TOAST', 'Failed to estimate fee for deposit')
      this.cancelDeposit()
    })
  },
  methods: {
    handleDepositAmountInput(input) {
      // Allow the fields to be cleared
      if (input.length === 0) {
        this.depositAmount = null
      }

      // Ensure correct formatting & positive
      // Prepend "0" to input so BigNumber parses "." as valid
      let parsedInput = new BigNumber('0' + input)
      if (parsedInput.isNaN() || parsedInput.isLessThan(0)) {
        return
      }

      let depositAmount = parsedInput

      // Calculate max source amount and reduce all values
      const maxDeposit = convert(
        MAX_DEPOSIT_AMOUNT,
        this.uplink.unit(),
        this.$store.getters.rateApi
      )
      if (depositAmount.isGreaterThan(maxDeposit)) {
        this.$store.commit('SHOW_TOAST', 'Maximum deposit is $10')
        depositAmount = maxDeposit
      }

      // Truncate the amounts
      // (Must be done last so have full precision to convert between them)
      depositAmount = depositAmount.decimalPlaces(
        this.uplink.assetScale,
        BigNumber.ROUND_DOWN
      )

      // *Only* update the source amount if we changed it (otherwise use the existing text)
      this.depositAmount = depositAmount.isEqualTo(parsedInput)
        ? input
        : depositAmount.toString()
    },
    acceptDeposit() {
      if (new BigNumber(this.depositAmount).isZero()) {
        return
      }

      const uplinkId = this.uplink.id
      this.uplink.activeDeposit = this.$store.state.api
        .deposit({
          uplink: this.uplink.getInternal(),
          amount: new BigNumber(this.depositAmount)
        })
        .then(() => {
          this.$store.commit('SHOW_TOAST', 'Successfully deposited funds')
        })
        .catch(err => {
          this.$store.commit('SHOW_TOAST', 'Failed to deposit')
        })
        .finally(() => {
          this.$store.commit('END_DEPOSIT', uplinkId)
        })

      this.cancelDeposit()
    },
    cancelDeposit() {
      this.$store.commit('NAVIGATE_TO', {
        name: 'home',
        meta: 'select-source-uplink'
      })
    }
  }
}
</script>

<style lang="scss">
.spinner {
  position: absolute;
  z-index: 15;
  width: 64px;
  height: 64px;
  margin: 20px auto;
  box-sizing: border-box;
  border-radius: 50%;
  border: 6px solid $secondary-100;
  border-left: 6px solid $secondary;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.dialog-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.deposit-dialog {
  width: 420px;
  padding: 40px;
  box-sizing: border-box;
  position: absolute;
  z-index: 20;
  background: white;
  border-radius: $card-radii;
  transform: scale(1);
  box-shadow: $card-shadow;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;

  // TODO Share this betweeen swap screen, too
  &__header {
    margin: 0 0 10px 0;
    font-weight: 300;
    font-size: 36px;
    letter-spacing: 0;
    user-select: none;
    text-align: center;
  }

  &__actions {
    align-self: flex-end;
    flex-grow: 1;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;
    align-items: flex-end;

    &__cancel-button {
      margin-right: 20px;
    }
  }

  &__custody-notice {
    margin: 0 0 10px 0;
    color: $text-black-medium-emphasis;

    &--bold {
      font-weight: 500;
    }
  }

  &__amount-input {
    margin: 20px 0 20px 0;
  }
}

.backdrop {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
  background: black;
  opacity: 0.5;
  transform: translateY(0) !important;
}

.prompt2-enter-active,
.prompt2-leave-active {
  transition-property: transform, opacity;
  transition-duration: 200ms; // Solely to trick Vue into applying the transition classes
}

.prompt2-enter-active {
  transition-timing-function: $easing-decelerate;
}

.prompt2-leave-active {
  transition-timing-function: $easing-accelerate;
}

.prompt2-enter,
.prompt2-leave-to {
  opacity: 0;
  transform: scale(0);
}
</style>
