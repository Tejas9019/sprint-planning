import React from 'react';
import { Zap, CheckSquare, BarChart3, Users } from 'lucide-react';
import { GOOGLE_LOGIN_URL } from '../../lib/api';

/** Brand "G" Google mark. */
export const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

/** Microsoft 4-square mark. */
export const MicrosoftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 23 23" aria-hidden="true">
    <path fill="#F35325" d="M1 1h10v10H1z" />
    <path fill="#81BC06" d="M12 1h10v10H12z" />
    <path fill="#05A6F0" d="M1 12h10v10H1z" />
    <path fill="#FFBA08" d="M12 12h10v10H12z" />
  </svg>
);

interface SocialAuthRowProps {
  onProvider: (provider: string) => void;
}

/** Social sign-in buttons + "or continue with email" divider. */
export const SocialAuthRow: React.FC<SocialAuthRowProps> = ({ onProvider }) => (
  <>
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => { window.location.href = GOOGLE_LOGIN_URL; }}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border-primary bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-sm font-medium transition-colors cursor-pointer"
      >
        <GoogleIcon /> Google
      </button>
      <button
        type="button"
        onClick={() => onProvider('Microsoft')}
        className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border-primary bg-bg-secondary hover:bg-bg-tertiary text-text-primary text-sm font-medium transition-colors cursor-pointer"
      >
        <MicrosoftIcon /> Microsoft
      </button>
    </div>
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border-primary" /></div>
      <div className="relative flex justify-center text-xs"><span className="px-2 bg-bg-secondary text-text-secondary">or continue with email</span></div>
    </div>
  </>
);

interface AuthLayoutProps {
  children: React.ReactNode;
  panelTitle?: string;
  panelSubtitle?: string;
}

/**
 * Two-panel auth shell: form on the left, branded illustration on the right
 * (the right panel collapses on small screens). Theme-token aware.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  panelTitle = 'Plan, track, and ship together.',
  panelSubtitle = 'Everything your team needs to run a sprint — boards, calendar, insights and notes in one workspace.',
}) => (
  <div className="min-h-screen w-full bg-bg-primary flex items-center justify-center sm:p-6">
    <div className="w-full max-w-5xl bg-bg-secondary sm:rounded-3xl sm:shadow-2xl sm:border sm:border-border-primary/60 overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-screen sm:min-h-[660px]">
      {/* Left — form */}
      <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-12 py-10">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow shadow-purple-500/20">
              <Zap size={18} />
            </div>
            <span className="font-bold text-lg text-text-heading tracking-tight">TrackFlows</span>
          </div>
          {children}
        </div>
      </div>

      {/* Right — brand panel */}
      <div className="hidden lg:flex relative flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 text-white">
        {/* soft glows */}
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 -left-10 w-56 h-56 rounded-full bg-indigo-400/20 blur-3xl" />

        {/* Mock product window */}
        <div className="relative mt-4">
          <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl space-y-3 max-w-xs">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
            </div>
            {[
              { w: 'w-3/4', done: true },
              { w: 'w-full', done: false },
              { w: 'w-2/3', done: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className={`w-4 h-4 rounded-md flex-shrink-0 border ${r.done ? 'bg-emerald-300 border-emerald-200' : 'border-white/50'}`} />
                <div className="flex-1 space-y-1">
                  <div className={`h-2 rounded-full bg-white/40 ${r.w}`} />
                </div>
                <span className="w-6 h-6 rounded-full bg-white/30 flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Floating feature chips */}
          <div className="absolute -right-2 -top-3 bg-white text-purple-600 rounded-xl px-3 py-2 shadow-xl flex items-center gap-1.5 text-xs font-semibold rotate-3">
            <BarChart3 size={14} /> Insights
          </div>
          <div className="absolute -left-3 bottom-2 bg-white text-indigo-600 rounded-xl px-3 py-2 shadow-xl flex items-center gap-1.5 text-xs font-semibold -rotate-3">
            <CheckSquare size={14} /> 12 done
          </div>
          <div className="absolute right-6 -bottom-5 bg-white text-emerald-600 rounded-xl px-3 py-2 shadow-xl flex items-center gap-1.5 text-xs font-semibold rotate-2">
            <Users size={14} /> Team
          </div>
        </div>

        {/* Tagline + dots */}
        <div className="relative space-y-3">
          <h2 className="text-2xl font-bold leading-snug">{panelTitle}</h2>
          <p className="text-sm text-white/80 leading-relaxed max-w-sm">{panelSubtitle}</p>
          <div className="flex gap-1.5 pt-1" aria-hidden="true">
            <span className="w-6 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
