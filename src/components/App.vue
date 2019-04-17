<template>
  <div id="app">
    <NavBar />
    <transition name="navigate" mode="out-in" appear>
      <component :is="currentRouteComponent" :route-info="$store.state.route" />
    </transition>
    <toast-manager />
    <portal-target name="dialog" />
  </div>
</template>

<script lang="ts">
import NavBar from '@/components/NavBar.vue'
import Home from '@/components/home/Home.vue'
import Swap from '@/components/swap/Swap.vue'
import Spinner from '@/components/Spinner.vue'
import ToastManager from '@/components/ToastManager.vue'
import Welcome from '@/components/Welcome.vue'
import Vue from 'vue'

export default Vue.extend({
  name: 'App',
  components: {
    NavBar,
    Home,
    Swap,
    Spinner,
    ToastManager,
    Welcome
  },
  computed: {
    currentRouteComponent(): 'Swap' | 'Home' | 'Welcome' | 'Spinner' {
      return this.$store.state.route.name === 'swap'
        ? 'Swap'
        : this.$store.state.route.name === 'welcome'
        ? 'Welcome'
        : this.$store.state.route.name === 'home'
        ? 'Home'
        : 'Spinner'
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

// Add shared text field styling

$mdc-typography-font-family: 'Rubik';
$mdc-theme-primary: $secondary;
@import 'material-components-vue/dist/button/styles';
@import 'material-components-vue/dist/icon-button/styles';
@import 'material-components-vue/dist/text-field/styles';
@import 'material-components-vue/dist/snackbar/styles';

.mdc-text-field {
  @include mdc-text-field-outline-shape-radius(3.175mm);
  @include mdc-text-field-outline-color($primary-300);
  @include mdc-text-field-hover-outline-color($primary-800);
  transition: $transition-color;

  :not(&--focused) {
    @include mdc-text-field-ink-color($primary-700);
    @include mdc-text-field-caret-color($primary-700);
    @include mdc-text-field-label-color($primary-700);
  }

  &__input {
    resize: none;

    &::-webkit-scrollbar {
      width: 0px;
    }
  }

  &--focused {
    // Label and outline change to orange on focus
    @include mdc-text-field-ink-color($text-black-high-emphasis);
    @include mdc-text-field-label-color($secondary);
    @include mdc-text-field-focused-outline-color($secondary);
  }
}

// .mdc-button {
//   @include mdc-button-shape-radius($card-radii);
// }
</style>
