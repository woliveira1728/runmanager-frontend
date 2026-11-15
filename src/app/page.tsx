'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  QrCode,
  ShieldCheck,
  Timer,
  ArrowRight,
  Activity,
  Layers,
  Users,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { fetchPublishedEvents, Event as SportEvent } from '@/lib/api';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth-context';
import { RegistrationModal } from '@/components/registration-modal';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [selectedEventForModal, setSelectedEventForModal] =
    useState<SportEvent | null>(null);

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
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                RunManager
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Corridas & Eventos
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Meu Painel ({user?.name?.split(' ')[0]})</span>
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
                  <span>Criar Conta</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium">
            <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Plataforma Oficial de Corridas de Rua & Eventos Esportivos</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Sua próxima conquista começa na{' '}
            <span className="text-blue-600 dark:text-blue-400">largada certa</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Inscreva-se nas principais corridas de rua, receba seu número de peito
            e retire seu kit na arena em segundos com <strong>QR Code digital</strong>,
            acompanhando seus tempos e classificações oficiais em um só lugar.
          </p>

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
                  <span>Começar Agora</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-semibold text-sm shadow-sm transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Já Tenho Conta</span>
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
                <span>Calendário Oficial</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Corridas com Inscrições Abertas
              </h2>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Garanta seu lote promocional e número de peito imediato
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
                          A partir de R${' '}
                          {Number(
                            event.modalities[0].registrationBatches[0].price,
                          ).toFixed(2)}
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
                          {new Date(event.eventDate).toLocaleDateString(
                            'pt-BR',
                            {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            },
                          )}
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
                Novos eventos esportivos serão divulgados em breve. Se você é
                organizador, publique sua prova no painel.
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
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              Retirada de Kit sem Filas
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Apresente o QR Code do seu bilhete digital na arena para conferência
              instantânea e entrega do seu kit no tamanho exato.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              Lotes em Tempo Real
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Escolha sua distância favorita com disponibilidade atualizada em
              tempo real e receba seu número de peito no ato da inscrição.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              Segurança & Privacidade
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Seus dados de saúde e contatos de emergência são protegidos por
              criptografia avançada em total conformidade com a LGPD.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition">
            <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Timer className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">
              Resultados & Categorias
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Consulte seu tempo líquido, tempo bruto, colocação geral e posição
              na sua faixa etária oficial logo após cruzar a linha de chegada.
            </p>
          </div>
        </div>

        {/* Banner para Organizadores */}
        <div className="mt-14 p-8 rounded-3xl bg-slate-900 dark:bg-slate-900/90 border border-slate-800 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-400">
              Para Organizadores & Assessorias Esportivas
            </span>
            <h2 className="text-2xl font-bold tracking-tight">
              Organize sua próxima corrida de rua no RunManager
            </h2>
            <p className="text-sm text-slate-300">
              Cadastre múltiplos percursos, gerencie lotes de vagas, opere o
              check-in de kits na arena por câmera e publique a cronometragem
              oficial da sua prova em minutos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={isAuthenticated ? '/dashboard' : '/register'}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition shadow-sm"
            >
              <span>Publicar Meu Evento</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-sm border border-slate-700">
              <Users className="h-4 w-4 text-slate-400" /> Credenciamento Ágil
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <strong>RunManager</strong> • Plataforma de Gestão de Corridas de Rua e Eventos Esportivos
          </div>
          <div>
            Proteção de Dados em Conformidade com a LGPD (Lei nº 13.709/2018)
          </div>
          <div>© 2026 RunManager. Todos os direitos reservados.</div>
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
