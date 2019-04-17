<template>
  <section class="dialog-container">
    <div class="backdrop" @click="cancelConfig"></div>
    <section class="config-dialog dialog">
      <transition name="fade" mode="out-in">
        <section v-if="!config" key="select-asset">
          <header class="config-dialog__header">Add Card</header>
          <p class="config-dialog__get-started">
            To get started, select an asset, then add a new card.
          </p>
          <section class="button-container">
            <div
              class="config-button config-button--btc"
              @click="configLightning"
            >
              BTC
            </div>
            <div class="config-button config-button--eth" @click="configEth">
              ETH
            </div>
            <div class="config-button config-button--xrp" @click="configXrp">
              XRP
            </div>
          </section>
          <footer v-if="!noUplinks" class="config-dialog__actions">
            <m-button
              class="config-dialog__actions__cancel-button"
              @click="cancelConfig"
              >Cancel</m-button
            >
          </footer>
        </section>
        <section v-if="config" key="config-uplink">
          <header class="config-dialog__header">Add {{ assetName }}</header>
          <main>
            <section v-if="isXrp" class="config-dialog__config">
              <p v-if="isMainnet" class="config-dialog__instructions">
                Configure a new card with an XRP account. After, you'll have the
                option to fund the card.
              </p>
              <p v-else class="config-dialog__instructions">
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
                v-model="config.secret"
                class="config-dialog__field"
                outlined
                placeholder="sn3Ums2UK53s5VkuM9nFVrbWrkmYU"
              >
                <m-floating-label for="xrp-secret">Secret</m-floating-label>
              </m-text-field>
            </section>
            <section v-if="isEth" class="config-dialog__config">
              <p v-if="isMainnet" class="config-dialog__instructions">
                Configure a new card with an Ethereum account. After, you'll
                have the option to fund the card.
              </p>
              <p v-else class="config-dialog__instructions">
                Configure a new card with a Kovan testnet account. After, you'll
                have the option to fund the card.
              </p>
              <m-text-field
                id="eth-private-key"
                v-model="config.privateKey"
                class="config-dialog__field"
                outlined
                placeholder="0x36fa71e0c8b177cc170e06e59abe8c83db1db0bae53a5f89624a891fd3c285a7"
              >
                <m-floating-label for="eth-private-key"
                  >Private Key</m-floating-label
                >
              </m-text-field>
            </section>
            <section v-if="isLightning" class="config-dialog__config">
              <p v-if="isMainnet" class="config-dialog__instructions">
                Configure a new card with credentials for a Bitcoin LND node.
              </p>
              <p v-else class="config-dialog__instructions">
                Configure a new card with credentials for a Bitcoin testnet LND
                node.
              </p>
              <m-text-field
                id="lnd-hostname"
                v-model="config.hostname"
                class="config-dialog__field"
                outlined
                placeholder="localhost"
              >
                <m-floating-label for="lnd-hostname">Hostname</m-floating-label>
              </m-text-field>
              <m-text-field
                id="lnd-grpc-port"
                v-model="config.grpcPort"
                class="config-dialog__field"
                outlined
                placeholder="10009"
              >
                <m-floating-label for="lnd-grpc-port"
                  >gRPC Port</m-floating-label
                >
              </m-text-field>
              <m-text-field
                id="lnd-tls-cert"
                v-model="config.tlsCert"
                class="config-dialog__field config-dialog__field--textarea"
                textarea
                outlined
                placeholder="LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNpRENDQWkrZ0F3SUJBZ0lRZG81djBRQlhIbmppNGhSYWVlTWpOREFLQmdncWhrak9QUVFEQWpCSE1SOHcKSFFZRFZRUUtFeFpzYm1RZ1lYVjBiMmRsYm1WeVlYUmxaQ0JqWlhKME1TUXdJZ1lEVlFRREV4dEtkWE4wZFhOegpMVTFoWTBKdmIyc3RVSEp2TFRNdWJHOWpZV3d3SGhjTk1UZ3dPREl6TURVMU9ERXdXaGNOTVRreE1ERTRNRFUxCk9ERXdXakJITVI4d0hRWURWUVFLRXhac2JtUWdZWFYwYjJkbGJtVnlZWFJsWkNCalpYSjBNU1F3SWdZRFZRUUQKRXh0S2RYTjBkWE56TFUxaFkwSnZiMnN0VUhKdkxUTXViRzlqWVd3d1dUQVRCZ2NxaGtqT1BRSUJCZ2dxaGtpTwpQUU1CQndOQ0FBU0ZoUm0rdy9UMTBQb0t0ZzRsbTloQk5KakpENDczZmt6SHdQVUZ3eTkxdlRyUVNmNzU0M2oyCkpyZ0ZvOG1iVFYwVnRwZ3FrZksxSU1WS01MckYyMXhpbzRIOE1JSDVNQTRHQTFVZER3RUIvd1FFQXdJQ3BEQVAKQmdOVkhSTUJBZjhFQlRBREFRSC9NSUhWQmdOVkhSRUVnYzB3Z2NxQ0cwcDFjM1IxYzNNdFRXRmpRbTl2YXkxUQpjbTh0TXk1c2IyTmhiSUlKYkc5allXeG9iM04wZ2dSMWJtbDRnZ3AxYm1sNGNHRmphMlYwaHdSL0FBQUJoeEFBCkFBQUFBQUFBQUFBQUFBQUFBQUFCaHhEK2dBQUFBQUFBQUFBQUFBQUFBQUFCaHhEK2dBQUFBQUFBQUF3bGM5WmMKazdiRGh3VEFxQUVFaHhEK2dBQUFBQUFBQUJpTnAvLytHeFhHaHhEK2dBQUFBQUFBQUtXSjV0bGlET1JqaHdRSwpEd0FDaHhEK2dBQUFBQUFBQUc2V3ovLyszYXRGaHhEOTJ0RFF5djRUQVFBQUFBQUFBQkFBTUFvR0NDcUdTTTQ5CkJBTUNBMGNBTUVRQ0lBOU85eHRhem1keENLajBNZmJGSFZCcTVJN0pNbk9GUHB3UlBKWFFmcllhQWlCZDVOeUoKUUN3bFN4NUVDblBPSDVzUnB2MjZUOGFVY1hibXlueDlDb0R1ZkE9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg=="
              >
                <m-floating-label for="lnd-tls-cert"
                  >TLS Certificate (base64)</m-floating-label
                >
              </m-text-field>
              <m-text-field
                id="lnd-macaroon"
                v-model="config.macaroon"
                class="config-dialog__field config-dialog__field--textarea"
                textarea
                outlined
                placeholder="AgEDbG5kArsBAwoQ3/I9f6kgSE6aUPd85lWpOBIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV32ml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaFgoHbWVzc2FnZRIEcmVhZBIFd3JpdGUaFwoIb2ZmY2hhaW4SBHJlYWQSBXdyaXRlGhYKB29uY2hhaW4SBHJlYWQSBXdyaXRlGhQKBXBlZXJzEgRyZWFkEgV3cml0ZQAABiAiUTBv3Eh6iDbdjmXCfNxp4HBEcOYNzXhrm+ncLHf5jA=="
              >
                <m-floating-label for="lnd-macaroon"
                  >Admin Macaroon (base64)</m-floating-label
                >
              </m-text-field>
            </section>
          </main>
          <footer class="config-dialog__actions">
            <m-button
              class="config-dialog__actions__cancel-button"
              :disabled="pendingConfig"
              @click="cancelConfig"
              >Cancel</m-button
            >
            <m-button
              class="config-dialog__actions__accept-button"
              raised
              :disabled="pendingConfig"
              @click="addCard"
              >Add Card</m-button
            >
          </footer>
        </section>
      </transition>
    </section>
  </section>
