<template>
    <ol class="tech">
        <li v-for="(item, index) in techWithIcons">
            <IconPill :label="item.name" :icon="item.icon" :tooltip="item.tooltip" :colour="item.colour"
                :id="`tech-${index}`" />
        </li>
    </ol>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IconPill from '../global/IconPill.vue';

const props = defineProps<{
    techWithIcons: {
        name: string;
        icon: string;
        tooltip: string;
        colour: string;
    }[]
}>();


</script>

<style scoped lang="scss">
.tech {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    @include breakpoint(sm) {
        gap: 0.5rem;
    }

    @include breakpoint(md) {
        gap: 0.6rem;
    }

    @include breakpoint(lg) {
        gap: 0.7rem;
    }

    li {
        display: flex;
        gap: 1rem;
    }

    .logo {
        height: 1em;
    }

    h3 {
        font-size: 0.7rem;
        font-weight: normal;
    }
}
</style>