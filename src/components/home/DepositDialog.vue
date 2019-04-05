<template>
  <section>
    <div class="backdrop" @click="cancelDeposit"></div>
    <section class="deposit-dialog dialog">
      <header class="deposit-dialog__header">Deposit</header>
      <main>
        <p class="deposit-dialog__custody-notice">
          Deposit funds onto your card to enable swapping and instant streaming
          payments.
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
      depositAmount: null
    }
  },
  computed: {
    uplink() {
      return this.$store.state.uplinks.find(
        uplink => uplink.id === this.routeInfo.id
      )
    },
    helperText() {
      const showUsdAmount =
        this.depositAmount && !new BigNumber(this.depositAmount).isNaN()
      if (!showUsdAmount) {
        return null
      }

      const usdAmount = convert(
        this.uplink.unit(this.depositAmount),
        usd(),
        this.$store.getters.rateApi
      ).toFixed(2, BigNumber.ROUND_CEIL)

      return '$' + usdAmount
    }
  },
  methods: {
    handleDepositAmountInput(input) {
      // Allow the fields to be cleared
      if (input.length === 0) {
        return null
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
.deposit-dialog {
  width: 420px;
  height: 360px;
  padding: 40px;
  box-sizing: border-box;
  position: absolute;
  z-index: 20;
  left: calc((100% - 420px) / 2);
  top: calc((100% - 360px) / 2);
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
    margin: 20px 0 0 0;
  }
}

.backdrop {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 15;
  background: black;
  opacity: 0.5;
  transform: translateY(0) !important;
}
</style>
