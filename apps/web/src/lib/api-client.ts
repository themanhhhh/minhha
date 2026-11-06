const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
export const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
export type ApiRequest = <T>(path: string, options?: RequestInit) => Promise<T>;

export async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  const isMultipart = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  if (!isMultipart && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: 'include', headers });
  if (response.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/')) {
    localStorage.removeItem('riki-auth');
    window.location.assign('/login');
  }
  if (!response.ok) {
    let message = 'Không thể thực hiện yêu cầu. Vui lòng thử lại.';
    try {
      const detail = await response.json() as { message?: string | string[] };
      if (detail.message && response.status < 500) message = Array.isArray(detail.message) ? detail.message.join('. ') : detail.message;
    } catch { /* Keep the user-facing fallback for non-JSON gateway responses. */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
