'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Lock,
  Layers,
  PlusCircle,
  Building2,
  Trash2,
  Send,
  MapPin,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Users,
  Check,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { QRCodeSVG } from 'qrcode.react';
import {
  fetchMyEvents,
  createEvent,
  publishEvent,
  deleteEvent,
  Event as SportEvent,
  Registration,
  fetchMyRegistrations,
  checkInRegistration,
} from '@/lib/api';
import { EventRegistrationsModal } from '@/components/event-registrations-modal';

/**
 * Formata data de nascimento de forma segura ignorando conversões indevidas de fuso horário.
 */
function formatBirthDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return '';
  const str = typeof dateStr === 'string' ? dateStr : dateStr.toISOString();
  const datePart = str.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return new Date(dateStr).toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora do evento para exibição amigável.
 */
function formatEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Estados do formulário de criação de eventos
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [modalityName, setModalityName] = useState('5km Geral');
  const [minAge, setMinAge] = useState(14);
  const [batchPrice, setBatchPrice] = useState(80);
  const [batchSlots, setBatchSlots] = useState(200);
  const [batchEndDate, setBatchEndDate] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const isAthlete = user?.role === 'ATHLETE';
  const isOrganizer = user?.role === 'ORGANIZER';
  const isAdmin = user?.role === 'ADMIN';

  // Estados de check-in na arena (Organizador / Admin)
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [checkInResult, setCheckInResult] = useState<Registration | null>(null);
  const [checkInError, setCheckInError] = useState<string | null>(null);
  const [selectedEventForAttendees, setSelectedEventForAttendees] = useState<SportEvent | null>(null);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  // Busca inscrições do atleta logado via TanStack Query
  const { data: myRegistrations, isLoading: loadingRegistrations } = useQuery<Registration[]>({
    queryKey: ['my-registrations'],
    queryFn: fetchMyRegistrations,
    enabled: !!user,
  });

  // Mutação para check-in por QR Code na arena
  const checkInMutation = useMutation({
    mutationFn: checkInRegistration,
    onSuccess: (data) => {
      setCheckInResult(data);
      setCheckInError(null);
      setQrCodeInput('');
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['event-registrations'] });
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setCheckInError(
          (err.response?.data as { message?: string })?.message ||
            'Não foi possível realizar o check-in.',
        );
      } else {
        setCheckInError('Erro ao validar check-in.');
      }
      setCheckInResult(null);
    },
  });

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;
    setCheckInError(null);
    checkInMutation.mutate({ qrCodeHash: qrCodeInput.trim() });
  };

  // Busca eventos do organizador via TanStack Query
  const { data: myEvents, isLoading: loadingEvents } = useQuery<SportEvent[]>({
    queryKey: ['my-events'],
    queryFn: fetchMyEvents,
    enabled: !!user && (isOrganizer || isAdmin),
  });

  // Mutação para criar evento
  const createMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
      setShowCreateModal(false);
      resetForm();
      setActionSuccess('Corrida de rua cadastrada com sucesso!');
      setActionError(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setActionError(
          (err.response?.data as { message?: string })?.message ||
            'Falha ao cadastrar evento esportivo.',
        );
      } else {
        setActionError('Falha ao cadastrar evento esportivo.');
      }
    },
  });

  // Mutação para publicar evento
  const publishMutation = useMutation({
    mutationFn: publishEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
      setActionSuccess('Evento publicado! As inscrições estão abertas.');
      setActionError(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setActionError(
          (err.response?.data as { message?: string })?.message ||
            'Falha ao publicar evento.',
        );
      } else {
        setActionError('Falha ao publicar evento.');
      }
    },
  });

  // Mutação para excluir evento
  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
      setActionSuccess('Evento removido com sucesso.');
      setActionError(null);
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setActionError(
          (err.response?.data as { message?: string })?.message ||
            'Não foi possível excluir o evento.',
        );
      } else {
        setActionError('Não foi possível excluir o evento.');
      }
    },
  });

  const resetForm = () => {
    setEventTitle('');
    setEventDescription('');
    setEventDate('');
    setEventLocation('');
    setModalityName('5km Geral');
    setMinAge(14);
    setBatchPrice(80);
    setBatchSlots(200);
    setBatchEndDate('');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!eventDate || !batchEndDate) {
      setActionError('Por favor preencha as datas do evento e do lote.');
      return;
    }

    const evDateObj = new Date(eventDate);
    const batchDateObj = new Date(batchEndDate);

    if (evDateObj <= new Date()) {
      setActionError('A data da prova deve estar no futuro.');
      return;
    }

    if (batchDateObj > evDateObj) {
      setActionError('A virada do lote não pode ser posterior à data da largada.');
      return;
    }

    createMutation.mutate({
      title: eventTitle.trim(),
      description: eventDescription.trim(),
      eventDate: evDateObj.toISOString(),
      location: eventLocation.trim(),
      modalities: [
        {
          name: modalityName.trim(),
          minAge: Number(minAge),
          batches: [
            {
              batchNumber: 1,
              price: Number(batchPrice),
              maxSlots: Number(batchSlots),
              endDate: batchDateObj.toISOString(),
            },
          ],
        },
      ],
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Carregando painel do usuário...</p>
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
                {isAthlete && 'Área do Atleta'}
                {isOrganizer && 'Área do Organizador'}
                {isAdmin && 'Área do Administrador'}
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
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
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
        {/* Notificações de Ação */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-600 hover:text-rose-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Banner de Boas-Vindas Dinâmico */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/15">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {isAthlete && 'Painel do Participante • Autenticação Segura JWT'}
                {isOrganizer && 'Painel de Gestão de Provas • Organizador Oficial'}
                {isAdmin && 'Painel Geral do Sistema • Gestão Global'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bem-vindo, {user.name}!
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              {isAthlete &&
                'Aqui você gerencia seu perfil esportivo, visualiza suas inscrições em corridas de rua e acompanha seus tempos oficiais.'}
              {isOrganizer &&
                'Cadastre seus eventos esportivos, configure modalidades e lotes com controle de vagas e gerencie o credenciamento na arena.'}
              {isAdmin &&
                'Painel administrativo geral para monitoramento de eventos, usuários e governança da plataforma.'}
            </p>
          </div>
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Dados Cadastrais / Perfil */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                  {isOrganizer ? (
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                  <span>
                    {isOrganizer ? 'Dados do Organizador' : 'Dados Cadastrais'}
                  </span>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Verificado
                </span>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">
                    Nome Completo
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {user.name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">
                    E-mail Cadastrado
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {user.email}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 text-xs block">
                    Papel no Sistema (RBAC)
                  </span>
                  <span className="inline-block mt-1 font-semibold text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {user.role}
                  </span>
                </div>

                {profile && isAthlete && (
                  <>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs block flex items-center gap-1">
                          <CreditCard className="h-3.5 w-3.5" /> CPF
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {profile.cpf.replace(
                            /(\d{3})(\d{3})(\d{3})(\d{2})/,
                            '$1.$2.$3-$4',
                          )}
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
                          {formatBirthDate(profile.birthDate)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-400 text-xs block">
                          Gênero
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {profile.gender === 'M'
                            ? 'Masculino'
                            : profile.gender === 'F'
                              ? 'Feminino'
                              : 'Outro'}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bloco de Saúde & LGPD */}
              {profile && isAthlete && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                      <HeartPulse className="h-4 w-4" /> Dados de Emergência
                    </span>
                    <span
                      className="text-[10px] text-slate-500 flex items-center gap-1"
                      title="Criptografado com AES-256 no banco"
                    >
                      <Lock className="h-3 w-3" /> AES-256
                    </span>
                  </div>

                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">
                        Contato:
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {profile.emergencyContact}
                      </span>
                    </div>

                    {profile.medicalNotes && (
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          Notas Médicas:
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {profile.medicalNotes}
                        </span>
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

          {/* Coluna Direita: Operações */}
          <div className="lg:col-span-2 space-y-6">
            {isAthlete ? (
              /* Visão do Atleta */
              <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Minhas Inscrições & Check-in na Arena</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Acompanhe suas corridas confirmadas e apresente seu QR Code na entrega de kits
                    </p>
                  </div>
                </div>

                {loadingRegistrations ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    Carregando suas inscrições...
                  </div>
                ) : myRegistrations && myRegistrations.length > 0 ? (
                  <div className="space-y-6">
                    {myRegistrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition space-y-5"
                      >
                        {/* Top Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                                {reg.batch.modality.event.title}
                              </h3>
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {reg.batch.modality.name}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                {formatEventDate(reg.batch.modality.event.eventDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                                {reg.batch.modality.event.location}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            {reg.checkedIn ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <CheckCircle2 className="h-4 w-4" /> Kit Retirado na Arena
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                <QrCode className="h-4 w-4" /> Aguardando Check-in
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Body: Bib Number & QR Code */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                          {/* Número de Peito */}
                          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white text-center space-y-1 shadow-md shadow-blue-500/15">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 block">
                              Número de Peito
                            </span>
                            <div className="text-5xl font-black tracking-tight">
                              #{reg.bibNumber ?? '---'}
                            </div>
                            <div className="text-xs text-blue-100 pt-1 flex items-center justify-center gap-1">
                              <Shirt className="h-3.5 w-3.5" />
                              <span>Camiseta {profile?.shirtSize || 'M'}</span>
                            </div>
                          </div>

                          {/* QR Code de Validação */}
                          <div className="flex flex-col items-center justify-center space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-center">
                            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 inline-block">
                              <QRCodeSVG
                                value={reg.qrCodeHash}
                                size={120}
                                level="M"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyHash(reg.qrCodeHash, reg.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-mono transition cursor-pointer"
                              title="Clique para copiar o código"
                            >
                              <span>{reg.qrCodeHash}</span>
                              {copiedHashId === reg.id ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : null}
                            </button>
                          </div>

                          {/* Instruções de Check-in */}
                          <div className="space-y-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 space-y-1.5">
                              <div className="font-bold flex items-center gap-1.5">
                                <ShieldCheck className="h-4 w-4 text-blue-600" />
                                <span>Check-in na Arena</span>
                              </div>
                              <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                                Apresente este QR Code no smartphone ou impresso no balcão da arena para retirada do seu kit de atleta e validação do chip.
                              </p>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                              <span>Inscrição confirmada em:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {new Date(reg.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                      <Trophy className="h-7 w-7" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                        Nenhuma inscrição ativa no momento
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        Explore as corridas oficiais abertas na página inicial e inscreva-se para garantir sua vaga e número de peito.
                      </p>
                    </div>

                    <div className="pt-2">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        <span>Ver Provas Disponíveis na Vitrine</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Visão do Organizador / Administrador */
              <div className="space-y-6">
                {/* Posto de Credenciamento na Arena por QR Code */}
                <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Posto de Credenciamento na Arena (Check-in por QR Code)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Digite ou utilize um leitor de código de barras para validar o QR Code do atleta e liberar o kit oficial
                    </p>
                  </div>

                  <form onSubmit={handleCheckInSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <QrCode className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={qrCodeInput}
                        onChange={(e) => setQrCodeInput(e.target.value)}
                        placeholder="Cole ou digite o hash (ex: RM-A1B2C3D4...)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={checkInMutation.isPending || !qrCodeInput.trim()}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {checkInMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Validando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Validar e Liberar Kit</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Feedback de Erro */}
                  {checkInError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{checkInError}</span>
                    </div>
                  )}

                  {/* Card de Liberação do Kit com Sucesso */}
                  {checkInResult && (
                    <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                          <CheckCircle2 className="h-4 w-4" /> Check-in Realizado com Sucesso!
                        </span>
                        <button
                          onClick={() => setCheckInResult(null)}
                          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          Limpar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Atleta:</span>
                          <span className="font-bold text-slate-900 dark:text-white text-sm block">
                            {checkInResult.athlete?.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            CPF: {checkInResult.athlete?.athleteProfile?.cpf || '---'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[11px]">Número de Peito:</span>
                          <span className="font-black text-2xl text-blue-600 dark:text-blue-400">
                            #{checkInResult.bibNumber}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[11px]">Camiseta a Entregar:</span>
                          <span className="inline-block mt-0.5 px-3 py-1 rounded-xl bg-blue-600 text-white font-extrabold text-sm shadow-sm">
                            TAMANHO {checkInResult.athlete?.athleteProfile?.shirtSize || 'M'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[11px]">Contato de Emergência:</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {checkInResult.athlete?.athleteProfile?.emergencyContact || 'Cadastrado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gestão de Eventos Esportivos */}
                <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>Gestão de Eventos Esportivos</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      Cadastre provas, configure percursos, gerencie lotes e libere credenciamento por QR Code
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCreateModal(!showCreateModal)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{showCreateModal ? 'Fechar Formulário' : 'Cadastrar Nova Prova'}</span>
                  </button>
                </div>

                {/* Formulário de Criação de Evento */}
                {showCreateModal && (
                  <form
                    onSubmit={handleCreateEvent}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-5"
                  >
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <PlusCircle className="h-4 w-4 text-blue-600" />
                      <span>Novo Evento Esportivo</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Nome Oficial da Prova *
                        </label>
                        <input
                          type="text"
                          required
                          value={eventTitle}
                          onChange={(e) => setEventTitle(e.target.value)}
                          placeholder="Ex: 1ª Corrida das Águas de Manaus 2026"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Data e Horário da Largada *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Local da Arena / Largada *
                        </label>
                        <input
                          type="text"
                          required
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          placeholder="Ex: Orla de Ponta Negra, Manaus - AM"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Regulamento e Informações Técnicas *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          placeholder="Instruções sobre hidratação, percurso, premiação e regras da prova..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Bloco de Modalidade e Lote 1 */}
                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        Configuração da Modalidade & 1º Lote de Vagas
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-xs text-slate-500">Percurso / Modalidade *</label>
                          <input
                            type="text"
                            required
                            value={modalityName}
                            onChange={(e) => setModalityName(e.target.value)}
                            placeholder="Ex: 5km Corrida"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Idade Mínima</label>
                          <input
                            type="number"
                            min={0}
                            value={minAge}
                            onChange={(e) => setMinAge(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-500">Preço (R$) *</label>
                          <input
                            type="number"
                            step="0.01"
                            min={0}
                            required
                            value={batchPrice}
                            onChange={(e) => setBatchPrice(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-slate-500">Limite de Vagas do Lote *</label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={batchSlots}
                            onChange={(e) => setBatchSlots(Number(e.target.value))}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs text-slate-500">Data Limite do Lote *</label>
                          <input
                            type="datetime-local"
                            required
                            value={batchEndDate}
                            onChange={(e) => setBatchEndDate(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md disabled:opacity-50"
                      >
                        {createMutation.isPending ? 'Salvando...' : 'Salvar Evento'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de Eventos Cadastrados */}
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                    <span>Minhas Provas Cadastradas</span>
                    <span className="text-xs text-slate-500 font-normal">
                      {myEvents?.length || 0} evento(s)
                    </span>
                  </h3>

                  {loadingEvents ? (
                    <div className="p-8 text-center text-xs text-slate-500">
                      Carregando eventos...
                    </div>
                  ) : myEvents && myEvents.length > 0 ? (
                    <div className="space-y-3">
                      {myEvents.map((event) => (
                        <div
                          key={event.id}
                          className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                                  {event.title}
                                </h4>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                    event.status === 'PUBLISHED'
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                  }`}
                                >
                                  {event.status === 'PUBLISHED' ? 'Publicado' : 'Rascunho'}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                  {formatEventDate(event.eventDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-blue-600" />
                                  {event.location}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => setSelectedEventForAttendees(event)}
                                className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                                title="Ver lista de inscritos e check-in"
                              >
                                <Users className="h-3.5 w-3.5" />
                                <span>Inscritos</span>
                              </button>

                              {event.status === 'DRAFT' && (
                                <button
                                  onClick={() => publishMutation.mutate(event.id)}
                                  disabled={publishMutation.isPending}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                                  title="Publicar e abrir inscrições"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  <span>Publicar</span>
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  if (confirm(`Excluir o evento "${event.title}"?`)) {
                                    deleteMutation.mutate(event.id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title="Excluir evento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Modalidades e Vagas */}
                          {event.modalities && event.modalities.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                              {event.modalities.map((mod) => (
                                <div
                                  key={mod.id}
                                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5"
                                >
                                  <Layers className="h-3.5 w-3.5 text-blue-500" />
                                  <span className="font-semibold">{mod.name}</span>
                                  {mod.registrationBatches?.[0] && (
                                    <span className="text-slate-500 dark:text-slate-400">
                                      • R$ {Number(mod.registrationBatches[0].price).toFixed(2)} ({mod.registrationBatches[0].maxSlots} vagas)
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                      <p className="text-xs text-slate-500">
                        Você ainda não cadastrou nenhuma corrida de rua.
                      </p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        + Cadastrar sua primeira prova
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>

    {/* Modal de Lista de Inscritos para Organizadores */}
    <EventRegistrationsModal
      isOpen={!!selectedEventForAttendees}
      onClose={() => setSelectedEventForAttendees(null)}
      event={selectedEventForAttendees}
    />

    {/* Footer */}
    <footer className="border-t border-slate-200 dark:border-slate-800 py-6 bg-white dark:bg-slate-900 text-center text-xs text-slate-500">
      RunManager • Plataforma de Gestão de Eventos Esportivos • Projeto Tecnológico ADS ULBRA
    </footer>
  </div>
);
}
