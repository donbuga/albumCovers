import { useState } from 'react';
import DecadeSelector from '../components/discover/DecadeSelector';
import FilterSummary from '../components/discover/FilterSummary';
import GenreSelector from '../components/discover/GenreSelector';
import WorldMapSelector from '../components/discover/WorldMapSelector';
import { COUNTRY_OPTIONS, DECADE_OPTIONS, GENRE_OPTIONS } from '../constants/discoverFilters';
import type { CountryOption, DecadeOption, GenreOption } from '../types/discover';

const DiscoverMap = () => {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [selectedDecade, setSelectedDecade] = useState<DecadeOption | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<GenreOption[]>([]);

  const handleToggleGenre = (genre: GenreOption) => {
    setSelectedGenres((currentGenres) =>
      currentGenres.includes(genre)
        ? currentGenres.filter((currentGenre) => currentGenre !== genre)
        : [...currentGenres, genre],
    );
  };

  const handleClearFilters = () => {
    setSelectedCountry(null);
    setSelectedDecade(null);
    setSelectedGenres([]);
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
            Una experiencia alternativa para descubrir música por territorio, década y estilo. Por ahora solo prepara la
            interfaz y mantiene los filtros en estado local, sin realizar búsquedas ni conexiones externas.
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
          onClearFilters={handleClearFilters}
        />
      </div>
    </div>
  );
};

export default DiscoverMap;
