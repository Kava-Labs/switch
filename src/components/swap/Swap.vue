<template>
  <div class="swap">
    <span class="swap__source-header">Send</span>
    <span class="swap__destination-header">Receive</span>
    <UplinkCard
      class="swap__source-uplink"
      :uplink="sourceUplink"
      :is-selectable="false"
    />
    <UplinkCard
      class="swap__destination-uplink"
      :uplink="destinationUplink"
      :is-selectable="false"
    />
    <img class="swap__interledger-logo" src="~@/assets/interledger-logo.svg" />
    <AmountInput
      :asset-code="sourceUnit().symbol"
      :amount="sourceAmount && sourceAmount.toString()"
      :amount-usd="sourceAmountUsd"
      @input="handleSourceAmountInput"
      class="swap__source-input"
      label="Send amount"
    />
    <AmountInput
      :asset-code="destinationUnit().symbol"
      :amount="destAmount && destAmount.toString()"
      @input="handleDestAmountInput"
      class="swap__destination-input"
      label="Receive amount"
    />
  </div>
</template>

<script>
import UplinkCard from '@/components/card/UplinkCard.vue'
import AmountInput from './AmountInput.vue'
import BigNumber from 'bignumber.js'
import { convert, usd, connectCoinCap } from '@kava-labs/crypto-rate-utils'

const MAX_TRADE_SIZE = usd(10)
const MAX_SLIPPAGE = 0.99

export default {
  props: {
    sourceUplink: {
      type: Object,
      required: true
    },
    destinationUplink: {
      type: Object,
      required: true
    }
  },
  components: { UplinkCard, AmountInput },
  data() {
    return {
      rateApi: null,
      sourceAmount: null,
      destAmount: null
    }
  },
  async created() {
    this.rateApi = await connectCoinCap()
  },
  methods: {
    handleSourceAmountInput(input) {
      // Allow the fields to be cleared
      if (input.length === 0) {
        this.sourceAmount = null
        this.destAmount = null
        return
      }

      // Ensure correct formatting & positive
      // Prepend "0" to input so BigNumber parses "." as valid
      let parsedInput = new BigNumber('0' + input)
      if (parsedInput.isNaN() || parsedInput.isLessThan(0)) {
        return
      }

      if (!this.rateApi) {
        return
      }

      let sourceAmount = parsedInput
      const exchangeRate = convert(
        this.sourceUnit(),
        this.destinationUnit(),
        this.rateApi
      )

      let destAmount = convert(
        this.sourceUnit(sourceAmount),
        this.destinationUnit(),
        exchangeRate
      )
      const reverseExchangeRate = new BigNumber(1).dividedBy(exchangeRate)

      // Calculate the max destination amount and reduce all values
      const maxDestAmount = this.destinationUplink.incomingCapacity$.value
      if (destAmount.isGreaterThan(maxDestAmount)) {
        destAmount = maxDestAmount
        sourceAmount = convert(
          this.destinationUnit(destAmount),
          this.sourceUnit(),
          reverseExchangeRate
        )
      }

      // Calculate max source amount and reduce all values
      const outgoingCapacity = this.sourceUplink.outgoingCapacity$.value
      const tradeLimit = convert(
        MAX_TRADE_SIZE,
        this.sourceUnit(),
        this.rateApi
      )
      const maxSourceAmount = BigNumber.min(outgoingCapacity, tradeLimit)
      if (sourceAmount.isGreaterThan(maxSourceAmount)) {
        sourceAmount = maxSourceAmount
        destAmount = convert(
          this.sourceUnit(sourceAmount),
          this.destinationUnit(),
          exchangeRate
        )
      }

      // Take 1% slippage margin out of the destination amount
      destAmount = destAmount.times(MAX_SLIPPAGE)

      // Truncate the amounts
      // (Must be done last so have full precision to convert between them)
      sourceAmount = sourceAmount.decimalPlaces(
        this.sourceUnit().unit,
        BigNumber.ROUND_DOWN
      )
      destAmount = destAmount.decimalPlaces(
        this.destinationUnit().unit,
        BigNumber.ROUND_DOWN
      )

      // Always update the destination amount, since only the source amount was edited
      this.destAmount = destAmount

      // *Only* update the source amount if we changed it (otherwise use the existing text)
      if (sourceAmount.isEqualTo(parsedInput)) {
        this.sourceAmount = input
      } else {
        this.sourceAmount = sourceAmount.toString()
      }
    },
    handleDestAmountInput(input) {
      // Allow the fields to be cleared
      if (input.length === 0) {
        this.sourceAmount = null
        this.destAmount = null
        return
      }

      // Ensure correct formatting & positive
      // Prepend "0" to input so BigNumber parses "." as valid
      let parsedInput = new BigNumber('0' + input)
      if (parsedInput.isNaN() || parsedInput.isLessThan(0)) {
        return
      }

      if (!this.rateApi) {
        return
      }

      const exchangeRate = convert(
        this.sourceUnit(),
        this.destinationUnit(),
        this.rateApi
      )
      const reverseExchangeRate = new BigNumber(1).dividedBy(exchangeRate)

      let destAmount = parsedInput
      let sourceAmount = convert(
        this.destinationUnit(destAmount),
        this.sourceUnit(),
        reverseExchangeRate
      )

      // Calculate the max destination amount and reduce all values
      const maxDestAmount = this.destinationUplink.incomingCapacity$.value
      if (destAmount.isGreaterThan(maxDestAmount)) {
        destAmount = maxDestAmount
        sourceAmount = convert(
          this.destinationUnit(destAmount),
          this.sourceUnit(),
          reverseExchangeRate
        )
      }

      // Calculate max source amount and reduce all values
      const outgoingCapacity = this.sourceUplink.outgoingCapacity$.value
      const tradeLimit = convert(
        MAX_TRADE_SIZE,
        this.sourceUnit(),
        this.rateApi
      )
      const maxSourceAmount = BigNumber.min(outgoingCapacity, tradeLimit)
      if (sourceAmount.isGreaterThan(maxSourceAmount)) {
        sourceAmount = maxSourceAmount
        destAmount = convert(
          this.sourceUnit(sourceAmount),
          this.destinationUnit(),
          exchangeRate
        )
      }

      // Add 1% slippage margin to the source amount
      sourceAmount = sourceAmount.dividedBy(MAX_SLIPPAGE)

      // Truncate the amounts
      // (Must be done last so have full precision to convert between them)
      sourceAmount = sourceAmount.decimalPlaces(
        this.sourceUnit().unit,
        BigNumber.ROUND_DOWN
      )
      destAmount = destAmount.decimalPlaces(
        this.destinationUnit().unit,
        BigNumber.ROUND_DOWN
      )

      // Always update the source amount, since only the destination amount was edited
      this.sourceAmount = sourceAmount

      // *Only* update the dest amount if we changed it (otherwise use the existing text)
      if (destAmount.isEqualTo(parsedInput)) {
        this.destAmount = input
      } else {
        this.destAmount = destAmount.toString()
      }
    }
  },
  computed: {
    sourceUnit() {
      return this.sourceUplink.exchangeUnit
    },
    destinationUnit() {
      return this.destinationUplink.exchangeUnit
    },
    sourceAmountUsd() {
      const showUsdAmount =
        this.rateApi &&
        this.sourceAmount &&
        // e.g. if sourceAmount=".", prevent $NaN
        !new BigNumber(this.sourceAmount).isNaN()

      return showUsdAmount
        ? convert(
            this.sourceUnit(this.sourceAmount),
            usd(),
            this.rateApi
          ).toFixed(2, BigNumber.ROUND_CEIL)
        : null
    }
  }
}
</script>

