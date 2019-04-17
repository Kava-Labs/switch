<template>
  <section class="dialog-container">
    <div class="backdrop" @click="cancelWithdrawal"></div>
    <transition name="prompt2" mode="out-in" appear>
      <section v-if="feeEstimate" class="withdraw-dialog dialog">
        <header class="withdraw-dialog__header">Withdraw</header>
        <main>
          <p class="withdraw-dialog__custody-notice">
            Remove the card and return balance to account on base layer
            blockchain?
          </p>
          <p class="withdraw-dialog__fee-estimate">
            Estimated fee: ${{ usdFeeEstimate }}
          </p>
        </main>
        <footer class="withdraw-dialog__actions">
          <m-button
            class="withdraw-dialog__actions__cancel-button"
            @click="cancelWithdrawal"
            >Cancel</m-button
          >
          <m-button
            class="withdraw-dialog__actions__accept-button"
            raised
            @click="startWithdrawal"
            >Withdraw</m-button
          >
        </footer>
      </section>
    </transition>
    <transition name="fade" mode="out-in" appear>
      <spinner v-if="!feeEstimate" />
    </transition>
  </section>
</template>

<script>
import Vue from 'vue'
import BigNumber from 'bignumber.js'
import Spinner from '@/components/Spinner.vue'
import { convert, usd } from '@kava-labs/crypto-rate-utils'

export default {
  components: { Spinner },
  props: {
    routeInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      feeEstimate: null
    }
  },
  computed: {
    uplink() {
      return this.$store.state.uplinks.find(
        uplink => uplink.id === this.routeInfo.id
      )
    },
    usdFeeEstimate() {
      return this.feeEstimate.isZero()
        ? '0'
        : convert(
            this.uplink.unit(this.feeEstimate),
            usd(),
            this.$store.getters.rateApi
          ).toFixed(4, BigNumber.ROUND_CEIL)
    }
  },
  async created() {
    // Generate a fee estimate as if we were withdrawing
    this.feeEstimate = await new Promise((resolve, reject) => {
      this.$store.state.api
        .withdraw({
          uplink: this.uplink.getInternal(),
          authorize: ({ fee }) => {
            resolve(fee)
            return Promise.reject()
          }
        })
        .then(reject, reject)
    }).catch(err => {
      this.$store.commit('SHOW_TOAST', 'Failed to estimate fee for withdrawal')
      this.cancelWithdrawal()
    })
  },
  methods: {
    async startWithdrawal() {
      const uplink = this.uplink.getInternal()
      const uplinkId = this.uplink.id

      this.uplink.activeWithdrawal = this.$store.state.api
        .withdraw({ uplink })
        .then(async () => {
          // Remove the uplink
          await this.$store.state.api.remove(this.uplink.getInternal())
          this.$store.commit('REFRESH_UPLINKS')
          this.$store.commit('SHOW_TOAST', 'Successfully withdrew funds')
        })
        .catch(err => {
          this.$store.commit('SHOW_TOAST', 'Failed to withdraw funds')
        })
        .finally(() => {
          this.$store.commit('END_WITHDRAWAL', uplinkId)
        })

      this.cancelWithdrawal()
    },
    cancelWithdrawal() {
      this.$store.commit('NAVIGATE_TO', {
        name: 'home',
        meta: 'select-source-uplink'
      })
    }
  }
}
</script>

<!-- TODO Abstract these styles somewhere else -->
<style lang="scss">
.dialog-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.withdraw-dialog {
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
  }

  &__fee-estimate {
    margin: 0 0 20px 0;
    color: $text-black-medium-emphasis;
    font-weight: 500;
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
