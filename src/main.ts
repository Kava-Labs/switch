import Vue from 'vue'
import App from '@/components/App.vue'
import store from '@/store'
import ipc from 'electron-better-ipc'

import PortalVue from 'portal-vue'
import Button from 'material-components-vue/dist/button'
import IconButton from 'material-components-vue/dist/icon-button'
import TextField from 'material-components-vue/dist/text-field'
import FloatingLabel from 'material-components-vue/dist/floating-label'

Vue.use(Button)
Vue.use(IconButton)
Vue.use(TextField)
Vue.use(FloatingLabel)
Vue.use(PortalVue)

new Vue({
  store,
  mounted() {
    ipc.answerMain('before-window-close', () => {
      return this.$store.state.api.disconnect()
    })
  },
  render: h => h(App)
}).$mount('#app')
