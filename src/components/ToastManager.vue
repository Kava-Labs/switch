<template>
  <div class="toast-container">
    <transition-group name="stack">
      <div
        v-for="toast in $store.state.toasts"
        :key="toast.key"
        class="toast"
        @click="$store.commit('HIDE_TOAST', toast.key)"
        v-html="toast.message"
      />
    </transition-group>
  </div>
</template>

<style lang="scss" scoped>
.toast-container {
  width: 500px; // To prevent cutting off shadows
  height: fit-content;
  padding: 0 30px 30px 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-end;
  position: absolute;
  overflow: hidden;
  z-index: 30;
  bottom: 0;
  right: 0;
}

.toast {
  max-width: 400px;
  min-width: 300px;
  height: 48px;
  margin: 20px 0 0 0;
  padding: 0 20px;
  border-radius: 24px;
  box-sizing: border-box;
  background: $primary-900;
  line-height: 48px;
  color: $text-white-high-emphasis;
  box-shadow: $card-shadow;
}

.stack-move {
  transition: transform 200ms $easing-standard;
}

.stack-enter-active {
  transition: transform 200ms $easing-standard;
}

.stack-leave-active {
  transition: transform 200ms $easing-standard, opacity 200ms $easing-standard;
}

.stack-enter,
.stack-leave-to {
  opacity: 0;
  transform: translateY(50px);
}
</style>
