import { useEffect, useState } from 'react';
import { useBuilderStore } from './store/builderStore';
import { useAuthStore } from './store/authStore';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { BuilderView } from './views/BuilderView';
import { RenderView } from './views/RenderView';
import { ScrollyView } from './views/ScrollyView';
import { ToastContainer } from './components/ui/Toast';

type View = 'auth' | 'dashboard' | 'builder' | 'render' | 'scrolly';

function getView(): View {
  const hash = window.location.hash;
  if (hash.startsWith('#/scrolly')) return 'scrolly';
  if (hash.startsWith('#/render'))  return 'render';
  if (hash.startsWith('#/edit'))    return 'builder';
  if (hash.startsWith('#/auth'))    return 'auth';
  return 'dashboard';
}

function App() {
  const [view, setView] = useState<View>(getView);
  const darkMode = useBuilderStore((s) => s.darkMode);
  const { user, loading, guestMode } = useAuthStore();

  useEffect(() => {
    const onHashChange = () => setView(getView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (loading || guestMode) return;
    if (!user && view !== 'auth' && view !== 'render' && view !== 'scrolly') {
      window.location.hash = '#/auth';
    }
    if (user && view === 'auth') {
      window.location.hash = '#/';
    }
  }, [user, loading, guestMode, view]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <span className="text-sm text-gray-400">Laddar…</span>
      </div>
    );
  }

  // Public views — used inside CMS iframes
  if (view === 'scrolly') return <ScrollyView />;
  if (view === 'render')  return <RenderView />;

  if (guestMode) {
    return (
      <>
        <BuilderView />
        <ToastContainer />
      </>
    );
  }

  if (!user) return <AuthView />;

  return (
    <>
      {view === 'builder' ? <BuilderView /> : <DashboardView />}
      <ToastContainer />
    </>
  );
}

export default App;
