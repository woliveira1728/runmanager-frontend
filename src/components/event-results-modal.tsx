'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Trophy,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Keyboard,
  Loader2,
  Sparkles,
  Medal,
} from 'lucide-react';
import {
  Event as SportEvent,
  EventResultItem,
  Registration,
  fetchEventResults,
  fetchEventRegistrations,
  importEventResults,
  recordSingleResult,
} from '@/lib/api';

interface EventResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SportEvent | null;
}

interface PendingException7A {
  message: string;
  invalidBibs: number[];
  validCount: number;
}

export function EventResultsModal({
  isOpen,
  onClose,
  event,
}: EventResultsModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('csv');

  // Estados de Importação CSV (UC07)
  const [csvContent, setCsvContent] = useState(
    'bib_number,gross_time,net_time\n101,00:24:35,00:24:12',
  );
  const [pending7A, setPending7A] = useState<PendingException7A | null>(null);

  // Estados de Digitação Manual (UC07)
  const [manualBib, setManualBib] = useState<string>('101');
  const [manualGrossTime, setManualGrossTime] = useState<string>('00:25:10');
  const [manualNetTime, setManualNetTime] = useState<string>('00:24:50');

  // Feedback visual
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: results, isLoading: loadingResults } = useQuery<
    EventResultItem[]
  >({
    queryKey: ['event-results', event?.id],
    queryFn: () =>
      event ? fetchEventResults(event.id) : Promise.resolve([]),
    enabled: isOpen && !!event,
  });

  const { data: registrations } = useQuery<Registration[]>({
    queryKey: ['event-registrations', event?.id],
    queryFn: () =>
      event ? fetchEventRegistrations(event.id) : Promise.resolve([]),
    enabled: isOpen && !!event,
  });

  const importMutation = useMutation({
    mutationFn: (ignoreInvalidBibs: boolean) =>
      importEventResults(event!.id, {
        csvContent,
        ignoreInvalidBibs,
      }),
    onSuccess: (data) => {
      setPending7A(null);
      setErrorMsg(null);
      const skippedText =
        data.skippedInvalidBibs.length > 0
          ? ` (Ignorados peitos inexistentes: ${data.skippedInvalidBibs.map((b) => `#${b}`).join(', ')})`
          : '';
      setSuccessMsg(
        `${data.importedCount} resultado(s) oficial(is) importado(s) e classificações recalculadas com sucesso!${skippedText}`,
      );
      queryClient.invalidateQueries({ queryKey: ['event-results', event?.id] });
      queryClient.invalidateQueries({
        queryKey: ['event-registrations', event?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    },
    onError: (err: unknown) => {
      setSuccessMsg(null);
      if (axios.isAxiosError(err)) {
        const respData = err.response?.data as {
          message?: string | string[];
          code?: string;
          invalidBibs?: number[];
          validCount?: number;
        };

        if (
          respData?.code === 'EXCEPTION_7A_INVALID_BIBS' &&
          respData.invalidBibs
        ) {
          const rawMsg = Array.isArray(respData.message)
            ? respData.message.join(' ')
            : respData.message || 'Números de peito não encontrados no evento.';
          setPending7A({
            message: rawMsg.replace(/^Exceção\s*\d+[A-Z]?:\s*/i, ''),
            invalidBibs: respData.invalidBibs,
            validCount: respData.validCount ?? 0,
          });
          setErrorMsg(null);
          return;
        }

        const msg = Array.isArray(respData?.message)
          ? respData.message.join(' ')
          : respData?.message || 'Falha ao importar tempos oficiais.';
        setErrorMsg(msg.replace(/^Exceção\s*\d+[A-Z]?:\s*/i, ''));
      } else {
        setErrorMsg('Erro inesperado ao importar resultados.');
      }
    },
  });

  const manualMutation = useMutation({
    mutationFn: () =>
      recordSingleResult(event!.id, {
        bibNumber: Number(manualBib),
        grossTime: manualGrossTime.trim(),
        netTime: manualNetTime.trim(),
      }),
    onSuccess: (saved) => {
      setErrorMsg(null);
      setPending7A(null);
      setSuccessMsg(
        `Tempo oficial do peito #${saved.registration.bibNumber} (${saved.netTime}) registrado com sucesso!`,
      );
      queryClient.invalidateQueries({ queryKey: ['event-results', event?.id] });
      queryClient.invalidateQueries({
        queryKey: ['event-registrations', event?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    },
    onError: (err: unknown) => {
      setSuccessMsg(null);
      if (axios.isAxiosError(err)) {
        const respData = err.response?.data as {
          message?: string | string[];
        };
        const msg = Array.isArray(respData?.message)
          ? respData.message.join(' ')
          : respData?.message || 'Falha ao registrar tempo individual.';
        setErrorMsg(msg.replace(/^Exceção\s*\d+[A-Z]?:\s*/i, ''));
      } else {
        setErrorMsg('Erro inesperado ao salvar tempo.');
      }
    },
  });

  if (!isOpen || !event) return null;

  const confirmedRegistrations = (registrations || []).filter(
    (r) => r.paymentStatus === 'CONFIRMED' && r.bibNumber !== null,
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result;
      if (typeof content === 'string') {
        setCsvContent(content);
        setPending7A(null);
        setErrorMsg(null);
      }
    };
    reader.readAsText(file);
  };

  const handleFillSampleFromEvent = () => {
    setPending7A(null);
    setErrorMsg(null);
    if (confirmedRegistrations.length > 0) {
      const rows = confirmedRegistrations.map((reg, index) => {
        const min = String(22 + index * 2).padStart(2, '0');
        const grossSec = '35';
        const netSec = '12';
        return `${reg.bibNumber},00:${min}:${grossSec},00:${min}:${netSec}`;
      });
      setCsvContent(['bib_number,gross_time,net_time', ...rows].join('\n'));
    } else {
      setCsvContent('bib_number,gross_time,net_time\n101,00:24:35,00:24:12');
    }
  };

  const handleCSVSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setPending7A(null);
    importMutation.mutate(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    manualMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                Resultados e Cronometragem Oficial
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {event.title} • Apuração por Tempo Líquido e Faixa Etária
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

        {/* Corpo com rolagem */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Seletor de Abas */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 w-fit">
            <button
              type="button"
              onClick={() => {
                setActiveTab('csv');
                setErrorMsg(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'csv'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Importar Planilha CSV em Lote</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('manual');
                setErrorMsg(null);
                setPending7A(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Keyboard className="h-4 w-4" />
              <span>Digitação Individual por Nº de Peito</span>
            </button>
          </div>

          {/* Alertas de Sucesso / Erro (Exceção 7B) / Confirmação (Exceção 7A) */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessMsg(null)}
                className="text-emerald-600 hover:text-emerald-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-rose-600 hover:text-rose-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {pending7A && (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="font-bold text-amber-900 dark:text-amber-200">
                    Números de Peito Não Identificados no Arquivo
                  </p>
                  <p className="text-amber-800 dark:text-amber-300">
                    {pending7A.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPending7A(null)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Revisar Arquivo
                </button>
                {pending7A.validCount > 0 && (
                  <button
                    type="button"
                    disabled={importMutation.isPending}
                    onClick={() => importMutation.mutate(true)}
                    className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    {importMutation.isPending
                      ? 'Importando...'
                      : `Confirmar e Importar ${pending7A.validCount} Registro(s) Válido(s)`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Conteúdo da Aba Ativa */}
          {activeTab === 'csv' ? (
            <form
              onSubmit={handleCSVSubmit}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Arquivo CSV de Cronometragem Eletrônica
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Formato padrão:{' '}
                    <code className="font-mono bg-slate-200/70 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                      bib_number,gross_time,net_time
                    </code>{' '}
                    (tempos em <code className="font-mono">HH:MM:SS</code>)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillSampleFromEvent}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Preencher com Inscritos da Prova</span>
                  </button>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer">
                    <Upload className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Carregar .CSV</span>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <textarea
                rows={5}
                required
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value);
                  setPending7A(null);
                }}
                placeholder="bib_number,gross_time,net_time&#10;101,00:24:35,00:24:12"
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                   Inscritos confirmados aptos na prova:{' '}
                  <strong>{confirmedRegistrations.length}</strong>{' '}
                  {confirmedRegistrations.length > 0 &&
                    `(${confirmedRegistrations.map((r) => `#${r.bibNumber}`).join(', ')})`}
                </span>

                <button
                  type="submit"
                  disabled={importMutation.isPending || !csvContent.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {importMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processando CSV...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      <span>Validar e Importar Tempos</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleManualSubmit}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4"
            >
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Lançamento Individual de Tempo por Número de Peito
                </h4>
                <p className="text-[11px] text-slate-500">
                  Ideal para ajustes pontuais de cronometragem ou provas de menor porte
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Número de Peito (#) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={manualBib}
                    onChange={(e) => setManualBib(e.target.value)}
                    placeholder="Ex: 101"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Tempo Bruto (HH:MM:SS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualGrossTime}
                    onChange={(e) => setManualGrossTime(e.target.value)}
                    placeholder="00:25:10"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Tempo Líquido (HH:MM:SS) *
                  </label>
                  <input
                    type="text"
                    required
                    value={manualNetTime}
                    onChange={(e) => setManualNetTime(e.target.value)}
                    placeholder="00:24:50"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Atalhos de inscritos:</span>
                  {confirmedRegistrations.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setManualBib(String(r.bibNumber))}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 cursor-pointer"
                    >
                      #{r.bibNumber} ({r.athlete?.name.split(' ')[0]})
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={manualMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {manualMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>Registrar Tempo Oficial</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tabela de Classificação Oficial Apurada */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Medal className="h-4 w-4 text-amber-500" />
                <span>
                  Classificação Oficial Apurada ({results?.length || 0}{' '}
                  resultado(s))
                </span>
              </h4>
              <span className="text-[11px] text-slate-500">
                Critério de desempate: menor tempo bruto
              </span>
            </div>

            {loadingResults ? (
              <div className="py-10 text-center text-xs text-slate-500">
                Carregando resultados apurados...
              </div>
            ) : results && results.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Pos. Geral</th>
                      <th className="px-4 py-3"># Peito</th>
                      <th className="px-4 py-3">Atleta</th>
                      <th className="px-4 py-3">Modalidade</th>
                      <th className="px-4 py-3">Pos. Faixa CBAt</th>
                      <th className="px-4 py-3">Tempo Líquido</th>
                      <th className="px-4 py-3">Tempo Bruto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {results.map((res) => (
                      <tr
                        key={res.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-extrabold text-indigo-600 dark:text-indigo-400">
                          {res.overallPos}º Lugar
                        </td>
                        <td className="px-4 py-3 font-mono font-bold">
                          #{res.registration.bibNumber}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {res.registration.athlete?.name || 'Atleta'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                            {res.registration.batch.modality.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-semibold text-[11px]">
                            {res.categoryPos}º ({res.ageCategory || 'Geral'})
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {res.netTime}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {res.grossTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                Nenhum tempo oficial registrado para esta corrida ainda. Utilize a importação CSV ou digitação acima.
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
