'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  Trophy,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  HeartPulse,
  Shirt,
  Calendar,
  CreditCard,
  QrCode,
  Sparkles,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Carregando painel do atleta...</p>
        </div>
      </div>
    );
  }

  const profile = user.athleteProfile;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">RunManager</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Área do Atleta
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {user.role}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 space-y-8 w-full">
        {/* Banner de Boas-Vindas */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/15">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Painel do Participante • Autenticação Segura JWT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bem-vindo, {user.name}!
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              Aqui você gerencia seu perfil esportivo, visualiza suas inscrições em corridas de rua e acompanha seus tempos oficiais.
            </p>
          </div>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card do Perfil do Atleta */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                  <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span>Dados Cadastrais</span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verificado
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">Nome Completo</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">E-mail Cadastrado</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{user.email}</span>
                </div>

                {profile && (
                  <>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5" /> CPF
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {profile.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center gap-1">
                          <Shirt className="h-3.5 w-3.5" /> Camiseta
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Tamanho {profile.shirtSize}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> Nascimento
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {new Date(profile.birthDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs block">Gênero</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {profile.gender === 'M' ? 'Masculino' : profile.gender === 'F' ? 'Feminino' : 'Outro'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bloco de Saúde & LGPD */}
              {profile && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <HeartPulse className="h-4 w-4" /> Dados de Emergência
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1" title="Criptografado com AES-256 no banco">
                      <Lock className="h-3 w-3" /> AES-256
                    </span>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Contato:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{profile.emergencyContact}</span>
                    </div>

                    {profile.medicalNotes && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Notas Médicas:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{profile.medicalNotes}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Consentimento LGPD ativo</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Área de Inscrições e Corridas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span>Minhas Inscrições & Check-in na Arena</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Acompanhe seus eventos confirmados e apresente seu QR Code na tenda de entrega de kit
                  </p>
                </div>
              </div>

              {/* Estado Inicial de Inscrições */}
              <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Trophy className="h-7 w-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                    Nenhuma inscrição ativa no momento
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    O módulo de cadastro de corridas e controle de lotes está em andamento. Em breve você poderá se inscrever nas provas oficiais.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href="http://localhost:3001/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <span>Explorar Swagger da API</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
        RunManager • Plataforma de Gestão de Eventos Esportivos • Projeto Tecnológico ADS ULBRA
      </footer>
    </div>
  );
}
