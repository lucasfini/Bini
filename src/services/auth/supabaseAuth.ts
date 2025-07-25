// src/services/auth/supabaseAuth.ts
import { supabase } from '../../config/supabase';
import { LoginCredentials, SignupCredentials, User } from '../../types/auth';

class SupabaseAuthService {
  // Generate a simple partner code
  private generatePartnerCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Sign up with email and password
  async signUp(credentials: SignupCredentials): Promise<User> {
    console.log('🚀 Starting Supabase signup for:', credentials.email);
    
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('✅ Auth user created:', authData.user.id);

    // 2. Create profile using the database function for partner code
    try {
      const { data: partnerCodeData, error: codeError } = await supabase
        .rpc('generate_partner_code');

      if (codeError) {
        console.error('❌ Partner code generation failed:', codeError);
        throw new Error('Failed to generate partner code');
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: credentials.email,
          name: credentials.name,
          partner_code: partnerCodeData,
        });

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      console.log('✅ Profile created with partner code:', partnerCodeData);
    } catch (error) {
      console.error('❌ Profile creation error:', error);
      throw error;
    }

    return this.mapSupabaseUser(authData.user, credentials.name);
  }

  // Sign in with email and password
  async signIn(credentials: LoginCredentials): Promise<User> {
    console.log('🚀 Starting Supabase signin for:', credentials.email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      console.error('❌ Signin failed:', error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Sign in failed - no user returned');
    }

    console.log('✅ User signed in:', data.user.id);

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('❌ Profile fetch failed:', profileError);
      // Return user without profile data for now
      return this.mapSupabaseUser(data.user, data.user.email || 'User');
    }

    console.log('✅ Profile fetched for:', profile.name);
    return this.mapSupabaseUser(data.user, profile.name, profile.partner_id);
  }

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('📝 No current user found');
        return null;
      }

      console.log('✅ Current user found:', user.id);

      // Try to get profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Profile fetch failed:', error);
        return this.mapSupabaseUser(user, user.email || 'User');
      }

      return this.mapSupabaseUser(user, profile.name, profile.partner_id);
    } catch (error) {
      console.error('❌ Get current user failed:', error);
      return null;
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Signout failed:', error);
      throw new Error(error.message);
    }
    console.log('✅ User signed out');
  }

  // Placeholder for Google sign in (we'll implement this later)
  async signInWithGoogle(): Promise<User> {
    throw new Error('Google Sign-In coming in a future step');
  }

  // Placeholder for partner linking (we'll implement this later)
  async linkPartner(data: any): Promise<void> {
    console.log('Partner linking coming in a future step:', data);
  }

  // Helper to map Supabase user to our User type
  private mapSupabaseUser(supabaseUser: any, name: string, partnerId?: string): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name,
      partnerId,
      createdAt: new Date(supabaseUser.created_at),
      updatedAt: new Date(),
    };
  }
}

export default new SupabaseAuthService();