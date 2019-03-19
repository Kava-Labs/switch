<template>
  <div class="card__button">
    <svg class="card__button__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path v-if="type === 'deposit'" class="--bounce-up" d="M16 12l-4-4-4 4M12 16V9"></path>
      <path v-if="type === 'swap'" class="--bounce-right" d="M12 8l4 4-4 4M8 12h7"></path>
      <path v-if="type === 'withdraw'" class="--bounce-down" d="M16 12l-4 4-4-4M12 8v7"></path>
      <g v-if="type === 'remove'" class="--grow">
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </g>
      <g v-if="type === 'add'" class="--grow">
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </g>
      <circle cx="12" cy="12" r="10" stroke-width="1"></circle>
    </svg>
    <span class="card__button__label">{{ label || type }}</span>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      // The value must match one of these strings
      validator: value =>
        ['deposit', 'swap', 'withdraw', 'remove', 'add'].includes(value)
    },
    label: {
      type: String
    }
  }
}
</script>

<style lang="scss" scoped>
@import './card';
</style>
