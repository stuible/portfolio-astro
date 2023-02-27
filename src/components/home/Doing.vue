<template>
  <ul>
    <li id="last-commit">
      <a href="https://github.com/stuible" target="_blank">
        <img src="~static/images/social/github.svg?data" alt="Github Logo">
        <h4>Last Commit</h4>
        <p>{{ lastCommitMessage }}</p>
      </a>
    </li>
    <li>
      <a href="https://www.linkedin.com/in/stuible/" target="_blank">
        <img src="~static/images/social/linkedin.svg?data" alt="Github Logo">
        <h4>Linkedin</h4>
        <p>Programmer / Systems Analyst at Vancouver Coastal Health</p>
      </a>
    </li>
    <!-- <li>
      <a href="https://twitter.com/joshstuible" target="_blank">
        <img src="~static/images/social/twitter.svg?data" alt="Github Logo">
        <h4>Twitter</h4>
      </a>
    </li>
    <li>
      <a href="https://www.instagram.com/stuible/" target="_blank">
        <img src="~static/images/social/instagram.svg?data" alt="Github Logo">
        <h4>Instagram</h4>
      </a>
    </li> -->

    <!-- <ul>
          <li v-for="commit in commits" v-bind:key="commit.id">{{commit.payload.commits[0].message}}</li>
    </ul>-->
  </ul>
</template>

<script>
export default {
  data() {
    return {
      commits: "",
      lastCommit: undefined
    };
  },
  computed: {
    lastCommitMessage() {
      if (this.lastCommit) {
        const message = this.lastCommit.payload.commits[0].message.split("\n");
        return message[0];
      } else return "Loading Last Commit...";
    }
  },
  mounted() {
    fetch("https://api.github.com/users/stuible/events")
      .then(function (response) {
        return response.json();
      })
      .then(json => {
        const filteredEvents = json.filter(
          event =>
            event.type === "PushEvent" &&
            event.payload.commits[0].message !== undefined
        );
        this.commits = filteredEvents;
        this.lastCommit = filteredEvents[0];
      });
  }
};
</script>

<style lang="scss">
#doing {
  ul {
    // display: grid;
    // grid-template-columns: 1fr 1fr;
    // grid-template-rows: auto auto;

    display: grid;
    grid-template-columns: 1fr;
    column-gap: map-get($main-grid-gap, phone);
    row-gap: 2em;

    @include breakpoint(phone) {
      grid-template-columns: 1fr 1fr;
      column-gap: map-get($main-grid-gap, phablet);
    }

    @include breakpoint(phablet) {
      grid-template-columns: 1fr 1fr;
      column-gap: map-get($main-grid-gap, tablet);
    }

    @include breakpoint(desktop) {
      grid-template-columns: 1fr 1fr;
      column-gap: map-get($main-grid-gap, desktophd);
    }

  }

  // li {
  //   grid-column: 1 / span 2;
  // }
  a {
    display: grid;
    grid-template-columns: 0.25fr 0.75fr;
    grid-template-rows: auto auto;
    align-items: flex-start;
    grid-template-areas: "icon ." "icon .";
    column-gap: 2em;
    row-gap: 1em;

    // background-color: white;
    // box-shadow: 0 0 25px 9px rgba(0, 0, 0, 0.05);
    // padding: 1em;
    margin-bottom: 1em;
    transition: all 150ms linear;

    &:hover {
      // background-color: white;
      // box-shadow: 0 20px 25px 9px rgba(0, 0, 0, 0.05);
    }
  }

  img {
    grid-area: icon;
    width: 100%;
    // border-right: 1px solid $colour-medium;
    // padding-right: 1em;
    background-color: $colour-medium;
    padding: 30%;

  }

  p {
    // margin-top: 0.5em;
  }
}

#last-commit {
  // border-radius: 1em;
}
</style>
