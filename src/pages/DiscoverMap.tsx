import { useMemo, useState } from 'react';
import AlbumGrid from '../components/AlbumGrid';
import AlbumMetadataModal from '../components/discover/AlbumMetadataModal';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import DecadeSelector from '../components/discover/DecadeSelector';
import FilterSummary from '../components/discover/FilterSummary';
import GenreSelector from '../components/discover/GenreSelector';
import WorldMapSelector from '../components/discover/WorldMapSelector';
import { COUNTRY_OPTIONS, DECADE_OPTIONS, GENRE_OPTIONS } from '../constants/discoverFilters';
import { useDiscoverAlbums } from '../hooks/useDiscoverAlbums';
import type { CountryOption, DecadeOption, GenreOption } from '../types/discover';
import type { AlbumResult } from '../types/musicBrainz';

const DiscoverMap = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<DecadeOption | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<GenreOption[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumResult | null>(null);
  const { albums, metadataByAlbumId, error, hasSearched, isLoading, resetSearch, searchAlbums } = useDiscoverAlbums();

  const selectedFilters = useMemo(
    () => ({
      country: selectedCountry,
      decade: selectedDecade,
      genres: selectedGenres,
    }),
    [selectedCountry, selectedDecade, selectedGenres],
  );

  const handleToggleGenre = (genre: GenreOption) => {
    setSelectedGenres((currentGenres) =>
      currentGenres.includes(genre)
        ? currentGenres.filter((currentGenre) => currentGenre !== genre)
        : [...currentGenres, genre],
    );
  };

  const handleApplyFilters = () => {
    void searchAlbums(selectedFilters);
  };

  const handleClearFilters = () => {
    setSelectedCountry(null);
    setSelectedDecade(null);
    setSelectedGenres([]);
    setSelectedAlbum(null);
    resetSearch();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[#1a233c] bg-gradient-to-br from-[#0f1d3b] via-[#081026] to-[#050812] p-6 shadow-2xl shadow-black/30">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-lime-300">DiscoverMap</p>
          <h2 className="mt-3 text-4xl font-black uppercase tracking-wide text-slate-100 sm:text-5xl">
            Explora álbumes desde el mapa
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Una experiencia alternativa para descubrir música por territorio, década y estilo con resultados reales de
            Discogs, incluyendo portadas y metadata disponible de cada lanzamiento.
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <WorldMapSelector
            countries={COUNTRY_OPTIONS}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
          />
          <DecadeSelector
            decades={DECADE_OPTIONS}
            selectedDecade={selectedDecade}
            onSelectDecade={setSelectedDecade}
          />
          <GenreSelector genres={GENRE_OPTIONS} selectedGenres={selectedGenres} onToggleGenre={handleToggleGenre} />
        </div>

        <FilterSummary
          selectedCountry={selectedCountry}
          selectedDecade={selectedDecade}
          selectedGenres={selectedGenres}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
          isLoading={isLoading}
        />
      </div>

      <section className="rounded-3xl border border-[#1a233c] bg-[#081026]/80 p-6 shadow-2xl shadow-black/20">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Resultados</p>
            <h2 className="mt-1 text-2xl font-black text-slate-100">Álbumes encontrados</h2>
          </div>
          {hasSearched && !isLoading && !error && (
            <p className="text-sm font-semibold text-slate-400">{albums.length} resultado(s)</p>
          )}
        </div>

        {isLoading && <LoadingState />}
        {!isLoading && error && <ErrorState message={error} />}
        {!isLoading && !error && albums.length > 0 && (
          <AlbumGrid albums={albums} apiSource="discogs" onAlbumDetailsClick={setSelectedAlbum} />
        )}
        {!isLoading && !error && albums.length === 0 && (
          <p className="text-slate-400">
            {hasSearched
              ? 'No se encontraron álbumes para la combinación de filtros seleccionada.'
              : 'Selecciona al menos un filtro y presiona “Apply filters” para descubrir álbumes.'}
          </p>
        )}
      </section>

      {selectedAlbum && (
        <AlbumMetadataModal
          album={selectedAlbum}
          metadataState={metadataByAlbumId[selectedAlbum.id]}
          onClose={() => setSelectedAlbum(null)}
        />
      )}
    </div>
  );
};

export default DiscoverMap;