</template>

<script>
import { SettlementEngineType, LedgerEnv } from '@kava-labs/switch-api'
import { generateUplinkId } from '@/store'
import { shell } from 'electron'

export default {
  data() {
    return {
      config: null,
      pendingConfig: null
    }
  },
  computed: {
    assetName() {
      return this.isXrp ? 'XRP' : this.isEth ? 'Ethereum' : 'Lightning'
    },
    isXrp() {
      return (
        this.config &&
        this.config.settlerType === SettlementEngineType.XrpPaychan
      )
    },
    isEth() {
      return (
        this.config &&
        this.config.settlerType === SettlementEngineType.Machinomy
      )
    },
    isLightning() {
      return this.config && this.config.settlerType === SettlementEngineType.Lnd
    },
    noUplinks() {
      return this.$store.state.uplinks.length === 0
    },
    isMainnet() {
      return this.$store.state.ledgerEnv === LedgerEnv.Mainnet
    }
  },
  methods: {
    openLink(event) {
      event.preventDefault()
      shell.openExternal(event.target.href)
    },
    configXrp() {
      this.config = {
        settlerType: SettlementEngineType.XrpPaychan,
        secret: ''
      }
    },
    configEth() {
      this.config = {
        settlerType: SettlementEngineType.Machinomy,
        privateKey: ''
      }
    },
    configLightning() {
      this.config = {
        settlerType: SettlementEngineType.Lnd,
        hostname: '',
        grpcPort: '',
        tlsCert: '',
        macaroon: ''
      }
    },
    addCard() {
      if (!this.config) {
        return
      }

      this.pendingConfig = this.$store.state.api
        .add(this.config)
        .then(uplink => {
          this.$store.commit('REFRESH_UPLINKS')

          const uplinkId = generateUplinkId(uplink)
          const generatedUplink = this.$store.state.uplinks.find(
            ({ id }) => id === uplinkId
          )

          // Automatically open deposit dialog after adding uplink
          // Don't show deposit screen if a Lightning uplink was created
          this.$store.commit(
            'NAVIGATE_TO',
            generatedUplink.canDeposit
              ? {
                  name: 'home',
                  meta: 'deposit',
                  id: generateUplinkId(uplink)
                }
              : {
                  name: 'home',
                  meta: 'select-source-uplink'
                }
          )
        })
        .catch(err => {
          this.pendingConfig = null
          this.$store.commit('SHOW_TOAST', 'Failed to configure new card')
        })
    },
    cancelConfig() {
      if (this.pendingConfig) {
        return
      }

      if (this.noUplinks) {
        if (this.config) {
          // If no uplinks and on config screen, return to welcome
          this.config = null
        }

        // If no uplinks and on "welcome" screen, don't do anything
        return
      }

      this.$store.commit('NAVIGATE_TO', {
        name: 'home',
        meta: 'select-source-uplink'
      })
    }
  }
}
</script>

