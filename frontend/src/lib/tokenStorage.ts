/**
 * Token storage seam shared by the API client and the auth store.
 *
 * - access token: kept in memory only (not persisted) to limit XSS exposure
 * - refresh token: persisted in localStorage so a page refresh keeps the session
 * - active tenant id: in memory; sent as the X-Tenant-Id header
 */
const REFRESH_KEY = 'trackflows-refresh';

let accessToken: string | null = null;
let activeTenantId: string | null = null;

export const tokenStorage = {
  getAccessToken: (): string | null => accessToken,
  setAccessToken: (token: string | null) => {
    accessToken = token;
  },

  getActiveTenantId: (): string | null => activeTenantId,
  setActiveTenantId: (tenantId: string | null) => {
    activeTenantId = tenantId;
  },

  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_KEY),
  setRefreshToken: (token: string | null) => {
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  },

  clear: () => {
    accessToken = null;
    activeTenantId = null;
    localStorage.removeItem(REFRESH_KEY);
  },
};
