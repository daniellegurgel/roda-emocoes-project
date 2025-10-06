import type { EmotionWheelTheme } from '../types/emotion-wheel';

export const darkTheme: EmotionWheelTheme = {
  colors: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    background: '#1f2937',
    text: '#f9fafb',
    border: '#374151',
    hover: '#374151',
    selected: '#1e40af',
    disabled: '#6b7280',
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