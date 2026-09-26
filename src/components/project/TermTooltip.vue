<template>
  <button type="button" class="term" v-tooltip="tooltip"><slot /></button>
</template>

<script lang="ts" setup>
import { vTooltip } from "floating-vue";

// Registers the stuible-tooltip theme and its styles
import "~/components/global/Tooltip.vue";

const props = defineProps<{
  def: string;
}>();

const tooltip = {
  content: props.def,
  theme: "stuible-tooltip",
  popperClass: "term-popper",
  distance: 12,
  triggers: ["hover", "focus", "touch"],
};
</script>

<style lang="scss" scoped>
.term {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  font-weight: 400;
  color: inherit;
  text-decoration: underline dotted $colour-link;
  text-decoration-thickness: 2px;
  text-underline-offset: 0.25em;
  cursor: help;
}
</style>

<style lang="scss">
// Definitions can wrap, so soften the pill shape
.v-popper--theme-stuible-tooltip.term-popper .v-popper__inner {
  max-width: 300px;
  border-radius: 18px;
  line-height: 1.45;
}
</style>
