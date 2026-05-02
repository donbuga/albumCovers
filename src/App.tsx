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
        <header className="mb-10 border-b border-[#1a233c] pb-8">
          <div className="mb-7 flex items-center justify-between gap-6">
            <h1 className="text-3xl font-black uppercase tracking-[0.16em] text-lime-300">Albumcovers</h1>
            <nav className="rounded-xl border border-[#27304a] bg-[#0a1020]/90 p-1 text-xs uppercase tracking-[0.2em] text-slate-400">
              <div className="flex">
                <span className="px-6 py-3">Search</span>
                <button className="rounded-lg bg-lime-300 px-6 py-3 font-semibold text-[#111827]">Discover</button>
              </div>
            </nav>
          </div>

          <h2 className="text-5xl font-black uppercase tracking-wider text-slate-200">
            Discover <span className="text-lime-300">Music</span>
          </h2>
          <p className="mt-2 text-sm tracking-[0.2em] text-slate-500">// selecciona fuente y busca para explorar</p>
        </header>

        <div className="mb-6 flex items-center gap-3">
          <label htmlFor="api-selector" className="text-sm font-medium text-slate-300">
            Fuente de búsqueda:
          </label>
          <select
            id="api-selector"
            value={apiSource}
            onChange={(e) => setApiSource(e.target.value as ApiSource)}
            className="rounded-lg border border-[#2a3758] bg-[#0b1224] px-3 py-2 text-sm text-slate-100 outline-none focus:border-lime-300"
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
      </div>
    </main>
  );
};

export default App;
