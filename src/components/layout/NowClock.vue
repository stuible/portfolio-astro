<template>
    <svg
        viewBox="0 0 82 82"
        role="img"
        :aria-label="timeLabel"
        xmlns="http://www.w3.org/2000/svg"
    >
        <line
            class="hand hour-hand"
            x1="41"
            y1="36.9438"
            x2="41"
            y2="11"
            :transform="`rotate(${hourRotation} 41 41)`"
        />
        <line
            class="hand minute-hand"
            x1="41"
            y1="36.9438"
            x2="41"
            y2="1"
            :transform="`rotate(${minuteRotation} 41 41)`"
        />
        <line
            class="second-hand"
            x1="41"
            y1="36.9438"
            x2="41"
            y2="1"
            :transform="`rotate(${secondRotation} 41 41)`"
        />
    </svg>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';

const hourRotation = shallowRef(0);
const minuteRotation = shallowRef(0);
const secondRotation = shallowRef(0);
const timeLabel = shallowRef('Current time');
let clockTimer: ReturnType<typeof setTimeout> | undefined;

const updateClock = () => {
    const time = new Date();
    const seconds = time.getSeconds();

    hourRotation.value = (time.getHours() % 12) * 30
        + time.getMinutes() * 0.5
        + seconds / 120;
    minuteRotation.value = time.getMinutes() * 6 + seconds * 0.1;
    secondRotation.value = seconds * 6;
    timeLabel.value = `Current time: ${time.toLocaleTimeString()}`;

    clockTimer = setTimeout(updateClock, 1000 - time.getMilliseconds());
};

onMounted(() => {
    updateClock();
});

onBeforeUnmount(() => {
    if (clockTimer !== undefined) clearTimeout(clockTimer);
});
</script>

<style scoped>
.hand {
    stroke: #2e2e2e;
    stroke-width: 4.01605;
}

.second-hand {
    stroke: #777;
    stroke-width: 1.25;
    opacity: 0.55;
}
</style>
