<template>
  <dialog-content>
    <template v-slot:header
      >Withdraw</template
    >
    <template>
      <p class="p">
        Remove the card and return balance to account on base layer blockchain?
      </p>
      <p class="p p--emphasis" :class="{ '--hide': !usdFeeEstimate }">
        Estimated fee: ${{ usdFeeEstimate }}
      </p>
    </template>
    <template v-slot:footer>
      <m-button @click="cancelWithdrawal">Cancel</m-button>
      <m-button raised @click="$store.dispatch('withdraw', uplink)"
        >Withdraw</m-button
      >
    </template>
  </dialog-content>
</template>

<script>
import Vue from 'vue'
import BigNumber from 'bignumber.js'
import DialogContent from '@/components/dialog/DialogContent.vue'
import { convert, usd } from '@kava-labs/crypto-rate-utils'

export default {
  components: { DialogContent },
  data() {
    return {
      feeEstimate: null
    }
  },
  computed: {
    uplink() {
      return this.$store.state.uplinks.find(
        uplink => uplink.id === this.$store.state.route.id
      )
    },
    usdFeeEstimate() {
      return !this.feeEstimate
        ? null
        : this.feeEstimate.isZero()
        ? '0'
        : convert(
            this.uplink.unit(this.feeEstimate),
            usd(),
            this.$store.state.rateApi
          ).toFixed(4, BigNumber.ROUND_CEIL)
    }
  },
  async created() {
    // Generate a fee estimate as if we were withdrawing
    this.feeEstimate = await new Promise((resolve, reject) => {
      this.$store.state.sdk
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
    cancelWithdrawal() {
      this.$store.commit('NAVIGATE_TO', {
        type: 'home'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.--hide {
  opacity: 0;
}
</style>
