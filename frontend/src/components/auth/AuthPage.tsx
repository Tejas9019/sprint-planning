import React, { useState } from 'react';
import { SignUp } from './SignUp';
import { SignIn } from './SignIn';
import { OTPVerification } from './OTPVerification';

type AuthStep = 'signin' | 'signup' | 'otp';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [currentStep, setCurrentStep] = useState<AuthStep>('signin');
  const [email, setEmail] = useState('');
  // The active OTP challenge id returned by signin/signup — required to verify the code.
  const [challengeId, setChallengeId] = useState('');
  // Remember which screen sent the user to OTP so "Back" returns there correctly.
  const [otpOrigin, setOtpOrigin] = useState<'signin' | 'signup'>('signin');
  const [notice, setNotice] = useState('');

  return (
    <>
      {notice && (currentStep === 'signin' || currentStep === 'signup') && (
        <div role="status" aria-live="polite" className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-50 border border-blue-200 text-blue-800 text-sm px-4 py-2.5 rounded-lg shadow-md max-w-md text-center">
          {notice}
        </div>
      )}

      {currentStep === 'signin' && (
        <SignIn
          onSignInAttempt={(userEmail, newChallengeId) => {
            setEmail(userEmail);
            setChallengeId(newChallengeId);
            setOtpOrigin('signin');
            setCurrentStep('otp');
          }}
          onSwitchToSignUp={() => { setNotice(''); setCurrentStep('signup'); }}
          onForgotPassword={() =>
            setNotice('Password reset is not available in this demo — sign in with your password to receive an OTP.')
          }
        />
      )}

      {currentStep === 'signup' && (
        <SignUp
          onSignUpSuccess={(userEmail, newChallengeId) => {
            setEmail(userEmail);
            setChallengeId(newChallengeId);
            setOtpOrigin('signup');
            setCurrentStep('otp');
          }}
          onSwitchToSignIn={() => { setNotice(''); setCurrentStep('signin'); }}
        />
      )}

      {currentStep === 'otp' && (
        <OTPVerification
          email={email}
          challengeId={challengeId}
          onVerificationSuccess={() => {
            onAuthSuccess?.();
          }}
          onBackToSignUp={() => setCurrentStep(otpOrigin)}
        />
      )}
    </>
  );
};
