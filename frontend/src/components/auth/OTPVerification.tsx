import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle, Mail, ArrowLeft } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '../../store/authStore';
import { ApiError } from '../../lib/api';

interface OTPVerificationProps {
  email: string;
  challengeId: string;
  onVerificationSuccess?: () => void;
  onBackToSignUp?: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  challengeId,
  onVerificationSuccess,
  onBackToSignUp,
}) => {
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const resendOtp = useAuthStore((s) => s.resendOtp);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30); // initial cooldown so "Resend" isn't instantly clickable
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    setError('');
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    else if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedOtp = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (pastedOtp.length > 0) {
      const newOtp = [...otp];
      pastedOtp.forEach((digit, index) => { if (index < 6) newOtp[index] = digit; });
      setOtp(newOtp);
      const lastIndex = Math.min(pastedOtp.length - 1, 5);
      setTimeout(() => inputRefs.current[lastIndex]?.focus(), 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // guard against double submit
    setError('');
    if (otp.join('').length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }
    setIsLoading(true);
    try {
      await verifyOtp(challengeId, otp.join(''));
      setSuccessMessage('Email verified successfully! Redirecting…');
      onVerificationSuccess?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');
    try {
      await resendOtp(challengeId);
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  return (
    <AuthLayout panelTitle="Almost there." panelSubtitle="Verify your email to secure your workspace and keep your team's data safe.">
      <button onClick={onBackToSignUp} className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:underline font-medium transition mb-6 text-sm cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
          <Mail className="w-7 h-7 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-text-heading">Verify your email</h1>
        <p className="text-sm text-text-secondary mt-1">
          We've sent a 6-digit code to <span className="font-medium text-text-heading">{maskedEmail}</span>
        </p>
      </div>

      {successMessage && (
        <div role="status" aria-live="polite" className="mb-6 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-emerald-700 dark:text-emerald-400 text-sm">{successMessage}</p>
        </div>
      )}
      {error && (
        <div role="alert" className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <p className="text-rose-700 dark:text-rose-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div role="group" aria-labelledby="otp-label">
          <span id="otp-label" className="block text-sm font-medium text-text-secondary mb-3">Enter verification code</span>
          <div className="flex gap-2 justify-between">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                disabled={isLoading}
                aria-label={`Digit ${index + 1} of 6`}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                placeholder="0"
                className={`w-12 h-14 rounded-lg border-2 bg-bg-primary text-text-primary text-center text-xl font-semibold transition-all focus:outline-none disabled:opacity-60 ${
                  error ? 'border-rose-500 focus:border-rose-500' : 'border-border-primary focus:border-purple-500 hover:border-text-secondary/40'
                }`}
                autoComplete="off"
              />
            ))}
          </div>
          <p className="text-xs text-text-secondary/80 mt-3">You can paste the code directly into any field.</p>
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.some((d) => !d)}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all shadow-lg shadow-purple-500/20 ${
            isLoading || otp.some((d) => !d) ? 'bg-text-secondary/50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isLoading ? 'Verifying…' : 'Verify email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-text-secondary text-sm mb-1">Didn't receive the code?</p>
        <button
          onClick={handleResendOTP}
          disabled={resendLoading || resendTimer > 0}
          className={`font-medium transition text-sm ${resendLoading || resendTimer > 0 ? 'text-text-secondary/50 cursor-not-allowed' : 'text-purple-600 dark:text-purple-400 hover:underline cursor-pointer'}`}
        >
          {resendTimer > 0 ? <span>Resend code in {resendTimer}s</span> : <span>{resendLoading ? 'Sending…' : 'Resend code'}</span>}
        </button>
      </div>

      <p className="mt-6 text-center text-xs text-text-secondary/80">This code will expire in 10 minutes</p>
    </AuthLayout>
  );
};
