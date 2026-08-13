# Integration Guide - Authentication Components

This guide shows how to integrate the authentication components into your existing application.

## Quick Start

### 1. Basic Integration (Simplest)

Update your `App.tsx`:

```tsx
import { useState } from 'react';
import { AuthPage } from './components/auth';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/KanbanBoard';
import { HomeView } from './components/HomeView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <AuthPage
        onAuthSuccess={() => {
          setIsAuthenticated(true);
          // TODO: Fetch user profile, set auth token, etc.
        }}
      />
    );
  }

  // Your existing app layout
  return (
    <div className="flex h-screen bg-white">
      <Sidebar {...sidebarProps} />
      <main className="flex-1">
        {/* Your app content */}
      </main>
    </div>
  );
}

export default App;
```

### 2. Advanced Integration with Auth State Management

Create `src/contexts/AuthContext.tsx`:

```tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; firstName: string; lastName: string } | null;
  authToken: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  const login = useCallback(async (credentials: any) => {
    // API call logic
    setIsAuthenticated(true);
    // setUser, setAuthToken, etc.
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    setAuthToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, authToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

Update `App.tsx`:

```tsx
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth';
import { DashboardLayout } from './components/DashboardLayout';

function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <DashboardLayout /> : <AuthPage />;
}

export default App;
```

### 3. Protected Routes (With React Router)

If using React Router:

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/auth';
import { KanbanBoard } from './components/KanbanBoard';
import { HomeView } from './components/HomeView';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

## API Integration

### Setting Up API Client

Create `src/api/client.ts`:

```tsx
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### Update Components to Use API Client

Update `src/components/auth/SignUp.tsx`:

```tsx
import apiClient from '../../api/client';

// Inside handleSubmit:
const response = await apiClient.post('/auth/signup', {
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  password: formData.password,
});

const { token, user } = response.data;
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify(user));
```

### Backend Endpoints Configuration

Create `.env.development`:

```
VITE_API_URL=http://localhost:8080
VITE_AUTH_ENDPOINT=/api/auth
```

Update `src/api/config.ts`:

```tsx
export const AUTH_API = {
  SIGNUP: `${import.meta.env.VITE_AUTH_ENDPOINT}/signup`,
  SIGNIN: `${import.meta.env.VITE_AUTH_ENDPOINT}/signin`,
  VERIFY_OTP: `${import.meta.env.VITE_AUTH_ENDPOINT}/verify-otp`,
  RESEND_OTP: `${import.meta.env.VITE_AUTH_ENDPOINT}/resend-otp`,
  REFRESH_TOKEN: `${import.meta.env.VITE_AUTH_ENDPOINT}/refresh-token`,
  LOGOUT: `${import.meta.env.VITE_AUTH_ENDPOINT}/logout`,
};
```

## Backend Integration (Spring Boot)

### Required Controllers

Create `UserController.java`:

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

  @PostMapping("/signup")
  public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) {
    // 1. Validate request
    // 2. Check if email exists
    // 3. Hash password
    // 4. Save user
    // 5. Generate OTP
    // 6. Send OTP email
    return ResponseEntity.ok(new SignUpResponse(message, email));
  }

  @PostMapping("/signin")
  public ResponseEntity<?> signIn(@RequestBody SignInRequest request) {
    // 1. Find user by email
    // 2. Validate password
    // 3. Generate JWT token
    // 4. Return token and user info
    return ResponseEntity.ok(new SignInResponse(token, user));
  }

  @PostMapping("/verify-otp")
  public ResponseEntity<?> verifyOtp(@RequestBody OtpRequest request) {
    // 1. Validate OTP
    // 2. Mark email as verified
    // 3. Return success
    return ResponseEntity.ok(new VerifyOtpResponse(message, token));
  }

  @PostMapping("/resend-otp")
  public ResponseEntity<?> resendOtp(@RequestBody ResendOtpRequest request) {
    // 1. Generate new OTP
    // 2. Send email
    // 3. Return success
    return ResponseEntity.ok(new ResendOtpResponse(message));
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
    // Invalidate token
    return ResponseEntity.ok(new LogoutResponse(message));
  }
}
```

### Request/Response DTOs

```java
// SignUpRequest.java
public class SignUpRequest {
  private String firstName;
  private String lastName;
  private String email;
  private String password;
  // getters, setters, validators
}

// SignUpResponse.java
public class SignUpResponse {
  private String message;
  private String email;
  // getters, setters
}

// Similar for SignIn, OTP, etc.
```

## Environment Variables

Create `.env` in `frontend/`:

```
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Sprint Planning
VITE_OTP_EXPIRY=600
```

## Testing

### Manual Testing Checklist

- [ ] Sign Up flow with validation
- [ ] Email validation errors
- [ ] Password strength validation
- [ ] Form field error messages
- [ ] Sign In with valid credentials
- [ ] Sign In with invalid credentials
- [ ] OTP input with auto-focus
- [ ] OTP paste functionality
- [ ] Resend OTP timer
- [ ] Keyboard navigation (Tab, Shift+Tab)
- [ ] Mobile responsive layout
- [ ] Dark mode (if applicable)
- [ ] Error handling & messages
- [ ] Loading states
- [ ] Success redirects

### Unit Testing Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SignUp } from './SignUp';

describe('SignUp Component', () => {
  it('renders sign up form', () => {
    render(<SignUp />);
    expect(screen.getByText('Create an account')).toBeInTheDocument();
  });

  it('validates email on submit', async () => {
    render(<SignUp />);
    fireEvent.click(screen.getByText('Create account'));
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('shows password mismatch error', () => {
    render(<SignUp />);
    // Fill form with mismatched passwords
    // Assert error message
  });
});
```

## Security Best Practices

✅ **Store tokens securely**
```tsx
// Use httpOnly cookies (more secure)
// OR in localStorage with token encryption
```

✅ **Validate on both frontend and backend**
- Frontend: UX feedback
- Backend: Security enforcement

✅ **Handle token expiration**
```tsx
// Use refresh token for long sessions
// Redirect to login on 401
```

✅ **Sanitize inputs**
```tsx
// Prevent XSS attacks
// Validate all inputs on backend
```

✅ **Use HTTPS in production**

✅ **Hash passwords**
```java
// Use BCrypt or similar
passwordEncoder.encode(password)
```

## Troubleshooting

### "Module not found" errors
```bash
npm install lucide-react
npm install tailwindcss
```

### CORS errors
```java
// In SecurityConfig.java
@Bean
public WebMvcConfigurer corsConfigurer() {
  return new WebMvcConfigurer() {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
      registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:5173")
        .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
  };
}
```

### API endpoint not found
- Check backend is running on correct port
- Verify API routes in backend
- Check VITE_API_URL environment variable

### OTP not sending
- Check email service configuration
- Verify SMTP settings in backend
- Check email address in form

## Next Steps

1. **Update API endpoints** in auth components
2. **Create backend controllers** for auth endpoints
3. **Set up database** models and repositories
4. **Configure email service** for OTP
5. **Add token management** (JWT, refresh tokens)
6. **Set up error logging** and monitoring
7. **Add analytics** tracking
8. **Configure rate limiting** for security
9. **Set up password reset** flow
10. **Add social login** integration (optional)
