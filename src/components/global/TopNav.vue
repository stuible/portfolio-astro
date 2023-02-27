<template>
  <nav id="top-nav" :class="{ open: mobileNavOpen }">
    <div id="hamburger-menu" @click="mobileNavOpen = !mobileNavOpen">
      <div id="hamburger-icon" class="hamburger hamburger--squeeze" :class="{ 'is-active': mobileNavOpen }">
        <span class="hamburger-box">
          <span class="hamburger-inner"></span>
        </span>
      </div>

      <div>JOSH STUIBLE</div>
    </div>
    <ul>
      <li class="logo">
        <a href="/">
          <img src="/logo.svg" alt="JS">
        </a>
      </li>
      <li v-for="item in nav" v-bind:key="item.name">
        <a v-if="item.email" :href="'mailto:' + item.email">{{ item.name }}</a>
        <a v-else-if="item.scroll != undefined" :href="item.link + item.hash"
          @click.native="$emit('clicked', item.scroll); mobileNavOpen = false">{{ item.name }}</a>
        <a v-else :href="item.link" @click.native="mobileNavOpen = false">{{ item.name }}</a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    nav: Array
  },
  watch: {
    nav: {
      handler(newVal, oldVal) {
        // console.log('nav has been changed: ' + newVal);
      },
      deep: true
    }
  },
  data() {
    return {
      mobileNavOpen: false
    };
  }
};
</script>

<style lang="scss">
//Main Nav
#top-nav {
  height: $top-nav-height;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin-bottom: 1em;

  .logo {
    img {
      height: 5em;
    }

    // margin-right: 0em;
    // display: none;

    @include breakpoint(thone) {
      margin-right: -1.5em;
    }

    @include breakpoint(phablet) {
      display: none;
    }
  }

  ul {
    list-style: none;
    display: block;
    justify-content: space-between;
    align-items: center;

    position: fixed;
    margin: 0;
    padding: 2em;
    padding-top: 7em;
    height: 100vh;
    top: 0;
    left: 0;
    width: 100%;

    background-color: $colour-light;

    transform: translate(-100%, 0);
    transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1);
    z-index: 1;
  }

  li {
    display: block;
    padding-bottom: 1.25em;
    // cursor: pointer;
  }

  a {
    text-decoration: none;
    color: $colour-dark;
    text-transform: uppercase;
    font-size: 24px;
    font-weight: 500;
    letter-spacing: 0.06em;

    @include breakpoint(phone) {
      font-size: 12px;
    }

    @include breakpoint(phablet) {
      font-size: 14px;
    }

    @include breakpoint(tablet) {
      font-size: 15px;
    }

    @include breakpoint(desktop) {
      font-size: 15px;
    }
  }

  //Mobile Nav Open Class
  &.open {
    ul {
      transform: translate(0, 0);
      // visibility: visible;
      // transition: visibility 0s linear 0.5s;
    }
  }

  @include breakpoint(phone) {
    margin-bottom: 4em;

    ul {
      display: flex;
      // visibility: visible;
      position: unset;
      transition: none;
      width: unset;
      transform-origin: unset;
      transform: unset;
      height: unset;
      background-color: unset;
      padding: 0;
    }

    li {
      display: inline-block;
      position: relative;
      padding-bottom: 0em;

      &:hover {
        &:before {
          content: "";
          border-bottom: 2px solid #edeaea;
          position: absolute;
          width: 100%;
          height: 2px;
          bottom: -6px;
          left: 0;
        }
      }

      //   border-bottom: 5px solid #edeaea;
    }
  }
}

// Hamburger Menu
#hamburger-menu {
  display: flex;
  align-items: center;
  width: 70%;
  min-width: 191px;
  left: 0;
  text-align: right;
  background-color: white;
  border: none;
  padding: 1em;
  padding-left: 25px;
  position: fixed;
  cursor: pointer;
  letter-spacing: 0.05em;
  z-index: 2;
  box-shadow: 0px 10px 30px 0px rgba(0, 0, 0, 0.1);
  transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1);

  @include breakpoint(phone) {
    display: none;
  }
}

$hamburgerIconSize: 25px;

#hamburger-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-right: 2em;
  height: $hamburgerIconSize - 5;
  width: $hamburgerIconSize;

  div {
    height: 1px;
    width: 100%;
    background-color: black;
  }
}
</style>
