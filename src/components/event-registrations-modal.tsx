'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Shirt,
  Loader2,
  Trophy,
} from 'lucide-react';
import {
  Event as SportEvent,
  PaymentStatus,
  Registration,
  fetchEventRegistrations,
  updateRegistrationPaymentStatus,
} from '@/lib/api';

interface EventRegistrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SportEvent | null;
}

export function EventRegistrationsModal({
  isOpen,
  onClose,
  event,
}: EventRegistrationsModalProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const queryClient = useQueryClient();

  const { data: registrations, isLoading } = useQuery<Registration[]>({
    queryKey: ['event-registrations', event?.id],
    queryFn: () =>
      event ? fetchEventRegistrations(event.id) : Promise.resolve([]),
    enabled: isOpen && !!event,
  });

  const paymentMutation = useMutation({
    mutationFn: ({
      registrationId,
      paymentStatus,
    }: {
      registrationId: string;
      paymentStatus: PaymentStatus;
    }) => updateRegistrationPaymentStatus(registrationId, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['event-registrations', event?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
      queryClient.invalidateQueries({ queryKey: ['published-events'] });
    },
  });

  if (!isOpen || !event) return null;

  const filteredRegistrations = (registrations || []).filter((reg) => {
    const term = searchTerm.toLowerCase();
    const athleteName = reg.athlete?.name.toLowerCase() || '';
    const athleteCpf = reg.athlete?.athleteProfile?.cpf || '';
    const bib = String(reg.bibNumber || '');
    return (
      athleteName.includes(term) ||
      athleteCpf.includes(term) ||
      bib.includes(term)
    );
  });

  const checkedInCount = (registrations || []).filter((r) => r.checkedIn).length;
  const confirmedCount = (registrations || []).filter(
    (r) => r.paymentStatus === 'CONFIRMED',
  ).length;
  const totalCount = registrations?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                Lista Oficial de Inscritos & Homologação
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {event.title} • {totalCount} atleta(s) registrado(s)
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

        {/* Barra de Estatísticas & Filtro */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              Total: {totalCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800">
              Confirmados: {confirmedCount}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Kits Entregues:{' '}
              {checkedInCount}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou #"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tabela de Participantes */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">
                Carregando lista de inscritos...
              </p>
            </div>
          ) : filteredRegistrations.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3"># Peito</th>
                    <th className="px-4 py-3">Atleta</th>
                    <th className="px-4 py-3">CPF</th>
                    <th className="px-4 py-3">Modalidade</th>
                    <th className="px-4 py-3">Camiseta</th>
                    <th className="px-4 py-3">Pagamento</th>
                    <th className="px-4 py-3">Check-in Arena</th>
                    <th className="px-4 py-3">Tempo Oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                        #{reg.bibNumber ?? '---'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {reg.athlete?.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {reg.athlete?.email}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {reg.athlete?.athleteProfile?.cpf || '---'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                          {reg.batch.modality.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-white">
                          <Shirt className="h-3 w-3 text-blue-500" />
                          {reg.athlete?.athleteProfile?.shirtSize || '---'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          disabled={
                            reg.checkedIn || paymentMutation.isPending
                          }
                          value={reg.paymentStatus}
                          onChange={(e) =>
                            paymentMutation.mutate({
                              registrationId: reg.id,
                              paymentStatus: e.target.value as PaymentStatus,
                            })
                          }
                          title={
                            reg.checkedIn
                              ? 'Inscrição com check-in realizado na arena'
                              : 'Confirmar ou cancelar inscrição manualmente'
                          }
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold border cursor-pointer disabled:opacity-60 ${
                            reg.paymentStatus === 'CONFIRMED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : reg.paymentStatus === 'PENDING'
                                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          <option value="CONFIRMED">Confirmado</option>
                          <option value="PENDING">Pendente</option>
                          <option value="CANCELLED">Cancelado</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {reg.checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Retirado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <Clock className="h-3.5 w-3.5" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {reg.result ? (
                          <div className="space-y-0.5">
                            <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                              <Trophy className="h-3 w-3 text-amber-500" />
                              <span>{reg.result.netTime}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 block">
                              {reg.result.overallPos}º Geral • Bruto:{' '}
                              {reg.result.grossTime}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Não apurado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center space-y-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Users className="h-8 w-8 text-slate-400 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                {searchTerm
                  ? 'Nenhum atleta encontrado para esta busca.'
                  : 'Nenhum atleta inscrito nesta corrida ainda.'}
              </p>
              <p className="text-xs text-slate-500">
                Assim que atletas realizarem inscrições, eles aparecerão aqui com número de peito.
              </p>
            </div>
          )}
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
