<template>
  <section>
    <transition-group name="list" class="card-container" tag="div">
      <div v-for="uplink in uplinks" :key="uplink.id" class="card">
        <uplink-card
          :uplink="uplink"
          :display="uplinksDisplay[uplink.id]"
          @select="selectUplink"
        />
      </div>
      <div v-if="!selectedSourceUplink" key="add-uplink" class="card">
        <add-uplink-card />
      </div>
    </transition-group>
    <transition name="prompt" mode="out-in">
      <component :is="metaRoute" :route-info="routeInfo" />
    </transition>
  </section>
</template>

<script lang="ts">
import AddUplinkCard from '@/components/card/AddUplinkCard.vue'
import UplinkCard from '@/components/card/UplinkCard.vue'
import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'
import { Uplink, HomeRoute } from '@/store'
import DepositDialog from '@/components/home/DepositDialog.vue'
import WithdrawDialog from '@/components/home/WithdrawDialog.vue'

export default Vue.extend({
  components: {
    AddUplinkCard,
    UplinkCard
  },
  props: {
    routeInfo: {
      required: true,
      type: Object as () => HomeRoute
    }
  },
  computed: {
    selectedSourceUplink(): string | null {
      return this.routeInfo.meta === 'select-destination-uplink'
        ? this.routeInfo.selectedSourceUplink
        : null
    },
    ...(mapState(['uplinks']) as {
      uplinks(): Uplink[]
    }),
    uplinksDisplay(): {
      [id: string]: 'normal' | 'selected' | 'selectable'
    } {
      return this.uplinks.reduce(
        (acc, uplink) => ({
          ...acc,
          [uplink.id]: !this.selectedSourceUplink
            ? 'normal'
            : this.selectedSourceUplink === uplink.id
            ? 'selected'
            : 'selectable'
        }),
        {}
      )
    },
    metaRoute(): typeof DepositDialog | typeof WithdrawDialog | null {
      return this.routeInfo.meta === 'deposit'
        ? DepositDialog
        : this.routeInfo.meta === 'withdrawal'
        ? WithdrawDialog
        : null
    }
  },
  methods: {
    selectUplink(id: string) {
      if (!this.selectedSourceUplink) {
        this.$store.commit('NAVIGATE_TO', {
          name: 'home',
          meta: 'select-destination-uplink',
          selectedSourceUplink: id
        })
      } else {
        this.$store.commit('NAVIGATE_TO', {
          name: 'swap',
          sourceUplink: this.selectedSourceUplink,
          destinationUplink: id
        })
      }
    }
  }
})
</script>

<style lang="scss">
.card-container {
  max-width: $content-max-width;
  margin: auto;
  padding: 20px 40px 40px 40px;
  box-sizing: border-box;
  display: grid;
  grid-gap: 40px;
  grid-template-columns: repeat(auto-fit, $card-width);
  justify-content: center;
}

// Wrapper is necessary so list transitions don't conflict with transitions within UplinkCard
.card {
  width: $card-width;
  height: $card-height;
  position: relative;
}

.list-move {
  transition: transform 300ms $easing-standard;
}

.list-enter-active {
  transition: opacity 300ms $easing-decelerate;
}

.list-leave-active {
  position: absolute;
}

.list-enter,
.list-leave-to {
  opacity: 0;
}

// Scale/fade transition for dialog
// TODO Can this be moved to within the Dialog component?

.backdrop,
.dialog {
  transition-property: transform, opacity;
  transition-duration: 200ms;
}

.prompt-enter-active,
.prompt-leave-active {
  transition: opacity 200ms; // Solely to trick Vue into apply the transition classes
}

.prompt-enter-active {
  .backdrop,
  .dialog {
    transition-timing-function: $easing-decelerate;
  }
}

.prompt-leave-active {
  .backdrop,
  .dialog {
    transition-timing-function: $easing-accelerate;
  }
}

.prompt-enter,
.prompt-leave-to {
  opacity: 1; // Solely to trick Vue

  .dialog,
  .backdrop {
    opacity: 0;
  }

  .dialog {
    transform: scale(0);
  }
}
</style>
