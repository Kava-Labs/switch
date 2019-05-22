<template>
  <dialog-content>
    <template v-slot:header
      >Update In Progress</template
    >
    <p class="p">App will restart after update is complete.</p>
    <loading-spinner />
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'
import LoadingSpinner from '@/components/dialog/pages/LoadingSpinner.vue'
import { LedgerEnv } from '@kava-labs/switch-api'

export default {
  components: {
    DialogContent,
    LoadingSpinner
  }
}
</script>
