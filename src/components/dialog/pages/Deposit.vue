<template>
  <dialog-content>
    <template v-slot:header
      >Deposit</template
    >
    <main>
      <p class="p">
        To use this as the sending asset for streaming swaps, deposit funds onto
        your card.
      </p>
      <p class="p p--emphasis">Only you have access to these funds.</p>
      <amount-input
        class="amount-input"
        :amount="depositAmount"
        :amount-usd="helperText"
        :asset-code="uplink.unit.symbol"
        :focused="true"
        @input="handleDepositAmountInput"
      />
    </main>
    <template v-slot:footer>
      <m-button @click="cancelDeposit">Cancel</m-button>
      <m-button raised @click="acceptDeposit">Deposit</m-button>
    </template>
  </dialog-content>
</template>

<script>
import Vue from 'vue'
import BigNumber from 'bignumber.js'
import AmountInput from '@/components/AmountInput.vue'
import DialogContent from '@/components/dialog/DialogContent.vue'
import {
  convert,
  exchangeQuantity,
  exchangeUnit
} from '@kava-labs/crypto-rate-utils'
import debug from 'debug'

const log = debug('switch')

const getAssetScale = uplink =>
  Math.abs(uplink.unit.exchangeScale - uplink.unit.accountScale)

const usd = exchangeUnit({
  symbol: 'USD',
  exchangeScale: 2,
  accountScale: 2,
  scale: 2
})

const MAX_DEPOSIT_AMOUNT = exchangeQuantity(usd, 100)

export default {
  components: { AmountInput, DialogContent },
  data() {
    return {
      depositAmount: '',
      feeEstimate: null
    }
  },
  computed: {
    uplink() {
      return this.$store.state.uplinks.find(
        uplink => uplink.id === this.$store.state.route.id
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
        exchangeQuantity(this.uplink.unit, this.depositAmount),
        usd,
        this.$store.state.rateApi
      ).amount.toFixed(2, BigNumber.ROUND_CEIL)

      const feeEstimateAmount = convert(
        this.feeEstimate,
        usd,
        this.$store.state.rateApi
      ).amount.toFixed(4, BigNumber.ROUND_CEIL)

      return `$${usdAmount} + $${feeEstimateAmount} fee*`
    }
  },
  async created() {
    // Generate a fee esimate as if we were depositing
    const amount = convert(
      exchangeQuantity(usd, 1),
      this.uplink.unit,
      this.$store.state.rateApi
    ).amount.decimalPlaces(this.uplink.unit.exchangeScale, BigNumber.ROUND_DOWN)

    this.feeEstimate = await new Promise((resolve, reject) => {
      this.$store.state.sdk
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
      log('Failed to estimate fee for deposit:', err)
      this.$store.commit(
        'SHOW_TOAST',
        'Failed to calculate fee. Deposit may fail due to insufficient funds'
      )
      return null
    })
  },
  methods: {
    handleDepositAmountInput(input) {
      // Allow the fields to be cleared
      if (input.length === 0) {
        this.depositAmount = ''
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
        this.uplink.unit,
        this.$store.state.rateApi
      ).amount
      if (depositAmount.isGreaterThan(maxDeposit)) {
        this.$store.commit('SHOW_TOAST', 'Maximum deposit is $100')
        depositAmount = maxDeposit
      }

      // Truncate the amounts
      // (Must be done last so have full precision to convert between them)
      depositAmount = depositAmount.decimalPlaces(
        getAssetScale(this.uplink),
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
      this.uplink.activeDeposit = this.$store.state.sdk
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
        type: 'home'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.amount-input {
  margin: 20px 0;
}
</style>