<style lang="scss" scoped>
.swap {
  max-width: $content-max-width;
  margin: 50px auto;
  display: grid;
  grid-template-columns: auto 1fr 100px 1fr auto;
  grid-template-rows: auto auto 50px auto;
  grid-template-areas:
    'source-header  .           .         .         dest-header'
    'source-uplink  source-pipe connector dest-pipe dest-uplink'
    '.              .           .         .         .'
    'source-input   .           go        .         dest-input';

  // "Send" and "Receive" headers

  &__source-header,
  &__destination-header {
    margin: 0 0 20px 0;
    font-weight: 300;
    font-size: 36px;
    letter-spacing: 0;
    user-select: none;
  }

  &__source-header {
    grid-area: source-header;
  }

  &__destination-header {
    grid-area: dest-header;
  }

  // The Interledger

  &__interledger-logo {
    width: 164px;
    grid-area: connector;
    align-self: center;
    justify-self: center;
    filter: drop-shadow(0 10px 20px rgba(40, 51, 75, 0.45));
    user-select: none;
    -webkit-user-drag: none;
  }

  // "Pipes" connecting the cards to Interledger
  // (to be used for animation)

  &__source-pipe,
  &__destination-pipe {
    height: 6px;
    align-self: center;
    background: $secondary-200;
  }

  &__source-pipe {
    grid-area: source-pipe;
  }

  &__destination-pipe {
    grid-area: dest-pipe;
  }

  // Cards for sending/receiving assets

  &__source-uplink {
    grid-area: source-uplink;
  }

  &__destination-uplink {
    grid-area: dest-uplink;
  }

  // Amount inputs/text fields

  &__source-input {
    grid-area: source-input;
  }

  &__destination-input {
    grid-area: dest-input;
  }
}
</style>
