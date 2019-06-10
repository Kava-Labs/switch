<template>
  <dialog-content>
    <template v-slot:header
      >Oops!</template
    >
    <p class="p">
      Switch uses payment channels to enable instant swaps. To receive money,
      Kava's connector needs to escrow funds in a payment channel to your card.
    </p>
    <p class="p">
      If you just created the card, try waiting a few moments while the payment
      channel is created.
    </p>
    <p class="p">
      If that still doesn't work, sometimes depositing a small amount will fix
      the issue.
    </p>
    <template v-slot:footer>
      <m-button raised @click="$store.dispatch('dismissDialog')"
        >Close</m-button
      >
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'

export default {
  components: {
    DialogContent
  }
}
</script>
