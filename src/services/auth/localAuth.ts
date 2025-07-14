import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, SignupCredentials, User } from '../../types/auth';

// Simple local authentication service
class LocalAuthService {
  private USERS_KEY = '@bini_users';
  private CURRENT_USER_KEY = '@bini_current_user';

  // Generate a simple user ID
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Get all stored users
  private async getStoredUsers(): Promise<Record<string, User>> {
    try {
      const usersJson = await AsyncStorage.getItem(this.USERS_KEY);
      return usersJson ? JSON.parse(usersJson) : {};
    } catch {
      return {};
    }
  }

  // Save users to storage
  private async saveUsers(users: Record<string, User>): Promise<void> {
    await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Email/Password Sign Up
  async signUp(credentials: SignupCredentials): Promise<User> {
    // Validate passwords match
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Basic validation
    if (!credentials.email || !credentials.password || !credentials.name) {
      throw new Error('All fields are required');
    }

    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    const users = await this.getStoredUsers();
    if (users[credentials.email]) {
      throw new Error('An account with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      email: credentials.email,
      name: credentials.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store user with password (in real app, you'd hash this)
    const userWithPassword = {
      ...newUser,
      password: credentials.password, // In production, hash this!
    };

    users[credentials.email] = userWithPassword;
    await this.saveUsers(users);

    // Set as current user
    await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

    return newUser;
  }

  // Email/Password Sign In
  async signIn(credentials: LoginCredentials): Promise<User> {
    const users = await this.getStoredUsers();
    const userWithPassword = users[credentials.email];

    if (!userWithPassword) {
      throw new Error('No account found with this email address');
    }

    // Check password (in real app, you'd compare hashes)
    if (userWithPassword.password !== credentials.password) {
      throw new Error('Incorrect password');
    }

    // Remove password from returned user object
    const user: User = {
      id: userWithPassword.id,
      email: userWithPassword.email,
      name: userWithPassword.name,
      createdAt: new Date(userWithPassword.createdAt),
      updatedAt: new Date(userWithPassword.updatedAt),
    };

    // Set as current user
    await AsyncStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));

    return user;
  }

  // Get current user (for auto-login)
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(this.CURRENT_USER_KEY);
      if (userJson) {
        const user = JSON.parse(userJson);
        return {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Password Reset (just clears the password for demo)
  async resetPassword(email: string): Promise<void> {
    const users = await this.getStoredUsers();
    if (!users[email]) {
      throw new Error('No account found with this email address');
    }
    // In a real app, you'd send an email here
    throw new Error('Password reset would be sent to your email');
  }
}

export default new LocalAuthService();