<template>
  <transition name="fly-in" mode="out-in">
    <nav v-if="showDestAssetSelection">
      <h4>Select an asset to receive</h4>
    </nav>
  </transition>
</template>

<script>
import state from '../store'

export default {
  data() {
    return state
  },
  computed: {
    showDestAssetSelection() {
      return this.sourceAssetCode && !this.destinationAssetCode
    }
  }
}
</script>

<style scoped>
nav {
  width: 100%;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2d3142;
  color: white;
  box-shadow: 0 4px 8px rgba(40, 51, 75, 0.45);
  position: absolute;
  top: 0;
  left: 0;
}

h4 {
  margin: 0;
  font-family: 'Rubik';
  font-size: 24px;
  font-weight: normal;
}

.fly-in-enter-active,
.fly-in-leave-active {
  transition: top 0.23s cubic-bezier(0, 0, 0.2, 1);
}
.fly-in-enter,
.fly-in-leave-to {
  transition: top 0.23s cubic-bezier(0.4, 0, 1, 1);
  top: -72px;
}
</style>
