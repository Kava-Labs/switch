<template>
  <div class="add-card">
    <UplinkCardButton type="add" label="Add Card" />
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
.add-card {
  width: $card-width;
  height: $card-height;
  border-radius: $card-radii;
  box-sizing: border-box;
  background: #f0efef;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: stretch;
  align-items: stretch;
  transition: 200ms box-shadow $easing-standard;

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px rgba(40, 51, 75, 0.45);
  }
}
</style>
