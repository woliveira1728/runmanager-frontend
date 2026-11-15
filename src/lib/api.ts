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

export interface UpdateAthleteProfileInput {
  shirtSize?: 'PP' | 'P' | 'M' | 'G' | 'GG';
  emergencyContact?: string;
  medicalNotes?: string;
  lgpdConsent?: boolean;
}

export async function updateMyProfile(
  data: UpdateAthleteProfileInput,
): Promise<AthleteProfile> {
  const response = await api.put<AthleteProfile>('/users/me/profile', data);
  return response.data;
}

export async function checkApiHealth(): Promise<ApiStatusResponse> {
  const response = await api.get<ApiStatusResponse>('/health');
  return response.data;
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'FINISHED';

export interface RegistrationBatch {
  id: string;
  modalityId: string;
  batchNumber: number;
  price: number | string;
  maxSlots: number;
  filledSlots: number;
  endDate: string;
}

export interface Modality {
  id: string;
  eventId: string;
  name: string;
  minAge: number;
  registrationBatches: RegistrationBatch[];
}

export interface Event {
  id: string;
  organizerId: string;
  title: string;
  description: string;
  eventDate: string;
  location: string;
  status: EventStatus;
  createdAt: string;
  modalities: Modality[];
  organizer?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface CreateEventInput {
  title: string;
  description: string;
  eventDate: string;
  location: string;
  status?: EventStatus;
  modalities: {
    name: string;
    minAge?: number;
    batches: {
      batchNumber: number;
      price: number;
      maxSlots: number;
      endDate: string;
    }[];
  }[];
}

export async function fetchPublishedEvents(search?: string): Promise<Event[]> {
  const params = search ? { search } : {};
  const response = await api.get<Event[]>('/events', { params });
  return response.data;
}

export async function fetchMyEvents(): Promise<Event[]> {
  const response = await api.get<Event[]>('/events/my-events');
  return response.data;
}

export async function createEvent(data: CreateEventInput): Promise<Event> {
  const response = await api.post<Event>('/events', data);
  return response.data;
}

export async function publishEvent(id: string): Promise<Event> {
  const response = await api.patch<Event>(`/events/${id}/publish`);
  return response.data;
}

export async function deleteEvent(id: string): Promise<Event> {
  const response = await api.delete<Event>(`/events/${id}`);
  return response.data;
}

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Registration {
  id: string;
  athleteId: string;
  batchId: string;
  bibNumber: number | null;
  paymentStatus: PaymentStatus;
  qrCodeHash: string;
  checkedIn: boolean;
  checkedInAt?: string | null;
  createdAt: string;
  batch: RegistrationBatch & {
    modality: Modality & {
      event: {
        id: string;
        title: string;
        eventDate: string;
        location: string;
        status: EventStatus;
      };
    };
  };
  athlete?: {
    id: string;
    name: string;
    email: string;
    athleteProfile?: {
      cpf: string;
      gender: 'M' | 'F' | 'OUTRO';
      shirtSize: 'PP' | 'P' | 'M' | 'G' | 'GG';
      emergencyContact?: string;
      birthDate?: string;
    };
  };
  result?: {
    id: string;
    grossTime: string;
    netTime: string;
    overallPos: number;
    categoryPos: number;
  } | null;
}

export interface CreateRegistrationInput {
  batchId: string;
}

export interface CheckInInput {
  qrCodeHash: string;
}

export async function createRegistration(
  data: CreateRegistrationInput,
): Promise<Registration> {
  const response = await api.post<Registration>('/registrations', data);
  return response.data;
}

export async function fetchMyRegistrations(): Promise<Registration[]> {
  const response = await api.get<Registration[]>('/registrations/my-registrations');
  return response.data;
}

export async function fetchEventRegistrations(
  eventId: string,
): Promise<Registration[]> {
  const response = await api.get<Registration[]>(
    `/registrations/event/${eventId}`,
  );
  return response.data;
}

export async function checkInRegistration(
  data: CheckInInput,
): Promise<Registration> {
  const response = await api.post<Registration>('/registrations/check-in', data);
  return response.data;
}

export async function updateRegistrationPaymentStatus(
  registrationId: string,
  paymentStatus: PaymentStatus,
): Promise<Registration> {
  const response = await api.patch<Registration>(
    `/registrations/${registrationId}/payment-status`,
    { paymentStatus },
  );
  return response.data;
}

export interface EventResultItem {
  id: string;
  registrationId: string;
  grossTime: string;
  netTime: string;
  overallPos: number;
  categoryPos: number;
  importedAt: string;
  ageCategory?: string;
  registration: {
    id: string;
    bibNumber: number | null;
    athlete?: {
      id: string;
      name: string;
      email: string;
      athleteProfile?: {
        cpf: string;
        gender: 'M' | 'F' | 'OUTRO';
        birthDate?: string;
        shirtSize: 'PP' | 'P' | 'M' | 'G' | 'GG';
      };
    };
    batch: {
      id: string;
      modality: {
        id: string;
        name: string;
      };
    };
  };
}

export interface RecordSingleResultInput {
  bibNumber: number;
  grossTime: string;
  netTime: string;
}

export interface ImportResultsInput {
  csvContent?: string;
  items?: RecordSingleResultInput[];
  ignoreInvalidBibs?: boolean;
}

export interface ImportResultsResponse {
  importedCount: number;
  skippedInvalidBibs: number[];
  results: EventResultItem[];
}

export async function recordSingleResult(
  eventId: string,
  data: RecordSingleResultInput,
): Promise<EventResultItem> {
  const response = await api.post<EventResultItem>(
    `/results/event/${eventId}/manual`,
    data,
  );
  return response.data;
}

export async function importEventResults(
  eventId: string,
  data: ImportResultsInput,
): Promise<ImportResultsResponse> {
  const response = await api.post<ImportResultsResponse>(
    `/results/event/${eventId}/import`,
    data,
  );
  return response.data;
}

export async function fetchEventResults(
  eventId: string,
): Promise<EventResultItem[]> {
  const response = await api.get<EventResultItem[]>(`/results/event/${eventId}`);
  return response.data;
}
