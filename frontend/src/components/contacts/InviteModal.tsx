import React, { useEffect, useState } from 'react';
import { X, Mail, Copy, Check, UserPlus } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useContactsStore, ROLES, DEPARTMENTS } from '../../store/contactsStore';
import { useBoardStore } from '../../store/boardStore';
import { useAuthStore } from '../../store/authStore';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const inviteLinkFor = (token: string) =>
  `${window.location.origin}${window.location.pathname}?invite=${token}`;

interface Errors {
  name?: string;
  email?: string;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const { inviteMember } = useContactsStore();
  const { activeTenantId } = useAuthStore();
  const { showToast } = useBoardStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES[2]);
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [errors, setErrors] = useState<Errors>({});
  const [sentLink, setSentLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setRole(ROLES[2]);
      setDepartment(DEPARTMENTS[0]);
      setErrors({});
      setSentLink(null);
      setCopied(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  const validate = () => {
    const next: Errors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!activeTenantId) return;
    setSubmitting(true);
    try {
      const member = await inviteMember(activeTenantId, { name, email, role, department });
      const link = inviteLinkFor(member.inviteToken);
      setSentLink(link);
      showToast(`Invitation email sent to ${member.email}`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to send invitation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!sentLink) return;
    try {
      await navigator.clipboard.writeText(sentLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast('Could not copy link', 'error');
    }
  };

  const inputClass = (err?: string) =>
    `w-full bg-bg-primary border ${err ? 'border-rose-500/60' : 'border-border-primary focus:border-purple-500/50'} rounded-lg px-3 py-2 text-text-primary outline-none transition-all`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy="invite-title" className="w-full max-w-md">
      <div className="bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-border-primary/50 flex items-center justify-between">
          <h3 id="invite-title" className="font-semibold text-text-heading text-sm flex items-center gap-2">
            <UserPlus size={15} className="text-purple-500" />
            Invite a member
          </h3>
          <button onClick={onClose} aria-label="Close dialog" className="text-text-secondary hover:text-text-heading hover:bg-bg-tertiary p-1 rounded-lg transition-all cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {sentLink ? (
          /* Success / invite-link view */
          <div className="p-5 space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <Mail size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-text-primary leading-relaxed">
                Invitation sent. Share this secure link if the email doesn’t arrive — opening it lets the invitee accept and join.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={sentLink}
                aria-label="Invitation link"
                className="flex-1 bg-bg-primary border border-border-primary rounded-lg px-3 py-2 text-text-secondary outline-none truncate"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-3 py-2 font-semibold transition-all active:scale-95 cursor-pointer"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={() => setSentLink(null)} className="bg-transparent hover:bg-bg-tertiary text-text-secondary hover:text-text-heading rounded-lg px-4 py-2 font-semibold transition-all cursor-pointer">
                Invite another
              </button>
              <button onClick={onClose} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer">
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
            <div>
              <label htmlFor="inv-name" className="text-text-secondary font-medium block mb-1">Full name</label>
              <input
                id="inv-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Priya Nair"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'inv-name-err' : undefined}
                className={inputClass(errors.name)}
              />
              {errors.name && <p id="inv-name-err" role="alert" className="text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="inv-email" className="text-text-secondary font-medium block mb-1">Email</label>
              <input
                id="inv-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'inv-email-err' : undefined}
                className={inputClass(errors.email)}
              />
              {errors.email && <p id="inv-email-err" role="alert" className="text-rose-500 mt-1">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inv-role" className="text-text-secondary font-medium block mb-1">Role</label>
                <select id="inv-role" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass()}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="inv-dept" className="text-text-secondary font-medium block mb-1">Department</label>
                <select id="inv-dept" value={department} onChange={(e) => setDepartment(e.target.value)} className={inputClass()}>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-primary/50">
              <button type="button" onClick={onClose} className="bg-transparent hover:bg-bg-tertiary text-text-secondary hover:text-text-heading rounded-lg px-4 py-2 font-semibold transition-all cursor-pointer">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer">
                <Mail size={13} />
                {submitting ? 'Sending...' : 'Send invite'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
