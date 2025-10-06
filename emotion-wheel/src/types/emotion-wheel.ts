export interface EmotionNode {
  id: string;
  label: string;
  color: string;
  intensity: number;
  parentId?: string;
  pathId: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface EmotionLevel {
  minAngle: number;
  maxAngle: number;
  radius: number;
}

export interface EmotionGroup {
  id: string;
  label: string;
  color: string;
  nodes: EmotionNode[];
}

export interface EmotionWheelData {
  nodes: EmotionNode[];
  levels: EmotionLevel[];
  groups: EmotionGroup[];
}

export interface EmotionWheelTheme {
  colors: {
    primary: string;
    secondary: string;
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
      small: string;
      medium: string;
      large: string;
    };
    fontWeight: {
      normal: number;
      bold: number;
    };
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  radii: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface WheelViewState {
  angleDeg: number;
  scale: number;
  translate: {
    x: number;
    y: number;
  };
}

export interface EmotionWheelProps {
  data: EmotionWheelData;
  theme: EmotionWheelTheme;
  selectionMode?: 'single' | 'multiple';
  maxSelected?: number;
  initialView?: WheelViewState;
  onSelectionChange: (selectedIds: string[]) => void;
  onViewChange?: (view: WheelViewState) => void;
  snapToSectors?: boolean;
  snapToleranceDeg?: number;
  inertia?: boolean;
  minScale?: number;
  maxScale?: number;
  enablePan?: boolean;
  disableKeyboard?: boolean;
  disableRotation?: boolean;
  disableZoom?: boolean;
  disableModalCloseOnEsc?: boolean;
  labelFormatter?: (label: string, node: EmotionNode) => string;
}