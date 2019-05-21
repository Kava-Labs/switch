<template>
  <dialog-content>
    <template v-slot:header
      >Set Password</template
    >
    <p class="p">
      Enter a hard-to-guess password, which is used to securely encrypt your
      credentials and private keys.
    </p>
    <p class="p p--emphasis">
      Funds may be unrecoverable if this password is lost or forgotten.
    </p>
    <p class="p p--emphasis">
      Kava cannot recover your password or private keys.
    </p>
    <m-text-field
      id="set-password"
      v-model="$store.state.route.password"
      class="password-field"
      outlined
      type="password"
    >
      <m-floating-label for="set-password">New Password</m-floating-label>
    </m-text-field>
    <m-text-field
      id="retype-password"
      v-model="$store.state.route.password2"
      class="password-field"
      outlined
      type="password"
    >
      <m-floating-label for="retype-password"
        >Re-type Password</m-floating-label
      >
    </m-text-field>
    <template v-slot:footer>
      <m-button raised @click="nextPage">Confirm</m-button>
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
    nextPage() {
      this.$store.dispatch('setPassword')
    }
  }
}
</script>

<style lang="scss" scoped>
.password-field {
  margin: 10px 0 10px 0;
}
</style>
