import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAuthStore } from './store/authStore.ts'

function Root() {
  const initialize = useAuthStore((s) => s._initialize);

  useEffect(() => {
    // Set up Supabase auth state listener exactly once; clean up on unmount
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
