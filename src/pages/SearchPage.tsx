import { useState } from 'react';
import AlbumGrid from '../components/AlbumGrid';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import SearchBar from '../components/SearchBar';
import { searchReleases as searchDiscogs } from '../services/discogsService';
import { searchReleases as searchITunes } from '../services/itunesService';
import type { AlbumResult } from '../types/musicBrainz';

type ApiSource = 'itunes' | 'discogs';

const SearchPage = () => {
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [apiSource] = useState<ApiSource>('itunes');

  const handleSearch = async (term: string) => {
    setHasSearched(true);
    setIsLoading(true);
    setError(null);

    try {
      const results = apiSource === 'itunes' ? await searchITunes(term) : await searchDiscogs(term);
      setAlbums(results);
    } catch (searchError) {
      setAlbums([]);
      if (searchError instanceof Error) {
        setError(searchError.message);
      } else {
        setError(`Ocurrió un error de red al buscar en ${apiSource === 'itunes' ? 'iTunes' : 'Discogs'}.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SearchBar onSearch={handleSearch} disabled={isLoading} />
      {isLoading && <LoadingState />}
      {!isLoading && error && <ErrorState message={error} />}
      {!isLoading && !error && albums.length > 0 && <AlbumGrid albums={albums} apiSource={apiSource} />}
      {!isLoading && !error && albums.length === 0 && <EmptyState hasSearched={hasSearched} />}
    </>
  );
};

export default SearchPage;
