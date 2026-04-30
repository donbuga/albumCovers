import type { AlbumResult } from '../types/musicBrainz';
import type { ITunesAlbum, ITunesSearchResponse } from '../types/itunes';

const ITUNES_BASE_URL = 'https://itunes.apple.com/search';

const normalizeITunesAlbum = (album: ITunesAlbum): AlbumResult => {
  const year = album.releaseDate?.slice(0, 4);

  return {
    id: album.collectionId.toString(),
    title: album.collectionName,
    artist: album.artistName,
    date: album.releaseDate,
    year,
    country: album.country,
    status: 'Official',
    coverUrl: album.artworkUrl100.replace('100x100', '600x600'),
  };
};

export const searchReleases = async (searchTerm: string): Promise<AlbumResult[]> => {
  const trimmedQuery = searchTerm.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = new URL(ITUNES_BASE_URL);
  url.searchParams.set('term', trimmedQuery);
  url.searchParams.set('media', 'music');
  url.searchParams.set('entity', 'album');
  url.searchParams.set('limit', '25');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`iTunes respondió con estado ${response.status}`);
    }

    const data = (await response.json()) as ITunesSearchResponse;
    const albums = data.results ?? [];

    const normalizedAlbums = albums.map(normalizeITunesAlbum);

    // Sort by year (oldest to newest)
    return normalizedAlbums.sort((a, b) => {
      if (!a.year) return 1;
      if (!b.year) return -1;
      return parseInt(a.year) - parseInt(b.year);
    });
  } catch (error) {
    console.error('iTunes search error:', error);
    throw error;
  }
};
