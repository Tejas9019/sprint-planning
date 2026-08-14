import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export type MemberStatus = 'invited' | 'active' | 'rejected' | 'revoked';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: MemberStatus;
  inviteToken: string;
  invitedAt: string; // ISO timestamp
}

export interface InviteInput {
  name: string;
  email: string;
  role: string;
  department: string;
}

export const ROLES = ['Admin', 'Manager', 'Member', 'Viewer'];
export const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations'];

interface ContactsState {
  members: Member[];
  fetchMembers: (tenantId: string) => Promise<void>;
  inviteMember: (tenantId: string, input: InviteInput) => Promise<Member>;
  bulkInvite: (tenantId: string, rows: InviteInput[]) => Promise<{ added: number; skipped: number }>;
  acceptInvite: (token: string) => Promise<Member | null>;
  fetchInviteDetails: (token: string) => Promise<any>;
  setStatus: (tenantId: string, id: string, status: MemberStatus) => Promise<void>;
  updateRole: (tenantId: string, id: string, role: string) => Promise<void>;
  removeMember: (tenantId: string, id: string) => Promise<void>;
  getByToken: (token: string) => Member | undefined;
}

export const useContactsStore = create<ContactsState>()(
  persist(
    (set, get) => ({
      members: [],

      fetchMembers: async (tenantId) => {
        try {
          const apiMembers = await apiGet<any[]>(`/tenants/${tenantId}/members`);
          const mapped: Member[] = apiMembers.map((m) => ({
            id: m.id,
            name: m.name || m.email.split('@')[0],
            email: m.email,
            role: m.role ? (m.role.charAt(0).toUpperCase() + m.role.slice(1).toLowerCase()) : 'Member',
            department: 'Product', // default department as backend does not store it
            status: m.status ? m.status.toLowerCase() as MemberStatus : 'invited',
            inviteToken: m.inviteToken || '',
            invitedAt: m.invitedAt || new Date().toISOString(),
          }));
          set({ members: mapped });
        } catch {
          // Keep empty on failure
        }
      },

      inviteMember: async (tenantId, input) => {
        try {
          const apiRole = input.role.toUpperCase();
          const m = await apiPost<any>(`/tenants/${tenantId}/members`, {
            email: input.email.trim().toLowerCase(),
            role: apiRole,
          });
          const mapped: Member = {
            id: m.id,
            name: m.name || input.name || m.email.split('@')[0],
            email: m.email,
            role: m.role ? (m.role.charAt(0).toUpperCase() + m.role.slice(1).toLowerCase()) : input.role,
            department: input.department || 'Product',
            status: m.status ? m.status.toLowerCase() as MemberStatus : 'invited',
            inviteToken: m.inviteToken || '',
            invitedAt: m.invitedAt || new Date().toISOString(),
          };
          set((s) => ({ members: [mapped, ...s.members] }));
          return mapped;
        } catch (err: any) {
          throw new Error(err?.message ?? 'Failed to invite member');
        }
      },

      bulkInvite: async (tenantId, rows) => {
        const existing = new Set(get().members.map((m) => m.email.toLowerCase()));
        let added = 0;
        let skipped = 0;
        for (const r of rows) {
          const email = r.email.trim().toLowerCase();
          if (!email || existing.has(email)) {
            skipped++;
            continue;
          }
          try {
            await apiPost<any>(`/tenants/${tenantId}/members`, {
              email,
              role: (r.role || 'Member').toUpperCase(),
            });
            added++;
          } catch {
            skipped++;
          }
        }
        await get().fetchMembers(tenantId);
        return { added, skipped };
      },

      acceptInvite: async (token) => {
        try {
          const m = await apiPost<any>(`/tenants/accept-invite?token=${token}`);
          const mapped: Member = {
            id: m.id,
            name: m.name || m.email.split('@')[0],
            email: m.email,
            role: m.role ? (m.role.charAt(0).toUpperCase() + m.role.slice(1).toLowerCase()) : 'Member',
            department: m.department || 'Product',
            status: m.status ? m.status.toLowerCase() as MemberStatus : 'invited',
            inviteToken: m.inviteToken || '',
            invitedAt: m.invitedAt || new Date().toISOString(),
          };
          return mapped;
        } catch (err: any) {
          throw new Error(err?.message ?? 'Failed to accept invite');
        }
      },

      fetchInviteDetails: async (token) => {
        try {
          return await apiGet<any>(`/auth/invites/${token}`);
        } catch (err: any) {
          throw new Error(err?.message ?? 'Failed to fetch invite details');
        }
      },

      setStatus: async (_tenantId, id, status) => {
        set((s) => ({
          members: s.members.map((m) => (m.id === id ? { ...m, status } : m)),
        }));
      },

      updateRole: async (tenantId, id, role) => {
        try {
          const apiRole = role.toUpperCase();
          const m = await apiPut<any>(`/tenants/${tenantId}/members/${id}/role`, { role: apiRole });
          set((s) => ({
            members: s.members.map((member) =>
              member.id === id
                ? {
                    ...member,
                    role: m.role ? (m.role.charAt(0).toUpperCase() + m.role.slice(1).toLowerCase()) : role,
                  }
                : member
            ),
          }));
        } catch {}
      },

      removeMember: async (tenantId, id) => {
        try {
          await apiDelete(`/tenants/${tenantId}/members/${id}`);
          set((s) => ({ members: s.members.filter((m) => m.id !== id) }));
        } catch {}
      },

      getByToken: (token) => get().members.find((m) => m.inviteToken === token),
    }),
    {
      name: 'contacts-storage',
      partialize: () => ({}),
    }
  )
);
