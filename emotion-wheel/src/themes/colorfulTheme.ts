import type { EmotionWheelTheme } from '../types/emotion-wheel';

export const colorfulTheme: EmotionWheelTheme = {
  colors: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    background: '#ffeaa7',
    text: '#2d3436',
    border: '#ddd',
    hover: '#fab1a0',
    selected: '#fd79a8',
    disabled: '#b2bec3',
  },
  typography: {
    fontFamily: 'Comic Sans MS, cursive, sans-serif',
    fontSize: {
      small: '12px',
      medium: '16px',
      large: '20px',
    },
    fontWeight: {
      normal: 400,
      bold: 700,
    },
  },
  spacing: {
    small: '6px',
    medium: '12px',
    large: '20px',
  },
  radii: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
};