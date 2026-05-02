import type { AlbumResult } from '../types/musicBrainz';
import type { DiscogsRelease, DiscogsSearchResponse } from '../types/discogs';

const DISCOGS_BASE_URL = 'https://api.discogs.com';
const DISCOGS_USER_AGENT = 'AlbumCoversExplorer/1.0.0';
const RELEASES_ENDPOINT_INTERVAL_MS = 4000;

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
  };
};

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
    return normalizedAlbums.sort((a, b) => {
      if (!a.year) return 1;
      if (!b.year) return -1;
      return parseInt(a.year) - parseInt(b.year);
    });
  } catch (error) {
    console.error('Discogs search error:', error);
    throw error;
  }
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
