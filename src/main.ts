import Vue from 'vue'
import App from '@/components/App.vue'
import store from '@/store'

Vue.config.productionTip = false // TODO default = true
Vue.config.performance = true // TODO default = false

new Vue({
  store,
  created() {
    this.$store.dispatch('loadApi')
  },
  render: h => h(App)
}).$mount('#app')
