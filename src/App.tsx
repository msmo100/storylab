import { useEffect, useState } from 'react';
import { BuilderView } from './views/BuilderView';
import { RenderView } from './views/RenderView';
import { useBuilderStore } from './store/builderStore';

function getView(): 'builder' | 'render' {
  return window.location.hash === '#/render' ? 'render' : 'builder';
}

function App() {
  const [view, setView] = useState<'builder' | 'render'>(getView);
  const darkMode = useBuilderStore((s) => s.darkMode);

  useEffect(() => {
    const onHashChange = () => setView(getView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Keep the <html> class in sync so all dark: variants activate
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return view === 'render' ? <RenderView /> : <BuilderView />;
}

export default App;
