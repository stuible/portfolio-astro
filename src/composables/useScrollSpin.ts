import { onBeforeUnmount, onMounted, watch, type Ref } from "vue";
import { WheelGestures, type WheelEventState } from "wheel-gestures";

// A scroll gesture that starts at the top or bottom of the page and pushes past
// it spins the element, which then settles on the nearest half turn. Speeds are
// in degrees per 60fps frame.
const spinPerPixel = 0.25;
const maxSpinSpeed = 40;
const friction = 0.86;
const snapFrequency = 0.18;
const snapDelay = 20;
const glideReach = 0.5;
// Pixels from the top or bottom that still count as being at the edge
const edgeTolerance = 25;
const frameMs = 1000 / 60;

export function useScrollSpin(
  target: Ref<HTMLElement | null>,
  enabled: () => boolean,
) {
  let angle = 0;
  let velocity = 0;
  let snapTarget: number | undefined;
  let snapGlide = false;
  let lastInputTime = 0;
  let lastTouchY: number | undefined;
  // The edges the current gesture started at; leaving them ends its spin
  let gestureEdges = { atTop: false, atBottom: false };
  let lastFrameTime: number | undefined;
  let frame: number | undefined;
  // Detects where wheel gestures start and which events are momentum. Fed
  // from our own passive listener, and told not to block page scrolling.
  const wheelGestures = WheelGestures({
    preventWheelAction: false,
    reverseSign: false,
  });

  function edges() {
    return {
      atTop: window.scrollY <= edgeTolerance,
      atBottom:
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - edgeTolerance,
    };
  }

  function startGesture() {
    gestureEdges = edges();
  }

  function trackGestureEdges() {
    const { atTop, atBottom } = edges();
    gestureEdges = {
      atTop: gestureEdges.atTop && atTop,
      atBottom: gestureEdges.atBottom && atBottom,
    };
  }

  function canSpin(pixels: number) {
    if (!enabled()) return false;

    return (
      (gestureEdges.atTop && pixels < 0) ||
      (gestureEdges.atBottom && pixels > 0)
    );
  }

  function addSpin(pixels: number) {
    if (!canSpin(pixels)) return;

    lastInputTime = performance.now();
    snapTarget = undefined;
    // Soft speed cap
    velocity =
      maxSpinSpeed *
      Math.tanh((velocity + pixels * spinPerPixel) / maxSpinSpeed);
    if (frame === undefined) {
      lastFrameTime = undefined;
      frame = window.requestAnimationFrame(step);
    }
  }

  function onWheel(event: WheelEvent) {
    wheelGestures.feedWheel(event);
  }

  function onWheelGesture(state: WheelEventState) {
    if (state.isStart) startGesture();
    else trackGestureEdges();
    if (state.isMomentum || state.isEnding) return;
    addSpin(state.axisDelta[1]);
  }

  function onTouchStart(event: TouchEvent) {
    lastTouchY = event.touches[0]?.clientY;
    startGesture();
  }

  function onTouchMove(event: TouchEvent) {
    const touchY = event.touches[0]?.clientY;
    if (touchY === undefined) return;
    trackGestureEdges();
    if (lastTouchY !== undefined) addSpin(lastTouchY - touchY);
    lastTouchY = touchY;
  }

  function onTouchEnd(event: TouchEvent) {
    if (event.touches.length > 0) return;
    lastTouchY = undefined;
  }

  function step(now: number) {
    frame = undefined;
    const dt =
      lastFrameTime === undefined
        ? 1
        : Math.min((now - lastFrameTime) / frameMs, 3);
    lastFrameTime = now;

    if (now - lastInputTime < snapDelay) {
      velocity *= friction ** dt;
    } else {
      // Pick the target once so it can't flip mid-snap
      if (snapTarget === undefined) {
        const coast = (velocity * friction) / (1 - friction);
        snapTarget = Math.round((angle + coast) / 180) * 180;
        const distance = snapTarget - angle;
        snapGlide =
          Math.sign(distance) === Math.sign(velocity) &&
          Math.abs(coast) >= Math.abs(distance) * glideReach;
      }

      const distance = snapTarget - angle;
      if (Math.abs(distance) < 0.5 && Math.abs(velocity) < 0.5) {
        angle = snapTarget;
        velocity = 0;
      } else if (snapGlide) {
        // Decelerate at the rate that lands exactly on the target
        const glide =
          Math.abs(distance) / (Math.abs(distance) + Math.abs(velocity));
        velocity *= glide ** dt;
      } else {
        // Critically damped spring
        const acceleration =
          snapFrequency ** 2 * distance - 2 * snapFrequency * velocity;
        velocity += acceleration * dt;
      }
    }

    const stepSize = velocity * dt;
    // Never step past the target
    angle =
      snapTarget !== undefined &&
      Math.abs(stepSize) > Math.abs(snapTarget - angle) &&
      Math.sign(stepSize) === Math.sign(snapTarget - angle)
        ? snapTarget
        : angle + stepSize;
    if (target.value) target.value.style.rotate = `${angle}deg`;

    if (velocity !== 0 || angle !== snapTarget)
      frame = window.requestAnimationFrame(step);
  }

  function reset() {
    angle = 0;
    velocity = 0;
    snapTarget = undefined;
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
  }

  // Bring the element back upright
  watch(enabled, (isEnabled) => {
    if (!isEnabled) reset();
  });

  onMounted(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    wheelGestures.on("wheel", onWheelGesture);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener("wheel", onWheel);
    wheelGestures.off("wheel", onWheelGesture);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("touchcancel", onTouchEnd);
    reset();
  });
}
