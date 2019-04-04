<template>
  <div id="app">
    <NavBar />
    <keep-alive>
      <transition name="navigate" mode="out-in" appear>
        <component
          :is="currentRouteComponent"
          :route-info="$store.state.route"
        />
      </transition>
    </keep-alive>
    <!-- TODO Add mounting for dialogs/toasts here -->
  </div>
</template>

<script lang="ts">
import NavBar from '@/components/NavBar.vue'
import Home from '@/components/home/Home.vue'
import Swap from '@/components/swap/Swap.vue'
import Vue from 'vue'

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

#app {
  margin: 0 50px;
}

.navigate-enter-active,
.navigate-leave-active {
  transition: opacity, transform;
  transition-duration: 300ms;
  transition-timing-function: $easing-standard;
  transform: translateZ(0);
}

.navigate-enter,
.navigate-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
