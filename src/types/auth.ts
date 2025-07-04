// Authentication related types

export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface SignupCredentials {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface User {
    id: string;
    email: string;
    name: string;
    partnerId?: string;
    partnerName?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface AuthState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
  }
  
  export interface PartnerLinkData {
    partnerCode: string;
    partnerEmail?: string;
  }
  
  // Form validation types
  export interface ValidationError {
    field: string;
    message: string;
  }
  
  export interface FormValidation {
    isValid: boolean;
    errors: ValidationError[];
  }
  
  // Auth context types
  export interface AuthContextType {
    user: User | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    linkPartner: (data: PartnerLinkData) => Promise<void>;
    isLoading: boolean;
    error: string | null;
  }