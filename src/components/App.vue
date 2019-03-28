<template>
  <div id="app">
    <NavBar />
    <transition name="component-fade" mode="out-in" appear>
      <component
        :is="currentRouteComponent"
        :route-info="$store.state.route"
      ></component>
    </transition>
  </div>
</template>

<script lang="ts">
import NavBar from '@/components/NavBar.vue'
import Home from '@/components/Home.vue'
import Swap from '@/components/swap/Swap.vue'
import Vue from 'vue'

import BigNumber from 'bignumber.js' // TODO remove this!
import { xrp } from '@kava-labs/crypto-rate-utils'

export default Vue.extend({
  name: 'App',
  components: {
    NavBar,
    Home,
    Swap
  },
  computed: {
    currentRouteComponent(): typeof Swap | typeof Home {
      /** TODO How to type Vue store? this is `any` */
      return this.$store.state.route.name === 'swap' ? Swap : Home
    }
  }
})
</script>

<style lang="scss">
@font-face {
  font-family: 'Rubik';
  font-weight: 300;
  src: url('~@/assets/fonts/Rubik/Rubik-Light.otf') format('opentype');
}

@font-face {
  font-family: 'Rubik';
  src: url('~@/assets/fonts/Rubik/Rubik-Regular.otf') format('opentype');
}

@font-face {
  font-family: 'Rubik';
  font-weight: 500;
  src: url('~@/assets/fonts/Rubik/Rubik-Medium.otf') format('opentype');
}

@font-face {
  font-family: 'Rubik';
  font-weight: 700;
  src: url('~@/assets/fonts/Rubik/Rubik-Bold.otf') format('opentype');
}

@font-face {
  font-family: 'Rubik';
  font-weight: 900;
  src: url('~@/assets/fonts/Rubik/Rubik-Black.otf') format('opentype');
}

body,
html {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Rubik';
}

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity, transform;
  transition-duration: 300ms;
  transition-timing-function: $easing-standard;
  transform: translateZ(0);
}

.component-fade-enter,
.component-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
