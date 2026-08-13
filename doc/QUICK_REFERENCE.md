# Quick Reference - Authentication Components

## 🚀 Quick Start

### View Demo Components
```bash
# Import demo into your App or router
import { AuthDemo } from './components/auth/AuthDemo';
<AuthDemo />
```

### Use Full Authentication Flow
```tsx
import { AuthPage } from './components/auth';

<AuthPage onAuthSuccess={() => navigate('/dashboard')} />
```

### Use Individual Components
```tsx
import { SignUp, SignIn, OTPVerification } from './components/auth';

// Use them separately in custom flows
```

---

## 📦 Component Inventory

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| **SignUp** | User registration | `onSignUpSuccess`, `onSwitchToSignIn` |
| **SignIn** | User login | `onSignInSuccess`, `onSwitchToSignUp`, `onForgotPassword` |
| **OTPVerification** | Email verification | `email`, `onVerificationSuccess`, `onBackToSignUp`, `onResendOTP` |
| **AuthPage** | Auth flow manager | `onAuthSuccess` |
| **AuthDemo** | Component showcase | - |

---

## 🎨 Design Highlights

### Colors Used
```
Primary Blue:    #1a73e8   ← Main action color
White:           #ffffff   ← Background
Light Gray:      #f1f3f4   ← Secondary backgrounds
Dark Gray:       #3c4043   ← Text
Error Red:       #e53e3e   ← Error states
Success Green:   #48bb78   ← Success states
```

### Button Styles
```
Primary (Active):    bg-blue-600 hover:bg-blue-700 text-white
Disabled:           bg-gray-400 cursor-not-allowed
Secondary (Links):  text-blue-600 hover:text-blue-700
```

### Input Fields
```
Default:        border-gray-300 bg-white
Focus:          border-blue-500
Error:          border-red-500 bg-red-50
Disabled:       bg-gray-100 cursor-not-allowed
```

---

## 📱 Form Fields

### SignUp Form
| Field | Validation | Required |
|-------|-----------|----------|
| First Name | Non-empty | ✅ |
| Last Name | Non-empty | ✅ |
| Email | Valid format | ✅ |
| Password | Min 8 chars | ✅ |
| Confirm Pass | Must match | ✅ |
| Terms | Must agree | ✅ |

### SignIn Form
| Field | Validation | Required |
|-------|-----------|----------|
| Email | Valid format | ✅ |
| Password | Non-empty | ✅ |
| Remember Me | 30 days | ❌ |

### OTP Form
| Field | Validation | Required |
|-------|-----------|----------|
| OTP Code | 6 digits | ✅ |

---

## 🔌 API Endpoints

Update these in your components:

```
POST /api/auth/signup
  Body: { firstName, lastName, email, password }
  Response: { message, email }

POST /api/auth/signin
  Body: { email, password, rememberMe }
  Response: { token, user }

POST /api/auth/verify-otp
  Body: { email, otp }
  Response: { token, user }

POST /api/auth/resend-otp
  Body: { email }
  Response: { message }
```

---

## 🔑 Key Features

### SignUp
- ✅ Real-time validation
- ✅ Password strength check
- ✅ Show/hide toggle
- ✅ Terms checkbox
- ✅ Error messages

### SignIn
- ✅ Email validation
- ✅ Password toggle
- ✅ Remember me (30 days)
- ✅ Forgot password link
- ✅ Error messages

### OTPVerification
- ✅ 6-digit input with auto-focus
- ✅ Keyboard navigation
- ✅ Paste-to-fill support
- ✅ 60-second resend timer
- ✅ Masked email display

### AuthPage
- ✅ Flow management
- ✅ Step navigation
- ✅ State persistence
- ✅ OTP resend handling

---

## 🎯 User Flows

### Sign Up Flow
```
1. SignUp form → Fill details
2. Submit → Validation
3. API call → Create account
4. Success → Switch to OTPVerification
5. Enter OTP → Verify email
6. Success → onAuthSuccess()
```

### Sign In Flow
```
1. SignIn form → Enter credentials
2. Submit → Validation
3. API call → Authenticate
4. Success → onSignInSuccess()
5. Redirect to dashboard
```

### OTP Flow
```
1. OTPVerification → Enter 6 digits
2. Auto-submit when complete
3. API call → Verify OTP
4. Error → Show message, allow retry
5. Success → onVerificationSuccess()
```

