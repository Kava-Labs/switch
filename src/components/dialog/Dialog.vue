<template>
  <transition name="fade" mode="out-in">
    <section v-show="!!page" class="modal" appear>
      <transition name="fade" mode="out-in" appear>
        <div
          v-show="!!page"
          class="modal__backdrop"
          @click="$store.dispatch('dismissDialog')"
        />
      </transition>
      <transition :name="transitionName" mode="out-in" appear>
        <component :is="page" class="modal__dialog" />
      </transition>
    </section>
  </transition>
</template>

<script>
import Welcome from '@/components/dialog/pages/Welcome.vue'
import Agreement from '@/components/dialog/pages/Agreement.vue'
import SetPassword from '@/components/dialog/pages/SetPassword.vue'
import LoadingSpinner from '@/components/dialog/pages/LoadingSpinner.vue'
import SelectAsset from '@/components/dialog/pages/SelectAsset.vue'
import ConfigEth from '@/components/dialog/pages/ConfigEth.vue'
import ConfigXrp from '@/components/dialog/pages/ConfigXrp.vue'
import ConfigBtc from '@/components/dialog/pages/ConfigBtc.vue'
import Deposit from '@/components/dialog/pages/Deposit.vue'
import Withdraw from '@/components/dialog/pages/Withdraw.vue'
import EnterPassword from '@/components/dialog/pages/EnterPassword.vue'
import SelectMode from '@/components/dialog/pages/SelectMode.vue'
import AutoUpdate from '@/components/dialog/pages/AutoUpdate.vue'
import { SettlementEngineType } from '@kava-labs/switch-api'
import Vue from 'vue'

export default {
  data() {
    return {
      // Default transition
      transitionName: 'zoom',
      // Default page
      page: LoadingSpinner
    }
  },
  computed: {
    route() {
      return this.$store.state.route
    }
  },
  watch: {
    /**
     * - Change the transition *before* the dynamic component is re-rendered!
     * - Since we need to know old state and new state to determine transition,
     *   this must use a watcher instead of a computed property
     */
    route(route, oldRoute) {
      this.transitionName =
        route.type === 'home' || oldRoute.type === 'home'
          ? 'zoom'
          : route.type === 'select-asset' &&
            oldRoute.type === 'config-credential'
          ? 'float-left'
          : 'float-right'

      /**
       * TODO The route/dynamic component is updated before the transition is updated, which is bad (wrong transition)
       * $nextTick resolves this, *but* the component is rendered using old route info, which causes errors
       *
       * Should route info be passed as a prop into each component instead? More unidirectional, could be better
       */
      this.$nextTick(() => {
        this.page =
          {
            'initial-load': LoadingSpinner,
            'prompt-password': EnterPassword,
            'select-mode': SelectMode,
            welcome: Welcome,
            agreement: Agreement,
            'set-password': SetPassword,
            'connecting-sdk': LoadingSpinner,
            'select-asset': SelectAsset,
            'config-credential': route.config
              ? {
                  [SettlementEngineType.Lnd]: ConfigBtc,
                  [SettlementEngineType.Machinomy]: ConfigEth,
                  [SettlementEngineType.XrpPaychan]: ConfigXrp
                }[route.config.settlerType]
              : null,
            'creating-uplink': LoadingSpinner,
            deposit: Deposit,
            withdraw: Withdraw,
            'update-in-progress': AutoUpdate
          }[route.type] || null
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.modal {
  width: 100%;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  // background: rgba(0, 0, 0, 0.5);
  /** Using an RGBA background caused stuttering. This fixes animations through hardware acceleration */
  // transform: translateZ(0);
  overflow: hidden;

  &__backdrop {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 15;
    left: 0;
    top: 0;
    opacity: 0.5;
    background: black;
  }

  &__dialog {
    width: 520px;
    padding: 30px;
    box-sizing: border-box;
    position: absolute;
    z-index: 20;
    background: white;
    border-radius: $card-radii;
    box-shadow: $card-shadow;
  }
}

/** Fade animation for the dimmed backdrop */

.fade-enter-active {
  transition: opacity 200ms;
}

.fade-enter-active {
  transition-timing-function: $easing-decelerate;
}

.fade-leave-active {
  transition-timing-function: $easing-accelerate;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

/** Zoom animation for opening/closing a dialog */

.zoom-enter-active,
.zoom-leave-active {
  transition: transform 200ms;
}

.zoom-enter-active {
  transition-timing-function: $easing-decelerate;
}

.zoom-leave-active {
  transition-timing-function: $easing-accelerate;
}

.zoom-enter,
.zoom-leave-to {
  transform: scale(0);
}

/** Float animation for navigation between steps/slides in a flow */

.float-right-enter-active,
.float-right-leave-active,
.float-left-enter-active,
.float-left-leave-active {
  transition: transform 240ms, opacity 180ms 60ms;
}

.float-right-enter-active,
.float-left-enter-active {
  transition-timing-function: $easing-decelerate;
}

.float-right-leave-active,
.float-left-leave-active {
  transition-timing-function: $easing-accelerate;
}

.float-right-enter,
.float-right-leave-to,
.float-left-enter,
.float-left-leave-to {
  opacity: 0;
}

.float-right-enter {
  transform: translateX(100%);
}

.float-right-leave-to {
  transform: translateX(-100%);
}

.float-left-enter {
  transform: translateX(-100%);
}

.float-left-leave-to {
  transform: translateX(100%);
}
</style>
