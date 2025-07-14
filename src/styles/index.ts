import { Dimensions } from 'react-native';

// Color Palette - From your beautiful original design
export const colors = {
  // Primary Colors (from your original design)
  primary: '#4A7C3A',       // Main green
  primaryLight: '#5A8A4A',
  primaryDark: '#2C3E26',
  
  // Secondary Colors 
  secondary: '#D4AF37',     // Gold
  secondaryLight: '#E6C759',
  secondaryDark: '#B8930F',
  
  // Neutral Colors (from your design)
  background: '#F7F3E9',    // Parchment background
  surface: '#FEFEFE',       // White cards
  surfaceSecondary: '#F5F5F5', // Light gray for tabs
  border: '#E5E7EB',        // Light border
  borderLight: '#F0F0F0',   // Even lighter border
  
  // Text Colors
  textPrimary: '#2C3E26',   // Dark green text
  textSecondary: '#5A6B54', // Medium green-gray
  textTertiary: '#9CA3AF',  // Light gray
  
  // Status Colors
  success: '#4A7C3A',       // Green
  error: '#EF4444',         // Red
  warning: '#D4AF37',       // Gold
  info: '#B8D4E3',          // Light blue
  
  // Special Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Couple-themed Colors
  heart: '#EF4444',         // Red for love/heart
  couple: '#EC4899',        // Pink for couples
  
  // Task specific colors
  shared: '#D4AF37',        // Gold for shared tasks
  individual: '#4A7C3A',    // Green for individual tasks
  lightBlue: '#B8D4E3',     // From your palette
  
  // Timeline colors
  timelineDot: '#E0E0E0',   // Gray timeline dots
  timelineActive: '#3D73FF', // Blue for active/highlighted
  
  // UI Enhancement colors (from your original design)
  shadowColor: 'rgba(0,0,0,0.08)',
  overlayLight: 'rgba(255,255,255,0.95)',
  overlayDark: 'rgba(0,0,0,0.8)',
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