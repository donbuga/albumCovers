import type { CountryOption } from '../../types/discover';

interface WorldMapSelectorProps {
  countries: CountryOption[];
  selectedCountry: CountryOption | null;
  onSelectCountry: (country: CountryOption) => void;
}

const landMasses = [
  'M78 74L164 42L269 65L329 113L302 191L236 218L165 191L94 202L40 149Z',
  'M239 236L326 249L395 310L386 434L339 529L288 485L255 386L220 302Z',
  'M395 95L506 58L614 95L644 177L592 248L473 244L399 184Z',
  'M432 263L548 258L633 341L637 461L589 569L515 552L460 440L407 343Z',
  'M555 92L715 68L883 101L972 183L948 318L820 368L653 329L573 236Z',
  'M776 500L913 510L991 572L936 632L813 612L746 552Z',
];

const gridLines = [
  { d: 'M70 124C220 92 350 92 500 124C650 156 830 156 1000 124', label: '30°N', y: 115 },
  { d: 'M58 230C230 204 370 204 520 230C673 258 828 258 1012 230', label: '0°', y: 222 },
  { d: 'M70 392C225 418 356 418 504 392C658 364 834 364 1000 392', label: '30°S', y: 385 },
];

const WorldMapSelector = ({ countries, selectedCountry, onSelectCountry }: WorldMapSelectorProps) => (
  <section className="overflow-hidden rounded-3xl border border-[#1d2945] bg-[#081026]/90 shadow-2xl shadow-black/20">
    <div className="flex flex-col gap-2 border-b border-[#1d2945] p-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-lime-300">Exploración global</p>
        <h2 className="text-2xl font-black text-slate-100">Selecciona un país</h2>
      </div>
      <p className="max-w-md text-sm text-slate-400">
        Ahora el mapa incluye {countries.length} países con siluetas más orgánicas, etiquetas y estados interactivos.
      </p>
    </div>

    <div className="p-3 sm:p-5">
      <svg
        viewBox="0 0 1040 660"
        role="img"
        aria-label="Mapa del mundo para seleccionar un país"
        className="h-auto w-full rounded-2xl bg-[#050a18]"
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="35%" r="72%">
            <stop offset="0%" stopColor="#284879" stopOpacity="0.72" />
            <stop offset="55%" stopColor="#0c1731" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#050a18" stopOpacity="1" />
          </radialGradient>
          <linearGradient id="landGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#17284c" />
            <stop offset="100%" stopColor="#0c1832" />
          </linearGradient>
          <linearGradient id="countryGradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#6ee7f9" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.4" />
          </linearGradient>
          <filter id="countryGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000" floodOpacity="0.28" />
          </filter>
        </defs>

        <rect width="1040" height="660" fill="url(#mapGlow)" />
        <circle cx="180" cy="140" r="86" fill="#38bdf8" opacity="0.06" />
        <circle cx="805" cy="470" r="118" fill="#a3e635" opacity="0.05" />

        {gridLines.map((line) => (
          <g key={line.label}>
            <path d={line.d} fill="none" stroke="#21375f" strokeDasharray="8 14" strokeLinecap="round" />
            <text x="24" y={line.y} className="fill-slate-500 text-[12px] font-bold tracking-widest">
              {line.label}
            </text>
          </g>
        ))}
        <path d="M520 42V618" stroke="#21375f" strokeDasharray="8 14" strokeLinecap="round" />

        <g filter="url(#softShadow)">
          {landMasses.map((path) => (
            <path key={path} d={path} fill="url(#landGradient)" stroke="#2b416a" strokeWidth="1.5" opacity="0.95" />
          ))}
        </g>

        {countries.map((country) => {
          const isActive = selectedCountry?.code === country.code;

          return (
            <g
              key={country.code}
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
              className="group cursor-pointer focus:outline-none"
            >
              <path
                d={country.path}
                className={`transition duration-200 group-focus-visible:stroke-white ${
                  isActive
                    ? 'fill-lime-300 stroke-white stroke-[2.5]'
                    : 'fill-[url(#countryGradient)] stroke-cyan-100/70 stroke-[1.5] hover:fill-lime-200 hover:stroke-white'
                }`}
                filter={isActive ? 'url(#countryGlow)' : undefined}
              />
              <circle
                cx={country.labelX}
                cy={country.labelY}
                r={isActive ? 18 : 15}
                className={`pointer-events-none transition duration-200 ${
                  isActive ? 'fill-[#050812] stroke-lime-100' : 'fill-[#071022]/85 stroke-cyan-100/50 group-hover:stroke-white'
                }`}
                strokeWidth="1.5"
              />
              <text
                x={country.labelX}
                y={country.labelY + 4}
                textAnchor="middle"
                className={`pointer-events-none select-none text-[12px] font-black ${isActive ? 'fill-lime-200' : 'fill-slate-100'}`}
              >
                {country.code}
              </text>
              <title>{country.name}</title>
            </g>
          );
        })}
      </svg>
    </div>
  </section>
);

export default WorldMapSelector;
