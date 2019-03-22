<template>
  <section class="card-container">
    <UplinkCard
      :uplink="uplink"
      :key="uplink.assetCode"
      v-for="uplink in uplinks"
    />
    <AddUplinkCard />
  </section>
</template>

<script>
import state from '@/store'
import AddUplinkCard from '@/components/card/AddUplinkCard.vue'
import UplinkCard from '@/components/card/UplinkCard.vue'

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
@import '~@/components/card/card';

.card-container {
  max-width: $content-max-width;
  margin: auto;
  padding: 10px 40px 40px 40px;
  box-sizing: border-box;
  display: grid;
  grid-gap: 40px;
  grid-template-columns: repeat(auto-fit, $card-width);
  justify-content: center;
}
</style>
