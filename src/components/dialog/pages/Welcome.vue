<template>
  <dialog-content>
    <template v-slot:header
      >Welcome to Switch!</template
    >
    <p v-if="!$store.state.config" class="p p--large">
      Switch is an Interledger wallet enabling lightning-fast crypto swaps and
      complete self-custody of assets.
    </p>
    <p v-else class="p">
      In this latest release, we'll guide you through setting a password. (Don't
      worry, your saved cards are still here!)
    </p>
    <template v-slot:footer>
      <m-button raised @click="promptAgreement">Let's Go</m-button>
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'

export default {
  components: {
    DialogContent
  },
  methods: {
    promptAgreement() {
      this.$store.commit('NAVIGATE_TO', {
        type: 'agreement'
      })
    }
  }
}
</script>
