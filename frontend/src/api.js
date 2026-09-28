const BASE = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, params } = {}) {
  const clean = Object.entries(params || {}).filter(([, v]) => v !== '' && v != null);
  const qs = clean.length ? '?' + new URLSearchParams(clean) : '';

  let res;
  try {
    res = await fetch(`${BASE}/api${path}${qs}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the backend is running.', 0);
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message || 'Something went wrong. Please try again.', res.status);
  return data;
}

export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};
