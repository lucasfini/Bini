import { Dimensions } from 'react-native';

// Updated Color Palette - Clean minimal design
export const colors = {
  // Base colors for minimal timeline design
  background: '#FAFAFA',        // Light gray background
  surface: '#FFFFFF',           // White cards/surfaces
  border: '#F0F0F0',           // Light borders
  borderLight: '#F8F8F8',      // Even lighter borders
  
  // Text hierarchy
  textPrimary: '#333333',       // Main text
  textSecondary: '#666666',     // Secondary text
  textTertiary: '#999999',      // Tertiary text/labels
  textDisabled: '#CCCCCC',      // Disabled text
  
  // Configurable accent colors (user can choose theme)
  accentPrimary: '#FF6B9D',     // Pink - for shared tasks, today indicator
  accentSecondary: '#6B73FF',   // Blue - default accent
  accentWarning: '#FF6B6B',     // Red - high priority, errors
  accentSuccess: '#4CAF50',     // Green - completed states
  accentInfo: '#17A2B8',        // Teal - info states
  
  // Legacy colors (keeping for backward compatibility)
  primary: '#FF6B9D',           // Maps to accentPrimary
  primaryLight: '#FF8FB3',
  primaryDark: '#E55A89',
  
  secondary: '#6B73FF',         // Maps to accentSecondary
  secondaryLight: '#8B93FF',
  secondaryDark: '#4B53DD',
  
  // Status colors
  success: '#4CAF50',
  error: '#FF6B6B',
  warning: '#FFC107',
  info: '#17A2B8',
  
  // Task-specific colors
  completed: '#999999',         // Completed task text
  todo: '#FF6B9D',             // TODO status
  shared: '#FF6B9D',           // Shared task indicator
  individual: '#6B73FF',        // Individual task indicator
  
  // Timeline specific
  timelineDot: '#E0E0E0',
  timelineActive: '#FF6B9D',    // Active timeline elements
  
  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Shadows and overlays
  shadowColor: 'rgba(0,0,0,0.08)',
  overlayLight: 'rgba(255,255,255,0.95)',
  overlayDark: 'rgba(0,0,0,0.8)',
  
  // Legacy couple-themed colors
  heart: '#FF6B6B',
  couple: '#FF6B9D',
  lightBlue: '#B8D4E3',
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
    display: 48,    // For large date numbers
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

// Shadows - Minimal approach
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
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
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
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

// Theme configuration for accent colors
export const themes = {
  pink: {
    primary: '#FF6B9D',
    secondary: '#6B73FF',
  },
  blue: {
    primary: '#6B73FF',
    secondary: '#FF6B9D',
  },
  green: {
    primary: '#4CAF50',
    secondary: '#FF6B9D',
  },
  red: {
    primary: '#FF6B6B',
    secondary: '#6B73FF',
  },
} as const;

export type ThemeKey = keyof typeof themes;