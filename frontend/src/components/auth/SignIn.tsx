import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AuthLayout, SocialAuthRow } from './AuthLayout';
import { useAuthStore } from '../../store/authStore';
import { ApiError } from '../../lib/api';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
}

interface SignInProps {
  onSignInAttempt?: (email: string, challengeId: string) => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-lg border-2 bg-bg-primary text-text-primary placeholder-text-secondary/70 transition-colors focus:outline-none ${
    hasError ? 'border-rose-500 focus:border-rose-500' : 'border-border-primary focus:border-purple-500 hover:border-text-secondary/40'
  }`;

export const SignIn: React.FC<SignInProps> = ({ onSignInAttempt, onSwitchToSignUp, onForgotPassword }) => {
  const signin = useAuthStore((s) => s.signin);
  const [formData, setFormData] = useState<SignInFormData>({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // guard against double submit
    setSuccessMessage('');
    setFormError('');
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const challengeId = await signin(formData.email, formData.password);
      setSuccessMessage('Credentials verified! Sending OTP…');
      onSignInAttempt?.(formData.email, challengeId);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-heading">Welcome back</h1>
        <p className="text-sm text-text-secondary mt-1">
          Don't have an account?{' '}
          <button onClick={onSwitchToSignUp} className="text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer">
            Sign up
          </button>
        </p>
      </div>

      {notice && (
        <div role="status" aria-live="polite" className="mb-4 p-3 bg-bg-tertiary border border-border-primary rounded-lg flex items-start gap-2 text-xs text-text-secondary">
          <Info className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
          {notice}
        </div>
      )}

      {successMessage && (
        <div role="status" aria-live="polite" className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-700 dark:text-emerald-400 text-sm">{successMessage}</p>
        </div>
      )}

      {formError && (
        <div role="alert" className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-rose-700 dark:text-rose-400 text-sm">{formError}</p>
        </div>
      )}

      <SocialAuthRow onProvider={(p) => setNotice(`${p} sign-in is not available in this demo — use Google or the email form below.`)} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={inputClass(!!errors.email)}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-rose-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Password</label>
            <button type="button" onClick={onForgotPassword} className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer">
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className={`${inputClass(!!errors.password)} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" role="alert" className="text-rose-500 text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.password}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="w-4 h-4 rounded border-border-primary accent-purple-600 cursor-pointer"
          />
          <span className="text-sm text-text-secondary">Remember me for 30 days</span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all mt-2 shadow-lg shadow-purple-500/20 ${
            isLoading ? 'bg-text-secondary/50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-text-secondary/80">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </AuthLayout>
  );
};
