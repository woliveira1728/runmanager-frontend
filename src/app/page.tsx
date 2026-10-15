'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { 
  Trophy, 
  QrCode, 
  ShieldCheck, 
  Timer, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ArrowRight,
  ExternalLink,
  Activity,
  Layers,
  Users,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Calendar,
  MapPin,
  Sparkles
} from 'lucide-react';
import { checkApiHealth, fetchPublishedEvents, Event as SportEvent } from '@/lib/api';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { RegistrationModal } from '@/components/registration-modal';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [selectedEventForModal, setSelectedEventForModal] = useState<SportEvent | null>(null);

  // Verificação de saúde da API
  const { 
    data: apiStatus, 
    isLoading: loading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['api-health'],
    queryFn: checkApiHealth,
    retry: 1,
  });

  // Vitrine de eventos publicados
  const { data: publishedEvents, isLoading: loadingEvents } = useQuery({
    queryKey: ['published-events'],
    queryFn: () => fetchPublishedEvents(),
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">RunManager</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                ULBRA ADS • AP2
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Swagger
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Painel ({user?.name?.split(' ')[0]})</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Cadastrar</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Engenharia de Software • Projeto Tecnológico ADS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Gestão Inteligente de <span className="text-blue-600 dark:text-blue-400">Corridas de Rua</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Plataforma fullstack desenvolvida para eliminar gargalos de credenciamento na arena
            através de leitura em tempo real de <strong>QR Code</strong>, reserva transacional de vagas e apuração de resultados com conformidade à <strong>LGPD</strong>.
          </p>

          {/* Status Badge Backend Integration */}
          <div className="pt-2 flex justify-center">
            <div className="inline-flex flex-wrap items-center gap-3 p-3 sm:px-5 sm:py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Status da API:
              </span>
              {loading ? (
                <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Verificando backend...
                </span>
              ) : apiStatus ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Conectado (v{apiStatus.version})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium" title={error?.message || 'Erro de conexão'}>
                  <XCircle className="h-4 w-4" /> Desconectado (Porta 3001)
                </span>
              )}

              <button
                onClick={() => refetch()}
                title="Atualizar conexão com a API (TanStack Query)"
                className="ml-1 p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Acessar Meu Painel</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 active:scale-[0.99] transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Cadastrar-se como Atleta</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm shadow-sm transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Acessar Minha Conta</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Vitrine de Corridas de Rua */}
        <div className="mt-16 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Vitrine Oficial de Provas</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Corridas com Inscrições Abertas
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Vagas limitadas com reserva transacional
            </span>
          </div>

          {loadingEvents ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Buscando corridas de rua disponíveis...
            </div>
          ) : publishedEvents && publishedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                        Inscrições Abertas
                      </span>
                      {event.modalities?.[0]?.registrationBatches?.[0] && (
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          A partir de R$ {Number(event.modalities[0].registrationBatches[0].price).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {event.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                        <span>
                          {new Date(event.eventDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>

                    {/* Modalidades */}
                    {event.modalities && event.modalities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {event.modalities.map((mod) => (
                          <span
                            key={mod.id}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                          >
                            {mod.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEventForModal(event)}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <span>Inscrever-se na Prova</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 px-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                Nenhuma corrida com inscrições abertas no momento
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Organizadores de eventos esportivos podem cadastrar suas provas através do painel administrativo.
              </p>
              {isAuthenticated && user?.role === 'ORGANIZER' && (
                <div className="pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
                  >
                    <span>Cadastrar Minha Prova</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Check-in na Arena</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Validação ágil de presença e liberação de kits via leitura de credencial com QR Code na câmera do organizador.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Controle de Vagas</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Lotes com trava transacional atômica no PostgreSQL, prevenindo inscrições duplicadas e sobrecarga de vagas.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Conformidade LGPD</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Proteção de dados médicos e contatos de emergência com criptografia em repouso e registro expresso de consentimento.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Timer className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Tempos & Rankings</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Importação de cronometragem oficial com cálculo automático de posições gerais e segmentadas por faixa etária.
            </p>
          </div>
        </div>

        {/* Modules Section */}
        <div className="mt-14 p-8 rounded-3xl bg-slate-900 dark:bg-slate-900/90 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              Arquitetura Fullstack • Next.js + NestJS
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Módulos e Atores do Sistema RunManager
            </h2>
            <p className="text-sm text-slate-300">
              Desenvolvido com controle de acesso baseado em papéis (RBAC): Atleta, Organizador de Provas e Administrador Geral.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="http://localhost:3001/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition shadow-sm"
            >
              Swagger API <ArrowRight className="h-4 w-4" />
            </a>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm border border-slate-700">
              <Users className="h-4 w-4 text-slate-400" /> Multi-Tenant RBAC
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong>RunManager</strong> • Projeto Tecnológico em Desenvolvimento de Sistemas
          </div>
          <div>
            Acadêmico: <strong>Wilson Dias de Oliveira</strong> (woliveira1728@rede.ulbra.br)
          </div>
          <div>
            Universidade Luterana do Brasil — <strong>ULBRA EAD</strong>
          </div>
        </div>
      </footer>

      {/* Modal de Inscrição Oficial na Prova */}
      <RegistrationModal
        isOpen={!!selectedEventForModal}
        onClose={() => setSelectedEventForModal(null)}
        event={selectedEventForModal}
        user={user}
      />
    </div>
  );
}
