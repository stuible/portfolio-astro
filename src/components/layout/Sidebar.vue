<template>
    <a href="/#">

        <div class="icon" ref="icon">
            <transition name="spin-fade" @enter-cancelled="onEnterCancel" @leave-cancelled="">
                <img v-if="currentIcon == 'logo'" src="/logo-sideways.svg" alt="JS" />
                <img v-else-if="currentIcon == 'skills'" src="/code.svg" alt="JS" />
                <img v-else-if="currentIcon == 'tech'" src="/hammer.svg" alt="JS" />
                <img v-else-if="currentIcon == 'work'" src="/hammer.svg" alt="JS" />
                <div v-else-if="currentIcon == 'projects'">―</div>
                <div v-else-if="currentIcon == 'project'">=</div>
            </transition>
        </div>
        <!-- {{ currentIcon }}  -->
    </a>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const currentIcon = ref("logo");

const offset = -25;

function onEnterCancel(event: Element) {
    event.classList.add('cancelled');
    // console.log(event);
}


function debounce(func, timeout) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function updateSidebarIcon(newIcon) {
    currentIcon.value = newIcon;
}

const updateSidebarIconDebounced = debounce((newIcon) => updateSidebarIcon(newIcon), 90);

onMounted(() => {
    // Get all the elements with the class .has-icon
    const hasIconDivs = document.querySelectorAll('.has-icon');

    // Get the .icon-container div
    const iconContainerDiv = document.querySelector('.icon') as HTMLElement;

    let lastScrollTop = 0;
    let lastActiveTitleDiv = null;


    // Define Scroll callback function
    const onScroll = (event) => {

        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollingDown = scrollTop > lastScrollTop;
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling

        let activeTitleDiv = lastActiveTitleDiv;

        for (const hasIconDiv of scrollingDown ? hasIconDivs : [...hasIconDivs].reverse()) {
            const hasIconRect = hasIconDiv.getBoundingClientRect();
            const iconContainerRect = iconContainerDiv.getBoundingClientRect();

            let hasIconDivStyle = getComputedStyle(hasIconDiv);

            let hasIconDivMarginTop = parseInt(hasIconDivStyle.marginTop);
            let hasIconDivMarginBottom = parseInt(hasIconDivStyle.marginBottom);
            const totalMarginY = hasIconDivMarginTop + hasIconDivMarginBottom;


            if ((scrollingDown && hasIconRect.top + offset <= iconContainerRect.bottom) || (!scrollingDown && hasIconRect.bottom + hasIconDivMarginBottom + offset >= iconContainerRect.bottom)) {

                activeTitleDiv = hasIconDiv;
            }
        }

        if (activeTitleDiv) {
            if (!lastActiveTitleDiv?.isEqualNode(activeTitleDiv)) {

                updateSidebarIconDebounced(activeTitleDiv.dataset.icon);
                // currentIcon.value = activeTitleDiv.dataset.icon;
                // console.log("updated dom");
            }
        }

        lastActiveTitleDiv = activeTitleDiv;

    };

    // Attach the callback function to the window scroll event
    window.addEventListener('scroll', onScroll);

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