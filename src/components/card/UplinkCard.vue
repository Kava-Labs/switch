<template>
  <div class="card-perspective">
    <!-- TODO To add back hover, add @mouseleave="showFront" to flip-container -->
    <div
      class="card"
      :class="{
        'card--flipped': display === 'normal' && showFlip,
        'card--selected': display === 'selected',
        'card--selectable': display === 'normal' || display === 'selectable',
        [assetClass]: true
      }"
      tabindex="0"
      @click="selectDestinationAsset"
      @focusout="showFront"
    >
      <div class="card__front" @click="showBack">
        <div class="card__front__balance" :title="balanceTooltip">
          <div class="card__front__balance__amount">{{ balance }}</div>
          <div class="card__front__balance__asset-code">
            {{ uplink.unit().symbol }}
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
          <UplinkCardButton
            type="swap"
            :dark-theme="darkTheme"
            @click.native="selectSourceAsset"
          />
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

<script lang="ts">
import UplinkCardButton from './UplinkCardButton.vue'
import BigNumber from 'bignumber.js'
import { mapGetters } from 'vuex'
import Vue from 'vue'
import { Uplink } from '@/store'

export default Vue.extend({
  components: { UplinkCardButton },
  props: {
    /** Uplink data from switch-api */
    uplink: {
      type: Object as () => Uplink,
      required: true
    },

    /** TODO Add an explanation of what these states actually mean
     * in terms of source asset has been selected, dest asset selected, etc. etc.
     */

    /** Can this card be flipped on hover or be selected? */
    display: {
      type: String as () =>
        | 'normal' // Card has actions, can be flipped & selected
        | 'selected' // No actions or flip; light opacity to show selected
        | 'selectable' // No actions or flip; hover response to show it can be selected
        | 'static', // No actions, flip, hover or selection
      default: 'normal'
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
        ({
          XRP: 6,
          BTC: 9,
          ETH: 9
        } as {
          [symbol: string]: number
        })[this.uplink.unit().symbol] || 6
    }
  },
  computed: {
    /** Should a dark theme be applied to the buttons? */
    darkTheme(): boolean {
      return this.uplink.unit().symbol === 'XRP'
    },

    /** Add styling unique to this card (color, background image) */
    assetClass(): string {
      return 'card--' + this.uplink.unit().symbol.toLowerCase()
    },

    /**
     * Format the balance
     * - Possible bug: for VERY large balances, it may display inaccurately
     */
    balance(): string {
      const truncatedBalance = this.uplink.balance
        // toFixed() will leave trailing zeros, but decimalPlaces *then* toString won't
        .decimalPlaces(this.uplink.unit().unit, BigNumber.ROUND_DOWN)
        // Use maxDigits + 1 to account for decimal point
        .toString()
        .substr(0, this.maxDigits + 1)
      // If it ends with a decimal point, remove it
      return truncatedBalance.endsWith('.')
        ? truncatedBalance.slice(0, -1)
        : truncatedBalance
    },

    /** Show full balance on hover in case it's truncated */
    balanceTooltip(): string {
      return `${this.uplink.balance} ${this.uplink.unit().symbol}`
    }
  },
  methods: {
    showFront() {
      if (this.display === 'normal') {
        this.showFlip = false
      }
    },
    showBack() {
      if (this.display === 'normal') {
        this.showFlip = true
      }
    },
    selectSourceAsset() {
      if (this.display === 'normal') {
        this.showFlip = false
        this.$emit('select', this.uplink.id)
      }
    },
    selectDestinationAsset() {
      if (this.display === 'selectable') {
        this.showFlip = false
        this.$emit('select', this.uplink.id)
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.card-perspective {
  width: $card-width;
  height: $card-height;
  perspective: 1000px;
  position: relative;
  z-index: 2;
}

.card {
  $self: &;
  width: 100%;
  height: 100%;
  transition: 250ms transform $easing-standard;
  transform-style: preserve-3d;
  outline: none; // TODO Bad for accessibility; better solution? http://www.outlinenone.com

  &__front,
  &__back {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: $card-radii;
    background: white;
    backface-visibility: hidden;
    box-shadow: 0 10px 20px rgba(40, 51, 75, 0.45);
  }

  &__front {
    z-index: 2;
    background-repeat: no-repeat;
    background-clip: border-box;
    transition: 0.2s box-shadow, 0.2s transform, 0.2s opacity;
    transition-timing-function: $easing-standard;

    &__balance {
      position: absolute;
      right: $card-inner-padding;
      top: $card-inner-padding;
      display: flex;
      flex-flow: column nowrap;
      justify-content: flex-start;
      align-items: flex-end;
    }

    &__balance__amount {
      font-weight: 300;
      font-size: 18pt;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.1ch;
      color: $text-black-high-emphasis;
    }

    &__balance__asset-code {
      @extend %asset-code;
    }

    &__connector-icon {
      width: 80px;
      position: absolute;
      right: $card-inner-padding;
      bottom: $card-inner-padding;
      user-select: none;
      -webkit-user-drag: none;
    }
  }

  &__back {
    padding: 20px 0 10px 0;
    transform: rotateY(180deg);
    display: flex;
    flex-flow: column nowrap;
    cursor: pointer;

    &__stripe {
      height: 40px;
      background: #dfdfdf;
    }

    &__actions {
      flex-grow: 1;
      display: grid;
      grid-template-columns: repeat(auto-fit, 90px);
      justify-content: center;
      align-content: center;
    }
  }

  &--flipped {
    transform: rotateY(180deg);
  }

  &--selectable {
    #{ $self }__front {
      cursor: pointer;
    }

    #{ $self }__front:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 10px 20px 4px rgba(40, 51, 75, 0.25);
    }
  }

  &--selected {
    #{ $self }__front {
      box-shadow: 0 4px 10px rgba(40, 51, 75, 0.3);
      opacity: 0.7;
    }
  }

  &--eth {
    #{ $self }__front {
      background-image: url('~@/assets/ethereum-logo.svg');
      background-position: -35px top;
      background-size: 180px;
    }
  }

  &--btc {
    #{ $self }__front {
      background-image: url('~@/assets/lightning-logo.png');
      background-position: left -40px top -40px;
      background-size: 250px;
    }
  }

  $xrp-accent: #23292f;
  &--xrp {
    #{ $self } {
      &__front {
        background-color: $xrp-accent;
        background-image: url('~@/assets/xrp-logo.svg');
        background-position: left -54px center;
        background-size: auto 210px;

        &__balance {
          // Needs additional specificity to override previous style
          &__amount,
          &__asset-code {
            color: white;
          }
        }
      }

      &__back {
        background-color: $xrp-accent;

        &__stripe {
          background: black;
        }
      }
    }
  }
}
</style>
