<template>
  <div class="card-perspective">
    <!-- TODO To add back hover, add @mouseleave="showFront" to flip-container -->
    <div
      class="card"
      :class="{ 'card--flipped': showFlip, [assetClass]: true }"
      @focusout="showFront"
      tabindex="0"
    >
      <div
        class="card__front"
        :class="{ 'card--selectable': isSelectable }"
        @click="showBack"
      >
        <div class="card__front__balance" :title="balanceTooltip">
          <div class="card__front__balance__amount">{{ balance }}</div>
          <div class="card__front__balance__asset-code">
            {{ uplink.exchangeUnit().symbol }}
          </div>
        </div>
        <img class="card__front__connector-icon" src="@/assets/kava-logo.svg" />
      </div>
      <div class="card__back" @click="showFront">
        <div class="card__back__stripe" />
        <div class="card__back__actions">
          <UplinkCardButton
            v-if="uplink.canDeposit"
            type="deposit"
            :dark-theme="darkTheme"
          />
          <UplinkCardButton type="swap" :dark-theme="darkTheme" />
          <UplinkCardButton
            v-if="uplink.canWithdraw"
            type="withdraw"
            :dark-theme="darkTheme"
          />
          <UplinkCardButton
            v-if="!uplink.canWithdraw"
            type="remove"
            :dark-theme="darkTheme"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UplinkCardButton from './UplinkCardButton.vue'
import BigNumber from 'bignumber.js'

export default {
  components: { UplinkCardButton },
  props: {
    /** Uplink data from switch-api */
    uplink: {
      type: Object,
      required: true
    },
    /** Can this card be flipped on hover or selected? */
    isSelectable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      /** Is the backside of the card displayed? */
      showFlip: false,
      /**
       * To prevent overlapping the card background image, different assets
       * should render different numbers of digits for the card balance
       */
      maxDigits:
        {
          XRP: 6,
          BTC: 9,
          ETH: 9
        }[this.uplink.exchangeUnit().symbol] || 6
    }
  },
  computed: {
    /** Should a dark theme be applied to the buttons? */
    darkTheme() {
      return this.uplink.exchangeUnit().symbol === 'XRP'
    },
    /** Add styling unique to this card (color, background image) */
    assetClass() {
      return 'card--' + this.uplink.exchangeUnit().symbol.toLowerCase()
    },
    /**
     * Format the balance
     * - Possible bug: for VERY large balances, it may display inaccurately
     */
    balance() {
      const truncatedBalance = this.uplink.balance$.value
        // toFixed() will leave trailing zeros, but decimalPlaces *then* toString won't
        .decimalPlaces(this.uplink.exchangeUnit().unit, BigNumber.ROUND_DOWN)
        // Use maxDigits + 1 to account for decimal point
        .toString()
        .substr(0, this.maxDigits + 1)
      // If it ends with a decimal point, remove it
      return truncatedBalance.endsWith('.')
        ? truncatedBalance.slice(0, -1)
        : truncatedBalance
    },
    /** Show full balance on hover in case it's truncated */
    balanceTooltip() {
      return `${this.uplink.balance$.value} ${
        this.uplink.exchangeUnit().symbol
      }`
    }
  },
  methods: {
    showFront() {
      if (this.isSelectable) {
        this.showFlip = false
      }
    },
    showBack() {
      if (this.isSelectable) {
        this.showFlip = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './card';
</style>
