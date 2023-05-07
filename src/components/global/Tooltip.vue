<script lang="ts">
import { PopperWrapper, options } from "floating-vue";

import { onMounted } from 'vue';


options.themes['stuible-tooltip'] = {
  $extend: 'tooltip',
  placement: 'top',
  delay: 100,
  handleResize: true,
}

export default {
  ...PopperWrapper,
  name: "Tooltip",
  vPopperTheme: "stuible-tooltip",
  setup() {
    onMounted(() => {
      const boundary = document != undefined ? document.querySelector('.layout-container .center') : undefined;

      options.boundary = boundary;
    })
  }
}

</script>

<style lang="scss">
@import "floating-vue/dist/style.css";

.v-popper--theme-stuible-tooltip {

  .v-popper__inner {
    background: #ffffff;
    // backdrop-filter: blur(4px);
    // border: solid rgb(234, 234, 234) 1px;
    border-radius: 100px;
    padding: 0.5rem 0.75rem 0.45rem 0.75rem;
    box-shadow: rgba(0, 0, 0, 0.06) 0px 0px 15px;
    font-size: 14px;
    color: #757575;
    // background-color: yellow;
  }

  .v-popper__arrow-inner {
    // border-color: #78ff09;
  }

  .v-popper__arrow-outer {
    border-color: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.06) 0px 10px 15px;
    // backdrop-filter: blur(4px);
  }

  &.v-popper__popper--hidden {
    transition: opacity 0.15s, visibility 0.15s;

    .v-popper__wrapper {
      transform: translateY(25px);
      transition: transform 0.15s;
    }
  }

  &.v-popper__popper--shown {
    transition: opacity 0.15s;

    .v-popper__wrapper {
      transition: transform 0.15s;
    }
  }
}
</style>
