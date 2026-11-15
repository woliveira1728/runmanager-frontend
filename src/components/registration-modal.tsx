'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  X,
  Trophy,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shirt,
  User as UserIcon,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Event as SportEvent,
  User,
  Registration,
  createRegistration,
} from '@/lib/api';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SportEvent | null;
  user: User | null;
  onSuccess?: (registration: Registration) => void;
}

export function RegistrationModal({
  isOpen,
  onClose,
  event,
  user,
  onSuccess,
}: RegistrationModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [prevEventId, setPrevEventId] = useState<string | null>(null);
  const [selectedModalityId, setSelectedModalityId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedRegistration, setConfirmedRegistration] =
    useState<Registration | null>(null);

  // Inicializa modalidade e lote ativo quando o evento muda (padrão React 19)
  if (event && event.id !== prevEventId) {
    setPrevEventId(event.id);
    const firstMod = event.modalities?.[0];
    setSelectedModalityId(firstMod?.id || '');
    setSelectedBatchId(firstMod?.registrationBatches?.[0]?.id || '');
    setErrorMsg(null);
    setConfirmedRegistration(null);
  }

  // Atualiza lote selecionado quando a modalidade é alterada
  const handleModalityChange = (modalityId: string) => {
    setSelectedModalityId(modalityId);
    setErrorMsg(null);
    const mod = event?.modalities.find((m) => m.id === modalityId);
    if (mod && mod.registrationBatches && mod.registrationBatches.length > 0) {
      setSelectedBatchId(mod.registrationBatches[0].id);
    } else {
      setSelectedBatchId('');
    }
  };

  const registrationMutation = useMutation({
    mutationFn: createRegistration,
    onSuccess: (data) => {
      setConfirmedRegistration(data);
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        setErrorMsg(
          (err.response?.data as { message?: string })?.message ||
            'Não foi possível concluir a inscrição.',
        );
      } else {
        setErrorMsg('Erro inesperado ao realizar inscrição.');
      }
    },
  });

  if (!isOpen || !event) return null;

  const currentModality = event.modalities.find(
    (m) => m.id === selectedModalityId,
  );
  const currentBatch = currentModality?.registrationBatches.find(
    (b) => b.id === selectedBatchId,
  );

  const isAthleteProfileComplete = !!user?.athleteProfile?.cpf;

  const handleConfirm = () => {
    if (!selectedBatchId) {
      setErrorMsg('Selecione uma modalidade e lote de inscrição.');
      return;
    }
    setErrorMsg(null);
    registrationMutation.mutate({ batchId: selectedBatchId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                Inscrição Oficial na Corrida
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reserva com controle de vagas e emissão de QR Code
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo com rolagem */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-100">
          {/* Tela de Sucesso */}
          {confirmedRegistration ? (
            <div className="py-8 text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                  Inscrição Confirmada!
                </span>
                <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white pt-1">
                  Parabéns, {user?.name?.split(' ')[0]}!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Sua vaga na prova <strong>{event.title}</strong> foi reservada
                  com sucesso.
                </p>
              </div>

              {/* Destaque do Número de Peito */}
              <div className="p-6 max-w-sm mx-auto rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20 text-center space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Seu Número Oficial de Peito
                </span>
                <div className="text-5xl font-black tracking-tight">
                  #{confirmedRegistration.bibNumber ?? '---'}
                </div>
                <div className="text-xs text-blue-100 pt-1 border-t border-blue-500/50">
                  Modalidade:{' '}
                  {confirmedRegistration.batch.modality.name}
                </div>
              </div>

              <div className="p-4 max-w-md mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5 text-left">
                <Sparkles className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                <span>
                  O QR Code para retirada do kit oficial de atleta e validação
                  na arena já está disponível no seu painel.
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push('/dashboard');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <span>Ver Comprovante & QR Code no Painel</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm cursor-pointer transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          ) : !user ? (
            /* Usuário não logado */
            <div className="py-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                  Autenticação Necessária
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Para se inscrever em provas esportivas e gerar seu QR Code de
                  arena, acesse sua conta ou crie seu cadastro de atleta.
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    router.push('/login');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition"
                >
                  Entrar na Conta
                </button>
                <button
                  onClick={() => {
                    onClose();
                    router.push('/register');
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition"
                >
                  Cadastrar-se como Atleta
                </button>
              </div>
            </div>
          ) : !isAthleteProfileComplete ? (
            /* Perfil incompleto */
            <div className="py-8 text-center space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-lg">
                  Perfil de Atleta Incompleto
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Você precisa cadastrar seu CPF, data de nascimento e tamanho de
                  camiseta no seu perfil antes de se inscrever.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    router.push('/dashboard');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold transition"
                >
                  Completar Meu Perfil no Painel
                </button>
              </div>
            </div>
          ) : (
            /* Fluxo de Seleção e Confirmação */
            <div className="space-y-6">
              {/* Resumo da Prova */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  {event.title}
                </h4>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    {new Date(event.eventDate).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" />
                    {event.location}
                  </span>
                </div>
              </div>

              {/* Seleção de Modalidade / Percurso */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  1. Escolha a Modalidade / Percurso
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {event.modalities.map((mod) => {
                    const isSelected = mod.id === selectedModalityId;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => handleModalityChange(mod.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {mod.name}
                          </span>
                          <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Idade mínima: {mod.minAge} anos
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lotes Disponíveis da Modalidade */}
              {currentModality && currentModality.registrationBatches.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    2. Lote de Inscrição Ativo
                  </label>
                  <div className="space-y-2">
                    {currentModality.registrationBatches.map((batch) => {
                      const isSelected = batch.id === selectedBatchId;
                      const remainingSlots = batch.maxSlots - batch.filledSlots;
                      const isSoldOut = remainingSlots <= 0;
                      const isExpired = new Date(batch.endDate) < new Date();

                      return (
                        <div
                          key={batch.id}
                          onClick={() => {
                            if (!isSoldOut && !isExpired) {
                              setSelectedBatchId(batch.id);
                            }
                          }}
                          className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-800'
                          } ${
                            isSoldOut || isExpired
                              ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900'
                              : 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {batch.batchNumber}º Lote Oficial
                              </span>
                              {isSoldOut ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                                  Esgotado
                                </span>
                              ) : isExpired ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">
                                  Encerrado
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                  {remainingSlots} vagas restantes
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Encerra em:{' '}
                              {new Date(batch.endDate).toLocaleDateString('pt-BR')}
                            </p>
                          </div>

                          <div className="text-right">
                            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
                              R$ {Number(batch.price).toFixed(2)}
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Taxa única
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed text-center text-xs text-slate-500">
                  Nenhum lote configurado para esta modalidade.
                </div>
              )}

              {/* Confirmação dos Dados do Atleta */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                    <span>Dados do Atleta Titular</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> LGPD Ativo
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      Nome:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {user.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      CPF:
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {user.athleteProfile?.cpf}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                      Camiseta Oficial:
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                      <Shirt className="h-3 w-3" />
                      Tamanho {user.athleteProfile?.shirtSize}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerta de Erro */}
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Rodapé / Botão de Confirmação */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 block">Total a Pagar:</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    R${' '}
                    {currentBatch
                      ? Number(currentBatch.price).toFixed(2)
                      : '0.00'}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm cursor-pointer transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={
                      !selectedBatchId ||
                      registrationMutation.isPending ||
                      (currentBatch &&
                        currentBatch.maxSlots - currentBatch.filledSlots <= 0)
                    }
                    className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    {registrationMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Confirmando...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar Inscrição</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
