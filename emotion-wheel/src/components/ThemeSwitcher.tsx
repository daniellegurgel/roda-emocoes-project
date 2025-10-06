import React from 'react';
import type { EmotionWheelTheme } from '../types/emotion-wheel';
import { defaultTheme } from '../themes/defaultTheme';
import { darkTheme } from '../themes/darkTheme';
import { colorfulTheme } from '../themes/colorfulTheme';

interface ThemeSwitcherProps {
  currentTheme: EmotionWheelTheme;
  onThemeChange: (theme: EmotionWheelTheme) => void;
}

const themes = [
  { name: 'Default', theme: defaultTheme },
  { name: 'Dark', theme: darkTheme },
  { name: 'Colorful', theme: colorfulTheme },
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Escolha um tema:</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {themes.map(({ name, theme }) => (
          <button
            key={name}
            onClick={() => onThemeChange(theme)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '2px solid',
              borderColor: currentTheme === theme ? theme.colors.primary : '#e5e7eb',
              backgroundColor: currentTheme === theme ? theme.colors.primary : 'white',
              color: currentTheme === theme ? 'white' : '#374151',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (currentTheme !== theme) {
                e.currentTarget.style.backgroundColor = theme.colors.hover;
                e.currentTarget.style.borderColor = theme.colors.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (currentTheme !== theme) {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSwitcher;