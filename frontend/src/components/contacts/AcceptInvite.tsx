import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, XCircle, MailWarning, ArrowRight, Loader2 } from 'lucide-react';
import { useContactsStore } from '../../store/contactsStore';

interface AcceptInviteProps {
  token: string;
  onDone: () => void;
}

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-2xl p-8 text-center space-y-5">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white mx-auto shadow shadow-purple-500/20">
        <Zap size={22} />
      </div>
      {children}
    </div>
  </div>
);

export const AcceptInvite: React.FC<AcceptInviteProps> = ({ token, onDone }) => {
  const { fetchInviteDetails, acceptInvite } = useContactsStore();
  const [loading, setLoading] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    fetchInviteDetails(token)
      .then((data) => {
        setInviteDetails(data);
        setAccepted(data.status === 'ACTIVE');
        setLoading(false);
      })
      .catch((err) => {
        setInviteError(err.message || 'Invitation not found');
        setLoading(false);
      });
  }, [token, fetchInviteDetails]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await acceptInvite(token);
      setAccepted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to accept invite. Make sure you are signed in first.');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-sm text-text-secondary">Loading invitation details...</p>
        </div>
      </Shell>
    );
  }

  // Invalid / unknown token
  if (inviteError || !inviteDetails) {
    return (
      <Shell>
        <MailWarning size={28} className="text-amber-500 mx-auto" />
        <h1 className="text-lg font-bold text-text-heading">Invitation not found</h1>
        <p className="text-sm text-text-secondary">{inviteError || 'This invite link is invalid or has been removed. Please ask your admin to resend it.'}</p>
        <button onClick={onDone} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 text-sm font-semibold transition-all active:scale-95 cursor-pointer">
          Continue to sign in
        </button>
      </Shell>
    );
  }

  const isRejectedOrRevoked = inviteDetails.status === 'REJECTED' || inviteDetails.status === 'REVOKED';

  if (isRejectedOrRevoked) {
    return (
      <Shell>
        <XCircle size={28} className="text-rose-500 mx-auto" />
        <h1 className="text-lg font-bold text-text-heading">This invitation is no longer active</h1>
        <p className="text-sm text-text-secondary">The invitation for <strong>{inviteDetails.email}</strong> was {inviteDetails.status.toLowerCase()}. Contact your admin for a new invite.</p>
        <button onClick={onDone} className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 text-sm font-semibold transition-all active:scale-95 cursor-pointer">
          Continue to sign in
        </button>
      </Shell>
    );
  }

  if (accepted) {
    return (
      <Shell>
        <CheckCircle2 size={28} className="text-emerald-500 mx-auto" />
        <h1 className="text-lg font-bold text-text-heading">You're in! 🎉</h1>
        <p className="text-sm text-text-secondary">
          You've joined <strong>{inviteDetails.tenantName}</strong> as a <strong>{inviteDetails.role}</strong> in {inviteDetails.department || 'Product'}. Sign in with <strong>{inviteDetails.email}</strong> to get started.
        </p>
        <button onClick={onDone} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg py-2.5 text-sm font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer">
          Continue to sign in <ArrowRight size={15} />
        </button>
      </Shell>
    );
  }

  // Pending invite — show details + accept
  return (
    <Shell>
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-widest font-bold text-text-secondary">You're invited to join tenant</p>
        <h1 className="text-xl font-bold text-text-heading">{inviteDetails.tenantName}</h1>
      </div>
      <div className="text-left bg-bg-primary/40 border border-border-primary/60 rounded-xl p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-text-secondary">Email</span><span className="font-medium text-text-primary truncate ml-3">{inviteDetails.email}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Role</span><span className="font-medium text-text-primary">{inviteDetails.role}</span></div>
        <div className="flex justify-between"><span className="text-text-secondary">Department</span><span className="font-medium text-text-primary">{inviteDetails.department || 'Product'}</span></div>
      </div>
      <div className="flex gap-2">
        <button onClick={onDone} className="flex-1 bg-transparent hover:bg-bg-tertiary border border-border-primary text-text-secondary hover:text-text-heading rounded-lg py-2.5 text-sm font-semibold transition-all cursor-pointer">
          Not now
        </button>
        <button onClick={handleAccept} disabled={accepting} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg py-2.5 text-sm font-semibold shadow-lg shadow-purple-500/10 transition-all active:scale-95 cursor-pointer disabled:opacity-50">
          {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={15} />} Accept invite
        </button>
      </div>
    </Shell>
  );
};
