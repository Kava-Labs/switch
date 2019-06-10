<template>
  <dialog-content>
    <template v-slot:header
      >Add Card</template
    >
    <p class="p">Select an asset to add a new card.</p>
    <section class="select-asset">
      <div class="select-asset__button" @click="$store.dispatch('selectBtc')">
        <div
          class="select-asset__button__icon select-asset__button__icon--btc"
        />
        <label class="select-asset__button__label">BTC</label>
      </div>
      <div class="select-asset__button" @click="$store.dispatch('selectEth')">
        <div
          class="select-asset__button__icon select-asset__button__icon--eth"
        />
        <label class="select-asset__button__label">ETH</label>
      </div>
      <div class="select-asset__button" @click="$store.dispatch('selectXrp')">
        <div
          class="select-asset__button__icon select-asset__button__icon--xrp"
        />
        <label class="select-asset__button__label">XRP</label>
      </div>
      <div class="select-asset__button" @click="$store.dispatch('selectDai')">
        <div
          class="select-asset__button__icon select-asset__button__icon--dai"
        />
        <label class="select-asset__button__label">DAI</label>
      </div>
    </section>
    <template v-slot:footer>
      <m-button @click="$store.dispatch('dismissDialog')">Cancel</m-button>
    </template>
  </dialog-content>
</template>

<script>
import DialogContent from '@/components/dialog/DialogContent.vue'

export default {
  components: {
    DialogContent
  }
}
</script>

<style lang="scss" scoped>
.select-asset {
  margin: 10px 0 0 0;
  align-self: stretch;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;

  &__button {
    $button: &;

    margin: 10px 0;
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    cursor: pointer;

    &--disabled {
      filter: grayscale(100%);
      cursor: default;
    }

    &__icon {
      width: 90px;
      height: 90px;
      background: white;
      background-repeat: no-repeat;
      background-clip: border-box;
      background-position: center;
      transition-property: box-shadow, color;
      transition-duration: 150ms;
      transition-timing-function: $easing-standard;
      box-shadow: inset 0 0 12px rgba(40, 51, 75, 0.4);
      user-select: none;
      -webkit-user-drag: none;
      border-radius: 50%;

      &--xrp {
        background-image: url('~@/assets/xrp-logo-black.svg');
        background-size: 50px;
      }

      &--eth {
        background-image: url('~@/assets/ethereum-logo.svg');
        background-size: 40px;
      }

      &--btc {
        background-image: url('~@/assets/lightning-logo.png');
        background-size: 60px;
      }

      &--dai {
        background-image: url('~@/assets/dai-logo.svg');
        background-size: 100px;
      }

      @at-root #{$button}:hover:not(#{$button}--disabled) & {
        box-shadow: inset 0 0 12px 2px $secondary-200;
      }
    }

    &__label {
      @extend %button;
      margin: 20px 0 0 0;
      text-transform: uppercase;
      transition: 0.2s color $easing-standard;
      user-select: none;
      font-size: 14pt;

      @at-root #{$button}:hover:not(#{$button}--disabled) & {
        color: $secondary;
      }
    }
  }
}
</style>
