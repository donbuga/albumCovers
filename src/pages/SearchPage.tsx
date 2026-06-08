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
    <section className="rounded-3xl border border-[#1a233c] bg-[#071022]/70 p-6 shadow-xl shadow-black/10">
      <div className="mb-5 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Búsqueda directa</p>
        <h2 className="mt-2 text-2xl font-black text-slate-100">Busca un artista o álbum específico</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">¿Ya sabes lo que buscas? Encuéntralo directo.</p>
      </div>
      <SearchBar onSearch={handleSearch} disabled={isLoading} />
      {isLoading && <LoadingState />}
      {!isLoading && error && <ErrorState message={error} />}
      {!isLoading && !error && albums.length > 0 && <AlbumGrid albums={albums} apiSource={apiSource} />}
      {!isLoading && !error && albums.length === 0 && <EmptyState hasSearched={hasSearched} />}
    </section>
  );
};

export default SearchPage;
