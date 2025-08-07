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

// Complete Theme Definitions based on startup animation colors
export const themes = {
  pink: {
    // Primary colors from animation
    primary: '#FF9FB2',          // Light pink from animation
    primaryDark: '#FF6B9D',      // Darker pink variant
    primaryLight: '#FFB8C5',     // Lighter pink variant
    
    // Secondary colors from animation  
    secondary: '#9BC4E2',        // Light blue from animation
    secondaryDark: '#6B73FF',    // Darker blue variant
    secondaryLight: '#B8D4F0',   // Lighter blue variant
    
    // Background hierarchy
    background: '#FEFBFC',       // Very light pink tint
    surface: '#FFFFFF',
    surfaceSecondary: '#FFF8FA', // Subtle pink tint
    
    // Accent colors
    accent: '#FF9FB2',
    accentSecondary: '#9BC4E2',
    
    // Text colors
    textPrimary: '#2D1B20',      // Dark with pink undertone
    textSecondary: '#5D4A4F',    // Medium with pink undertone
    textTertiary: '#8A7479',     // Light with pink undertone
    
    // Borders and dividers
    border: '#F5E6EA',           // Light pink border
    borderLight: '#FAF0F3',      // Very light pink border
    
    // Status colors with pink theme
    success: '#4CAF50',
    warning: '#FF8A65',
    error: '#FF6B6B',
    info: '#9BC4E2',
  },
  
  blue: {
    // Primary colors from animation (flipped)
    primary: '#9BC4E2',          // Light blue from animation  
    primaryDark: '#6B73FF',      // Darker blue variant
    primaryLight: '#B8D4F0',     // Lighter blue variant
    
    // Secondary colors from animation
    secondary: '#FF9FB2',        // Light pink from animation
    secondaryDark: '#FF6B9D',    // Darker pink variant
    secondaryLight: '#FFB8C5',   // Lighter pink variant
    
    // Background hierarchy
    background: '#FBFCFE',       // Very light blue tint
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFF', // Subtle blue tint
    
    // Accent colors  
    accent: '#9BC4E2',
    accentSecondary: '#FF9FB2',
    
    // Text colors
    textPrimary: '#1B2025',      // Dark with blue undertone
    textSecondary: '#4A4F5D',    // Medium with blue undertone
    textTertiary: '#74798A',     // Light with blue undertone
    
    // Borders and dividers
    border: '#E6EAEF',           // Light blue border
    borderLight: '#F0F3FA',      // Very light blue border
    
    // Status colors with blue theme
    success: '#4CAF50',
    warning: '#FF8A65', 
    error: '#FF6B6B',
    info: '#9BC4E2',
  },
} as const;

export type ThemeKey = keyof typeof themes;
export type Theme = typeof themes.pink;