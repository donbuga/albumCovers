import type { CountryOption, DecadeOption, GenreOption } from '../../types/discover';

interface FilterSummaryProps {
  selectedCountry: CountryOption | null;
  selectedDecade: DecadeOption | null;
  selectedGenres: GenreOption[];
  onClearFilters: () => void;
}

const FilterSummary = ({ selectedCountry, selectedDecade, selectedGenres, onClearFilters }: FilterSummaryProps) => {
  const hasActiveFilters = Boolean(selectedCountry || selectedDecade || selectedGenres.length > 0);

  return (
    <aside className="rounded-3xl border border-lime-300/20 bg-lime-300/[0.06] p-5 shadow-2xl shadow-black/20 lg:sticky lg:top-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-300">Resumen</p>
      <h2 className="mt-1 text-2xl font-black text-slate-100">Filtros activos</h2>

      <dl className="mt-5 space-y-4 text-sm">
        <div>
          <dt className="font-bold uppercase tracking-[0.16em] text-slate-500">País</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-100">{selectedCountry?.name ?? 'Sin seleccionar'}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase tracking-[0.16em] text-slate-500">Década</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-100">{selectedDecade ?? 'Sin seleccionar'}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase tracking-[0.16em] text-slate-500">Géneros</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {selectedGenres.length > 0 ? (
              selectedGenres.map((genre) => (
                <span key={genre} className="rounded-full bg-cyan-300/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-cyan-200">
                  {genre}
                </span>
              ))
            ) : (
              <span className="text-lg font-semibold text-slate-100">Sin seleccionar</span>
            )}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        disabled={!hasActiveFilters}
        onClick={onClearFilters}
        className="mt-6 w-full rounded-2xl border border-[#31415f] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-200 transition hover:border-lime-300 hover:text-lime-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#31415f] disabled:hover:text-slate-200"
      >
        Clear filters
      </button>
    </aside>
  );
};

export default FilterSummary;
