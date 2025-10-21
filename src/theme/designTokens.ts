import { Dimensions } from 'react-native';

// Updated Color Palette - Dark theme design
export const colors = {
  background: '#1A1A1A',
  surface: '#2A2A2A',
  border: '#3A3A3A',
  borderLight: '#333333',
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textTertiary: '#999999',
  textDisabled: '#666666',
  accentPrimary: '#FF6B9D',
  accentSecondary: '#6B73FF',
  accentWarning: '#FF6B6B',
  accentSuccess: '#4CAF50',
  accentInfo: '#17A2B8',
  primary: '#FF6B9D',
  primaryLight: '#FF8FB3',
  primaryDark: '#E55A89',
  secondary: '#6B73FF',
  secondaryLight: '#8B93FF',
  secondaryDark: '#4B53DD',
  success: '#4CAF50',
  error: '#FF6B6B',
  warning: '#FFC107',
  info: '#17A2B8',
  completed: '#999999',
  todo: '#FF6B9D',
  shared: '#FF6B9D',
  individual: '#6B73FF',
  timelineDot: '#E0E0E0',
  timelineActive: '#FF6B9D',
  white: '#FFFFFF',
  black: '#000000',
  shadowColor: 'rgba(0,0,0,0.08)',
  overlayLight: 'rgba(255,255,255,0.95)',
  overlayDark: 'rgba(0,0,0,0.8)',
  heart: '#FF6B6B',
  couple: '#FF6B9D',
  lightBlue: '#B8D4E3',
} as const;

export const typography = {
  sizes: { xs:12, sm:14, md:16, lg:18, xl:20, xxl:24, xxxl:28, title:32, display:48 },
  weights: {
    light: '300' as const, regular: '400' as const, medium: '500' as const,
    semibold: '600' as const, bold: '700' as const, heavy: '800' as const,
  },
  lineHeights: { tight:1.2, normal:1.4, relaxed:1.6 },
} as const;

export const spacing = { xs:4, sm:8, md:16, lg:24, xl:32, xxl:48, xxxl:64 } as const;

export const borderRadius = { sm:4, md:8, lg:12, xl:16, round:50 } as const;

export const shadows = {
  none:{ shadowColor:'transparent', shadowOffset:{width:0,height:0}, shadowOpacity:0, shadowRadius:0, elevation:0 },
  sm:{ shadowColor: colors.black, shadowOffset:{width:0,height:1}, shadowOpacity:0.05, shadowRadius:2, elevation:1 },
  md:{ shadowColor: colors.black, shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:4, elevation:3 },
  lg:{ shadowColor: colors.black, shadowOffset:{width:0,height:4}, shadowOpacity:0.12, shadowRadius:8, elevation:5 },
} as const;

export const animations = { fast:150, normal:250, slow:350 } as const;

const { width, height } = Dimensions.get('window');
export const layout = {
  window: { width, height },
  isSmallDevice: width < 375,
  isLargeDevice: width >= 414,
} as const;

export const themes = {
  dark: {
    primary:'#FF9FB2', primaryDark:'#FF6B9D', primaryLight:'#FFB8C5',
    secondary:'#9BC4E2', secondaryDark:'#6B73FF', secondaryLight:'#B8D4F0',
    background:'#1A1A1A', surface:'#2A2A2A', surfaceSecondary:'#333333',
    accent:'#FF9FB2', accentSecondary:'#9BC4E2',
    textPrimary:'#FFFFFF', textSecondary:'#CCCCCC', textTertiary:'#999999',
    border:'#3A3A3A', borderLight:'#333333',
    success:'#4CAF50', warning:'#FF8A65', error:'#FF6B6B', info:'#9BC4E2',
  },
  pink: {
    primary:'#FF9FB2', primaryDark:'#FF6B9D', primaryLight:'#FFB8C5',
    secondary:'#9BC4E2', secondaryDark:'#6B73FF', secondaryLight:'#B8D4F0',
    background:'#FEFBFC', surface:'#FFFFFF', surfaceSecondary:'#FFF8FA',
    accent:'#FF9FB2', accentSecondary:'#9BC4E2',
    textPrimary:'#2D1B20', textSecondary:'#5D4A4F', textTertiary:'#8A7479',
    border:'#F5E6EA', borderLight:'#FAF0F3',
    success:'#4CAF50', warning:'#FF8A65', error:'#FF6B6B', info:'#9BC4E2',
  },
  blue: {
    primary:'#9BC4E2', primaryDark:'#6B73FF', primaryLight:'#B8D4F0',
    secondary:'#FF9FB2', secondaryDark:'#FF6B9D', secondaryLight:'#FFB8C5',
    background:'#FBFCFE', surface:'#FFFFFF', surfaceSecondary:'#F8FAFF',
    accent:'#9BC4E2', accentSecondary:'#FF9FB2',
    textPrimary:'#1B2025', textSecondary:'#4A4F5D', textTertiary:'#74798A',
    border:'#E6EAEF', borderLight:'#F0F3FA',
    success:'#4CAF50', warning:'#FF8A65', error:'#FF6B6B', info:'#9BC4E2',
  },
} as const;

export type ThemeKey = keyof typeof themes;
export type Theme = typeof themes.pink;