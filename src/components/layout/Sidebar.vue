<template>
    <a href="/#" aria-label="Home">

        <div class="icon" :class="{ reverse: reverseSwap }" ref="icon">
            <transition name="spin-fade" @enter-cancelled="onEnterCancel" @leave-cancelled="">
                <img v-if="currentIcon == 'logo'" ref="logo" src="/logo-sideways.svg" alt="" />
                <NowClock v-else-if="currentIcon == 'now'" class="now-clock" />
                <img v-else-if="currentIcon == 'skills'" src="/code.svg" alt="" />
                <img v-else-if="currentIcon == 'tech'" src="/hammer.svg" alt="" />
                <img v-else-if="currentIcon == 'work'" src="/hammer.svg" alt="" />
                <div v-else-if="currentIcon == 'projects'">―</div>
                <div v-else-if="currentIcon == 'project'">=</div>
            </transition>
        </div>
        <!-- {{ currentIcon }}  -->
    </a>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import NowClock from './NowClock.vue';
import { useScrollSpin } from '~/composables/useScrollSpin';

type SidebarIcon = 'logo' | 'now' | 'skills' | 'tech' | 'work' | 'projects' | 'project';

const currentIcon = shallowRef<SidebarIcon>('logo');
const icon = shallowRef<HTMLElement | null>(null);
const logo = shallowRef<HTMLElement | null>(null);
// Swap icons counterclockwise when scrolling up
const reverseSwap = shallowRef(false);
let lastSwapScrollY = 0;
const iconPaths = ['/logo-sideways.svg', '/code.svg', '/hammer.svg'];
const validIcons = new Set<SidebarIcon>([
    'logo',
    'now',
    'skills',
    'tech',
    'work',
    'projects',
    'project',
]);

const markerOffset = -25;
let iconMarkers: HTMLElement[] = [];
let animationFrame: number | undefined;
let iconsPreloaded = false;

useScrollSpin(logo, () => currentIcon.value === 'logo');

function onEnterCancel(event: Element) {
    event.classList.add('cancelled');
}

function preloadIcons() {
    if (iconsPreloaded) return;
    iconsPreloaded = true;

    iconPaths.forEach((path) => {
        if (document.head.querySelector(`link[rel="preload"][href="${path}"]`)) return;

        const preloadTag = document.createElement('link');
        preloadTag.rel = 'preload';
        preloadTag.as = 'image';
        preloadTag.href = path;
        document.head.appendChild(preloadTag);
    });
}

function refreshMarkers() {
    iconMarkers = Array.from(document.querySelectorAll<HTMLElement>('.has-icon'));
}

// The sidebar can hydrate before the HTML parser reaches the
// homepage sections, so keep re-querying until the document has finished
// parsing rather than on every scroll frame.
function ensureMarkers() {
    if (iconMarkers.length === 0 || document.readyState === 'loading') refreshMarkers();
}

function updateSidebarIcon() {
    animationFrame = undefined;
    if (!icon.value) return;

    ensureMarkers();
    if (iconMarkers.length === 0) return;

    const iconBottom = icon.value.getBoundingClientRect().bottom;
    let activeMarker = iconMarkers[0];

    for (const marker of iconMarkers) {
        if (marker.getBoundingClientRect().top + markerOffset > iconBottom) break;
        activeMarker = marker;
    }

    const scrollY = window.scrollY;
    const nextIcon = activeMarker?.dataset.icon as SidebarIcon | undefined;
    if (nextIcon && validIcons.has(nextIcon) && nextIcon !== currentIcon.value) {
        reverseSwap.value = scrollY < lastSwapScrollY;
        currentIcon.value = nextIcon;
    }
    lastSwapScrollY = scrollY;
}

function scheduleIconUpdate() {
    preloadIcons();
    if (animationFrame !== undefined) return;
    animationFrame = window.requestAnimationFrame(updateSidebarIcon);
}

function onResize() {
    refreshMarkers();
    scheduleIconUpdate();
}

onMounted(() => {
    updateSidebarIcon();
    window.addEventListener('scroll', scheduleIconUpdate, { passive: true });
    window.addEventListener('resize', onResize);

    // Mounting mid-parse only finds the markers above the sidebar (the header),
    // so pick up the rest of the page once it has been parsed.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onResize, { once: true });
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('scroll', scheduleIconUpdate);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('DOMContentLoaded', onResize);
    if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
});
</script>

<style scoped lang="scss">
.icon {
    position: relative;
    max-width: 3rem;


    @include breakpoint(md) {
        aspect-ratio: 1/1;
        display: flex;
        justify-content: center;
        align-items: center;
    }



    img {

        width: 100%;
        height: 100%;
        display: block;

    }

    .now-clock {
        width: 100%;
        height: 100%;
        display: block;
    }

    div {
        text-align: center;
        font-weight: 500;
        font-size: 1.5rem;
    }
}

// Vue Transition

.spin-fade-enter-active,
.spin-fade-leave-active {
    transition: opacity 0.15s, transform 0.5s;

    &.cancelled {
        transition: none;
        opacity: 0;
    }
}

.spin-fade-enter-from {
    opacity: 0;
    transform: rotate(-180deg);

    .reverse > & {
        transform: rotate(180deg);
    }
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // animation: spin 0.5s;
}

.spin-fade-leave-to {
    opacity: 0;
    transform: rotate(180deg);

    .reverse > & {
        transform: rotate(-180deg);
    }
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

@keyframes spin {
    from {
        transform: rotate(0);
    }

    to {
        transform: rotate(180deg);
    }
}
</style>
