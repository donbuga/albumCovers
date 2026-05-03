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
    <main className="min-h-screen bg-[#050812] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <header className="mb-10 border-b border-[#1a233c] pb-4">

          <h2 className="text-5xl font-black uppercase tracking-wider text-slate-200">
            Dis<span className="text-lime-300">cover</span> <span className="text-lime-300">Music</span>
          </h2>
          <p className="text-sm tracking-[0.2em] text-slate-500">// descubre carátulas de discos y más</p>
        </header>

        <SearchBar onSearch={handleSearch} disabled={isLoading} />
        {isLoading && <LoadingState />}
        {!isLoading && error && <ErrorState message={error} />}
        {!isLoading && !error && albums.length > 0 && <AlbumGrid albums={albums} apiSource={apiSource} />}
        {!isLoading && !error && albums.length === 0 && <EmptyState hasSearched={hasSearched} />}
      </div>
    </main>
  );
};

export default App;
