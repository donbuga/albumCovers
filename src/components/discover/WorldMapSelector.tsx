import type { CountryOption } from '../../types/discover';

interface WorldMapSelectorProps {
  countries: CountryOption[];
  selectedCountry: CountryOption | null;
  onSelectCountry: (country: CountryOption) => void;
}

const continentClass = 'fill-[#111d38] stroke-[#243557] stroke-[1.5]';

const WorldMapSelector = ({ countries, selectedCountry, onSelectCountry }: WorldMapSelectorProps) => (
  <section className="overflow-hidden rounded-3xl border border-[#1d2945] bg-[#081026]/90 shadow-2xl shadow-black/20">
    <div className="flex flex-col gap-2 border-b border-[#1d2945] p-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-300">Exploración global</p>
        <h2 className="text-2xl font-black text-slate-100">Selecciona un país</h2>
      </div>
      <p className="max-w-md text-sm text-slate-400">
        Haz click o tap sobre un país resaltable para guardar la selección localmente.
      </p>
    </div>

    <div className="p-3 sm:p-5">
      <svg viewBox="0 0 900 460" role="img" aria-label="Mapa del mundo para seleccionar un país" className="h-auto w-full rounded-2xl bg-[#050a18]">
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#1f355d" stopOpacity="0.52" />
            <stop offset="100%" stopColor="#050a18" stopOpacity="0" />
          </radialGradient>
          <filter id="countryGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width="900" height="460" fill="url(#mapGlow)" />
        <path className={continentClass} d="M88 95L160 61L244 78L303 122L276 188L205 205L166 174L101 182L58 139Z" />
        <path className={continentClass} d="M260 218L331 231L374 287L347 376L293 424L251 357L225 282Z" />
        <path className={continentClass} d="M399 105L487 79L581 107L609 171L559 220L462 210L405 163Z" />
        <path className={continentClass} d="M454 219L545 222L591 298L558 405L494 415L448 339L421 267Z" />
        <path className={continentClass} d="M579 119L712 93L817 143L785 236L664 258L590 207Z" />
        <path className={continentClass} d="M676 322L786 333L838 384L789 419L696 396Z" />
        <path d="M77 229H826" stroke="#182640" strokeDasharray="6 12" strokeLinecap="round" />
        <path d="M450 48V420" stroke="#182640" strokeDasharray="6 12" strokeLinecap="round" />

        {countries.map((country) => {
          const isActive = selectedCountry?.code === country.code;

          return (
            <g key={country.code}>
              <g
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`Seleccionar ${country.name}`}
                onClick={() => onSelectCountry(country)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectCountry(country);
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                <rect
                  x={country.x}
                  y={country.y}
                  width={country.width}
                  height={country.height}
                  rx="10"
                  className={`transition duration-200 ${
                    isActive
                      ? 'fill-lime-300 stroke-white stroke-2'
                      : 'fill-cyan-300/30 stroke-cyan-200/70 stroke-[1.5] hover:fill-cyan-300/60 hover:stroke-white'
                  }`}
                  filter={isActive ? 'url(#countryGlow)' : undefined}
                />
                <text
                  x={country.x + country.width / 2}
                  y={country.y + country.height / 2 + 4}
                  textAnchor="middle"
                  className={`pointer-events-none select-none text-[13px] font-black ${isActive ? 'fill-[#050812]' : 'fill-slate-100'}`}
                >
                  {country.code}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  </section>
);

export default WorldMapSelector;
