import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Mail, Music } from 'lucide-react';

// Input validation utilities
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export default function AuthPage() {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setMessage('');
    
    if (!email) {
      setEmailError('Email address is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const sanitizedEmail = sanitizeEmail(email);
      await signInWithEmail(sanitizedEmail);
      setIsSubmitted(true);
      setMessage('Check your email for a magic link to sign in!');
    } catch (error) {
      setMessage('Error sending magic link. Please try again.');
      // Don't expose detailed error information to client
      console.warn('Auth error occurred');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      setMessage('Error signing in with Google. Please try again.');
      console.error('Google auth error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="bg-primary p-3 rounded-full">
            <Music className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-foreground">
          Welcome to ChordLine
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Your band management platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-border">
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Email Form */}
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className={cn(
                        "appearance-none relative block w-full pl-12 pr-3 py-3",
                        "border placeholder-muted-foreground",
                        "text-foreground rounded-md focus:outline-none focus:ring-2",
                        "focus:z-10 bg-background",
                        emailError 
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-border focus:ring-primary focus:border-primary"
                      )}
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError(''); // Clear error on input
                      }}
                      disabled={loading}
                    />
                  </div>
                </div>
                {emailError && (
                  <div className="text-red-500 text-sm mt-1">
                    {emailError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className={cn(
                    "group relative w-full flex justify-center py-3 px-4",
                    "border border-transparent text-sm font-medium rounded-md",
                    "text-primary-foreground bg-primary hover:bg-primary/90",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Sign in with Magic Link'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={cn(
                  "w-full flex justify-center items-center py-3 px-4",
                  "border border-border rounded-md shadow-sm",
                  "bg-background text-foreground text-sm font-medium",
                  "hover:bg-accent focus:outline-none focus:ring-2",
                  "focus:ring-offset-2 focus:ring-primary",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-green-50 p-4 rounded-md mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Magic link sent!
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      Check your email and click the link to sign in.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setMessage('');
                  setEmail('');
                }}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                Try a different email
              </button>
            </div>
          )}

          {message && !isSubmitted && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{message}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}