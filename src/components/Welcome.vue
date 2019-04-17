<template>
  <section class="welcome">
    <header class="welcome__header">Welcome</header>
    <p class="welcome__get-started">
      Switch is an Interledger wallet that enables lightning-fast swaps,
      interoperability across blockchains, and complete self-custody of assets.
    </p>
    <p class="welcome__get-started">
      Would you like to use testnet mode (recommended to get started) or mainnet
      mode (real money)?
    </p>
    <p class="welcome__get-started">
      At any time, you can reopen the app and change modes. Your credentials for
      both will be securely saved.
    </p>
    <section class="welcome__cta">
      <m-button raised @click="selectTestnet">Testnet</m-button>
      <m-button class="welcome__cta__mainnet-button" @click="selectMainnet"
        >Mainnet</m-button
      >
    </section>
  </section>
</template>

<script>
import { LedgerEnv } from '@kava-labs/switch-api'

export default {
  methods: {
    selectTestnet() {
      this.$store.dispatch('loadApi', LedgerEnv.Testnet)
    },
    selectMainnet() {
      this.$store.dispatch('loadApi', LedgerEnv.Mainnet)
    }
  }
}
</script>

<style lang="scss">
.welcome {
  width: 500px;
  margin: 20px auto;

  // TODO Share this betweeen swap screen, too
  &__header {
    margin: 0 0 10px 0;
    font-weight: 300;
    font-size: 36px;
    letter-spacing: 0;
    user-select: none;
    text-align: center;
  }

  &__get-started {
    margin: 0 0 10px 0;
    color: $text-black-medium-emphasis;
  }

  &__cta {
    margin: 20px 0 0 0;

    &__mainnet-button {
      margin: 0 0 0 20px;
    }
  }
}
</style>
