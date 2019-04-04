<template>
  <section>
    <div class="backdrop" @click="cancelDeposit"></div>
    <section class="deposit-dialog dialog">
      <header class="deposit-dialog__header">Deposit</header>
      <main>
        <p class="deposit-dialog__custody-notice">
          Funds will be kept securely in your custody.
        </p>
        <AmountInput
          :amount="depositAmount"
          :amount-usd="helperText"
          :asset-code="uplink.unit().symbol"
          :focused="true"
          @input="updateInputAmount"
        />
      </main>
      <footer class="deposit-dialog__actions">
        <m-button
          class="deposit-dialog__actions__cancel-button"
          :disabled="pendingDeposit"
          @click="cancelDeposit"
          >Cancel</m-button
        >
        <m-button
          class="deposit-dialog__actions__accept-button"
          raised
          :disabled="pendingDeposit"
          @click="acceptDeposit"
          >Accept</m-button
        >
      </footer>
    </section>
  </section>
</template>

<script>
import Vue from 'vue'
import Button from 'material-components-vue/dist/button'
import BigNumber from 'bignumber.js'
import AmountInput from '@/components/swap/AmountInput.vue'
import { convert, usd } from '@kava-labs/crypto-rate-utils'

Vue.use(Button)

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
      pendingDeposit: null,
      inputAmount: ''
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
    },
    depositAmount() {
      // Allow the fields to be cleared
      if (this.inputAmount.length === 0) {
        return null
      }

      // Ensure correct formatting & positive
      // Prepend "0" to input so BigNumber parses "." as valid
      let parsedInput = new BigNumber('0' + this.inputAmount)
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
        depositAmount = maxDeposit
      }

      // Truncate the amounts
      // (Must be done last so have full precision to convert between them)
      depositAmount = depositAmount.decimalPlaces(
        this.uplink.assetScale,
        BigNumber.ROUND_DOWN
      )

      // *Only* update the source amount if we changed it (otherwise use the existing text)
      return depositAmount.isEqualTo(parsedInput)
        ? this.inputAmount
        : depositAmount.toString()
    }
  },
  methods: {
    async updateInputAmount(amount) {
      this.inputAmount = amount
    },
    acceptDeposit() {
      if (new BigNumber(this.depositAmount).isZero()) {
        return
      }

      if (this.pendingDeposit) {
        return
      }

      this.pendingDeposit = this.$store.state.api.deposit({
        uplink: this.uplink.getInternal(),
        amount: new BigNumber(this.depositAmount)
      })

      this.pendingDeposit.then(() => {
        this.pendingDeposit = null
        this.cancelDeposit()
      })
    },
    cancelDeposit() {
      if (this.pendingDeposit) {
        return
      }

      this.$store.commit('NAVIGATE_TO', {
        name: 'home',
        meta: 'select-source-uplink'
      })
    }
  }
}
</script>

<style lang="scss">
$mdc-typography-font-family: 'Rubik';
$mdc-theme-primary: $secondary;
@import 'material-components-vue/dist/button/styles';

.deposit-dialog {
  width: 420px;
  height: 340px;
  padding: 40px;
  box-sizing: border-box;
  position: absolute;
  z-index: 20;
  left: calc((100% - 420px) / 2);
  top: calc((100% - 340px) / 2);
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
    margin: 0 0 30px 0;
    color: $text-black-medium-emphasis;
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
}
</style>
