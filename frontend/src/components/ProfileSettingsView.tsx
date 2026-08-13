import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../lib/api';
import { useBoardStore } from '../store/boardStore';
import { User, Calendar, Mail, AlertTriangle, Shield } from 'lucide-react';

export const ProfileSettingsView: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const roles = useAuthStore((s) => s.roles);
  const permissions = useAuthStore((s) => s.permissions);
  const showToast = useBoardStore((s) => s.showToast);

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [dob, setDob] = useState(user?.dob ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex-grow flex items-center justify-center bg-bg-primary h-screen text-text-secondary">
        Please sign in to view your profile settings.
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      setErrorMsg('First name cannot be empty');
      return;
    }
    if (!lastName.trim()) {
      setErrorMsg('Last name cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const updatedUser = await authApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob: dob || null,
      });

      // Update the Zustand authStore state immediately
      useAuthStore.setState({ user: updatedUser });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Failed to update profile.');
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col h-screen overflow-y-auto bg-bg-primary p-6 md:p-8 select-none">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Account Settings</h1>
          <p className="text-text-secondary mt-2">Manage your personal profile information and settings.</p>
        </div>

        {/* Content Panel */}
        <div className="bg-bg-secondary border border-border-primary/20 dark:border-border-primary/10 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-md">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Error Banner */}
            {errorMsg && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl text-sm">
                <AlertTriangle size={18} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Profile Picture & General info */}
            <div className="flex flex-col sm:flex-row items-center gap-4.5 pb-6 border-b border-border-primary/20 dark:border-border-primary/10">
              <div className="w-18 h-18 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {firstName.charAt(0).toUpperCase()}{lastName.charAt(0).toUpperCase()}
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-text-primary">{user.fullName}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {user.authProvider === 'GOOGLE' ? 'Google Account' : 'Password Login'}
                </span>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <User size={14} /> First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary/20 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-text-primary placeholder-text-secondary transition-all"
                  placeholder="Jane"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <User size={14} /> Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary/20 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-text-primary placeholder-text-secondary transition-all"
                  placeholder="Doe"
                />
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary/50 border border-border-primary/20 text-text-secondary cursor-not-allowed select-none focus:outline-none"
                />
                <p className="text-xs text-text-secondary/60">Email cannot be changed.</p>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <Calendar size={14} /> Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-primary/20 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-text-primary transition-all"
                />
              </div>
            </div>

            {/* Roles / Permissions (read-only settings context) */}
            {(roles.length > 0 || permissions.length > 0) && (
              <div className="mt-8 pt-6 border-t border-border-primary/20 dark:border-border-primary/10 space-y-4">
                <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2">
                  <Shield size={14} /> System Authorities & Roles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <span key={role} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Role: {role}
                    </span>
                  ))}
                  {permissions.map((perm) => (
                    <span key={perm} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-medium transition-all shadow-md flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