<style lang="scss">
.config-dialog__get-started {
  margin: 0 0 10px 0;
  color: $text-black-medium-emphasis;
}

.button-container {
  margin: 25px 0 40px 0;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
}

.config-button {
  width: 120px;
  height: 120px;
  margin: 0 0 20px 0;
  background: white;
  background-repeat: no-repeat;
  background-clip: border-box;
  background-position: center;
  transition-property: box-shadow, color;
  transition-duration: 200ms;
  transition-timing-function: $easing-standard;
  box-shadow: inset 0 0 16px rgba(40, 51, 75, 0.55);
  cursor: pointer;
  user-select: none;
  -webkit-user-drag: none;
  @extend %button;
  font-size: 14pt;
  text-transform: uppercase;
  line-height: 290px;
  border-radius: 50%;
  text-align: center;

  &:hover {
    color: $secondary;
    box-shadow: inset 0 0 16px 4px $secondary-200;
  }

  &--xrp {
    background-image: url('~@/assets/xrp-logo-black.svg');
    background-size: 70px;
  }

  &--eth {
    background-image: url('~@/assets/ethereum-logo.svg');
    background-size: 55px;
  }

  &--btc {
    background-image: url('~@/assets/lightning-logo.png');
    background-size: 80px;
  }

  &__label {
    @extend %button;
    margin: 15px 0 0 0;
    text-transform: uppercase;
    transition: 0.2s color $easing-standard;
    user-select: none;
    text-align: center;
  }
}

.dialog-container {
  width: 100%;
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.config-dialog {
  width: 500px;
  padding: 30px;
  box-sizing: border-box;
  position: absolute;
  z-index: 20;
  background: white;
  border-radius: $card-radii;
  transform: scale(1);
  box-shadow: $card-shadow;
  display: flex;
  flex-flow: column nowrap;

  // TODO Share this betweeen swap screen, too
  &__header {
    margin: 0 0 10px 0;
    font-weight: 300;
    font-size: 36px;
    letter-spacing: 0;
    user-select: none;
    text-align: left;
  }

  &__instructions {
    margin: 0 0 20px 0;
    color: $text-black-medium-emphasis;
  }

  &__config {
    display: flex;
    flex-flow: column nowrap;
  }

  &__field {
    margin: 0 0 20px 0;

    &--textarea {
      height: 100px !important;
    }
  }

  &__actions {
    margin: 10px 0 0 0;
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
  z-index: 10;
  background: black;
  opacity: 0.5;
}
</style>
