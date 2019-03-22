<template>
  <div
    class="card-button"
    :class="{ 'card-button--dark': darkTheme }"
    @click.stop
  >
    <svg
      class="card-button__icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        v-if="type === 'deposit'"
        class="card-button__icon--bounce-up"
        d="M16 12l-4-4-4 4M12 16V9"
      ></path>
      <path
        v-if="type === 'swap'"
        class="card-button__icon--bounce-right"
        d="M12 8l4 4-4 4M8 12h7"
      ></path>
      <path
        v-if="type === 'withdraw'"
        class="card-button__icon--bounce-down"
        d="M16 12l-4 4-4-4M12 8v7"
      ></path>
      <g v-if="type === 'remove'" class="card-button__icon--grow">
        <line x1="15" y1="9" x2="9" y2="15"></line>
        <line x1="9" y1="9" x2="15" y2="15"></line>
      </g>
      <g v-if="type === 'add'" class="card-button__icon--grow">
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
      </g>
      <circle cx="12" cy="12" r="10" stroke-width="1"></circle>
    </svg>
    <span class="card-button__label">{{ label || type }}</span>
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
    },
    darkTheme: {
      default: false,
      type: Boolean
    }
  }
}
</script>

<style lang="scss" scoped>
@import './card';

.card-button {
  $self: &;
  flex-grow: 1;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;

  &__icon {
    width: 72px;
    fill: rgba(0, 0, 0, 0);
    stroke: #2d3142;
    stroke-width: 1.2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: 200ms stroke $easing-standard;
  }

  $pulsate-duration: 600ms;
  @mixin pulsate($name, $low, $high) {
    transform-origin: center;
    animation-name: pulsate-#{$name};
    animation-duration: $pulsate-duration;
    // Trigger the animation to begin EXACTLY in the middle of $low and $high
    // - 0.8 is a constant from the bezier curve (!@#$%^&*)
    // - 0.9 because $low begins at 0% and $high ends at 90% of the progression
    // - Negative delay is a hack to trigger the animation to play immediately,
    //   but at that time in its execution
    animation-delay: -1 * ($pulsate-duration - (0.8 * 0.9 * $pulsate-duration));
    animation-timing-function: $easing-decelerate;
    animation-iteration-count: infinite;

    @keyframes pulsate-#{$name} {
      0% {
        opacity: 0;
        transform: $low;
      }

      30% {
        opacity: 1;
      }

      60% {
        opacity: 1;
      }

      90% {
        opacity: 0;
        transform: $high;
      }

      100% {
        opacity: 0;
      }
    }
  }

  &__label {
    @extend %button;
    margin: 10px 0 0 0;
    text-transform: uppercase;
    transition: 0.2s color $easing-standard;
    user-select: none;
  }

  &--dark {
    #{ $self } {
      &__icon {
        stroke: white;
      }

      &__label {
        color: white;
      }
    }
  }

  &:hover {
    #{ $self } {
      &__icon {
        stroke: $secondary;

        &--grow {
          @include pulsate('grow', scale(0.8), scale(1.2));
        }

        &--bounce-up {
          @include pulsate('bounce-up', translateY(4px), translateY(-4px));
        }

        &--bounce-down {
          @include pulsate('bounce-down', translateY(-4px), translateY(4px));
        }

        &--bounce-right {
          @include pulsate('bounce-right', translateX(-4px), translateX(4px));
        }
      }
    }

    &__label {
      color: $secondary;
    }
  }
}
</style>
