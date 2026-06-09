import type { AlbumResult } from '../types/musicBrainz';
import type { DiscogsRelease, DiscogsReleaseDetail, DiscogsSearchResponse } from '../types/discogs';
import { getFirstReleaseImageUrl } from './discogsReleaseMapper';
import type { DiscoverAlbumFilters, YearRange } from '../types/discoverAlbums';
import type { GenreOption } from '../types/discover';

const DISCOGS_BASE_URL = 'https://api.discogs.com';
const DISCOGS_USER_AGENT = 'AlbumCoversExplorer/1.0.0';
const RELEASES_ENDPOINT_INTERVAL_MS = 3000;
const DISCOVER_RESULTS_LIMIT = 36;

const DISCOGS_COUNTRY_NAMES: Partial<Record<string, string>> = {
  GB: 'UK',
  US: 'US',
};

const DISCOGS_STYLE_NAMES: Record<GenreOption, string> = {
  ROCK: 'Rock',
  POP: 'Pop',
  FOLK: 'Folk',
  JAZZ: 'Jazz',
  'HIP HOP': 'Hip Hop',
  METAL: 'Metal',
  ELECTRONIC: 'Electronic',
  CLASSICAL: 'Classical',
  REGGAE: 'Reggae',
  BLUES: 'Blues',
};

const DISCOVERY_SLIDE_STYLES: Record<string, string> = {
  'Jamaica|1970|REGGAE': 'Reggae',
  'UK|1980|ROCK': 'Post Punk',
  'Brazil|1960|JAZZ': 'Bossa Nova',
  'US|1950|BLUES': 'Blues',
  'US|1960|POP': 'Soul',
  'Germany|1970|ELECTRONIC': 'Krautrock',
  'Germany|1970|': 'Krautrock',
  'US|1970|JAZZ': 'Jazz-Funk',
  'Spain|1960|FOLK': 'Flamenco',
  'Nigeria|1970|FOLK': 'Afrobeat',
};

const DECADE_SEARCH_YEARS: Record<number, number> = {
  1950: 1955,
  1960: 1963,
  1970: 1973,
  1980: 1983,
  1990: 1993,
  2000: 2003,
};

let releasesRequestQueue = Promise.resolve();
let lastReleasesRequestAt = 0;

const wait = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Request aborted', 'AbortError'));
      return;
    }

    const timeoutId = setTimeout(resolve, ms);

    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        reject(new DOMException('Request aborted', 'AbortError'));
      },
      { once: true },
    );
  });

const fetchDiscogsReleaseWithInterval = async (url: string, signal?: AbortSignal): Promise<Response> => {
  const runRequest = async (): Promise<Response> => {
    const now = Date.now();
    const elapsed = now - lastReleasesRequestAt;

    if (elapsed < RELEASES_ENDPOINT_INTERVAL_MS) {
      await wait(RELEASES_ENDPOINT_INTERVAL_MS - elapsed, signal);
    }

    lastReleasesRequestAt = Date.now();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': DISCOGS_USER_AGENT,
      },
      signal,
    });

    return response;
  };

  const nextRequest = releasesRequestQueue.then(runRequest, runRequest);
  releasesRequestQueue = nextRequest.then(() => undefined, () => undefined);

  return nextRequest;
};

export const getReleaseDetail = async (releaseId: string, signal?: AbortSignal): Promise<DiscogsReleaseDetail> => {
  const url = `${DISCOGS_BASE_URL}/releases/${releaseId}`;
  const response = await fetchDiscogsReleaseWithInterval(url, signal);

  if (!response.ok) {
    throw new Error(`Discogs API respondió con estado ${response.status}`);
  }

  return (await response.json()) as DiscogsReleaseDetail;
};

export const getReleaseCoverImage = async (releaseId: string, signal?: AbortSignal): Promise<string | null> => {
  const release = await getReleaseDetail(releaseId, signal);

  return getFirstReleaseImageUrl(release);
};

