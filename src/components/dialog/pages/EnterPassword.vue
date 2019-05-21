<template>
  <dialog-content>
    <template v-slot:header
      >Unlock Switch</template
    >
    <p class="p">Enter your password to decrypt stored credentials and keys.</p>
    <!-- TODO When attempting to initially focus this, really bizarre bug where sometimes
    there's no "d" in the label until it's blurred and focused again...-->
    <m-text-field
      id="prompt-password"
      v-model="$store.state.route.password"
      class="password-field"
      outlined
      type="password"
      @keyup.enter="$store.dispatch('enterPassword')"
    >
      <m-floating-label for="prompt-password">Password</m-floating-label>
    </m-text-field>
    <template v-slot:footer>
      <m-button raised @click="$store.dispatch('enterPassword')"
        >Unlock</m-button
      >
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'
import { LedgerEnv } from '@kava-labs/switch-api'

export default {
  components: {
    DialogContent
  }
}
</script>

<style lang="scss" scoped>
.password-field {
  margin: 10px 0;
}
</style>
