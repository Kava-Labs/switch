<template>
  <section class="card-container">
    <!-- TODO Show greater precision for BTC & ETH, since there's more space (and they need more precision) -->
    <UplinkCard :uplink="uplink" :key="uplink.assetCode" v-for="uplink in uplinks"/>
    <AddUplinkCard/>
  </section>
</template>

<script>
import state from '../store'
import AddUplinkCard from './card/AddUplinkCard.vue'
import UplinkCard from './card/UplinkCard.vue'

export default {
  components: {
    AddUplinkCard,
    UplinkCard
  },
  data() {
    return state
  }
}
</script>

<style lang="scss" scoped>
.card-container {
  max-width: 1200px;
  margin: auto;
  padding: 10px 40px 40px 40px;
  box-sizing: border-box;
  display: grid;
  grid-gap: 40px;
  // TODO Use var from card.scss
  grid-template-columns: repeat(auto-fit, 85.6mm);
  justify-content: center;
}
</style>
