<template>
  <div class="amount-input">
    <m-text-field
      :focused="focused"
      :value="amount"
      outlined
      @model="emitInput"
    >
      <div class="amount-input__asset-code">{{ assetCode }}</div>
      <m-floating-label v-if="label">{{ label }}</m-floating-label>
    </m-text-field>
    <div v-if="amountUsd" class="amount-input__reported-amount">
      {{ amountUsd }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      default: null,
      type: String
    },
    assetCode: {
      required: true,
      type: String
    },
    amount: {
      required: true,
      validator: value => typeof value === 'string' || value === null
    },
    amountUsd: {
      default: undefined,
      type: String
    },
    focused: {
      default: false,
      type: Boolean
    }
  },
  mounted() {
    if (this.focused) {
      this.$el.querySelector('.mdc-text-field__input').focus()
    }
  },
  methods: {
    emitInput(value) {
      this.$emit('input', value)

      // Reset the state of the text field to the value of the prop,
      // so the data flow is unidirectional
      this.$forceUpdate()
    }
  }
}
</script>

<style lang="scss">
.amount-input {
  display: flex;
  flex-flow: column nowrap;
  position: relative;

  &__asset-code {
    @extend %asset-code;
    color: $primary-700;
    align-self: center;
    position: absolute;
    right: 17px;
    top: 17px;
    transition: $transition-color;
  }

  &__reported-amount {
    @extend %reported-amount;
    margin: 10px 0 0 17px;
    grid-area: reported-amount;
  }

  .mdc-text-field {
    &__input {
      font-size: 18pt;
      font-weight: 300;
      letter-spacing: 0.1ch;
      font-variant-numeric: tabular-nums;
      // Appears material-ui adds this, but override it to stay consistent with cards?
      -webkit-font-smoothing: auto;
    }

    &--focused {
      .amount-input__asset-code,
      + .amount-input__reported-amount {
        color: $text-black-high-emphasis;
      }
    }
  }
}
</style>
