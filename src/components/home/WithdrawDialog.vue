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
        <m-button class="withdraw-dialog__actions__cancel-button" @click="cancelWithdrawal">Cancel</m-button>
        <m-button
          class="withdraw-dialog__actions__accept-button"
          raised
          @click="startWithdrawal"
        >Withdraw</m-button>
      </footer>
    </section>
  </section>
</template>

<script>
import Vue from 'vue'
import BigNumber from 'bignumber.js'
import { convert, usd } from '@kava-labs/crypto-rate-utils'

export default {
  props: {
    routeInfo: {
      type: Object,
      required: true
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
      const uplink = this.uplink.getInternal()
      const uplinkId = this.uplink.id

      this.uplink.activeWithdrawal = this.$store.state.api
        .withdraw({ uplink })
        .then(async () => {
          // Remove the uplink
          await this.$store.state.api.remove(this.uplink.getInternal())
          this.$store.commit('REFRESH_UPLINKS')
          this.$store.commit('SHOW_TOAST', 'Successfully withdrew funds')
        })
        .catch(err => {
          this.$store.commit('SHOW_TOAST', 'Failed to withdraw funds')
        })
        .finally(() => {
          this.$store.commit('END_WITHDRAWAL', uplinkId)
        })

      this.cancelWithdrawal()
    },
    cancelWithdrawal() {
      this.$store.commit('NAVIGATE_TO', {
        name: 'home',
        meta: 'select-source-uplink'
      })
    }
  }
}
</script>

<!-- TODO Abstract these styles somewhere else -->
<style lang="scss">
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
