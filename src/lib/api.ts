import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiStatusResponse {
  name: string;
  version: string;
  status: string;
  description: string;
  institution: string;
  timestamp: string;
}

export async function checkApiHealth(): Promise<ApiStatusResponse> {
  const response = await api.get<ApiStatusResponse>('/health');
  return response.data;
}
