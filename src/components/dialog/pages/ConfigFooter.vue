<template>
  <section class="container">
    <m-button @click="$store.dispatch('backToSelectAsset')">Back</m-button>
    <m-button raised @click="$store.dispatch('addCard')">Add Card</m-button>
  </section>
</template>

<style lang="scss" scoped>
.container {
  align-self: flex-end;
  flex-grow: 1;
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  align-items: flex-end;

  /** Add space between the two buttons */
  :last-child {
    margin: 0 0 0 20px;
  }
}
</style>
