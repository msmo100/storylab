import { useToastStore } from '../../store/toastStore';
import { cn } from '../../utils/cn';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          aria-live="assertive"
          onClick={() => removeToast(t.id)}
          className={cn(
            'pointer-events-auto flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium shadow-lg border cursor-pointer select-none',
            t.type === 'success' &&
              'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
            t.type === 'error' &&
              'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
            t.type === 'info' &&
              'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
          )}
        >
          <span className="text-base leading-none" aria-hidden="true">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
