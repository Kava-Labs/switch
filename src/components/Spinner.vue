<template functional>
  <div class="spinner"></div>
</template>

<style lang="scss" scoped>
.spinner {
  margin: auto;
  position: relative;
  width: 64px;
  height: 64px;
  margin: 20px auto;
  box-sizing: border-box;
  border-radius: 50%;
  border: 6px solid $secondary-100;
  border-left: 6px solid $secondary;
  animation: spin 600ms linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