const normalizeDiscogsRelease = async (release: DiscogsRelease): Promise<AlbumResult> => {
  const titleParts = release.title.split(' - ');
  const artist = titleParts.length > 1 ? titleParts[0] : 'Unknown Artist';
  const title = titleParts.length > 1 ? titleParts.slice(1).join(' - ') : release.title;

  let coverUrl = release.cover_image || release.thumb || 'https://via.placeholder.com/300x300/333/fff?text=No+Cover';
  let videoUrls: string[] | undefined;

  try {
    const releaseDetail = await getReleaseDetail(release.id.toString());
    coverUrl = getFirstReleaseImageUrl(releaseDetail) ?? coverUrl;
    videoUrls = releaseDetail.videos
      ?.map((video) => (video.uri ?? '').trim())
      .filter((url): url is string => Boolean(url));
  } catch (error) {
    console.warn(`Could not fetch release ${release.id} for preview:`, error);
  }

  return {
    id: release.id.toString(),
    title,
    artist,
    date: release.year,
    year: release.year,
    country: release.country,
    status: 'Official',
    coverUrl,
    genres: release.genre,
    styles: release.style,
    videoUrls,
  };
};

const normalizeDiscogsSearchRelease = (release: DiscogsRelease): AlbumResult => {
  const titleParts = release.title.split(' - ');
  const artist = titleParts.length > 1 ? titleParts[0] : 'Unknown Artist';
  const title = titleParts.length > 1 ? titleParts.slice(1).join(' - ') : release.title;

  return {
    id: release.id.toString(),
    title,
    artist,
    date: release.year,
    year: release.year,
    country: release.country,
    status: 'Official',
    coverUrl: release.cover_image || release.thumb || 'https://via.placeholder.com/300x300/333/fff?text=No+Cover',
    genres: release.genre,
    styles: release.style,
  };
};

const sortAlbumsByYear = (albums: AlbumResult[]): AlbumResult[] =>
  albums.sort((a, b) => {
    if (!a.year) return 1;
    if (!b.year) return -1;
    return parseInt(a.year) - parseInt(b.year);
  });

export const searchReleases = async (searchTerm: string): Promise<AlbumResult[]> => {
  const trimmedQuery = searchTerm.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = `${DISCOGS_BASE_URL}/database/search?q=${encodeURIComponent(trimmedQuery)}&type=release&per_page=25`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': DISCOGS_USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Discogs respondió con estado ${response.status}`);
    }

    const data = (await response.json()) as DiscogsSearchResponse;
    const releases = data.results ?? [];

    // Normalize each release (now async)
    const normalizedAlbums = await Promise.all(releases.map(normalizeDiscogsRelease));

    // Sort by year (oldest to newest)
    return sortAlbumsByYear(normalizedAlbums);
  } catch (error) {
    console.error('Discogs search error:', error);
    throw error;
  }
};

export const searchReleaseIds = async (searchTerm: string): Promise<string[]> => {
  const trimmedQuery = searchTerm.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = `${DISCOGS_BASE_URL}/database/search?q=${encodeURIComponent(trimmedQuery)}&type=release&per_page=5`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': DISCOGS_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Discogs respondió con estado ${response.status}`);
  }

  const data = (await response.json()) as DiscogsSearchResponse;
  return (data.results ?? []).map((release) => release.id.toString());
};

export const getReleaseImages = async (releaseId: string, signal?: AbortSignal): Promise<string[]> => {
  const url = `${DISCOGS_BASE_URL}/releases/${releaseId}`;
  const response = await fetchDiscogsReleaseWithInterval(url, signal);

  if (!response.ok) {
    throw new Error(`Discogs API respondió con estado ${response.status}`);
  }

  const release = (await response.json()) as DiscogsReleaseDetail;
  const imageUrls =
    release.images
      ?.map((image) => image.uri || image.resource_url || image.uri150)
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl)) ?? [];

  if (imageUrls.length > 0) {
    return imageUrls;
  }

  const fallbackImage = release.cover_image || release.thumb;

  return fallbackImage ? [fallbackImage] : [];
};


export const getDecadeYearRange = (decade: DiscoverAlbumFilters['decade']): YearRange | null => {
  if (!decade) {
    return null;
  }

  const startYear = Number.parseInt(decade.slice(0, 4), 10);

  if (Number.isNaN(startYear)) {
    return null;
  }

  const endYear = startYear + 9;

  return {
    startYear,
    endYear,
    queryValue: String(DECADE_SEARCH_YEARS[startYear] ?? startYear + 3),
  };
};

