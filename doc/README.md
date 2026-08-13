# Authentication Components

Professional authentication UI components with light theme design, including Sign Up, Sign In with OTP verification.

## Components

### 1. **SignUp Component**
User registration form with validation.

**Features:**
- First name, last name, email, and password fields
- Password confirmation validation
- Terms & Conditions agreement
- Email validation
- Password strength requirements (min 8 characters)
- Show/hide password toggle
- Real-time error messages
- Loading state during submission

**Usage:**
```tsx
import { SignUp } from './components/auth';

<SignUp
  onSignUpSuccess={(email) => {
    // Handle successful signup, redirect to OTP verification
  }}
  onSwitchToSignIn={() => {
    // Switch to sign in form
  }}
/>
```

### 2. **SignIn Component**
User login form with email and password.

**Features:**
- Email and password fields
- "Remember me" checkbox (30 days)
- Forgot password link
- Email validation
- Show/hide password toggle
- Real-time error messages
- Loading state during submission

**Usage:**
```tsx
import { SignIn } from './components/auth';

<SignIn
  onSignInSuccess={() => {
    // Handle successful login, redirect to dashboard
  }}
  onSwitchToSignUp={() => {
    // Switch to sign up form
  }}
  onForgotPassword={() => {
    // Handle forgot password flow
  }}
/>
```

### 3. **OTPVerification Component**
Email verification with 6-digit OTP code.

**Features:**
- 6-digit OTP input with auto-focus
- Paste OTP directly into any field
- Keyboard navigation (arrow keys, backspace)
- 60-second resend timer
- Masked email display
- Real-time error messages
- Loading state during verification

**Usage:**
```tsx
import { OTPVerification } from './components/auth';

<OTPVerification
  email="user@example.com"
  onVerificationSuccess={() => {
    // Handle successful verification, redirect to dashboard
  }}
  onBackToSignUp={() => {
    // Go back to sign up
  }}
  onResendOTP={async () => {
    // Handle resend OTP API call
  }}
/>
```

### 4. **AuthPage Component** (Main Container)
Manages the complete authentication flow between Sign Up, Sign In, and OTP verification.

**Features:**
- Handles routing between authentication steps
- Manages email state across steps
- Integrates all three components
- Manages OTP resend functionality

**Usage:**
```tsx
import { AuthPage } from './components/auth';

// Option 1: Use AuthPage directly (recommended for auth routes)
<AuthPage
  onAuthSuccess={() => {
    // Redirect to dashboard
    navigate('/dashboard');
  }}
/>

// Option 2: Use individual components for custom flows
import { SignUp, SignIn, OTPVerification } from './components/auth';
```

## Integration with App.tsx

To integrate authentication into your main App:

```tsx
import { useState } from 'react';
import { AuthPage } from './components/auth';
import { KanbanBoard } from './components/KanbanBoard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <AuthPage
        onAuthSuccess={() => {
          setIsAuthenticated(true);
          // Optional: fetch user data, set auth token, etc.
        }}
      />
    );
  }

  return (
    // Your main dashboard/app layout
    <KanbanBoard />
  );
}

export default App;
```

## API Endpoints Required

The authentication components make API calls to these endpoints (update URLs in components):

1. **Sign Up**
   - `POST /api/auth/signup`
   - Body: `{ firstName, lastName, email, password }`

2. **Sign In**
   - `POST /api/auth/signin`
   - Body: `{ email, password, rememberMe }`

3. **Verify OTP**
   - `POST /api/auth/verify-otp`
   - Body: `{ email, otp }`

4. **Resend OTP**
   - `POST /api/auth/resend-otp`
   - Body: `{ email }`

## Styling & Theme

All components use:
- **Tailwind CSS** for styling
- **Light theme** (white background, blue accent color #1a73e8)
- **Responsive design** (mobile, tablet, desktop)
- **Lucide Icons** for UI icons (Eye, EyeOff, AlertCircle, CheckCircle, Mail, ArrowLeft)

Color scheme matches your existing application:
- Primary: Blue (#1a73e8)
- Secondary: Gray (#70757a)
- Error: Red (#e53e3e)
- Success: Green (#48bb78)

## Validation

### Sign Up Validation
- First name: Required, non-empty
- Last name: Required, non-empty
- Email: Required, valid email format
- Password: Required, minimum 8 characters
- Confirm Password: Must match password
- Terms & Conditions: Must be agreed

### Sign In Validation
- Email: Required, valid email format
- Password: Required, non-empty

### OTP Validation
- 6-digit code required
- Numbers only
- Auto-submission on completion

## Features Included

✅ Form validation with real-time error messages  
✅ Show/hide password toggles  
✅ Loading states during submission  
✅ Success messages with auto-redirect  
✅ Responsive design (mobile-first)  
✅ Keyboard navigation support  
✅ Clipboard paste support for OTP  
✅ Auto-focus between input fields  
✅ 60-second resend timer  
✅ Masked email display  
✅ Remember me functionality  
✅ Forgot password link  
✅ Terms & Conditions checkbox  

## Customization

To customize colors, fonts, or styling, edit the Tailwind classes in each component:

```tsx
// Example: Change button color
className="bg-blue-600 hover:bg-blue-700"
// Change to:
className="bg-purple-600 hover:bg-purple-700"
```

## Accessibility

- Semantic HTML labels
- Keyboard navigation support
- ARIA labels for icons
- Focus states for all interactive elements
- Error messages linked to form fields
- Color contrast compliance

## Future Enhancements

- [ ] Forgot password flow
- [ ] Social login (Google, Apple, GitHub)
- [ ] Two-factor authentication
- [ ] Biometric authentication
- [ ] Session management
- [ ] Refresh token handling
- [ ] Rate limiting for OTP attempts
