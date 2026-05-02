import { useState } from 'react';
import AlbumGrid from './components/AlbumGrid';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import LoadingState from './components/LoadingState';
import SearchBar from './components/SearchBar';
import { searchReleases as searchDiscogs } from './services/discogsService';
import { searchReleases as searchITunes } from './services/itunesService';
import type { AlbumResult } from './types/musicBrainz';

type ApiSource = 'itunes' | 'discogs';

const App = () => {
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [apiSource, setApiSource] = useState<ApiSource>('itunes');

  const handleSearch = async (term: string) => {
    setHasSearched(true);
    setIsLoading(true);
    setError(null);

    try {
      let results: AlbumResult[];
      
      if (apiSource === 'itunes') {
        results = await searchITunes(term);
      } else {
        results = await searchDiscogs(term);
      }
      
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
    <main className="app-container">
      <header>
        <h1>Album Covers Explorer</h1>
        <p>Encuentra portadas de discos usando iTunes o Discogs API.</p>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="api-selector" style={{ marginRight: '10px' }}>
          Fuente de búsqueda:
        </label>
        <select
          id="api-selector"
          value={apiSource}
          onChange={(e) => setApiSource(e.target.value as ApiSource)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: '#2a2a2a',
            color: 'white',
          }}
        >
          <option value="itunes">iTunes</option>
          <option value="discogs">Discogs</option>
        </select>
      </div>

      <SearchBar onSearch={handleSearch} disabled={isLoading} />

      {isLoading && <LoadingState />}
      {!isLoading && error && <ErrorState message={error} />}
      {!isLoading && !error && albums.length > 0 && <AlbumGrid albums={albums} apiSource={apiSource} />}
      {!isLoading && !error && albums.length === 0 && <EmptyState hasSearched={hasSearched} />}
    </main>
  );
};

export default App;
