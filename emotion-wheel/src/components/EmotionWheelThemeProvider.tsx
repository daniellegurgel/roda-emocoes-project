import React, { createContext, useContext } from 'react';
import type { EmotionWheelTheme } from '../types/emotion-wheel';
import type { ReactNode } from 'react';

interface EmotionWheelThemeContextType {
  theme: EmotionWheelTheme;
}

const EmotionWheelThemeContext = createContext<EmotionWheelThemeContextType | undefined>(undefined);

interface EmotionWheelThemeProviderProps {
  theme: EmotionWheelTheme;
  children: ReactNode;
}

export const EmotionWheelThemeProvider: React.FC<EmotionWheelThemeProviderProps> = ({
  theme,
  children,
}) => {
  return (
    <EmotionWheelThemeContext.Provider value={{ theme }}>
      {children}
    </EmotionWheelThemeContext.Provider>
  );
};

export const useEmotionWheelTheme = (): EmotionWheelTheme => {
  const context = useContext(EmotionWheelThemeContext);
  if (!context) {
    throw new Error('useEmotionWheelTheme must be used within an EmotionWheelThemeProvider');
  }
  return context.theme;
};