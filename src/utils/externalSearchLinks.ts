import type { ExternalSearchProvider } from '../types/externalSearch';

export const EXTERNAL_SEARCH_PROVIDERS: ExternalSearchProvider[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    baseUrl: 'https://www.youtube.com/results',
    queryParam: 'search_query',
    icon: '▶️',
  },
  {
    id: 'youtube-music',
    name: 'YouTube Music',
    baseUrl: 'https://music.youtube.com/search',
    queryParam: 'q',
    icon: '🎵',
  },
  {
    id: 'google',
    name: 'Google',
    baseUrl: 'https://www.google.com/search',
    queryParam: 'q',
    icon: '🔎',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    baseUrl: 'https://open.spotify.com/search',
    urlStrategy: 'path-segment',
    icon: '🟢',
  },
  {
    id: 'discogs',
    name: 'Discogs',
    baseUrl: 'https://www.discogs.com/search/',
    queryParam: 'q',
    icon: '💿',
  },
  {
    id: 'bandcamp',
    name: 'Bandcamp',
    baseUrl: 'https://bandcamp.com/search',
    queryParam: 'q',
    icon: '🏷️',
  },
  {
    id: 'apple-music',
    name: 'Apple Music',
    baseUrl: 'https://music.apple.com/search',
    queryParam: 'term',
    icon: '🍎',
  },
  {
    id: 'deezer',
    name: 'Deezer',
    baseUrl: 'https://www.deezer.com/search',
    urlStrategy: 'path-segment',
    icon: '🎧',
  },
  {
    id: 'tidal',
    name: 'Tidal',
    baseUrl: 'https://listen.tidal.com/search',
    queryParam: 'q',
    icon: '🌊',
  },
  {
    id: 'rateyourmusic',
    name: 'RateYourMusic',
    baseUrl: 'https://rateyourmusic.com/search',
    queryParam: 'searchterm',
    icon: '⭐',
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia',
    baseUrl: 'https://en.wikipedia.org/w/index.php',
    queryParam: 'search',
    icon: '📚',
  },
];

export interface ExternalSearchLink {
  provider: ExternalSearchProvider;
  url: string;
}

export const buildExternalSearchQuery = (artist: string, albumTitle: string): string =>
  [artist, albumTitle].map((value) => value.trim()).filter(Boolean).join(' ');

export const buildExternalSearchUrl = (provider: ExternalSearchProvider, query: string): string => {
  const encodedQuery = encodeURIComponent(query);

  if (provider.urlStrategy === 'path-segment') {
    return `${provider.baseUrl}/${encodedQuery}`;
  }

  if (!provider.queryParam) {
    return provider.baseUrl;
  }

  return `${provider.baseUrl}?${provider.queryParam}=${encodedQuery}`;
};

export const getExternalSearchLinks = (artist: string, albumTitle: string): ExternalSearchLink[] => {
  const query = buildExternalSearchQuery(artist, albumTitle);

  return EXTERNAL_SEARCH_PROVIDERS.map((provider) => ({
    provider,
    url: buildExternalSearchUrl(provider, query),
  }));
};
