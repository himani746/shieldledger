import { getSession } from "next-auth/react";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  // Debug mode logging as requested by user
  console.log('Sending request to:', url);

  const headers = new Headers(options.headers || {});
  
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if (session && (session as any).token) {
        headers.set('Authorization', `Bearer ${(session as any).token}`);
      }
    } catch (e) {
      console.error('Failed to get session token', e);
    }
  }

  const res = await fetch(url, { ...options, headers });
  return res;
}
