<template>
  <div class="amount-input">
    <div ref="mdc-text-field" class="mdc-text-field mdc-text-field--outlined">
      <input
        id="tf-outlined"
        ref="text-input"
        class="mdc-text-field__input"
        type="text"
        :value="amount"
        @input.stop="emitInput"
      />
      <div class="amount-input__asset-code">{{ assetCode }}</div>
      <div class="mdc-notched-outline">
        <div class="mdc-notched-outline__leading"></div>
        <div class="mdc-notched-outline__notch">
          <label for="tf-outlined" class="mdc-floating-label">
            {{ label }}
          </label>
        </div>
        <div class="mdc-notched-outline__trailing"></div>
      </div>
    </div>
    <div v-if="amountUsd" class="amount-input__usd-amount">
      <span class="amount-input__usd-amount__dollar-sign">$</span>
      <span>{{ amountUsd }}</span>
    </div>
  </div>
</template>

<script>
import { MDCTextField } from '@material/textfield'

export default {
  props: {
    label: {
      required: true,
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

  /**
   * TODO Should this be replaced with the text field from material-components-vue? Looks pretty good!
   * (I'm also implementing some of this wrong; .destroy() on component should be called when removed from DOM)
   */

  mounted() {
    this.initTextField()

    if (this.focused) {
      this.$refs['text-input'].focus()
    }
  },
  updated() {
    this.initTextField()
  },
  methods: {
    initTextField() {
      new MDCTextField(this.$refs['mdc-text-field'])
    },
    emitInput(event) {
      this.$emit('input', event.target.value)

      // Reset the state of the text field to the value of the prop,
      // so the data flow is unidirectional
      this.$forceUpdate()
    }
  }
}
</script>

<style lang="scss">
$mdc-typography-font-family: 'Rubik';
@import '~@material/textfield/mdc-text-field';

$transition-color: 0.2s color $easing-standard;

.amount-input {
  display: flex;
  flex-flow: column nowrap;

  &__asset-code {
    @extend %asset-code;
    color: $primary-700;
    align-self: center;
    position: absolute;
    right: 15px;
    margin-top: -1px;
    transition: $transition-color;
  }

  &__usd-amount {
    margin: 10px 0 0 17px;
    grid-area: usd-amount;
    color: $primary-600;
    font-size: 14pt;
    font-weight: 500;
    letter-spacing: 0.1ch;
    font-variant-numeric: tabular-nums;
    transition: $transition-color;

    &__dollar-sign {
      margin-right: 1px;
    }
  }
}

.mdc-text-field {
  @include mdc-text-field-outline-shape-radius(3.175mm);
  @include mdc-text-field-outline-color($primary-300);
  @include mdc-text-field-hover-outline-color($primary-800);
  transition: $transition-color;

  :not(&--focused) {
    @include mdc-text-field-ink-color($primary-700);
    @include mdc-text-field-caret-color($primary-700);
    @include mdc-text-field-label-color($primary-700);
  }

  &--focused {
    // Label and outline change to orange on focus
    @include mdc-text-field-ink-color($text-black-high-emphasis);
    @include mdc-text-field-label-color($secondary);
    @include mdc-text-field-focused-outline-color($secondary);

    .amount-input__asset-code,
    + .amount-input__usd-amount {
      color: $text-black-high-emphasis;
    }
  }

  &__input {
    font-size: 18pt;
    font-weight: 300;
    letter-spacing: 0.1ch;
    font-variant-numeric: tabular-nums;
    // Appears material-ui adds this, but override it to stay consistent with cards?
    -webkit-font-smoothing: auto;
  }
}
</style>
