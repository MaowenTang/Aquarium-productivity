import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { supabase } from '../utils/supabaseClient';

interface LoginScreenProps {
  onLogin: (email: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please try signing in instead.');
            setIsSignUp(false);
            setIsLoading(false);
            return;
          }
          throw error;
        }
        
        console.log('Sign up successful:', data);
        
        // Auto sign in after signup (since email confirmation is disabled)
        const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          console.error('Auto sign-in after signup failed:', signInError);
          setError('Account created successfully! Please try signing in now.');
          setIsSignUp(false);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('Login successful after signup:', session.user.email);
          onLogin(session.user.email!);
        }
      } else {
        // Sign in existing user
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again, or create a new account if you don\'t have one yet.');
          } else if (error.message.includes('Email not confirmed')) {
            setError('Please check your email and confirm your account before signing in.');
          } else {
            setError(`Sign in failed: ${error.message}`);
          }
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          console.log('Login successful:', session.user.email);
          onLogin(session.user.email!);
        } else {
          setError('Login failed: No session created. Please try again.');
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      const errorMessage = error.message || 'Authentication failed';
      
      // Handle network/connection errors
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('NetworkError') ||
          errorMessage.includes('not configured') ||
          errorMessage.includes('fetch')) {
        setError('⚠️ Unable to connect to authentication server. Please check:\n• Your internet connection\n• That Supabase is properly configured');
        setIsLoading(false);
        return;
      }
      
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials or try creating a new account.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else if (errorMessage.includes('Password should be at least')) {
        setError('Password must be at least 6 characters long.');
      } else {
        setError(`Authentication failed: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md backdrop-blur-sm border-2 border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 2, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full flex items-center justify-center"
            >
              <span className="text-2xl">🌊</span>
            </motion.div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Aquarium Serenity
            </CardTitle>
            <CardDescription>
              Dive into peaceful productivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/50 border-blue-200 focus:border-blue-400 rounded-2xl"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Password (minimum 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/50 border-blue-200 focus:border-blue-400 rounded-2xl"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-2xl shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating Account...' : 'Diving In...'}</span>
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Dive In'
                )}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                  disabled={isLoading}
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                </button>
              </div>
            </form>
          </CardContent>
          
          {/* Helper info */}
          <div className="px-6 pb-6">
            <div className="text-xs text-blue-600/70 text-center space-y-1 border-t border-blue-200 pt-3">
              <p>💡 Tip: Create a new account with any email and password (6+ characters)</p>
              <p>Email confirmation is disabled for easy testing</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}