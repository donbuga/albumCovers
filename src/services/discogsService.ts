import type { AlbumResult } from '../types/musicBrainz';
import type { DiscogsRelease, DiscogsSearchResponse } from '../types/discogs';
import type { DiscoverAlbumFilters, YearRange } from '../types/discoverAlbums';
import type { GenreOption } from '../types/discover';

const DISCOGS_BASE_URL = 'https://api.discogs.com';
const DISCOGS_USER_AGENT = 'AlbumCoversExplorer/1.0.0';
const RELEASES_ENDPOINT_INTERVAL_MS = 4000;
const DISCOVER_RESULTS_LIMIT = 36;

const DISCOGS_GENRE_PARAMS: Partial<Record<GenreOption, 'genre' | 'style'>> = {
  ROCK: 'genre',
  POP: 'genre',
  FOLK: 'genre',
  JAZZ: 'genre',
  'HIP HOP': 'genre',
  METAL: 'style',
  ELECTRONIC: 'genre',
  CLASSICAL: 'genre',
  REGGAE: 'genre',
  BLUES: 'genre',
};

let releasesRequestQueue = Promise.resolve();
let lastReleasesRequestAt = 0;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const fetchDiscogsReleaseWithInterval = async (url: string): Promise<Response> => {
  const runRequest = async (): Promise<Response> => {
    const now = Date.now();
    const elapsed = now - lastReleasesRequestAt;

    if (elapsed < RELEASES_ENDPOINT_INTERVAL_MS) {
      await wait(RELEASES_ENDPOINT_INTERVAL_MS - elapsed);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': DISCOGS_USER_AGENT,
      },
    });

    lastReleasesRequestAt = Date.now();
    return response;
  };

  const nextRequest = releasesRequestQueue.then(runRequest, runRequest);
  releasesRequestQueue = nextRequest.then(() => undefined, () => undefined);

  return nextRequest;
};

const normalizeDiscogsRelease = async (release: DiscogsRelease): Promise<AlbumResult> => {
  // Extract artist from title (format: "Artist - Title")
  const titleParts = release.title.split(' - ');
  const artist = titleParts.length > 1 ? titleParts[0] : 'Unknown Artist';
  const title = titleParts.length > 1 ? titleParts.slice(1).join(' - ') : release.title;

  // Fetch individual release to get the actual cover image
  let coverUrl = 'https://via.placeholder.com/300x300/333/fff?text=No+Cover';
  
  try {
    const response = await fetchDiscogsReleaseWithInterval(release.resource_url);

    if (response.ok) {
      const releaseDetail = await response.json();
      // Use the thumb from the individual release if available
      if (releaseDetail.thumb) {
        coverUrl = releaseDetail.thumb;
      }
    }
  } catch (error) {
    // If we can't fetch the individual release, use placeholder
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

export const getReleaseImages = async (releaseId: string): Promise<string[]> => {
  try {
    const url = `${DISCOGS_BASE_URL}/releases/${releaseId}`;

    const response = await fetchDiscogsReleaseWithInterval(url);

    if (!response.ok) {
      throw new Error(`Discogs API respondió con estado ${response.status}`);
    }

    const release = await response.json();
    
    console.log('Discogs release data:', release); // Debug log
    
    // Extract all image URLs from the release with correct Discogs structure
    let images: string[] = [];
    
    if (release.images && Array.isArray(release.images)) {
      images = release.images.map((img: any) => {
        // Discogs images have: type, uri, resource_url, uri150, width, height
        // Take ALL images from the array, not just the first one
        if (img && img.uri) {
          return img.uri; // Extract every image's URI
        }
        return null;
      }).filter(Boolean);
    }
    
    // Also check for other possible image fields
    if (images.length === 0 && release.thumb) {
      images = [release.thumb];
    }
    
    if (images.length === 0 && release.cover_image) {
      images = [release.cover_image];
    }
    
    console.log(`Release ${releaseId}: Found ${images.length} images`, images);
    
    return images;
  } catch (error) {
    console.error('Error fetching Discogs release images:', error);
    throw error;
  }
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
    queryValue: `${startYear}-${endYear}`,
  };
};

const isAlbumWithinYearRange = (album: AlbumResult, yearRange: YearRange | null): boolean => {
  if (!yearRange || !album.year) {
    return true;
  }

  const albumYear = Number.parseInt(album.year, 10);

  return albumYear >= yearRange.startYear && albumYear <= yearRange.endYear;
};

const buildDiscoverSearchUrl = (filters: DiscoverAlbumFilters, genre?: GenreOption): string => {
  const url = new URL(`${DISCOGS_BASE_URL}/database/search`);
  const yearRange = getDecadeYearRange(filters.decade);

  url.searchParams.set('type', 'release');
  url.searchParams.set('per_page', '50');

  if (filters.country) {
    url.searchParams.set('country', filters.country.name);
  }

  if (yearRange) {
    url.searchParams.set('year', yearRange.queryValue);
  }

  if (genre) {
    const paramName = DISCOGS_GENRE_PARAMS[genre] ?? 'genre';
    url.searchParams.set(paramName, genre);
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

export const searchDiscoverAlbums = async (
  filters: DiscoverAlbumFilters,
  signal?: AbortSignal,
): Promise<AlbumResult[]> => {
  const hasFilters = Boolean(filters.country || filters.decade || filters.genres.length > 0);

  if (!hasFilters) {
    return [];
  }

  const yearRange = getDecadeYearRange(filters.decade);
  const genresToSearch = filters.genres.length > 0 ? filters.genres : [undefined];
  const urls = genresToSearch.map((genre) => buildDiscoverSearchUrl(filters, genre));
  const responses = await Promise.all(urls.map((url) => fetchDiscogsSearch(url, signal)));
  const albumsById = new Map<string, AlbumResult>();

  responses
    .flatMap((response) => response.results ?? [])
    .map(normalizeDiscogsSearchRelease)
    .filter((album) => isAlbumWithinYearRange(album, yearRange))
    .forEach((album) => {
      albumsById.set(album.id, album);
    });

  return sortAlbumsByYear([...albumsById.values()]).slice(0, DISCOVER_RESULTS_LIMIT);
};
