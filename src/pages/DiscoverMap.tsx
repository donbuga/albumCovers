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
  const [areFiltersCollapsed, setAreFiltersCollapsed] = useState(false);
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
    setAreFiltersCollapsed(true);
    void searchAlbums(selectedFilters);
  };

  const handleClearFilters = () => {
    setSelectedCountry(null);
    setSelectedDecade(null);
    setSelectedGenres([]);
    setSelectedAlbum(null);
    resetSearch();
    setAreFiltersCollapsed(false);
  };

  const resultStatus = isLoading
    ? 'Buscando en los archivos...'
    : error
      ? 'No se pudieron cargar resultados'
      : `${albums.length} resultado(s)`;

  return (
    <div className="space-y-6">
      <div id="discovery-slider">
        <div className="slide active" data-country="Jamaica" data-decade="1970" data-genre="Reggae">
          <p className="slide-kicker">¿Qué sonaba en Jamaica en los 70s?</p>
          <p className="slide-title">Descubre el reggae en su lugar de origen</p>
        </div>
        <div className="slide" data-country="UK" data-decade="1980" data-genre="Post Punk">
          <p className="slide-kicker">Londres · 1980s · Post-punk</p>
          <p className="slide-title">El sonido que cambió una generación</p>
        </div>
        <div className="slide" data-country="Brazil" data-decade="1960" data-genre="Bossa Nova">
          <p className="slide-kicker">¿De dónde viene el bossa nova?</p>
          <p className="slide-title">Brasil, 1960s — explóralo ahora</p>
        </div>
        <div className="slide" data-country="US" data-decade="1950" data-genre="Blues">
          <p className="slide-kicker">Chicago · 1950s · Blues</p>
          <p className="slide-title">El origen de todo lo que vino después</p>
        </div>
        <div className="slide">
          <p className="slide-kicker">¿Qué géneros nacieron en tu país?</p>
          <p className="slide-title">Elige un país en el mapa y descúbrelo</p>
        </div>
        <div className="slide" data-country="US" data-decade="1960" data-genre="Soul">
          <p className="slide-kicker">Detroit · 1960s · Soul</p>
          <p className="slide-title">Motown: la fábrica de hits que conquistó el mundo</p>
        </div>
        <div className="slide" data-country="Germany" data-decade="1970" data-genre="Krautrock">
          <p className="slide-kicker">¿Qué escuchaban en Alemania en los 70s?</p>
          <p className="slide-title">Krautrock y electrónica — el futuro sonaba así</p>
        </div>
        <div className="slide" data-country="US" data-decade="1970" data-genre="Jazz-Funk">
          <p className="slide-kicker">Nueva York · 1970s · Jazz Fusion</p>
          <p className="slide-title">Cuando el jazz decidió romper todas las reglas</p>
        </div>
        <div className="slide" data-country="Spain" data-decade="1960" data-genre="Flamenco">
          <p className="slide-kicker">¿De dónde viene el flamenco más puro?</p>
          <p className="slide-title">España, 1960s — raíces que todavía vibran</p>
        </div>
        <div className="slide" data-country="Nigeria" data-decade="1970" data-genre="Afrobeat">
          <p className="slide-kicker">Lagos · 1970s · Afrobeat</p>
          <p className="slide-title">Fela Kuti y el ritmo que desafió al poder</p>
        </div>
        <div className="slider-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </div>

      {hasSearched && (
        <section className="rounded-3xl border border-lime-300/25 bg-[#081026]/95 p-4 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-300">Filtros aplicados</p>
              <div className="mt-2 flex flex-wrap items-center gap-2" aria-label="Resumen compacto de filtros aplicados">
                <span className="rounded-full bg-slate-100/10 px-3 py-1 text-sm font-bold text-slate-100">
                  {selectedCountry?.name ?? 'Elige un país'}
                </span>
                <span className="rounded-full bg-slate-100/10 px-3 py-1 text-sm font-bold text-slate-100">
                  {selectedDecade ?? 'Cualquier década'}
                </span>
                {selectedGenres.length > 0 ? (
                  selectedGenres.map((genre) => (
                    <span key={genre} className="rounded-full bg-cyan-300/15 px-3 py-1 text-sm font-bold text-cyan-200">
                      {genre}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-100">
                    Cualquier género
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-left">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Resultados</p>
                <p className="text-2xl font-black text-slate-100">{resultStatus}</p>
              </div>
              <button
                type="button"
                onClick={() => setAreFiltersCollapsed((currentValue) => !currentValue)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-lime-300/40 px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-lime-200 transition hover:border-lime-200 hover:bg-lime-300/10"
                aria-expanded={!areFiltersCollapsed}
              >
                <span className={`text-lg transition ${areFiltersCollapsed ? 'rotate-180' : ''}`} aria-hidden="true">
                  ↑
                </span>
                {areFiltersCollapsed ? 'Expandir filtros' : 'Minimizar filtros'}
              </button>
            </div>
          </div>
        </section>
      )}

      {!areFiltersCollapsed && (
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
      )}

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
              ? 'No se encontraron álbumes. Prueba con otro artista o explora el mapa.'
              : 'Los resultados aparecerán aquí'}
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
