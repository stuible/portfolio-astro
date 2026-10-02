# My Portfolio

This is my portfolio website built with Astro 🚀

## Project Structure

Inside of this Astro project, you'll see the following folders and files:

```
/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Card.astro
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## Homepage “right now” section

The homepage pulls the owner’s most recent public commit at build time, using
GitHub’s commit search scoped to `author:<owner>` (set in `src/content/pages/home.md`).
That spans every public repository the owner commits to — client and organisation
repositories included — not just this one, so whatever they touched last is what
the card shows. Its editable “right now” content lives in the same file.

The music card reads the three most recently added tracks from a Spotify
playlist. Copy `.env.example` to `.env`, then provide `SPOTIFY_CLIENT_ID`,
`SPOTIFY_CLIENT_SECRET`, `SPOTIFY_REFRESH_TOKEN`, and `SPOTIFY_PLAYLIST_ID`.
The refresh token must belong to the playlist owner or a collaborator and have
the `playlist-read-private` scope. These values are server-only and must also be
configured in the deployment environment. If Spotify is unavailable, the build
reuses the last successful track list, kept in Astro's cache directory
(`node_modules/.astro/now/`), which persists between Netlify builds. With no
saved list or missing credentials, the site still builds and shows a quiet empty
state.

## Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
