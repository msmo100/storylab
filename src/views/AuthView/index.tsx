import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useBuilderStore } from '../../store/builderStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

type Tab = 'signin' | 'signup';

export function AuthView() {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const { signIn, signUp, error, pendingConfirmation, enterGuestMode } = useAuthStore();
  const { startGuestSession } = useBuilderStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === 'signin') {
      await signIn(email, password, rememberMe);
    } else {
      await signUp(email, password);
    }
  }

  function handleGuestMode() {
    startGuestSession();
    enterGuestMode();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">

        {/* Wordmark */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            GP StoryLab
          </span>
        </div>

        {/* Email confirmation notice */}
        {pendingConfirmation && (
          <div className="mb-6 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-4 py-3 text-sm text-blue-800 dark:text-blue-200 text-center">
            Kolla din e-post och klicka på bekräftelselänken för att aktivera ditt konto.
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 mb-6">
          {(['signin', 'signup'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                tab === t
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {t === 'signin' ? 'Logga in' : 'Skapa konto'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="E-post"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            label="Lösenord"
            type="password"
            autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {tab === 'signin' && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Håll mig inloggad</span>
            </label>
          )}

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full justify-center mt-1"
          >
            {tab === 'signin' ? 'Logga in' : 'Skapa konto'}
          </Button>
        </form>

        {/* Guest mode */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleGuestMode}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline underline-offset-2"
          >
            Använd utan att logga in
          </button>
        </div>

      </div>
    </div>
  );
}
