<template>
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
</template>

<script lang="ts">
import AddUplinkCard from '@/components/card/AddUplinkCard.vue'
import UplinkCard from '@/components/card/UplinkCard.vue'
import { mapState, mapGetters } from 'vuex'
import Vue from 'vue'
import { Uplink, HomeRoute } from '@/store'

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
      return this.routeInfo.selectedSourceUplink
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
    }
  },
  methods: {
    selectUplink(id: string) {
      if (!this.selectedSourceUplink) {
        this.$store.commit('NAVIGATE_TO', {
          name: 'home',
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

.card {
  width: $card-width;
  height: $card-height;
  position: relative;
}

// TODO Transitions for cards in layout

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
</style>
