'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/contexts/auth-context';
import {
  Trophy,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  HeartPulse,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Building2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function RegisterPage() {
  const { register } = useAuth();

  // Tipo de Conta (UC02: Atleta ou Organizador)
  const [accountRole, setAccountRole] = useState<'ATHLETE' | 'ORGANIZER'>('ATHLETE');

  // Dados da Conta
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Perfil do Atleta
  const [cpf, setCpf] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'M' | 'F' | 'OUTRO'>('M');
  const [shirtSize, setShirtSize] = useState<'PP' | 'P' | 'M' | 'G' | 'GG'>('M');

  // Dados Médicos / Sensíveis (LGPD)
  const [emergencyContact, setEmergencyContact] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);

  // Estados de submissão
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Máscara dinâmica de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    }
    setCpf(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validações locais
    if (password !== confirmPassword) {
      setErrorMessage('As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (accountRole === 'ATHLETE') {
      const cpfDigits = cpf.replace(/\D/g, '');
      const isCpfValid = (clean: string) => {
        if (clean.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(clean)) return false;
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i), 10) * (10 - i);
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(clean.charAt(9), 10)) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i), 10) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(clean.charAt(10), 10)) return false;
        return true;
      };

      if (!isCpfValid(cpfDigits)) {
        setErrorMessage('Por favor, informe um CPF válido com dígitos verificadores corretos.');
        return;
      }

      if (!birthDate) {
        setErrorMessage('Por favor, informe sua data de nascimento.');
        return;
      }

      if (!emergencyContact.trim()) {
        setErrorMessage('O contato de emergência é indispensável para sua segurança.');
        return;
      }

      const phoneDigits = emergencyContact.replace(/\D/g, '');
      if (phoneDigits.length < 10 || !/^[1-9]{2}/.test(phoneDigits)) {
        setErrorMessage(
          'O contato de emergência deve incluir um número de telefone com DDD válido (ex: (92) 99888-7766).'
        );
        return;
      }

      if (!lgpdConsent) {
        setErrorMessage('É obrigatório consentir com o termo da LGPD para criar o perfil de atleta.');
        return;
      }
    }

    setLoading(true);

    try {
      if (accountRole === 'ORGANIZER') {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role: 'ORGANIZER',
        });
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role: 'ATHLETE',
          athleteProfile: {
            cpf,
            birthDate,
            gender,
            shirtSize,
            emergencyContact: emergencyContact.trim(),
            medicalNotes: medicalNotes.trim() ? medicalNotes.trim() : undefined,
            lgpdConsent: true,
          },
        });
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          setErrorMessage(
            (err.response?.data as { message?: string })?.message ||
              'E-mail ou CPF já cadastrado no sistema.'
          );
        } else if (err.code === 'ERR_NETWORK') {
          setErrorMessage(
            'Não foi possível conectar ao servidor no momento. Tente novamente em instantes.'
          );
        } else {
          setErrorMessage(
            (err.response?.data as { message?: string })?.message ||
              'Falha ao realizar cadastro. Verifique os campos e tente novamente.'
          );
        }
      } else {
        setErrorMessage('Ocorreu um erro inesperado ao realizar cadastro.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      <header className="max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Início
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="w-full max-w-2xl p-6 sm:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-blue-500/25 mb-1">
              <Trophy className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {accountRole === 'ATHLETE' ? 'Cadastro de Atleta' : 'Cadastro de Organizador'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {accountRole === 'ATHLETE'
                ? 'Crie seu perfil oficial no RunManager para se inscrever em provas e retirar kits com agilidade via QR Code'
                : 'Crie sua conta de Organizador ou Assessoria Esportiva para publicar corridas, lotes e realizar check-in na arena'}
            </p>
          </div>

          {/* Seletor de Perfil (UC02: Atleta ou Organizador) */}
          <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setAccountRole('ATHLETE');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                accountRole === 'ATHLETE'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Sou Atleta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAccountRole('ORGANIZER');
                setErrorMessage(null);
              }}
              className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                accountRole === 'ORGANIZER'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Sou Organizador</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seção 1: Credenciais e Identificação Básica */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <UserIcon className="h-4 w-4" />
                1. Informações da Conta
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    E-mail (Login) *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="atleta@exemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {accountRole === 'ATHLETE' ? (
              <>
                {/* Seção 2: Perfil do Atleta */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Calendar className="h-4 w-4" />
                    2. Perfil Esportivo & Entrega de Kits
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        CPF (Obrigatório e Único) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={14}
                        value={cpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Gênero para Categoria de Prova *
                      </label>
                      <select
                        value={gender}
                        onChange={(e) =>
                          setGender(e.target.value as 'M' | 'F' | 'OUTRO')
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      >
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="OUTRO">Outro / Não binário</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Tamanho da Camiseta Oficial *
                      </label>
                      <select
                        value={shirtSize}
                        onChange={(e) =>
                          setShirtSize(
                            e.target.value as 'PP' | 'P' | 'M' | 'G' | 'GG'
                          )
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                      >
                        <option value="PP">PP (Extra Pequeno)</option>
                        <option value="P">P (Pequeno)</option>
                        <option value="M">M (Médio)</option>
                        <option value="G">G (Grande)</option>
                        <option value="GG">GG (Extra Grande)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Seção 3: Saúde e LGPD */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <HeartPulse className="h-4 w-4" />
                    3. Segurança em Prova & Saúde (Criptografia LGPD)
                  </h2>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Contato de Emergência com DDD (Nome e Telefone) *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          placeholder="Ex: Maria Souza (Mãe) - (92) 99888-7766"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        🔒 Criptografado em repouso no servidor com chave AES-256.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Observações Médicas / Alergias (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={medicalNotes}
                        onChange={(e) => setMedicalNotes(e.target.value)}
                        placeholder="Ex: Alérgico a penicilina, asmático leve, tipo sanguíneo O+..."
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        🔒 Acesso restrito a socorristas da arena em caso de ocorrência médica.
                      </p>
                    </div>

                    {/* Termo de Consentimento LGPD */}
                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
                      <div className="flex items-start gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          <strong>Termo de Consentimento para Tratamento de Dados (LGPD):</strong>
                          <p className="mt-1 text-slate-600 dark:text-slate-400">
                            De acordo com a Lei nº 13.709/2018 (LGPD), seus dados sensíveis de saúde e contato de emergência são protegidos com criptografia simétrica AES-256-GCM em repouso e serão consultados unicamente em situações de socorro emergencial durante a corrida de rua.
                          </p>
                        </div>
                      </div>

                      <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-blue-200/50 dark:border-blue-900/40">
                        <input
                          type="checkbox"
                          required
                          checked={lgpdConsent}
                          onChange={(e) => setLgpdConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 select-none">
                          Concordo com o armazenamento seguro e tratamento dos meus dados conforme as diretrizes da LGPD *
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-start gap-3">
                <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                  <strong className="block text-slate-900 dark:text-white">
                    Conta de Organizador de Eventos
                  </strong>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ao criar uma conta de Organizador, você terá acesso imediato ao painel de criação de corridas de rua, configuração de múltiplos percursos e lotes de vagas, listagem de inscritos e console de check-in por QR Code na arena.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Concluir Cadastro e Acessar Plataforma</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Já possui uma conta cadastrada?{' '}
              <Link
                href="/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Fazer Login
              </Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-500">
        © 2026 RunManager • Plataforma de Gestão de Eventos Esportivos
      </footer>
    </div>
  );
}
