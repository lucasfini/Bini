import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, User, LoginCredentials, SignupCredentials } from '../types/auth';
import LocalAuthService from '../services/auth/localAuth';

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
        const currentUser = await LocalAuthService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.log('No existing user found');
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
      const user = await LocalAuthService.signIn(credentials);
      setUser(user);
    } catch (err: any) {
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
      const user = await LocalAuthService.signUp(credentials);
      setUser(user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    throw new Error('Google Sign-In not available in this version');
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      clearError();
      await LocalAuthService.signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const linkPartner = async (data: any): Promise<void> => {
    // TODO: Implement partner linking logic
    console.log('Partner linking not implemented yet:', data);
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