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

// View (zoom/rotação/pan) state
export interface WheelViewState {
  angleDeg: number; // rotação global (clockwise)
  scale: number; // fator relativo ao viewBox
  translate: { x: number; y: number }; // pan opcional
}

// Tema (tokens mínimos para v1)
export interface EmotionWheelTheme {
  colors: {
    label: string;
    labelSecondary: string;
    outline: string;
    focusOutline: string;
    selectedOutline: string;
    disabledOpacity: number;
    hoverOpacity: number;
    selectedOpacity: number;
  };
  typography: {
    primaryLabelSize: number; // px
    secondaryLabelSize: number; // px
    tertiaryLabelSize: number; // px
    primaryWeight?: number;
    secondaryWeight?: number;
    tertiaryWeight?: number;
  };
}

export type SelectionMode = 'single' | 'multiple';

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
  // Seleção
  selectionMode?: SelectionMode; // default: 'multiple'
  maxSelected?: number; // apenas para 'multiple'
  selected?: string[]; // controlado
  defaultSelected?: string[]; // não-controlado
  onChange?: (selectedIds: string[]) => void;
  // A11y
  ariaLabel?: string;
  getItemAriaLabel?: (emotion: string, data: Emotion) => string;
  // View state (zoom/rotação)
  viewState?: WheelViewState; // controlado
  defaultViewState?: WheelViewState; // não-controlado
  onViewChange?: (view: WheelViewState) => void;
  minScale?: number;
  maxScale?: number;
  snapToSectors?: boolean;
  snapToleranceDeg?: number;
  inertia?: boolean;
  // Tema
  theme?: EmotionWheelTheme;
  // Flags utilitárias
  readOnly?: boolean;
  disabled?: boolean;
}
