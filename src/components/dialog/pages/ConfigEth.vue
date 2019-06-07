<template>
  <dialog-content>
    <template v-slot:header
      >Add {{ $store.state.route.config.assetType }}</template
    >
    <p v-if="$store.getters.isMainnet" class="p">
      Configure a new card with an Ethereum account. After, you'll have the
      option to fund the card.
    </p>
    <p v-else class="p">
      Configure a new card with a Kovan testnet Ethereum account. After, you'll
      have the option to fund the card.
    </p>
    <m-text-field
      id="eth-private-key"
      v-model="$store.state.route.config.privateKey"
      class="field"
      outlined
      placeholder="0x36fa71e0c8b177cc170e06e59abe8c83db1db0bae53a5f89624a891fd3c285a7"
    >
      <m-floating-label for="eth-private-key">Private Key</m-floating-label>
    </m-text-field>
    <template v-slot:footer>
      <config-footer />
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'
import ConfigFooter from '@/components/dialog/pages/ConfigFooter.vue'

export default {
  components: { DialogContent, ConfigFooter }
}
</script>

<style lang="scss" scoped>
.field {
  margin: 10px 0 0 0;
}
</style>
