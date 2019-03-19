<template>
  <div id="app">
    <NavBar/>
    <Home/>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
import Home from './components/Home.vue'

export default {
  name: 'app',
  components: {
    NavBar,
    Home
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Rubik:300,400,500,700,900');

body,
html {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  position: relative;
  font-family: 'Rubik';
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
