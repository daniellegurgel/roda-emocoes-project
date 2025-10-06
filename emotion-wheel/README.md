# Roda de Emoções (Emotion Wheel)

A reusable React component for interactive emotion selection with customizable themes and data-driven content.

## Features

- 🎨 **Customizable Themes**: Full control over colors, typography, spacing, and radii
- 📊 **Data-Driven**: Emotions, colors, and intensities sourced from external data
- 🖱️ **Interactive**: Click, hover, drag to rotate, scroll to zoom
- ♿ **Accessible**: Keyboard navigation and screen reader support
- 📱 **Responsive**: Adapts to different screen sizes
- 🎭 **Animations**: Smooth transitions and micro-interactions with Framer Motion
- 🔄 **Flexible Selection**: Single or multiple selection modes
- 🎯 **Snap to Sectors**: Optional snap-to-grid functionality
- ⚡ **Performance**: Optimized with requestAnimationFrame and memoization

## Installation

```bash
npm install
```

## Usage

```tsx
import EmotionWheel from './components/EmotionWheel';
import { EmotionWheelThemeProvider } from './components/EmotionWheelThemeProvider';
import { defaultTheme } from './themes/defaultTheme';
import { sampleEmotionWheelData } from './data/sampleData';

function App() {
  const handleSelectionChange = (selectedIds: string[]) => {
    console.log('Selected emotions:', selectedIds);
  };

  return (
    <EmotionWheelThemeProvider theme={defaultTheme}>
      <EmotionWheel
        data={sampleEmotionWheelData}
        theme={defaultTheme}
        selectionMode="multiple"
        maxSelected={3}
        onSelectionChange={handleSelectionChange}
        snapToSectors={true}
        inertia={true}
        minScale={0.5}
        maxScale={2.0}
        enablePan={true}
      />
    </EmotionWheelThemeProvider>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `EmotionWheelData` | - | **Required.** Emotion wheel data including nodes, levels, and groups |
| `theme` | `EmotionWheelTheme` | - | **Required.** Theme configuration for colors, typography, spacing, and radii |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | Selection mode for emotions |
| `maxSelected` | `number` | - | Maximum number of emotions that can be selected |
| `initialView` | `WheelViewState` | `{ angleDeg: 0, scale: 1, translate: { x: 0, y: 0 } }` | Initial view state of the wheel |
| `onSelectionChange` | `(selectedIds: string[]) => void` | - | **Required.** Callback when selection changes |
| `onViewChange` | `(view: WheelViewState) => void` | - | Callback when view state changes |
| `snapToSectors` | `boolean` | `true` | Whether to snap rotation to sectors |
| `snapToleranceDeg` | `number` | `5` | Tolerance in degrees for snap-to-sector |
| `inertia` | `boolean` | `false` | Whether to enable rotation inertia |
| `minScale` | `number` | `0.5` | Minimum zoom scale |
| `maxScale` | `number` | `3.0` | Maximum zoom scale |
| `enablePan` | `boolean` | `false` | Whether to enable panning |
| `disableKeyboard` | `boolean` | `false` | Whether to disable keyboard navigation |
| `disableRotation` | `boolean` | `false` | Whether to disable rotation |
| `disableZoom` | `boolean` | `false` | Whether to disable zoom |
| `disableModalCloseOnEsc` | `boolean` | `false` | Whether to disable closing on Escape key |
| `labelFormatter` | `(label: string, node: EmotionNode) => string` | `(label) => label` | Function to format emotion labels |

## Data Structure

```tsx
interface EmotionWheelData {
  nodes: EmotionNode[];
  levels: EmotionLevel[];
  groups: EmotionGroup[];
}

interface EmotionNode {
  id: string;
  label: string;
  color: string;
  intensity: number;
  parentId?: string;
  pathId: string;
  disabled?: boolean;
  selected?: boolean;
}
```

## Theme Structure

```tsx
interface EmotionWheelTheme {
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
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT