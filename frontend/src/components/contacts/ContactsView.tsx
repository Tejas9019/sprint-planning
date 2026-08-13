import React, { useMemo, useState } from 'react';
import {
  UserPlus, FileSpreadsheet, Search, CheckCircle2, XCircle, Trash2, Ban,
  ChevronLeft, ChevronRight, Users, Copy
} from 'lucide-react';
import { IconButton } from '../ui/IconButton';
import { InviteModal, inviteLinkFor } from './InviteModal';
import { BulkUploadModal } from './BulkUploadModal';
import { useContactsStore, type MemberStatus } from '../../store/contactsStore';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';

const PAGE_SIZE = 8;

const STATUS_BADGE: Record<MemberStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  invited: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  revoked: 'bg-zinc-500/10 text-text-secondary border-border-primary',
};

const initials = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || '?';

const FILTERS: Array<{ key: 'all' | MemberStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'invited', label: 'Invited' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'revoked', label: 'Revoked' },
];

export const ContactsView: React.FC = () => {
  const { members, setStatus, removeMember, fetchMembers } = useContactsStore();
  const { activeTenantId } = useAuthStore();
  const { showToast } = useBoardStore();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MemberStatus>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (activeTenantId) {
      fetchMembers(activeTenantId);
    }
  }, [activeTenantId, fetchMembers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      const matchesQuery = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [members, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startIdx = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(safePage * PAGE_SIZE, filtered.length);

  const counts = useMemo(() => ({
    total: members.length,
    active: members.filter((m) => m.status === 'active').length,
    invited: members.filter((m) => m.status === 'invited').length,
  }), [members]);

  const onFilterChange = (key: 'all' | MemberStatus) => { setStatusFilter(key); setPage(1); };
  const onQueryChange = (v: string) => { setQuery(v); setPage(1); };

  const accept = (id: string, name: string) => {
    if (activeTenantId) {
      setStatus(activeTenantId, id, 'active');
      showToast(`${name} is now active`, 'success');
    }
  };
  const reject = (id: string, name: string) => {
    if (activeTenantId) {
      setStatus(activeTenantId, id, 'rejected');
      showToast(`Invitation for ${name} rejected`, 'info');
    }
  };
  const revoke = (id: string, name: string) => {
    if (activeTenantId) {
      setStatus(activeTenantId, id, 'revoked');
      showToast(`Access revoked for ${name}`, 'info');
    }
  };
  const remove = (id: string, name: string) => {
    if (activeTenantId) {
      removeMember(activeTenantId, id);
      showToast(`Removed ${name}`, 'info');
    }
  };

  const copyInvite = async (token: string, name: string) => {
    try {
      await navigator.clipboard.writeText(inviteLinkFor(token));
      showToast(`Invite link for ${name} copied`, 'success');
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full overflow-hidden bg-bg-primary">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border-primary/60 bg-bg-secondary flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 flex-shrink-0">
        <div>
          <h1 className="text-base font-bold text-text-heading tracking-tight flex items-center gap-2">
            <Users size={18} className="text-purple-500" />
            Contacts
          </h1>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {counts.total} members · {counts.active} active · {counts.invited} pending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBulkOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-bg-secondary hover:bg-bg-tertiary border border-border-primary text-text-primary rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-500" />
            Bulk upload
          </button>
          <button
            onClick={() => setInviteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer"
          >
            <UserPlus size={14} />
            Invite member
          </button>
        </div>
      </header>

      {/* Toolbar: search + status filter */}
      <div className="px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
          <label htmlFor="contacts-search" className="sr-only">Search members</label>
          <input
            id="contacts-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full bg-bg-secondary border border-border-primary focus:border-purple-500/40 rounded-lg py-2 pl-9 pr-3 text-xs outline-none text-text-primary transition-all"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap" role="tablist" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={statusFilter === f.key}
              onClick={() => onFilterChange(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === f.key
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-bg-secondary border border-border-primary text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="border border-border-primary/60 rounded-2xl overflow-hidden bg-bg-secondary/40">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-primary text-text-secondary font-semibold bg-bg-secondary/80 select-none">
                <th scope="col" className="p-3.5">Name</th>
                <th scope="col" className="p-3.5 hidden md:table-cell">Email</th>
                <th scope="col" className="p-3.5 hidden lg:table-cell">ID</th>
                <th scope="col" className="p-3.5 hidden lg:table-cell">Role</th>
                <th scope="col" className="p-3.5 hidden xl:table-cell">Department</th>
                <th scope="col" className="p-3.5">Status</th>
                <th scope="col" className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/30">
              {pageItems.map((m) => {
                const canAccept = m.status === 'invited';
                const canReject = m.status === 'invited';
                const canRevoke = m.status === 'active';
                return (
                  <tr key={m.id} className="hover:bg-bg-tertiary/30 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {initials(m.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-heading truncate">{m.name || '—'}</p>
                          <p className="text-[10px] text-text-secondary truncate md:hidden">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-text-secondary hidden md:table-cell">{m.email}</td>
                    <td className="p-3.5 text-text-secondary/70 font-mono text-[10px] hidden lg:table-cell">{m.id.slice(0, 8)}</td>
                    <td className="p-3.5 text-text-primary hidden lg:table-cell">{m.role}</td>
                    <td className="p-3.5 text-text-secondary hidden xl:table-cell">{m.department}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${STATUS_BADGE[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        {m.status === 'invited' && (
                          <IconButton label={`Copy invite link for ${m.name}`} size="sm" onClick={() => copyInvite(m.inviteToken, m.name)} className="hover:text-purple-600 dark:hover:text-purple-400">
                            <Copy size={14} />
                          </IconButton>
                        )}
                        <IconButton
                          label={`Accept ${m.name}`}
                          size="sm"
                          disabled={!canAccept}
                          onClick={() => accept(m.id, m.name)}
                          className="hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <CheckCircle2 size={15} />
                        </IconButton>
                        <IconButton
                          label={`Reject ${m.name}`}
                          size="sm"
                          disabled={!canReject}
                          onClick={() => reject(m.id, m.name)}
                          className="hover:text-amber-600 dark:hover:text-amber-400"
                        >
                          <XCircle size={15} />
                        </IconButton>
                        <IconButton
                          label={`Revoke access for ${m.name}`}
                          size="sm"
                          disabled={!canRevoke}
                          onClick={() => revoke(m.id, m.name)}
                          className="hover:text-orange-600 dark:hover:text-orange-400"
                        >
                          <Ban size={14} />
                        </IconButton>
                        <IconButton
                          label={`Remove ${m.name}`}
                          size="sm"
                          onClick={() => remove(m.id, m.name)}
                          className="hover:text-rose-600 dark:hover:text-rose-400"
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-text-secondary select-none">
                    {members.length === 0 ? 'No members yet. Invite someone to get started.' : 'No members match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="px-6 py-3 border-t border-border-primary/60 bg-bg-secondary flex items-center justify-between flex-shrink-0 select-none">
        <span className="text-[11px] text-text-secondary">
          Showing <strong className="text-text-primary">{startIdx}</strong>–<strong className="text-text-primary">{endIdx}</strong> of <strong className="text-text-primary">{filtered.length}</strong>
        </span>
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <IconButton label="Previous page" size="sm" variant="subtle" disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            <ChevronLeft size={15} />
          </IconButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-label={`Page ${p}`}
              aria-current={p === safePage ? 'page' : undefined}
              className={`min-w-7 h-7 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                p === safePage ? 'bg-purple-600 text-white' : 'text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              {p}
            </button>
          ))}
          <IconButton label="Next page" size="sm" variant="subtle" disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            <ChevronRight size={15} />
          </IconButton>
        </nav>
      </div>

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
      <BulkUploadModal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
};
