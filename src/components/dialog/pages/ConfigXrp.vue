<template>
  <dialog-content>
    <template v-slot:header
      >Add XRP</template
    >
    <p v-if="$store.getters.isMainnet" class="p">
      Configure a new card with an XRP account. After, you'll have the option to
      fund the card.
    </p>
    <p v-else class="p">
      Configure a new card with an
      <a
        class="a"
        href="https://developers.ripple.com/xrp-test-net-faucet.html"
        @click="openLink"
        >XRP testnet</a
      >
      credential. After, you'll have the option to fund the card.
    </p>
    <m-text-field
      id="xrp-secret"
      v-model="$store.state.route.config.secret"
      class="field"
      outlined
      placeholder="sn3Ums2UK53s5VkuM9nFVrbWrkmYU"
    >
      <m-floating-label for="xrp-secret">Secret</m-floating-label>
    </m-text-field>
    <template v-slot:footer>
      <config-footer />
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'
import ConfigFooter from '@/components/dialog/pages/ConfigFooter.vue'
import { shell } from 'electron'

export default {
  components: { DialogContent, ConfigFooter },
  methods: {
    openLink(event) {
      event.preventDefault()
      shell.openExternal(event.target.href)
    }
  }
}
</script>

<style lang="scss" scoped>
// TODO Abstract this (password fields also require it)?
.field {
  margin: 10px 0 0 0;
}
</style>
