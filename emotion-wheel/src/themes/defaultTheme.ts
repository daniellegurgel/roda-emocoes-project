import type { EmotionWheelTheme } from '../types/emotion-wheel';

export const defaultTheme: EmotionWheelTheme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    background: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
    hover: '#f3f4f6',
    selected: '#dbeafe',
    disabled: '#9ca3af',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px',
    },
    fontWeight: {
      normal: 400,
      bold: 600,
    },
  },
  spacing: {
    small: '4px',
    medium: '8px',
    large: '16px',
  },
  radii: {
    small: '4px',
    medium: '8px',
    large: '12px',
  },
};