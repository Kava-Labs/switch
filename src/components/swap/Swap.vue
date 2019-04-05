<template>
  <div class="swap">
    <span class="swap__source-header">Send</span>
    <span class="swap__destination-header">Receive</span>
    <UplinkCard
      :key="`uplink-${routeInfo.sourceUplink}`"
      class="swap__source-uplink"
      :uplink="sourceUplink"
      display="static"
    />
    <UplinkCard
      :key="`uplink-${routeInfo.destinationUplink}`"
      class="swap__destination-uplink"
      :uplink="destinationUplink"
      display="static"
    />
    <img
      class="swap__interledger-logo"
      :class="{ 'swap__interledger-logo--spin': routeInfo.isStreaming }"
      src="~@/assets/interledger-logo.svg"
    />
    <div class="swap__source-pipe">
      <div
        v-for="(isActive, index) in activeMoneyOut"
        :key="`money-out-${index}`"
        class="swap__packet"
        :class="{ 'swap__packet--active': isActive }"
        @animationend="toggleMoneyOut(index)"
      ></div>
    </div>
    <div class="swap__destination-pipe">
      <div
        v-for="(isActive, index) in activeMoneyIn"
        :key="`money-in-${index}`"
        class="swap__packet"
        :class="{ 'swap__packet--active': isActive }"
        @animationend="toggleMoneyIn(index)"
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
    <transition name="fade" mode="out-in" appear>
      <div v-if="!routeInfo.isStreaming" class="swap__actions">
        <m-button
          class="swap__actions__go-button"
          outlined
          @click="startStream"
        >
          <span>Go</span>
          <svg slot="icon" viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </m-button>
        <m-button class="swap__actions__flip-button" flat @click="flipUplinks">
          <span>Flip</span>
          <svg slot="icon" viewBox="0 0 24 24">
            <path d="M17 2.1l4 4-4 4"></path>
            <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4"></path>
            <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2"></path>
          </svg>
        </m-button>
      </div>
    </transition>
  </div>
</template>

<script>
import UplinkCard from '@/components/card/UplinkCard.vue'
import AmountInput from './AmountInput.vue'
import BigNumber from 'bignumber.js'
import { convert, usd } from '@kava-labs/crypto-rate-utils'
import { Uplink } from '@/store'
import Vue from 'vue'
import { from } from 'rxjs'
import { pairwise, filter, takeUntil } from 'rxjs/operators'

const MAX_TRADE_SIZE = usd(10)
const MAX_SLIPPAGE = 0.99

