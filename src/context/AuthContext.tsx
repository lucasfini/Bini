// src/context/AuthContext.tsx - Updated to use Supabase
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, User, LoginCredentials, SignupCredentials } from '../types/auth';
import SupabaseAuthService from '../services/auth/supabaseAuth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing user on app start
    const checkCurrentUser = async () => {
      try {
        console.log('🔍 Checking for current user...');
        
        const currentUser = await SupabaseAuthService.getCurrentUser();
        
        if (currentUser) {
          console.log('✅ Current user found:', currentUser.name);
          setUser(currentUser);
        } else {
          console.log('📝 No current user found');
        }
      } catch (err) {
        console.error('❌ Auth check failed:', err);
        setError('Failed to check authentication status');
      } finally {
        setIsLoading(false);
      }
    };

    checkCurrentUser();
  }, []);

  const clearError = () => setError(null);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      // Check for development bypass
      if (credentials.email === 'dev@test.com' && credentials.password === 'testpass123') {
        console.log('🚀 Using development bypass...');
        const mockUser = {
          id: 'dev-user-123',
          name: 'Dev User',
          email: 'dev@test.com',
          partnerId: null,
          partnerLinked: false
        };
        setUser(mockUser);
        console.log('✅ Development login successful');
        return;
      }
      
      console.log('🚀 Attempting login...');
      const user = await SupabaseAuthService.signIn(credentials);
      setUser(user);
      console.log('✅ Login successful for:', user.name);
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log('🚀 Attempting signup...');
      const user = await SupabaseAuthService.signUp(credentials);
      setUser(user);
      console.log('✅ Signup successful for:', user.name);
    } catch (err: any) {
      console.error('❌ Signup failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    throw new Error('Google Sign-In coming in a future step');
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      
      console.log('🚀 Attempting logout...');
      await SupabaseAuthService.signOut();
      setUser(null);
      console.log('✅ Logout successful');
    } catch (err: any) {
      console.error('❌ Logout failed:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const linkPartner = async (data: any): Promise<void> => {
    console.log('Partner linking coming in a future step:', data);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    signInWithGoogle,
    logout,
    linkPartner,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};