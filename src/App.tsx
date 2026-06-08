import { useEffect, useState } from 'react';
import AppHeader from './components/AppHeader';
import DiscoverMap from './pages/DiscoverMap';
import SearchPage from './pages/SearchPage';

const routes = ['/', '/discover-map'] as const;
type AppRoute = (typeof routes)[number];

const getRouteFromHash = (): AppRoute => {
  const hashRoute = window.location.hash.replace(/^#/, '') || '/';
  return routes.includes(hashRoute as AppRoute) ? (hashRoute as AppRoute) : '/';
};

const App = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getRouteFromHash);

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(getRouteFromHash());

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <main className="min-h-screen bg-[#050812] text-slate-100">
      <div className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <AppHeader currentRoute={currentRoute} />
        <div className="space-y-10">
          <DiscoverMap />
          <SearchPage />
        </div>
      </div>
    </main>
  );
};

export default App;
