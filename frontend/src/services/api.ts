const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error?.message || `Request failed: ${res.status}`);
  }

  return data as T;
}

export const api = {
  health: () => request<{ status: string }>('/health'),

  sessions: {
    list: () => request<StudySession[]>('/sessions'),
    get: (id: string) => request<StudySession>(`/sessions/${id}`),
    create: (session: Omit<StudySession, 'id' | 'user_id' | 'xp_earned' | 'created_at'>) =>
      request<StudySession>('/sessions', {
        method: 'POST',
        body: JSON.stringify(session),
      }),
    delete: (id: string) => request<void>(`/sessions/${id}`, { method: 'DELETE' }),
  },

  stats: {
    get: () => request<StudyStats>('/stats'),
  },

  quest: {
    get: () => request<QuestProgress>('/quest'),
  },

  ai: {
    analyze: () => request<AIAnalysis>('/ai/analyze', { method: 'POST' }),
  },
};

import type { StudySession, StudyStats, QuestProgress, AIAnalysis } from '../types';