import { Dimensions } from 'react-native';

// Color Palette
export const colors = {
  // Primary Colors
  primary: '#3B82F6',       // Blue
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  
  // Secondary Colors
  secondary: '#F59E0B',     // Amber
  secondaryLight: '#FCD34D',
  secondaryDark: '#D97706',
  
  // Neutral Colors
  background: '#F8FAFC',    // Light gray
  surface: '#FFFFFF',       // White
  border: '#E5E7EB',        // Light border
  
  // Text Colors
  textPrimary: '#1F2937',   // Dark gray
  textSecondary: '#6B7280', // Medium gray
  textTertiary: '#9CA3AF',  // Light gray
  
  // Status Colors
  success: '#10B981',       // Green
  error: '#EF4444',         // Red
  warning: '#F59E0B',       // Amber
  info: '#3B82F6',          // Blue
  
  // Special Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Couple-themed Colors
  heart: '#EF4444',         // Red for love/heart
  couple: '#EC4899',        // Pink for couples
} as const;

// Typography Scale
export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    title: 32,
  },
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Spacing Scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// Border Radius
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
} as const;

// Shadows
export const shadows = {
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Animation Durations
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Screen Dimensions Helpers
const { width, height } = Dimensions.get('window');

export const layout = {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  isLargeDevice: width >= 414,
} as const;