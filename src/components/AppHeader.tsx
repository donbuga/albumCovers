interface AppHeaderProps {
  currentRoute: string;
}

const navItems = [
  { href: '#/', label: 'Buscar', route: '/' },
  { href: '#/discover-map', label: 'DiscoverMap', route: '/discover-map' },
];

const AppHeader = ({ currentRoute }: AppHeaderProps) => (
  <header className="mb-10 border-b border-[#1a233c] pb-4">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-5xl font-black uppercase tracking-wider text-slate-200">
          Dis<span className="text-lime-300">cover</span> <span className="text-lime-300">Music</span>
        </h1>
        <p className="text-sm tracking-[0.2em] text-slate-500">// descubre carátulas de discos y más</p>
      </div>

      <nav className="flex w-full flex-col gap-2 rounded-2xl border border-[#1a233c] bg-[#081026]/80 p-2 sm:w-auto sm:flex-row" aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;

          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`rounded-xl px-4 py-2 text-center text-sm font-bold uppercase tracking-[0.18em] transition duration-200 ${
                isActive
                  ? 'bg-lime-300 text-[#050812] shadow-lg shadow-lime-300/20'
                  : 'text-slate-400 hover:bg-[#111b34] hover:text-slate-100'
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </nav>
    </div>
  </header>
);

export default AppHeader;
