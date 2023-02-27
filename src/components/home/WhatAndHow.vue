<template>
    <section id="what">
        <h3>What I do</h3>
        <ul>
            <li v-for="service in services" :key="service.data.title"
                @mouseover="setTechHighlights(service.data.technology)" @mouseleave="setTechHighlights([])">
                {{ service.data.title }}
            </li>
        </ul>
    </section>
    <section id="how">
        <h3>How I do</h3>
        <ul>
            <li v-for="tech in technology" :key="tech.data.title" :class="{ fade: !isHighlighted(tech.id) }">
                <h6>{{ tech.data.title }}</h6>

                <div class="icon" v-html="tech.data.icon"></div>
            </li>
        </ul>
    </section>
</template>

<script setup lang="ts">import { ref } from 'vue';

const props = defineProps<{
    services: {
        data: {
            title: string;
            technology: string[];
        }

    }[],
    technology: {
        id: string;
        data: {
            title: string;
            icon: string;
        }
    }[]
}>();

const highlightedTech = ref<string[]>([]);

function isHighlighted(tech) {
    // If the technology is found in the list of tech or the list of tech is empty
    // Return true
    if (
        highlightedTech.value === tech
    ) {
        return true;
    }
    return false;
}

function setTechHighlights(tech) {
    highlightedTech.value = tech;
}

function getTechByName(name) {
    return this.tech.find(obj => {
        return obj.title === name;
    });
}
</script>

<style lang="scss" scoped>
#what {
    grid-area: what;

    ul {
        // list-style: square;
        // list-style-position: inside;
    }

    li {
        font-size: 2em;
        cursor: default;
        color: darkgray;
        padding: 0.25em 0;
        font-weight: 400;
        letter-spacing: 0.05em;

        &:hover {
            color: black;
        }

        @include breakpoint(phone) {
            font-size: 1.15em;
        }

        @include breakpoint(phablet) {
            font-size: 1.5em;
        }

        @include breakpoint(tablet) {
            font-size: 2em;
        }

        @include breakpoint(desktop) {
            font-size: 2em;
        }
    }
}

#how {
    grid-area: how;

    ul {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 2em;

        @include breakpoint(phone) {
            grid-template-columns: 1fr 1fr 1fr;
        }

        @include breakpoint(thone) {
            grid-template-columns: 1fr 1fr 1fr 1fr;
        }

        @include breakpoint(phablet) {
            grid-template-columns: 1fr 1fr 1fr;
        }

        @include breakpoint(desktop) {
            grid-template-columns: $main-grid-columns;
        }
    }

    h6 {
        position: absolute;
        top: -10px;
        opacity: 0;
        transition: all 100ms ease-in;
    }

    li {
        position: relative;
        width: 100%;
        background-color: $colour-medium;

        &:hover {
            h6 {
                top: -20px;
                opacity: 1;
            }
        }

        &::before {
            content: "";
            display: block;
            padding-top: 100%;
        }

        &.fade {
            opacity: 0.4;
        }

        .icon {
            position: absolute;
            top: 25%;
            left: 25%;
            height: 50%;
            width: 50%;
            text-align: center;
        }

        svg {
            width: 100%;
            height: 100%;
        }
    }
}
</style>