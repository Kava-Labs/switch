import Vue from 'vue'
import App from '@/components/App.vue'
import store from '@/store'
import { ipcRenderer } from 'electron-better-ipc'

import Button from 'material-components-vue/dist/button'
import IconButton from 'material-components-vue/dist/icon-button'
import TextField from 'material-components-vue/dist/text-field'
import FloatingLabel from 'material-components-vue/dist/floating-label'

Vue.use(Button)
Vue.use(IconButton)
Vue.use(TextField)
Vue.use(FloatingLabel)

new Vue({
  store,
  async mounted() {
    this.$store.dispatch('initialLoad')

    ipcRenderer.answerMain('before-window-close', async () => {
      await this.$store.state.sdk.disconnect()
      await this.$store.dispatch('persistConfig')
      return null
    })
  },
  render: h => h(App)
}).$mount('#app')
