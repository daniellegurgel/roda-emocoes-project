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

export type SelectionMode = 'single' | 'multiple';

export type EmotionLevel = 'primaria' | 'secundaria' | 'terciaria';

export interface WheelViewState {
  angleDeg: number;
  scale: number;
  translate: { x: number; y: number };
}

export interface EmotionWheelTheme {
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    background: string;
    text: string;
    border: string;
    hover: string;
    selected: string;
    disabled: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
  spacing: {
    padding: number;
  };
  animations: {
    duration: number;
    easing: string;
  };
}

export interface EmotionWheelProps {
  // Dados principais
  data: EmotionsData;

  // Seleção
  selectionMode?: SelectionMode;
  selectedEmotions?: string[];
  maxSelected?: number;

  // Eventos
  onEmotionClick?: (emotion: string, data: Emotion) => void;
  onEmotionHover?: (emotion: string | null, data: Emotion | null) => void;
  onSelectionChange?: (selectedEmotions: string[]) => void;
  onViewChange?: (viewState: WheelViewState) => void;

  // Estados e controle
  disabledEmotions?: string[];
  disabled?: boolean;

  // Visualização
  viewBox?: string;
  width?: number | string;
  height?: number | string;
  padding?: number;
  className?: string;
  style?: React.CSSProperties;

  // Rótulos
  showLabels?: boolean;
  labelFormatter?: (name: string) => string;

  // Centro
  centerComponent?: React.ReactNode;

  // Tema
  theme?: Partial<EmotionWheelTheme>;

  // Recursos avançados
  enableRotation?: boolean;
  enableZoom?: boolean;
  enableModal?: boolean;
  modalProps?: {
    isOpen?: boolean;
    onClose?: () => void;
    title?: string;
  };

  // Configurações de comportamento
  snapToSectors?: boolean;
  snapToleranceDeg?: number;
  inertia?: boolean;
  minScale?: number;
  maxScale?: number;

  // Acessibilidade
  ariaLabel?: string;
  ariaLabelledBy?: string;

  // Callbacks de erro
  onError?: (error: Error) => void;
}
