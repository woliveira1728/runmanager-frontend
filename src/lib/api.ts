import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar o token JWT em requisições autorizadas
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('runmanager_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor para redirecionar em caso de token expirado (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Ignora erro 401 se estiver na página de login ou registro
      const isAuthPath =
        window.location.pathname === '/login' ||
        window.location.pathname === '/register';
      if (!isAuthPath) {
        localStorage.removeItem('runmanager_token');
        localStorage.removeItem('runmanager_user');
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  },
);

export interface ApiStatusResponse {
  name: string;
  version: string;
  status: string;
  description: string;
  institution: string;
  timestamp: string;
}

export interface AthleteProfile {
  id: string;
  userId: string;
  cpf: string;
  birthDate: string;
  gender: 'M' | 'F' | 'OUTRO';
  shirtSize: 'PP' | 'P' | 'M' | 'G' | 'GG';
  emergencyContact: string;
  medicalNotes?: string | null;
  lgpdConsent: boolean;
  lgpdConsentAt?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'ATHLETE';
  createdAt?: string;
  athleteProfile?: AthleteProfile;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export async function checkApiHealth(): Promise<ApiStatusResponse> {
  const response = await api.get<ApiStatusResponse>('/health');
  return response.data;
}
