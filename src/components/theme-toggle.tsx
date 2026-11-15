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
      <div className="h-8 w-8 sm:w-28 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 shrink-0" />
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <>
      {/* Botão compacto de alternância para telas mobile (< sm) */}
      <button
        type="button"
        onClick={cycleTheme}
        title="Alternar Tema (Claro / Escuro / Sistema)"
        aria-label="Alternar Tema de Cor"
        className="sm:hidden inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 shadow-inner shrink-0 cursor-pointer"
      >
        {theme === 'light' && <Sun className="h-4 w-4 text-amber-600" />}
        {theme === 'dark' && (
          <Moon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        )}
        {theme !== 'light' && theme !== 'dark' && (
          <Laptop className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        )}
      </button>

      {/* Controle segmentado completo para telas maiores (sm+) */}
      <div
        role="group"
        aria-label="Controle de Tema de Cor"
        className="hidden sm:inline-flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 text-xs shadow-inner shrink-0"
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
        <span className="hidden md:inline">Claro</span>
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
        <span className="hidden md:inline">Escuro</span>
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
        <span className="hidden md:inline">Sistema</span>
      </button>
    </div>
    </>
  );
}
