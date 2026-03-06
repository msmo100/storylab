import { useEffect, useState } from 'react';
import { useBuilderStore } from './store/builderStore';
import { useAuthStore } from './store/authStore';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { BuilderView } from './views/BuilderView';
import { RenderView } from './views/RenderView';

type View = 'auth' | 'dashboard' | 'builder' | 'render';

function getView(): View {
  const hash = window.location.hash;
  if (hash.startsWith('#/render')) return 'render';
  if (hash.startsWith('#/edit'))   return 'builder';
  if (hash.startsWith('#/auth'))   return 'auth';
  return 'dashboard';
}

function App() {
  const [view, setView] = useState<View>(getView);
  const darkMode = useBuilderStore((s) => s.darkMode);
  const { user, loading } = useAuthStore();

  // Hash change listener
  useEffect(() => {
    const onHashChange = () => setView(getView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Keep <html> dark class in sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Auth guards: run once auth state is known
  useEffect(() => {
    if (loading) return;

    if (!user && view !== 'auth' && view !== 'render') {
      window.location.hash = '#/auth';
    }

    if (user && view === 'auth') {
      window.location.hash = '#/';
    }
  }, [user, loading, view]);

  // Spinner while the initial Supabase session resolves
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <span className="text-sm text-gray-400">Laddar…</span>
      </div>
    );
  }

  // Render view is public — used inside CMS iframes with no auth context
  if (view === 'render') return <RenderView />;

  // All other views require a logged-in user
  if (!user) return <AuthView />;

  if (view === 'builder') return <BuilderView />;
  return <DashboardView />;
}

export default App;
