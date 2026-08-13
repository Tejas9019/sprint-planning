import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { AuthLayout, SocialAuthRow } from './AuthLayout';
import { useAuthStore } from '../../store/authStore';
import { ApiError } from '../../lib/api';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
}

interface SignUpProps {
  onSignUpSuccess?: (email: string, challengeId: string) => void;
  onSwitchToSignIn?: () => void;
}

const inputClass = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-lg border-2 bg-bg-primary text-text-primary placeholder-text-secondary/70 transition-colors focus:outline-none ${
    hasError ? 'border-rose-500 focus:border-rose-500' : 'border-border-primary focus:border-purple-500 hover:border-text-secondary/40'
  }`;

export const SignUp: React.FC<SignUpProps> = ({ onSignUpSuccess, onSwitchToSignIn }) => {
  const signup = useAuthStore((s) => s.signup);
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the Terms & Conditions';
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
      const challengeId = await signup({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      setSuccessMessage('Account created! Redirecting to OTP verification…');
      onSignUpSuccess?.(formData.email, challengeId);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pwLen = formData.password.length;
  const pwHint = pwLen === 0 ? '' : pwLen < 8 ? 'Weak — use at least 8 characters' : 'Strong enough';

  return (
    <AuthLayout panelTitle="Start tracking in minutes." panelSubtitle="Create your workspace and invite your team — boards, calendar and insights are ready out of the box.">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-heading">Create an account</h1>
        <p className="text-sm text-text-secondary mt-1">
          Already have an account?{' '}
          <button onClick={onSwitchToSignIn} className="text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer">
            Sign in
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

      <SocialAuthRow onProvider={(p) => setNotice(`${p} sign-up is not available in this demo — use Google or the email form below.`)} />

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary mb-1.5">First name</label>
            <input
              type="text" id="firstName" name="firstName" autoComplete="given-name" placeholder="Jane"
              value={formData.firstName} onChange={handleInputChange}
              aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              className={inputClass(!!errors.firstName)}
            />
            {errors.firstName && <p id="firstName-error" role="alert" className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary mb-1.5">Last name</label>
            <input
              type="text" id="lastName" name="lastName" autoComplete="family-name" placeholder="Doe"
              value={formData.lastName} onChange={handleInputChange}
              aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              className={inputClass(!!errors.lastName)}
            />
            {errors.lastName && <p id="lastName-error" role="alert" className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
          <input
            type="email" id="signup-email" name="email" autoComplete="email" placeholder="you@example.com"
            value={formData.email} onChange={handleInputChange}
            aria-invalid={!!errors.email} aria-describedby={errors.email ? 'signup-email-error' : undefined}
            className={inputClass(!!errors.email)}
          />
          {errors.email && <p id="signup-email-error" role="alert" className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'} id="signup-password" name="password" autoComplete="new-password" placeholder="Create a password"
              value={formData.password} onChange={handleInputChange}
              aria-invalid={!!errors.password} aria-describedby={errors.password ? 'signup-password-error' : 'password-hint'}
              className={`${inputClass(!!errors.password)} pr-10`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition cursor-pointer">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password ? (
            <p id="signup-password-error" role="alert" className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.password}</p>
          ) : pwHint ? (
            <p id="password-hint" className={`text-xs mt-1 ${pwLen < 8 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{pwHint}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" autoComplete="new-password" placeholder="Re-enter your password"
              value={formData.confirmPassword} onChange={handleInputChange}
              aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              className={`${inputClass(!!errors.confirmPassword)} pr-10`}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} aria-pressed={showConfirmPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition cursor-pointer">
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p id="confirmPassword-error" role="alert" className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirmPassword}</p>}
        </div>

        <div>
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange}
              aria-invalid={!!errors.agreeToTerms} aria-describedby={errors.agreeToTerms ? 'terms-error' : undefined}
              className="w-4 h-4 mt-0.5 rounded border-border-primary accent-purple-600 cursor-pointer"
            />
            <span className="text-sm text-text-secondary">
              I agree to the <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">Terms &amp; Conditions</a>
            </span>
          </label>
          {errors.agreeToTerms && <p id="terms-error" role="alert" className="text-rose-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.agreeToTerms}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all mt-2 shadow-lg shadow-purple-500/20 ${
            isLoading ? 'bg-text-secondary/50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isLoading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-text-secondary/80">
        By creating an account, you agree to our Terms of Service and Privacy Policy
      </p>
    </AuthLayout>
  );
};
