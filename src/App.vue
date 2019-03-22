<template>
  <div id="app">
    <NavBar />
    <Home />
    <Swap :source-uplink="uplinks[2]" :destination-uplink="uplinks[0]" />
  </div>
</template>

<script>
import state from '@/store'
import NavBar from '@/components/NavBar.vue'
import Home from '@/components/home/Home.vue'
import Swap from '@/components/swap/Swap.vue'

export default {
  name: 'app',
  components: {
    NavBar,
    Home,
    Swap
  },
  data() {
    return state
  }
}
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
</style>
