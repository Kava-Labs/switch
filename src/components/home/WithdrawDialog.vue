<template>
  <section>
    <div class="backdrop" @click="cancelWithdrawal"></div>
    <section class="withdraw-dialog dialog">
      <header class="withdraw-dialog__header">Withdraw</header>
      <main>
        <p class="withdraw-dialog__custody-notice">
          Remove the card and return balance to account on base layer
          blockchain?
        </p>
      </main>
      <footer class="withdraw-dialog__actions">
        <m-button
          class="withdraw-dialog__actions__cancel-button"
          :disabled="withdrawalStarted"
          @click="cancelWithdrawal"
          >Cancel</m-button
        >
        <m-button
          class="withdraw-dialog__actions__accept-button"
          raised
          :disabled="withdrawalStarted"
          @click="startWithdrawal"
          >Accept</m-button
        >
      </footer>
    </section>
  </section>
</template>

<script>
import Vue from 'vue'
import Button from 'material-components-vue/dist/button'
import BigNumber from 'bignumber.js'
import { convert, usd } from '@kava-labs/crypto-rate-utils'

Vue.use(Button)

export default {
  props: {
    routeInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      withdrawalStarted: false,
      withdrawalDone: false
    }
  },
  computed: {
    uplink() {
      return this.$store.state.uplinks.find(
        uplink => uplink.id === this.routeInfo.id
      )
    }
  },
  methods: {
    async startWithdrawal() {
      this.withdrawalStarted = true

      const uplink = this.uplink.getInternal()
      this.$store.state.api
        .withdraw({ uplink })
        .finally(() => {
          this.withdrawalDone = true
          this.cancelWithdrawal()
        })
        .then(async () => {
          // Remove the uplink
          await this.$store.state.api.remove(this.uplink.getInternal())
          this.$store.commit('REFRESH_UPLINKS')

          // TODO Show success toast
        })
        .catch(err => {
          // TODO Show error toast
        })
    },
    cancelWithdrawal() {
      if (!this.isCancellable) {
        return
      }

      this.$store.commit('NAVIGATE_TO', {
        name: 'home',
        meta: 'select-source-uplink'
      })
    },
    isCancellable() {
      return !this.withdrawalStarted || this.withdrawalDone
    }
  }
}
</script>

<!-- TODO Abstract these styles somewhere else -->
<style lang="scss">
$mdc-typography-font-family: 'Rubik';
$mdc-theme-primary: $secondary;
@import 'material-components-vue/dist/button/styles';

.withdraw-dialog {
  width: 420px;
  height: 240px;
  padding: 40px;
  box-sizing: border-box;
  position: absolute;
  z-index: 20;
  left: calc((100% - 420px) / 2);
  top: calc((100% - 240px) / 2);
  background: white;
  border-radius: $card-radii;
  transform: scale(1);
  box-shadow: $card-shadow;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;

  // TODO Share this betweeen swap screen, too
  &__header {
    margin: 0 0 10px 0;
    font-weight: 300;
    font-size: 36px;
    letter-spacing: 0;
    user-select: none;
    text-align: center;
  }

  &__actions {
    align-self: flex-end;
    flex-grow: 1;
    display: flex;
    flex-flow: row wrap;
    justify-content: flex-end;
    align-items: flex-end;

    &__cancel-button {
      margin-right: 20px;
    }
  }

  &__custody-notice {
    margin: 0 0 30px 0;
    color: $text-black-medium-emphasis;
  }
}

.backdrop {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 15;
  background: black;
  opacity: 0.5;
}
</style>
