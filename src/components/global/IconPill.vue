<template>
  <div class="pill-wrapper">
    <Tooltip v-if="tooltip" :distance="15" :triggers="['hover', 'focus', 'touch']" :aria-id="id">
      <button class="pill" :class="{ small: small }">
        <div class="icon">
          <img :src="icon ? icon : ''" :alt="`${label} Icon`" />
        </div>
        <span class="label">{{ label }}</span>
      </button>

      <template #popper>
        {{ tooltip }}
      </template>

    </Tooltip>
    <button v-else class="pill" :class="{ small: small }">
      <div class="icon">
        <img :src="icon ? icon : ''" :alt="`${label} Icon`" />
      </div>
      <span class="label">{{ label }}</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import Tooltip from "./Tooltip.vue";

const props = defineProps<{
  label: string;
  tooltip?: string;
  icon?: string;
  colour?: string;
  small?: boolean;
  id?: string;
}>();

const backgroundColour = props.colour ?? "#f5f5f5";

</script>

<style lang="scss" scoped>
.pill-wrapper {
  --backgroundColor: v-bind(backgroundColour);
}

.pill {
  display: inline-flex;
  align-items: center;
  border: none;
  font-size: 1em;
  padding-right: $spacing-xs;
  border-radius: 1rem;

  background-color: var(--backgroundColor);

  &.small {
    font-size: 0.75em;
  }
}

.icon {
  width: 0.75em;
  height: 0.75em;
  margin: 0.25em;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);

  img {
    width: 0.5em;
    height: 0.5em;
  }
}

.label {
  font-size: 0.45em;
  font-weight: 500;
  opacity: 0.8;
}
</style>