---

## 📲 Responsive Breakpoints

```
Mobile:     320px - 640px    (Full width, 16px padding)
Tablet:     641px - 1024px   (Max 448px, centered)
Desktop:    1025px+          (Max 448px, centered)
```

---

## ⌨️ Keyboard Navigation

### All Forms
- **Tab** - Next field
- **Shift+Tab** - Previous field
- **Enter** - Submit form
- **Space** - Toggle checkbox

### OTP Verification
- **Tab** - Next digit field
- **Shift+Tab** - Previous digit field
- **Arrow Right** - Next field
- **Arrow Left** - Previous field
- **Backspace** - Clear digit & go back
- **Digit Keys** - Enter number

---

## 🔒 Security Features

- ✅ Password validation (min 8 chars)
- ✅ Email verification with OTP
- ✅ Input sanitization
- ✅ Error handling
- ✅ HTTPS ready
- ✅ Generic error messages (no user enumeration)

---

## 🎓 Integration Steps

### 1. Copy Components
```bash
# Already created in:
frontend/src/components/auth/
```

### 2. Update API URLs
```tsx
// In each component, replace:
const response = await fetch('/api/auth/signup', ...)
// With your actual backend URL
```

### 3. Add to App.tsx
```tsx
import { AuthPage } from './components/auth';

if (!isAuthenticated) {
  return <AuthPage onAuthSuccess={handleAuthSuccess} />;
}
```

### 4. Create Backend Endpoints
```java
// Spring Boot controller with @PostMapping routes
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/verify-otp
POST /api/auth/resend-otp
```

---

## 🧪 Testing Checklist

- [ ] SignUp validation errors
- [ ] SignIn with invalid credentials
- [ ] OTP auto-focus works
- [ ] OTP paste functionality
- [ ] Resend OTP countdown
- [ ] Password toggle visibility
- [ ] Form submission loading state
- [ ] Success message displays
- [ ] Error messages appear
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Console has no errors

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | Component documentation |
| **DESIGN_SYSTEM.md** | Colors, typography, spacing |
| **INTEGRATION_GUIDE.md** | Backend integration steps |
| **PACKAGE_SUMMARY.md** | Complete package overview |
| **QUICK_REFERENCE.md** | This file |

---

## 💡 Tips & Tricks

### Show Demo Page
```tsx
import AuthDemo from './components/auth/AuthDemo';

// View all components with navigation buttons
<AuthDemo />
```

### Custom Error Messages
```tsx
// Add to API response handler
const errorMessage = response.data?.message || 'An error occurred';
setErrors({ email: errorMessage });
```

### Add Loading Overlay
```tsx
// Wrap with loading spinner
{isLoading && <LoadingSpinner />}
```

### Store Auth Token
```tsx
const response = await fetch(...);
if (response.ok) {
  const { token } = await response.json();
  localStorage.setItem('authToken', token);
}
```

---

## 🚨 Common Issues & Solutions

### "lucide-react is not installed"
```bash
npm install lucide-react
```

### CORS errors from backend
```java
// Add to Spring SecurityConfig
registry.addMapping("/api/**")
  .allowedOrigins("http://localhost:5173");
```

### Components not styling correctly
```bash
# Ensure Tailwind is configured:
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init
```

### API endpoints returning 404
- Check backend is running
- Verify endpoint paths match
- Check CORS configuration

---

## 📞 Support

### For component questions, see:
- Component README.md
- DESIGN_SYSTEM.md
- INTEGRATION_GUIDE.md

### For backend issues:
- Check Spring Boot logs
- Verify database connections
- Test endpoints with Postman

### For styling changes:
- Edit Tailwind classes in components
- Reference DESIGN_SYSTEM.md for color codes
- Test on multiple breakpoints

---

## 📋 File Checklist

```
✅ frontend/src/components/auth/
   ✅ SignUp.tsx
   ✅ SignIn.tsx
   ✅ OTPVerification.tsx
   ✅ AuthPage.tsx
   ✅ AuthDemo.tsx
   ✅ index.ts
   ✅ README.md
   ✅ DESIGN_SYSTEM.md
   ✅ INTEGRATION_GUIDE.md
   ✅ PACKAGE_SUMMARY.md
   ✅ QUICK_REFERENCE.md
```

---

**You're all set! 🎉** Start with `AuthDemo` to see the components in action.
