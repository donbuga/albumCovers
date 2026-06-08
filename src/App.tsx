import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader';
import DiscoverMap from './pages/DiscoverMap';
import SearchPage from './pages/SearchPage';

const routes = ['/', '/discover-map'] as const;
type AppRoute = (typeof routes)[number];

const getRouteFromHash = (): AppRoute => {
  const hashRoute = window.location.hash.replace(/^#/, '') || '/discover-map';
  return routes.includes(hashRoute as AppRoute) ? (hashRoute as AppRoute) : '/discover-map';
};

const App = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(getRouteFromHash());

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (currentRoute === '/') {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLInputElement>('input[aria-label=\"Buscar álbumes\"]')?.focus();
      });
    }
  }, [currentRoute]);

  return (
    <main className="min-h-screen bg-[#050812] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <AppHeader currentRoute={currentRoute} />
        <div className="space-y-10">
          <div style={{ display: currentRoute === '/discover-map' ? 'block' : 'none' }}>
            <DiscoverMap />
          </div>
          <div style={{ display: currentRoute === '/' ? 'block' : 'none' }}>
            <SearchPage />
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
