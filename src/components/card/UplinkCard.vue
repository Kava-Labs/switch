<template>
  <div class="card__perspective-container">
    <div
      class="card__flip-container"
      :class="{'card--flipped': showFlip, [assetClass]: true}"
      @click="resetFlipBack"
    >
      <div class="card__front" :class="{'card--selected': showSelected}">
        <div class="card__front__balance">
          <div class="card__front__balance__amount">{{ uplink.balance }}</div>
          <div class="card__front__balance__asset-code">{{ uplink.assetCode }}</div>
        </div>
        <img class="card__front__connector-icon" src="../../assets/kava-logo.svg">
      </div>
      <div class="card__back" @mouseover="resetFlipBack" @mouseout="showFront">
        <div class="card__back__stripe"/>
        <div class="card__back__actions">
          <UplinkCardButton v-if="uplink.canDeposit" type="deposit"/>
          <UplinkCardButton type="swap"/>
          <UplinkCardButton v-if="uplink.canWithdraw" type="withdraw"/>
          <UplinkCardButton v-if="!uplink.canWithdraw" type="remove"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UplinkCardButton from './UplinkCardButton.vue'

export default {
  components: { UplinkCardButton },
  props: {
    uplink: {
      assetCode: String,
      connector: String
    }
  },
  data() {
    return {
      showFlip: false
    }
  },
  computed: {
    assetClass() {
      return 'card--' + this.uplink.assetCode.toLowerCase()
    }
  },
  methods: {
    resetFlipBack() {
      this.showFlip = true
    },
    showFront() {
      this.showFlip = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import './card';
</style>
