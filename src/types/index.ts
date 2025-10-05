export interface EmotionColor {
  classe: string;
  hex: string;
}

export interface EmotionColors {
  centro: EmotionColor;
  meio: EmotionColor;
  externa: EmotionColor;
}

export interface Emotion {
  nivel: 'primaria' | 'secundaria' | 'terciaria';
  tamanho_original?: number;
  comportamento: string;
  cores?: EmotionColors;
  emocao_primaria?: string;
  emocao_secundaria?: string;
}

export interface EmotionsData {
  metadata: {
    versao: string;
    autor: string;
    total_emocoes: number;
    primarias: number;
    secundarias: number;
    terciarias: number;
  };
  emocoes: Record<string, Emotion>;
}

export interface EmotionWheelProps {
  data: EmotionsData;
  onEmotionClick?: (emotion: string, data: Emotion) => void;
  onEmotionHover?: (emotion: string | null, data: Emotion | null) => void;
  disabledEmotions?: string[];
  viewBox?: string;
  width?: number | string;
  height?: number | string;
  padding?: number;
  className?: string;
  style?: React.CSSProperties;
  showLabels?: boolean;
  labelFormatter?: (name: string) => string;
  centerComponent?: React.ReactNode;
  colorScheme?: Partial<Record<string, string>>;
}
