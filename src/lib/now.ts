export type GitCommit = {
  message: string;
  url: string;
  repository: string;
  sha: string;
  committedAt: string;
};

export type SpotifyTrack = {
  name: string;
  artists: string;
  url: string;
  artwork: string | undefined;
  addedAt: string;
};

type GitHubCommitSearchResponse = {
  items: Array<{
    sha: string;
    html_url: string;
    repository: { full_name: string };
    commit: {
      message: string;
      author: { date: string } | null;
      committer: { date: string } | null;
    };
  }>;
};

type SpotifyTrackObject = {
  type: string;
  name: string;
  artists?: Array<{ name: string }>;
  external_urls?: { spotify?: string };
  album?: { images?: Array<{ url: string }> };
};

type SpotifyItem = {
  added_at: string | null;
  item?: SpotifyTrackObject | null;
  track?: SpotifyTrackObject | null;
};

type SpotifyPage = { items: SpotifyItem[]; next: string | null };

const PLAYLIST_PAGE_SIZE = 50;
const MAX_PLAYLIST_PAGES = 20;

// `astro dev` re-executes component frontmatter on every page request and HMR
// update, so without a cache every refresh would walk the whole playlist (up
// to 20 requests) and hit the GitHub search API again, quickly tripping their
// rate limits and baking the failure in as empty data. Keep a short-lived
// in-memory cache of successful results in dev only; production calls each
// function once per build and skips the cache entirely. Failures (429s, 5xx)
// are never cached, so the next dev request retries.
const DEV_CACHE_TTL_MS = 5 * 60 * 1000;

type DevCacheEntry = { value: unknown; expiresAt: number };

const devCache = new Map<string, DevCacheEntry>();

async function withDevCache<T>(key: string, compute: () => Promise<T>): Promise<T> {
  if (!import.meta.env.DEV) return compute();

  const entry = devCache.get(key);
  if (entry) {
    if (Date.now() < entry.expiresAt) return entry.value as T;
    devCache.delete(key);
  }

  // Cache only once the compute resolves; a rejection propagates to the
  // caller's error handling without being cached.
  const value = await compute();
  devCache.set(key, { value, expiresAt: Date.now() + DEV_CACHE_TTL_MS });
  return value;
}

export async function getLatestCommit(owner: string): Promise<GitCommit | undefined> {
  return withDevCache(`github-latest-commit:${owner}`, async () => {
    const query = new URLSearchParams({
      q: `author:${owner} is:public`,
      sort: "author-date",
      order: "desc",
      per_page: "1",
    });
    const response = await fetch(
      `https://api.github.com/search/commits?${query}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "stuible.com",
          ...(import.meta.env.GITHUB_TOKEN
            ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` }
            : {}),
        },
      },
    );

    if (!response.ok) throw new Error(`GitHub responded with ${response.status}`);

    const [commit] = ((await response.json()) as GitHubCommitSearchResponse).items;
    if (!commit) return undefined;
    const committedAt = commit.commit.author?.date ?? commit.commit.committer?.date;
    if (!committedAt) return undefined;

    return {
      message: commit.commit.message.split("\n")[0],
      url: commit.html_url,
      repository: commit.repository.full_name,
      sha: commit.sha.slice(0, 7),
      committedAt,
    };
  }).catch((error) => {
    console.warn("Could not fetch the latest public GitHub commit.", error);
    return undefined;
  });
}

// Accepts a bare id, a share URL, or the `spotify:playlist:<id>` URI that the
// "Copy Spotify URI" menu item yields. Anything else is reported rather than
// passed through to build an URL that can only 404.
function getPlaylistId(value: string | undefined) {
  if (!value) return undefined;

  const id = value
    .trim()
    .match(/^(?:https?:\/\/\S*\/playlist\/|spotify:playlist:)?([a-zA-Z0-9]+)(?:[/?#].*)?$/)?.[1];

  if (!id) {
    console.warn(
      `Could not read a playlist id from SPOTIFY_PLAYLIST_ID ("${value}"). Expected a playlist id, share URL, or spotify:playlist: URI.`,
    );
    return undefined;
  }

  return id;
}

async function getSpotifyAccessToken() {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return undefined;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) throw new Error(`Spotify authorization failed (${response.status})`);
  return ((await response.json()) as { access_token: string }).access_token;
}

export async function getLatestPlaylistTracks(): Promise<SpotifyTrack[]> {
  const playlistId = getPlaylistId(import.meta.env.SPOTIFY_PLAYLIST_ID);
  // A missing playlist id or missing credentials resolve to an empty list that
  // is cached like any other success, so a misconfiguration does not
  // re-attempt the API on every dev request.
  return withDevCache(`spotify-playlist-tracks:${playlistId ?? "(missing)"}`, async () => {
    if (!playlistId) return [];

    const accessToken = await getSpotifyAccessToken();
    if (!accessToken) return [];

    const fields = "items(added_at,item(type,name,artists(name),external_urls.spotify,album(images(url))),track(type,name,artists(name),external_urls.spotify,album(images(url)))),next";
    let next: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/items?market=CA&limit=${PLAYLIST_PAGE_SIZE}&fields=${encodeURIComponent(fields)}`;
    const playlistItems: SpotifyItem[] = [];

    // Playlist order is not add order, so every page has to be read before the
    // three most recently added tracks are known. Cap the walk so a very large
    // playlist cannot turn a build into hundreds of serial round trips.
    for (let page = 0; next && page < MAX_PLAYLIST_PAGES; page += 1) {
      const response = await fetch(next, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error(`Spotify responded with ${response.status}`);

      const body = (await response.json()) as SpotifyPage;
      playlistItems.push(...body.items);
      next = body.next;
    }

    if (next) {
      console.warn(
        `Stopped reading the Spotify playlist after ${MAX_PLAYLIST_PAGES * PLAYLIST_PAGE_SIZE} tracks; "on repeat" may miss a more recent addition.`,
      );
    }

    return playlistItems
      .filter((entry) => entry.added_at && (entry.item ?? entry.track)?.type === "track")
      .sort((a, b) => Date.parse(b.added_at!) - Date.parse(a.added_at!))
      .slice(0, 3)
      .map((entry) => {
        const track = (entry.item ?? entry.track)!;
        return {
          name: track.name,
          artists: track.artists?.map((artist) => artist.name).join(", ") ?? "Unknown artist",
          url: track.external_urls?.spotify ?? `https://open.spotify.com/playlist/${playlistId}`,
          artwork: track.album?.images?.at(-1)?.url,
          addedAt: entry.added_at!,
        };
      });
  }).catch((error) => {
    console.warn("Could not fetch Spotify playlist tracks.", error);
    return [] as SpotifyTrack[];
  });
}
