import { getSession } from 'next-auth/react';

const BASE = '';

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = await getSession();
  const token = session?.accessToken;
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, { ...init, headers });
}
