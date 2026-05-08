import type { GenreOption } from '../../types/discover';

interface GenreSelectorProps {
  genres: GenreOption[];
  selectedGenres: GenreOption[];
  onToggleGenre: (genre: GenreOption) => void;
}

const GenreSelector = ({ genres, selectedGenres, onToggleGenre }: GenreSelectorProps) => (
  <section className="rounded-3xl border border-[#1d2945] bg-[#081026]/90 p-5 shadow-2xl shadow-black/20">
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-300">Paleta sonora</p>
      <h2 className="text-2xl font-black text-slate-100">Estilos musicales</h2>
    </div>

    <div className="flex flex-wrap gap-3" aria-label="Seleccionar géneros musicales">
      {genres.map((genre) => {
        const isActive = selectedGenres.includes(genre);

        return (
          <button
            key={genre}
            type="button"
            aria-pressed={isActive}
            onClick={() => onToggleGenre(genre)}
            className={`rounded-full border px-4 py-2 text-sm font-bold uppercase tracking-[0.14em] transition duration-200 ${
              isActive
                ? 'border-cyan-300 bg-cyan-300 text-[#050812] shadow-lg shadow-cyan-300/20'
                : 'border-[#263554] bg-[#0c1428] text-slate-300 hover:-translate-y-0.5 hover:border-cyan-300/70 hover:text-white'
            }`}
          >
            {genre}
          </button>
        );
      })}
    </div>
  </section>
);

export default GenreSelector;
