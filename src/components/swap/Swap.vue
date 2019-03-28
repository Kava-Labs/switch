<template>
  <div class="swap">
    <span class="swap__source-header">Send</span>
    <span class="swap__destination-header">Receive</span>
    <UplinkCard
      class="swap__source-uplink"
      :uplink="sourceUplink"
      display="static"
    />
    <UplinkCard
      class="swap__destination-uplink"
      :uplink="destinationUplink"
      display="static"
    />
    <img
      class="swap__interledger-logo"
      :class="{ 'swap__interledger-logo--spin': isStreaming }"
      src="~@/assets/interledger-logo.svg"
    />
    <div class="swap__source-pipe">
      <div
        v-for="packet in moneyOut"
        :key="packet"
        class="swap__packet"
        @animationend="removeMoneyOut(packet)"
      ></div>
    </div>
    <div class="swap__destination-pipe">
      <div
        v-for="packet in moneyIn"
        :key="packet"
        class="swap__packet"
        @animationend="removeMoneyIn(packet)"
      ></div>
    </div>
    <AmountInput
      :focused="true"
      :asset-code="sourceUnit().symbol"
      :amount="sourceAmount && sourceAmount.toString()"
      :amount-usd="sourceAmountUsd"
      class="swap__source-input"
      label="Send amount"
      @input="handleSourceAmountInput"
    />
    <AmountInput
      :asset-code="destinationUnit().symbol"
      :amount="destAmount && destAmount.toString()"
      class="swap__destination-input"
      label="Receive amount"
      @input="handleDestAmountInput"
    />
    <div class="swap__actions">
      <button
        ref="mdc-go-button"
        class="swap__actions__go-button mdc-button mdc-button--outlined"
        @click="startStream"
      >
        <span class="mdc-button__label">Go</span>
        <svg class="mdc-button__icon" viewBox="0 0 24 24">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
      <button
        ref="mdc-flip-button"
        class="swap__actions__flip-button mdc-button"
        @click="flipUplinks"
      >
        <span class="mdc-button__label">Flip</span>
        <svg class="mdc-button__icon" viewBox="0 0 24 24">
          <path d="M17 2.1l4 4-4 4"></path>
          <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"></path>
          <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import UplinkCard from '@/components/card/UplinkCard.vue'
import AmountInput from './AmountInput.vue'
import BigNumber from 'bignumber.js'
import { convert, usd, connectCoinCap } from '@kava-labs/crypto-rate-utils'
import { Uplink } from '@/store'
import Vue from 'vue'

const MAX_TRADE_SIZE = usd(10)
const MAX_SLIPPAGE = 0.99

// TODO Add a min trade size in usd -- otherwise it may fail due to exchange rates?

