import { useState } from 'react';
import AlbumGrid from './components/AlbumGrid';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import LoadingState from './components/LoadingState';
import SearchBar from './components/SearchBar';
import { searchReleases } from './services/musicBrainzService';
import type { AlbumResult } from './types/musicBrainz';

const App = () => {
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (term: string) => {
    setHasSearched(true);
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchReleases(term);
      setAlbums(results);
    } catch (searchError) {
      setAlbums([]);
      if (searchError instanceof Error) {
        setError(searchError.message);
      } else {
        setError('Ocurrió un error de red al buscar en MusicBrainz.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-container">
      <header>
        <h1>Album Covers Explorer</h1>
        <p>Encuentra lanzamientos y sus portadas usando MusicBrainz + Cover Art Archive.</p>
      </header>

      <SearchBar onSearch={handleSearch} disabled={isLoading} />

      {isLoading && <LoadingState />}
      {!isLoading && error && <ErrorState message={error} />}
      {!isLoading && !error && albums.length > 0 && <AlbumGrid albums={albums} />}
      {!isLoading && !error && albums.length === 0 && <EmptyState hasSearched={hasSearched} />}
    </main>
  );
};

export default App;
