<template>
  <dialog-content>
    <template v-slot:header
      >Select Mode</template
    >
    <p class="p">
      We recommend testnet mode to get started. Mainnet mode uses real money.
    </p>
    <template v-slot:footer>
      <m-button raised @click="selectTestnet">Testnet</m-button>
      <m-button @click="selectMainnet">Mainnet</m-button>
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'
import { LedgerEnv } from '@kava-labs/switch-api'

export default {
  components: {
    DialogContent
  },
  methods: {
    selectTestnet() {
      this.$store.dispatch('setMode', LedgerEnv.Testnet)
    },
    selectMainnet() {
      this.$store.dispatch('setMode', LedgerEnv.Mainnet)
    }
  }
}
</script>
