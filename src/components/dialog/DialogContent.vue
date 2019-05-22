<template functional>
  <section class="dialog-content">
    <header class="dialog-content__header">
      <slot name="header" />
    </header>
    <main class="dialog-content__body">
      <slot />
    </main>
    <footer class="dialog-content__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style lang="scss" scoped>
.dialog-content {
  display: flex;
  flex-flow: column nowrap;

  // TODO Share the styling between the swap screen
  &__header {
    margin: 0 0 10px 0;
    font-weight: 300;
    font-size: 36px;
    letter-spacing: 0;
    user-select: none;
    align-self: flex-start;
  }

  &__body {
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
  }

  &__footer {
    margin: 20px 0 0 0;
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
}
</style>
