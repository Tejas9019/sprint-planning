import { create } from 'zustand';
import {
  applyTokens,
  authApi,
  setUnauthorizedHandler,
  type ApiTenant,
  type ApiUser,
  type AuthTokens,
} from '../lib/api';
import { tokenStorage } from '../lib/tokenStorage';

export type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated';

interface AuthState {
  status: AuthStatus;
  user: ApiUser | null;
  tenants: ApiTenant[];
  activeTenantId: string | null;
  roles: string[];
  permissions: string[];

  /** Restore a session from the persisted refresh token on app start. */
  bootstrap: () => Promise<void>;
  signup: (input: { firstName: string; lastName: string; email: string; password: string }) => Promise<string>;
  signin: (email: string, password: string) => Promise<string>;
  verifyOtp: (challengeId: string, code: string) => Promise<void>;
  resendOtp: (challengeId: string) => Promise<void>;
  /** Consume access/refresh tokens delivered via the Google OAuth redirect fragment. */
  ingestOAuthTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  setActiveTenant: (tenantId: string) => Promise<void>;
  logout: () => Promise<void>;

  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const applySession = (tokens: AuthTokens) => {
    applyTokens(tokens);
    set({
      status: 'authenticated',
      user: tokens.user,
      tenants: tokens.tenants,
      activeTenantId: tokens.activeTenantId,
    });
  };

  const clearSession = () => {
    tokenStorage.clear();
    set({
      status: 'unauthenticated',
      user: null,
      tenants: [],
      activeTenantId: null,
      roles: [],
      permissions: [],
    });
  };

  // Force a clean sign-out if the API client gives up on refreshing.
  setUnauthorizedHandler(() => clearSession());

  return {
    status: 'loading',
    user: null,
    tenants: [],
    activeTenantId: null,
    roles: [],
    permissions: [],

    bootstrap: async () => {
      if (!tokenStorage.getRefreshToken()) {
        set({ status: 'unauthenticated' });
        return;
      }
      try {
        const me = await authApi.me();
        set({
          status: 'authenticated',
          user: me.user,
          tenants: me.tenants,
          activeTenantId: me.activeTenantId,
          roles: me.roles,
          permissions: me.permissions,
        });
      } catch {
        clearSession();
      }
    },

    signup: async (input) => {
      const challenge = await authApi.signup(input);
      return challenge.challengeId;
    },

    signin: async (email, password) => {
      const challenge = await authApi.signin({ email, password });
      return challenge.challengeId;
    },

    verifyOtp: async (challengeId, code) => {
      const tokens = await authApi.verifyOtp({ challengeId, code });
      applySession(tokens);
      const me = await authApi.me();
      set({ roles: me.roles, permissions: me.permissions });
    },

    resendOtp: async (challengeId) => {
      await authApi.resendOtp(challengeId);
    },

    ingestOAuthTokens: async (accessToken, refreshToken) => {
      tokenStorage.setAccessToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      const me = await authApi.me();
      tokenStorage.setActiveTenantId(me.activeTenantId);
      set({
        status: 'authenticated',
        user: me.user,
        tenants: me.tenants,
        activeTenantId: me.activeTenantId,
        roles: me.roles,
        permissions: me.permissions,
      });
    },

    setActiveTenant: async (tenantId) => {
      const tokens = await authApi.switchTenant(tenantId);
      applySession(tokens);
      const me = await authApi.me();
      set({ roles: me.roles, permissions: me.permissions });
    },

    logout: async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        try {
          await authApi.logout(refreshToken);
        } catch {
          /* best-effort; clear locally regardless */
        }
      }
      clearSession();
    },

    hasPermission: (permission) => get().permissions.includes(permission),
  };
});
