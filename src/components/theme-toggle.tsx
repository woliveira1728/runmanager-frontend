'use client';

import { useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Laptop } from 'lucide-react';

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <div className="h-8 w-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50" />
    );
  }

  return (
    <div
      role="group"
      aria-label="Controle de Tema de Cor"
      className="inline-flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 text-xs shadow-inner"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        title="Forçar Tema Claro"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-800 text-amber-600 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Sun className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Claro</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        title="Forçar Tema Escuro"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Moon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Escuro</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('system')}
        title="Sincronizar com o Sistema Operacional"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Laptop className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Sistema</span>
      </button>
    </div>
  );
}
