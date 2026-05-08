import type { DecadeOption } from '../../types/discover';

interface DecadeSelectorProps {
  decades: DecadeOption[];
  selectedDecade: DecadeOption | null;
  onSelectDecade: (decade: DecadeOption) => void;
}

const DecadeSelector = ({ decades, selectedDecade, onSelectDecade }: DecadeSelectorProps) => (
  <section className="rounded-3xl border border-[#1d2945] bg-[#081026]/90 p-5 shadow-2xl shadow-black/20">
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-300">Filtro temporal</p>
      <h2 className="text-2xl font-black text-slate-100">Década</h2>
    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8" role="radiogroup" aria-label="Seleccionar década">
      {decades.map((decade) => {
        const isActive = selectedDecade === decade;

        return (
          <button
            key={decade}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelectDecade(decade)}
            className={`rounded-2xl border px-4 py-3 text-sm font-black uppercase tracking-[0.16em] transition duration-200 ${
              isActive
                ? 'border-lime-300 bg-lime-300 text-[#050812] shadow-lg shadow-lime-300/20'
                : 'border-[#263554] bg-[#0c1428] text-slate-300 hover:-translate-y-0.5 hover:border-lime-300/70 hover:text-white'
            }`}
          >
            {decade}
          </button>
        );
      })}
    </div>
  </section>
);

export default DecadeSelector;