export default {
  components: { UplinkCard, AmountInput },
  props: {
    routeInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      sourceAmount: null,
      destAmount: null,
      /** Active dots animating settlements (only 3 at a time) */
      activeMoneyOut: [false, false, false],
      activeMoneyIn: [false, false, false]
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
      // e.g. if sourceAmount=".", prevent $NaN
      const showUsdAmount =
        this.sourceAmount && !new BigNumber(this.sourceAmount).isNaN()

      return showUsdAmount
        ? '$' +
            convert(
              this.sourceUnit(this.sourceAmount),
              usd(),
              this.$store.getters.rateApi
            ).toFixed(2, BigNumber.ROUND_CEIL)
        : null
    },
    // TODO Replace with availableToSend
    sourceOutgoingCapacity() {
      return this.sourceUplink.outgoingCapacity$.value
    },
    // TODO Replace with availableToReceive
    destinationIncomingCapacity() {
      return this.destinationUplink.incomingCapacity$.value
    }
  },
  // When capacity changes, update the amount of available capacity
  watch: {
    sourceOutgoingCapacity() {
      this.handleSourceAmountInput(this.sourceAmount, false)
    },
    destinationIncomingCapacity() {
      this.handleSourceAmountInput(this.sourceAmount, false)
    }
  },
  methods: {
    flipUplinks() {
      if (this.routeInfo.isStreaming) {
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
        return
      }

      // Prevent multiple streams simultaneously
      if (this.routeInfo.isStreaming) {
        return
      }
      this.$store.commit('NAVIGATE_TO', {
        ...this.routeInfo,
        isStreaming: true
      })

      const streamComplete = this.$store.state.api
        .streamMoney({
          amount: new BigNumber(this.sourceAmount),
          source: this.sourceUplink.getInternal(),
          dest: this.destinationUplink.getInternal()
        })
        .then(() => {
          this.$store.commit('SHOW_TOAST', `Swap succeeded &ensp; &#127881;`)
        })
        .catch(err => {
          this.$store.commit('SHOW_TOAST', 'Swap failed')
        })
        .finally(() => {
          this.$store.commit('NAVIGATE_TO', {
            ...this.routeInfo,
            isStreaming: false
          })
        })

      // Animate dots as settlements go out/come in

      this.sourceUplink.balance$
        .pipe(
          pairwise(),
          filter(([oldBalance, newBalance]) =>
            newBalance.isLessThan(oldBalance)
          ),
          takeUntil(from(streamComplete))
        )
        .subscribe(() => {
          for (const [index, isActive] of this.activeMoneyOut.entries()) {
            if (!isActive) {
              Vue.set(this.activeMoneyOut, index, true)
              break
            }
          }
        })

      this.destinationUplink.balance$
        .pipe(
          pairwise(),
          filter(([oldBalance, newBalance]) =>
            newBalance.isGreaterThan(oldBalance)
          ),
          takeUntil(from(streamComplete))
        )
        .subscribe(() => {
          for (const [index, isActive] of this.activeMoneyIn.entries()) {
            if (!isActive) {
              Vue.set(this.activeMoneyIn, index, true)
              break
            }
          }
        })

      await streamComplete

      // TODO Show check mark when streaming is complete?

      // Update the input fields since the capacity may have changed
      this.handleSourceAmountInput(this.sourceAmount)
    },
    toggleMoneyOut(index) {
      Vue.set(this.activeMoneyOut, index, false)
    },
    toggleMoneyIn(index) {
      Vue.set(this.activeMoneyIn, index, false)
    },
    // TODO Abstract some of this code !
    handleSourceAmountInput(input, showToast = true) {
      if (this.routeInfo.isStreaming) {
        this.sourceAmount = this.sourceAmount
        return
      }

      // Allow the fields to be cleared
      if (!input || input.length === 0) {
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

      let sourceAmount = parsedInput
      const exchangeRate = convert(
        this.sourceUnit(),
        this.destinationUnit(),
        this.$store.getters.rateApi
      )

      let showTradeLimitToast = false
      let showIncomingCapacityToast = false
      let showOutgoingCapacityToast = false

      let destAmount = convert(
        this.sourceUnit(sourceAmount),
        this.destinationUnit(),
        exchangeRate
      )
      const reverseExchangeRate = new BigNumber(1).dividedBy(exchangeRate)

      // Calculate the max destination amount and reduce all values
      const maxDestAmount = this.destinationUplink.incomingCapacity$.value
      if (destAmount.isGreaterThan(maxDestAmount)) {
        showIncomingCapacityToast = true

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
        this.$store.getters.rateApi
      )
      const maxSourceAmount = BigNumber.min(outgoingCapacity, tradeLimit)
      if (sourceAmount.isGreaterThan(maxSourceAmount)) {
        showOutgoingCapacityToast = sourceAmount.isGreaterThan(outgoingCapacity)
        showTradeLimitToast = sourceAmount.isGreaterThan(tradeLimit)

        sourceAmount = maxSourceAmount
        destAmount = convert(
          this.sourceUnit(sourceAmount),
          this.destinationUnit(),
          exchangeRate
        )
      }

      // Show relevant toasts
      if (showToast) {
        if (showTradeLimitToast) {
          this.$store.commit('SHOW_TOAST', 'Maximum swap amount is $10')
        } else if (showOutgoingCapacityToast) {
          this.$store.commit(
            'SHOW_TOAST',
            'Deposit to sending card to increase swap limit'
          )
        } else if (showIncomingCapacityToast) {
          this.$store.commit('SHOW_TOAST', 'Swap amount limited by connector')
        }
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
      if (this.routeInfo.isStreaming) {
        this.destAmount = this.destAmount
        return
      }

      // Allow the fields to be cleared
      if (!input || input.length === 0) {
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

      const exchangeRate = convert(
        this.sourceUnit(),
        this.destinationUnit(),
        this.$store.getters.rateApi
      )
      const reverseExchangeRate = new BigNumber(1).dividedBy(exchangeRate)

      let destAmount = parsedInput
      let sourceAmount = convert(
        this.destinationUnit(destAmount),
        this.sourceUnit(),
        reverseExchangeRate
      )

      let showTradeLimitToast = false
      let showIncomingCapacityToast = false
      let showOutgoingCapacityToast = false

      // Calculate the max destination amount and reduce all values
      const maxDestAmount = this.destinationUplink.incomingCapacity$.value
      if (destAmount.isGreaterThan(maxDestAmount)) {
        showIncomingCapacityToast = true

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
        this.$store.getters.rateApi
      )
      const maxSourceAmount = BigNumber.min(
        outgoingCapacity,
        tradeLimit,
        sourceAmount.dividedBy(MAX_SLIPPAGE)
      )
      if (sourceAmount.isGreaterThan(maxSourceAmount)) {
        showOutgoingCapacityToast = sourceAmount.isGreaterThan(outgoingCapacity)
        showTradeLimitToast = sourceAmount.isGreaterThan(tradeLimit)

        sourceAmount = maxSourceAmount
        destAmount = convert(
          this.sourceUnit(sourceAmount),
          this.destinationUnit(),
          exchangeRate
        )
      }

      // Show relevant toasts
      if (showToast) {
        if (showTradeLimitToast) {
          this.$store.commit('SHOW_TOAST', 'Maximum swap amount is $10')
        } else if (showOutgoingCapacityToast) {
          this.$store.commit(
            'SHOW_TOAST',
            'Deposit to sending card to increase swap limit'
          )
        } else if (showIncomingCapacityToast) {
          this.$store.commit('SHOW_TOAST', 'Swap amount limited by connector')
        }
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
.swap {
  max-width: $content-max-width;
  margin: 20px auto;
  display: grid;
  grid-template-columns: auto 1fr 80px 1fr auto;
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
    width: 130px;
    grid-area: connector;
    align-self: center;
    justify-self: center;
    filter: drop-shadow(0 0 8px rgba(40, 51, 75, 0.35));
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
          // filter: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
          // filter: rotate(360deg);
        }
      }

      animation: spin 500ms linear infinite forwards;
    }
  }

  // "Pipes" connecting the cards to Interledger
  // (to be used for animation)

  &__source-pipe,
  &__destination-pipe {
    height: 15px;
    align-self: center;
    position: relative;
    transform-style: preserve-3d;
    transform: translateZ(0);

    @keyframes move {
      from {
        transform: translateX(-20px);
      }

      to {
        // TODO Calc this so it works depending upon the window size?
        transform: translateX(140px);
      }
    }

    // TODO Fix this
    .swap__packet {
      width: 15px;
      height: 15px;
      background: $secondary-400;
      border-radius: 50%;
      position: absolute;
      transform: translateX(-20px);
      transform-style: preserve-3d;
      // animation-timing-function: $easing-accelerate;

      &--active {
        animation: move 150ms;
      }
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

    // TODO Improve these styles!
    // TODO Change Material "theme" using SVG mixins!

    &__go-button {
      width: 110px;
      height: 56px;
      font-size: 14pt;
      border-radius: $card-radii;
    }

    &__flip-button {
      width: 110px;
      height: 42px;
      margin-top: 10px;
      color: $primary-400 !important;

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
