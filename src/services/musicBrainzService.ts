import type {
  AlbumResult,
  MusicBrainzRelease,
  MusicBrainzSearchResponse,
} from '../types/musicBrainz';
import { getCoverArtUrl } from './coverArtService';

const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2/release/';
const CORS_PROXY_URL = 'https://api.allorigins.win/raw?url=';
export const MUSICBRAINZ_APP_NAME = 'AlbumCoversExplorer/1.0.0';

const buildArtistName = (release: MusicBrainzRelease): string => {
  const artistCredit = release['artist-credit'];

  if (!artistCredit || artistCredit.length === 0) {
    return 'Artista desconocido';
  }

  return artistCredit
    .map((credit) => credit.artist?.name ?? credit.name)
    .filter(Boolean)
    .join(', ');
};

const normalizeRelease = (release: MusicBrainzRelease): AlbumResult => {
  const year = release.date?.slice(0, 4);

  return {
    id: release.id,
    title: release.title,
    artist: buildArtistName(release),
    date: release.date,
    year,
    country: release.country,
    status: release.status,
    coverUrl: getCoverArtUrl(release.id),
  };
};

export const searchReleases = async (searchTerm: string): Promise<AlbumResult[]> => {
  const trimmedQuery = searchTerm.trim();

  if (!trimmedQuery) {
    return [];
  }

  // Use absolute URL for URL constructor, but fetch through proxy
  const url = new URL(MUSICBRAINZ_BASE_URL);
  url.searchParams.set('query', trimmedQuery);
  url.searchParams.set('fmt', 'json');

  // Use CORS proxy to bypass network issues
  const musicBrainzUrl = MUSICBRAINZ_BASE_URL + url.search.substring(1);
  const corsProxyUrl = CORS_PROXY_URL + encodeURIComponent(musicBrainzUrl);

  const response = await fetch(corsProxyUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Client-Name': MUSICBRAINZ_APP_NAME,
      'User-Agent': MUSICBRAINZ_APP_NAME,
    },
  });

  if (!response.ok) {
    throw new Error(`MusicBrainz respondió con estado ${response.status}`);
  }

  const data = (await response.json()) as MusicBrainzSearchResponse;
  const releases = data.releases ?? [];

  return releases.map(normalizeRelease);
};
