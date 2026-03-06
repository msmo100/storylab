import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

type Tab = 'signin' | 'signup';

export function AuthView() {
  const [tab, setTab] = useState<Tab>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp, error, pendingConfirmation } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tab === 'signin') {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
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
              onClick={() => setTab(t)}
              className={[
                'flex-1 py-2 text-sm font-medium rounded-md transition-colors',
                tab === t
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
              ].join(' ')}
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
      </div>
    </div>
  );
}