export default {
  components: { UplinkCard, AmountInput },
  props: {
    routeInfo: {
      type: Object,
      required: true
    }
    // sourceUplink: {
    //   type: Object,
    //   required: true
    // },
    // destinationUplink: {
    //   type: Object,
    //   required: true
    // }
  },
  data() {
    return {
      rateApi: null,
      sourceAmount: null,
      destAmount: null,
      buttonRipple: null, // TODO remove this!
      // TODO Add rendering for this!
      moneyOut: [],
      moneyIn: [],
      isStreaming: false
    }
  },
  computed: {
    sourceUplink() {
      return this.$store.state.uplinks.find(
        uplink => uplink.id === this.routeInfo.sourceUplink
      )
    },
    destinationUplink() {
      return this.$store.state.uplinks.find(
        uplink => uplink.id === this.routeInfo.destinationUplink
      )
    },
    sourceUnit() {
      return this.sourceUplink.unit
    },
    destinationUnit() {
      return this.destinationUplink.unit
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
  },
  async created() {
    this.rateApi = await connectCoinCap()
  },
  mounted() {
    this.initButtons()
  },
  updated() {
    this.initButtons()
  },

  // TODO Fix Prettier/autoformat not working correctly in VS Code -- could save me lots of time!
  // TODO Should is be using eslint for autoformatting instead?

  methods: {
    flipUplinks() {
      if (this.isStreaming) {
        return
      }

      this.$store.commit('NAVIGATE_TO', {
        name: 'swap',
        sourceUplink: this.routeInfo.destinationUplink,
        destinationUplink: this.routeInfo.sourceUplink
      })

      // TODO Oh my God, please don't do this
      const sourceAmount = this.sourceAmount
      if (typeof sourceAmount === 'string') {
        Vue.nextTick(() => {
          this.handleDestAmountInput(sourceAmount)
        })
      }
    },

    async startStream() {
      if (!this.sourceAmount) {
        return // TODO
      }

      // Prevent multiple streams simultaneously
      if (this.isStreaming) {
        return
      }
      this.isStreaming = true

      // TODO Clear input fields? Hide them?

      // TODO Show check mark when streaming is complete?

      const { moneyIn$, moneyOut$ } = await this.$parent.streamMoney({
        amount: new BigNumber(this.sourceAmount),
        source: this.sourceUplink,
        dest: this.destinationUplink,
        rateApi: this.rateApi
      })

      moneyIn$.subscribe(
        () => this.moneyIn.push(Math.random().toString()),
        () => {
          // TODO Show error toast? Idk!
        },
        () => {
          this.isStreaming = false
        }
      )

      moneyOut$.subscribe(() => {
        this.moneyOut.push(Math.random().toString())
      })
    },
    removeMoneyOut(id) {
      this.moneyOut = this.moneyOut.filter(val => val !== id)
    },
    removeMoneyIn(id) {
      this.moneyIn = this.moneyIn.filter(val => val !== id)
    },
    initButtons() {
      new MDCRipple(this.$refs['mdc-go-button'])
      new MDCRipple(this.$refs['mdc-flip-button'])
    },
    // TODO Abstract some of this code !
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
      const maxDestAmount = this.destinationUplink.incomingCapacity
      if (destAmount.isGreaterThan(maxDestAmount)) {
        destAmount = maxDestAmount
        sourceAmount = convert(
          this.destinationUnit(destAmount),
          this.sourceUnit(),
          reverseExchangeRate
        )
      }

      // Calculate max source amount and reduce all values
      const outgoingCapacity = this.sourceUplink.outgoingCapacity
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

      // Take slippage margin out of the destination amount
      // Safe since it always decreases the destination amount
      destAmount = destAmount.times(MAX_SLIPPAGE)

      // Truncate the amounts
      // (Must be done last so have full precision to convert between them)
      sourceAmount = sourceAmount.decimalPlaces(
        this.sourceUplink.assetScale,
        BigNumber.ROUND_DOWN
      )
      destAmount = destAmount.decimalPlaces(
        this.destinationUplink.assetScale,
        BigNumber.ROUND_DOWN
      )

      // Always update the destination amount, since only the source amount was edited
      this.destAmount = destAmount.toString()

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
      const maxDestAmount = this.destinationUplink.incomingCapacity
      if (destAmount.isGreaterThan(maxDestAmount)) {
        destAmount = maxDestAmount
        sourceAmount = convert(
          this.destinationUnit(destAmount),
          this.sourceUnit(),
          reverseExchangeRate
        )
      }

      // Calculate max source amount and reduce all values
      const outgoingCapacity = this.sourceUplink.outgoingCapacity
      const tradeLimit = convert(
        MAX_TRADE_SIZE,
        this.sourceUnit(),
        this.rateApi
      )
      const maxSourceAmount = BigNumber.min(
        outgoingCapacity,
        tradeLimit,
        sourceAmount.dividedBy(MAX_SLIPPAGE) // TODO !?!?
      )
      if (sourceAmount.isGreaterThan(maxSourceAmount)) {
        sourceAmount = maxSourceAmount
        destAmount = convert(
          this.sourceUnit(sourceAmount),
          this.destinationUnit(),
          exchangeRate
        )
      }

      // Truncate the amounts
      // (Must be done last so have full precision to convert between them)
      sourceAmount = sourceAmount.decimalPlaces(
        this.sourceUplink.assetScale,
        BigNumber.ROUND_DOWN
      )
      destAmount = destAmount.decimalPlaces(
        this.destinationUplink.assetScale,
        BigNumber.ROUND_DOWN
      )

      // Always update the source amount, since only the destination amount was edited
      this.sourceAmount = sourceAmount.toString()

      // *Only* update the dest amount if we changed it (otherwise use the existing text)
      if (destAmount.isEqualTo(parsedInput)) {
        this.destAmount = input
      } else {
        this.destAmount = destAmount.toString()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
$mdc-theme-primary: $secondary;
// $mdc-theme-secondary: $secondary;
$mdc-typography-font-family: 'Rubik';
@import '@material/button/mdc-button';

.swap {
  max-width: $content-max-width;
  margin: 20px auto;
  display: grid;
  grid-template-columns: auto 1fr 100px 1fr auto;
  grid-template-rows: auto auto 50px auto;
  grid-template-areas:
    'source-header  .           .         .         dest-header'
    'source-uplink  source-pipe connector dest-pipe dest-uplink'
    '.              .           .         .         .'
    'source-input   .           actions   .         dest-input';

  // "Send" and "Receive" headers

  &__source-header,
  &__destination-header {
    margin: 0 0 20px 0;
    font-weight: 300;
    font-size: 36px;
    letter-spacing: 0;
    user-select: none;
    text-align: center;
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
    position: relative;
    z-index: 4;
    // transform-origin: center;
    transform-style: preserve-3d;

    &--spin {
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      // animation: spin 120ms infinite forwards;
    }
  }

  // "Pipes" connecting the cards to Interledger
  // (to be used for animation)

  &__source-pipe,
  &__destination-pipe {
    height: 10px;
    align-self: center;
    position: relative;
    transform-style: preserve-3d;
    transform: translateZ(0);

    @keyframes move {
      from {
        transform: translateX(-20px);
      }

      to {
        transform: translateX(140px);
      }
    }

    // TODO Fix this
    .swap__packet {
      width: 10px;
      height: 10px;
      background: $secondary-400;
      border-radius: 50%;
      position: absolute;
      transform: translateX(-20px);
      transform-style: preserve-3d;
      animation: move 200ms;
      animation-delay: 100ms;
    }
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

  // Buttons

  &__actions {
    grid-area: actions;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;

    &__go-button,
    &__flip-button {
      @include mdc-button-shape-radius($card-radii);
    }

    // TODO Fix these styles!
    &__go-button {
      width: 110px;
      height: 56px;
      font-size: 14pt;
      // @include mdc-button-filled-accessible($secondary);
    }

    // TODO TODO TODO Change Material "theme" using SVG mixins!

    &__flip-button {
      width: 110px;
      height: 42px;
      margin-top: 10px;

      .mdc-button__label {
        color: $primary-400;
      }

      .mdc-button__icon {
        fill: none;
        stroke: $primary-400;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    }
  }
}
</style>
