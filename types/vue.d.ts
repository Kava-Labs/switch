import Vue, { ComponentOptions } from 'vue'
import { State } from '@/store'
import { Store } from 'vuex'

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    store?: Store<State>
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $store: Store<State>
  }
}
