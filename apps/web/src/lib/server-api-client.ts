import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

export async function serverApiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const cookieHeader = (await cookies()).toString();
  if (cookieHeader) headers.set('Cookie', cookieHeader);
  const isMultipart = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  if (!isMultipart && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, cache: 'no-store' });
  if (response.status === 401) redirect('/login');
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
