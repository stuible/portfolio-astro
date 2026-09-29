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

// Covers both playlist read shapes: a `fields=total` count response and a tail-fetch items response.
type SpotifyPage = { items?: SpotifyItem[]; total?: number };

// The playlist is chronological with newest at the bottom, so the most recently
// added tracks sit in the tail. Fetching only the tail keeps the build to two
// requests instead of paging the whole list (which tripped Spotify's rate limits).
const PLAYLIST_TAIL_SIZE = 10;

// Spotify intermittently answers 429/5xx, which would otherwise bake an empty
// track list into a production build. A few short retries ride out the blip.
const SPOTIFY_RETRY_ATTEMPTS = 3;
const SPOTIFY_RETRY_BASE_DELAY_MS = 1000;
const SPOTIFY_RETRY_MAX_DELAY_MS = 4000;

// Dev-only cache: `astro dev` re-runs frontmatter on every request, which would
// re-hit the GitHub/Spotify APIs and trip their rate limits. Production calls
// each function once per build and skips the cache.
const DEV_CACHE_TTL_MS = 5 * 60 * 1000;

type DevCacheEntry = { value: unknown; expiresAt: number };

const devCache = new Map<string, DevCacheEntry>();

async function withDevCache<T>(
  key: string,
  compute: () => Promise<T>
): Promise<T> {
  if (!import.meta.env.DEV) return compute();

  const entry = devCache.get(key);
  if (entry) {
    if (Date.now() < entry.expiresAt) return entry.value as T;
    devCache.delete(key);
  }

  // Cache only successes; rejections propagate without being cached.
  const value = await compute();
  devCache.set(key, { value, expiresAt: Date.now() + DEV_CACHE_TTL_MS });
  return value;
}

export async function getLatestCommit(
  owner: string
): Promise<GitCommit | undefined> {
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
      }
    );

    if (!response.ok)
      throw new Error(`GitHub responded with ${response.status}`);

    const [commit] = ((await response.json()) as GitHubCommitSearchResponse)
      .items;
    if (!commit) return undefined;
    const committedAt =
      commit.commit.author?.date ?? commit.commit.committer?.date;
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

// Accepts a bare id, a share URL, or a `spotify:playlist:` URI; anything else
// is reported rather than passed through to build an URL that can only 404.
function getPlaylistId(value: string | undefined) {
  if (!value) return undefined;

  const id = value
    .trim()
    .match(
      /^(?:https?:\/\/\S*\/playlist\/|spotify:playlist:)?([a-zA-Z0-9]+)(?:[/?#].*)?$/
    )?.[1];

  if (!id) {
    console.warn(
      `Could not read a playlist id from SPOTIFY_PLAYLIST_ID ("${value}"). Expected a playlist id, share URL, or spotify:playlist: URI.`
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

  if (!response.ok)
    throw new Error(`Spotify authorization failed (${response.status})`);
  return ((await response.json()) as { access_token: string }).access_token;
}

// Retries 429/5xx up to three attempts, honoring Spotify's `Retry-After` when
// present and backing off exponentially otherwise (capped). `context` labels
// the thrown error so logs say which request failed.
async function fetchSpotifyWithRetry(
  url: string,
  init: RequestInit,
  context: string
): Promise<Response> {
  for (let attempt = 1; ; attempt += 1) {
    const response = await fetch(url, init);
    const retryable = response.status === 429 || response.status >= 500;
    if (response.ok || !retryable || attempt >= SPOTIFY_RETRY_ATTEMPTS) {
      if (!response.ok)
        throw new Error(`Spotify responded with ${response.status} ${context}`);
      return response;
    }

    const backoffMs = SPOTIFY_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1);
    const retryAfter = response.headers.get("Retry-After");
    const retryAfterSeconds = retryAfter === null ? NaN : Number(retryAfter);
    const delayMs = Math.min(
      Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0
        ? retryAfterSeconds * 1000
        : backoffMs,
      SPOTIFY_RETRY_MAX_DELAY_MS
    );
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

export async function getLatestPlaylistTracks(): Promise<SpotifyTrack[]> {
  const playlistId = getPlaylistId(import.meta.env.SPOTIFY_PLAYLIST_ID);
  // A missing id or credentials resolve to an empty list that is cached like
  // any success, so a misconfiguration does not re-attempt the API every dev request.
  return withDevCache(
    `spotify-playlist-tracks:${playlistId ?? "(missing)"}`,
    async () => {
      if (!playlistId) return [];

      const accessToken = await getSpotifyAccessToken();
      if (!accessToken) return [];

      const headers = { headers: { Authorization: `Bearer ${accessToken}` } };

      const totalResponse = await fetchSpotifyWithRetry(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=total&limit=1`,
        headers,
        "while reading the playlist length"
      );
      const { total } = (await totalResponse.json()) as SpotifyPage;
      if (!total) return [];

      const fields =
        "items(added_at,item(type,name,artists(name),external_urls.spotify,album(images(url))),track(type,name,artists(name),external_urls.spotify,album(images(url))))";
      const tailResponse = await fetchSpotifyWithRetry(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=CA&limit=${PLAYLIST_TAIL_SIZE}&offset=${Math.max(0, total - PLAYLIST_TAIL_SIZE)}&fields=${encodeURIComponent(fields)}`,
        headers,
        `while reading the last ${PLAYLIST_TAIL_SIZE} tracks of the playlist`
      );
      const tail = (await tailResponse.json()) as SpotifyPage;

      return (tail.items ?? [])
        .filter(
          (entry) =>
            entry.added_at && (entry.item ?? entry.track)?.type === "track"
        )
        .sort((a, b) => Date.parse(b.added_at!) - Date.parse(a.added_at!))
        .slice(0, 3)
        .map((entry) => {
          const track = (entry.item ?? entry.track)!;
          return {
            name: track.name,
            artists:
              track.artists?.map((artist) => artist.name).join(", ") ??
              "Unknown artist",
            url:
              track.external_urls?.spotify ??
              `https://open.spotify.com/playlist/${playlistId}`,
            artwork: track.album?.images?.at(-1)?.url,
            addedAt: entry.added_at!,
          };
        });
    }
  ).catch((error) => {
    console.warn("Could not fetch Spotify playlist tracks.", error);
    return [] as SpotifyTrack[];
  });
}