type DiscoverSearchAttempt = {
  country?: string;
  style?: string;
  year?: string;
};

const getDiscogsCountryName = (country: DiscoverAlbumFilters['country']): string | undefined => {
  if (!country) {
    return undefined;
  }

  return DISCOGS_COUNTRY_NAMES[country.code] ?? country.name;
};

const getDiscogsStyleName = (filters: DiscoverAlbumFilters, genre?: GenreOption): string | undefined => {
  const country = getDiscogsCountryName(filters.country) ?? '';
  const decade = filters.decade ? filters.decade.slice(0, 4) : '';
  const slideStyle = DISCOVERY_SLIDE_STYLES[`${country}|${decade}|${genre ?? ''}`];

  if (slideStyle) {
    return slideStyle;
  }

  return genre ? DISCOGS_STYLE_NAMES[genre] : undefined;
};

const buildDiscoverSearchUrl = (attempt: DiscoverSearchAttempt): string => {
  const url = new URL(`${DISCOGS_BASE_URL}/database/search`);

  url.searchParams.set('type', 'release');
  url.searchParams.set('per_page', '25');

  if (attempt.country) {
    url.searchParams.set('country', attempt.country);
  }

  if (attempt.style) {
    url.searchParams.set('style', attempt.style);
  }

  if (attempt.year) {
    url.searchParams.set('year', attempt.year);
  }

  return url.toString();
};

const fetchDiscogsSearch = async (url: string, signal?: AbortSignal): Promise<DiscogsSearchResponse> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': DISCOGS_USER_AGENT,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Discogs respondió con estado ${response.status}`);
  }

  return (await response.json()) as DiscogsSearchResponse;
};

const buildDiscoverSearchAttempts = (filters: DiscoverAlbumFilters, genre?: GenreOption): DiscoverSearchAttempt[] => {
  const country = getDiscogsCountryName(filters.country);
  const yearRange = getDecadeYearRange(filters.decade);
  const style = getDiscogsStyleName(filters, genre);
  const attempts: DiscoverSearchAttempt[] = [];

  attempts.push({ country, style, year: yearRange?.queryValue });

  if (country || style) {
    attempts.push({ country, style });
  }

  if (style) {
    attempts.push({ style });
  }

  return attempts.filter(
    (attempt, index, allAttempts) =>
      Boolean(attempt.country || attempt.style || attempt.year) &&
      allAttempts.findIndex(
        (currentAttempt) =>
          currentAttempt.country === attempt.country && currentAttempt.style === attempt.style && currentAttempt.year === attempt.year,
      ) === index,
  );
};

const fetchDiscoverSearchWithFallback = async (
  filters: DiscoverAlbumFilters,
  genre?: GenreOption,
  signal?: AbortSignal,
): Promise<DiscogsRelease[]> => {
  const attempts = buildDiscoverSearchAttempts(filters, genre);

  for (const attempt of attempts) {
    const response = await fetchDiscogsSearch(buildDiscoverSearchUrl(attempt), signal);
    const releases = response.results ?? [];

    if (releases.length > 0) {
      return releases;
    }
  }

  return [];
};

export const searchDiscoverAlbums = async (
  filters: DiscoverAlbumFilters,
  signal?: AbortSignal,
): Promise<AlbumResult[]> => {
  const hasFilters = Boolean(filters.country || filters.decade || filters.genres.length > 0);

  if (!hasFilters) {
    return [];
  }

  const genresToSearch = filters.genres.length > 0 ? filters.genres : [undefined];
  const releaseGroups = await Promise.all(
    genresToSearch.map((genre) => fetchDiscoverSearchWithFallback(filters, genre, signal)),
  );
  const albumsById = new Map<string, AlbumResult>();

  releaseGroups
    .flatMap((releases) => releases)
    .map(normalizeDiscogsSearchRelease)
    .forEach((album) => {
      albumsById.set(album.id, album);
    });

  return sortAlbumsByYear([...albumsById.values()]).slice(0, DISCOVER_RESULTS_LIMIT);
};
