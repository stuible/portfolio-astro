<template>
  <nav id="side-nav" ref="sidebarNav">
    <ul>
      <li v-for="item in nav" v-bind:key="item.name">
        <a v-if="item.email" :href="'mailto:' + item.email">{{item.name}}</a>
        <nuxt-link
          v-else-if="item.scroll != undefined"
          :to="item.link + item.hash"
          @click.native="$emit('clicked', item.scroll)"
        >{{item.name}}</nuxt-link>
        <nuxt-link v-else :to="item.link">{{item.name}}</nuxt-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    nav: Array
  },
  methods: {
    onScroll(event) {
      var y = window.scrollY;
      var startY = 35;
      if (y > startY) {
        this.$refs.sidebarNav.style.display = "";
        var scrollPercent = (startY - y + 75) / startY;
        this.$refs.sidebarNav.style.opacity = Math.min(
          1,
          Math.max(0, -scrollPercent)
        );
      } else {
        this.$refs.sidebarNav.style.opacity = 0;
        this.$refs.sidebarNav.style.display = "none";
      }
    }
    // setOpacity
  },
  mounted() {
    window.addEventListener("scroll", this.onScroll);
  },
  destroyed() {
    window.removeEventListener("scroll", this.onScroll);
  }
};
</script>

<style lang="scss">
#side-nav {
  padding: 1.5em 0.3em 0 0;
  opacity: 0;
  transition: opacity 200ms;
  line-height: 1.75em;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.01em;

  @include breakpoint(tablet) {
    font-size: 13px;
  }
}
</style>
