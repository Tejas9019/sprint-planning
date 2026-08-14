import { tokenStorage } from './tokenStorage';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8080';
const API = `${BASE_URL}/api/v1`;

/** The Spring oauth2Login entry point — used by the "Continue with Google" button. */
export const GOOGLE_LOGIN_URL = `${BASE_URL}/oauth2/authorization/google`;

// ---- Shared response shapes (mirror the backend DTOs) ----
export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  dob: string | null;
  enabled: boolean;
  emailVerified: boolean;
  authProvider: 'LOCAL' | 'GOOGLE';
}

export interface ApiTenant {
  id: string;
  name: string;
  slug: string;
  role: string;
  status: string;
}

export interface OtpChallenge {
  challengeId: string;
  maskedEmail: string;
  purpose: 'SIGNIN' | 'SIGNUP_VERIFY';
  expiresInSeconds: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  activeTenantId: string | null;
  user: ApiUser;
  tenants: ApiTenant[];
}

export interface CurrentUser {
  user: ApiUser;
  activeTenantId: string | null;
  roles: string[];
  permissions: string[];
  tenants: ApiTenant[];
}

/** Error thrown for any non-2xx response, carrying the backend ApiError fields when present. */
export class ApiError extends Error {
  status: number;
  code: string;
  fieldErrors?: { field: string; message: string }[];

  constructor(status: number, code: string, message: string, fieldErrors?: { field: string; message: string }[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

let onUnauthorized: (() => void) | null = null;
/** Registered by the auth store so the client can force a sign-out when refresh fails. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach access token (default true)
}

async function request<T>(path: string, options: RequestOptions = {}, retryOn401 = true): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const tenantId = tokenStorage.getActiveTenantId();
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
  }

  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && retryOn401 && tokenStorage.getRefreshToken()) {
    const refreshed = await tryRefresh();
    if (refreshed) return request<T>(path, options, false);
    forceSignOut();
    throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const code = data?.code ?? 'ERROR';
    const message = data?.message ?? response.statusText;
    throw new ApiError(response.status, code, message, data?.fieldErrors);
  }
  return data as T;
}

let refreshPromise: Promise<boolean> | null = null;

/** Attempt a single token refresh. Updates token storage on success. Deduplicated to prevent concurrent calls. */
async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const tokens = await request<AuthTokens>('/auth/refresh', { method: 'POST', body: { refreshToken }, auth: false }, false);
        applyTokens(tokens);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

/** Persist a token bundle into the shared storage. */
export function applyTokens(tokens: AuthTokens) {
  tokenStorage.setAccessToken(tokens.accessToken);
  tokenStorage.setRefreshToken(tokens.refreshToken);
  tokenStorage.setActiveTenantId(tokens.activeTenantId);
}

function forceSignOut() {
  tokenStorage.clear();
  onUnauthorized?.();
}

/** Auth endpoints. */
export const authApi = {
  signup: (body: { firstName: string; lastName: string; email: string; password: string }) =>
    request<OtpChallenge>('/auth/signup', { method: 'POST', body, auth: false }),

  signin: (body: { email: string; password: string }) =>
    request<OtpChallenge>('/auth/signin', { method: 'POST', body, auth: false }),

  verifyOtp: (body: { challengeId: string; code: string }) =>
    request<AuthTokens>('/auth/verify-otp', { method: 'POST', body, auth: false }),

  resendOtp: (challengeId: string) =>
    request<OtpChallenge>('/auth/resend-otp', { method: 'POST', body: { challengeId }, auth: false }),

  logout: (refreshToken: string) =>
    request<void>('/auth/logout', { method: 'POST', body: { refreshToken }, auth: false }),

  me: () => request<CurrentUser>('/auth/me'),

  switchTenant: (tenantId: string) =>
    request<AuthTokens>('/auth/switch-tenant', { method: 'POST', body: { tenantId } }),

  updateProfile: (body: { firstName?: string; lastName?: string; dob?: string | null }) =>
    apiPut<ApiUser>('/users/me', body),
};

/** Generic helpers for authenticated resource calls. */
export const apiGet = <T>(path: string) => request<T>(path);
export const apiPost = <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body });
export const apiPut = <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body });
export const apiDelete = <T>(path: string) => request<T>(path, { method: 'DELETE' });

const AI_BASE_URL = (import.meta.env.VITE_AI_API_BASE_URL as string | undefined) ?? 'http://localhost:8000';

export const aiApi = {
  chat: (message: string, context?: string) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${AI_BASE_URL}/api/v1/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, context }),
    }).then((r) => {
      if (!r.ok) throw new Error('AI request failed');
      return r.json();
    });
  },

  getHistory: () => {
    const headers: Record<string, string> = {};
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${AI_BASE_URL}/api/v1/ai/chat/history`, {
      method: 'GET',
      headers,
    }).then((r) => {
      if (!r.ok) throw new Error('AI history request failed');
      return r.json();
    });
  },

  writerChat: (message: string, sourceIds: string[]) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${AI_BASE_URL}/api/v1/ai/writer/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, source_ids: sourceIds }),
    }).then((r) => {
      if (!r.ok) throw new Error('AI writer request failed');
      return r.json();
    });
  },

  uploadDocument: (file: File) => {
    const headers: Record<string, string> = {};
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${AI_BASE_URL}/api/v1/ai/upload`, {
      method: 'POST',
      headers,
      body: formData,
    }).then((r) => {
      if (!r.ok) throw new Error('AI document upload failed');
      return r.json();
    });
  },

  deleteSource: (sourceId: string) => {
    const headers: Record<string, string> = {};
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    return fetch(`${AI_BASE_URL}/api/v1/ai/sources/${sourceId}`, {
      method: 'DELETE',
      headers,
    }).then((r) => {
      if (!r.ok) throw new Error('AI delete source failed');
      return r.json();
    });
  },
};

