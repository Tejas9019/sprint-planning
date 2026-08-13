import React, { useState } from 'react';
import { SignUp, SignIn, OTPVerification, AuthPage } from './';

/**
 * Demo page showcasing all authentication components
 * This is useful for testing and visual validation
 * 
 * View this page by importing and rendering it:
 * import AuthDemo from './components/auth/demo';
 * <AuthDemo />
 */

type DemoView = 'signup' | 'signin' | 'otp' | 'full-flow';

export const AuthDemo: React.FC = () => {
  const [demoView, setDemoView] = useState<DemoView>('full-flow');

  const navigationButtons = (
    <div className="fixed top-4 left-4 right-4 z-50 flex gap-2 flex-wrap">
      <button
        onClick={() => setDemoView('full-flow')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          demoView === 'full-flow'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Full Auth Flow
      </button>
      <button
        onClick={() => setDemoView('signin')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          demoView === 'signin'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Sign In
      </button>
      <button
        onClick={() => setDemoView('signup')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          demoView === 'signup'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Sign Up
      </button>
      <button
        onClick={() => setDemoView('otp')}
        className={`px-4 py-2 rounded-lg font-medium transition ${
          demoView === 'otp'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        OTP Verification
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {navigationButtons}

      {demoView === 'full-flow' && (
        <AuthPage
          onAuthSuccess={() => {
            alert('Authentication successful! In production, redirect to dashboard.');
          }}
        />
      )}

      {demoView === 'signin' && (
        <SignIn
          onSignInAttempt={() => {
            alert('Sign in successful!');
          }}
          onSwitchToSignUp={() => setDemoView('signup')}
          onForgotPassword={() => {
            alert('Forgot password clicked!');
          }}
        />
      )}

      {demoView === 'signup' && (
        <SignUp
          onSignUpSuccess={() => {
            alert('Sign up successful!');
            setDemoView('otp');
          }}
          onSwitchToSignIn={() => setDemoView('signin')}
        />
      )}

      {demoView === 'otp' && (
        <OTPVerification
          email="user@example.com"
          challengeId="demo-challenge"
          onVerificationSuccess={() => {
            alert('OTP verified successfully!');
          }}
          onBackToSignUp={() => setDemoView('signup')}
        />
      )}
    </div>
  );
};

export default AuthDemo;
