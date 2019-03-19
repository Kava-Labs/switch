<template>
  <div class="add-card">
    <UplinkCardButton type="add" label="Add Uplink"/>
  </div>
</template>

<script>
import UplinkCardButton from './UplinkCardButton.vue'

export default {
  components: {
    UplinkCardButton
  }
}
</script>

<style lang="scss" scoped>
@import './card';
</style>
