# Roda de Emoções - Documentação Técnica

## Visão Geral

A **Roda de Emoções** é um componente React reutilizável e interativo que transforma um SVG de roda de emoções em uma interface de usuário dinâmica. O componente é totalmente configurável através de dados e temas, permitindo reutilização em múltiplas aplicações sem necessidade de reimplantação.

## Características Principais

### 🎨 **Temática Dinâmica**
- Controle completo sobre cores, tipografia, espaçamento e raios
- Suporte a múltiplos temas (Default, Dark, Colorful)
- Integração com ThemeProvider para gerenciamento centralizado

### 📊 **Dados Dinâmicos**
- Emoções, cores e intensidades provenientes de dados externos
- Estrutura hierárquica para grupos e níveis de emoção
- Suporte a labels personalizados e formatação

### 🖱️ **Interatividade Avançada**
- **Clique**: Seleção/deseleção de emoções
- **Arrastar**: Rotação da roda com mouse
- **Scroll**: Zoom in/out com roda do mouse
- **Teclado**: Navegação com setas, Enter, Espaço, Escape
- **Toque**: Suporte a gestos em dispositivos móveis

### ♿ **Acessibilidade**
- Navegação por teclado completa
- Suporte a leitores de tela
- Roles ARIA apropriados
- Foco visível e gerenciamento de foco

### 📱 **Responsividade**
- Adaptação automática a diferentes tamanhos de tela
- SVG responsivo com viewBox
- Controles de zoom e pan para preservar legibilidade

### 🎭 **Animações**
- Transições suaves com Framer Motion
- Animações de hover e seleção
- Inércia opcional para rotação
- Snap-to-sector para alinhamento preciso

## Estrutura do Projeto

```
src/
├── components/
│   ├── EmotionWheel.tsx              # Componente principal
│   ├── EmotionWheelThemeProvider.tsx # Provider de tema
│   ├── EmotionWheelExample.tsx       # Exemplo de uso
│   └── ThemeSwitcher.tsx             # Seletor de temas
├── types/
│   └── emotion-wheel.ts              # Definições de tipos
├── themes/
│   ├── defaultTheme.ts               # Tema padrão
│   ├── darkTheme.ts                  # Tema escuro
│   └── colorfulTheme.ts              # Tema colorido
├── data/
│   └── sampleData.ts                 # Dados de exemplo
└── __tests__/
    └── EmotionWheel.test.tsx         # Testes unitários
```

## API do Componente

### Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `data` | `EmotionWheelData` | - | **Obrigatório.** Dados da roda de emoções |
| `theme` | `EmotionWheelTheme` | - | **Obrigatório.** Configuração do tema |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | Modo de seleção |
| `maxSelected` | `number` | - | Número máximo de emoções selecionáveis |
| `initialView` | `WheelViewState` | `{ angleDeg: 0, scale: 1, translate: { x: 0, y: 0 } }` | Estado inicial da visualização |
| `onSelectionChange` | `(selectedIds: string[]) => void` | - | **Obrigatório.** Callback de mudança de seleção |
| `onViewChange` | `(view: WheelViewState) => void` | - | Callback de mudança de visualização |
| `snapToSectors` | `boolean` | `true` | Ativar snap para setores |
| `snapToleranceDeg` | `number` | `5` | Tolerância em graus para snap |
| `inertia` | `boolean` | `false` | Ativar inércia na rotação |
| `minScale` | `number` | `0.5` | Escala mínima de zoom |
| `maxScale` | `number` | `3.0` | Escala máxima de zoom |
| `enablePan` | `boolean` | `false` | Ativar panning |
| `disableKeyboard` | `boolean` | `false` | Desabilitar navegação por teclado |
| `disableRotation` | `boolean` | `false` | Desabilitar rotação |
| `disableZoom` | `boolean` | `false` | Desabilitar zoom |
| `disableModalCloseOnEsc` | `boolean` | `false` | Desabilitar fechamento com Escape |
| `labelFormatter` | `(label: string, node: EmotionNode) => string` | `(label) => label` | Formatador de labels |

### Estrutura de Dados

#### EmotionWheelData
```typescript
interface EmotionWheelData {
  nodes: EmotionNode[];      // Emoções individuais
  levels: EmotionLevel[];    // Níveis de intensidade
  groups: EmotionGroup[];    // Grupos de emoções
}
```

#### EmotionNode
```typescript
interface EmotionNode {
  id: string;                // Identificador único
  label: string;             // Texto da emoção
  color: string;             // Cor da emoção
  intensity: number;         // Intensidade (0-1)
  parentId?: string;         // ID do pai (opcional)
  pathId: string;            // ID do caminho SVG
  disabled?: boolean;        // Se está desabilitada
  selected?: boolean;        // Se está selecionada
}
```

#### EmotionWheelTheme
```typescript
interface EmotionWheelTheme {
  colors: {
    primary: string;         // Cor primária
    secondary: string;       // Cor secundária
    background: string;      // Cor de fundo
    text: string;           // Cor do texto
    border: string;         // Cor da borda
    hover: string;          // Cor no hover
    selected: string;       // Cor quando selecionado
    disabled: string;       // Cor quando desabilitado
  };
  typography: {
    fontFamily: string;     // Família da fonte
    fontSize: {
      small: string;        // Tamanho pequeno
      medium: string;       // Tamanho médio
      large: string;        // Tamanho grande
    };
    fontWeight: {
      normal: number;       // Peso normal
      bold: number;         // Peso negrito
    };
  };
  spacing: {
    small: string;          // Espaçamento pequeno
    medium: string;         // Espaçamento médio
    large: string;          // Espaçamento grande
  };
  radii: {
    small: string;          // Raio pequeno
    medium: string;         // Raio médio
    large: string;          // Raio grande
  };
}
```

## Exemplos de Uso

### Uso Básico
```tsx
import EmotionWheel from './components/EmotionWheel';
import { EmotionWheelThemeProvider } from './components/EmotionWheelThemeProvider';
import { defaultTheme } from './themes/defaultTheme';
import { sampleEmotionWheelData } from './data/sampleData';

function App() {
  const handleSelectionChange = (selectedIds: string[]) => {
    console.log('Emoções selecionadas:', selectedIds);
  };

  return (
    <EmotionWheelThemeProvider theme={defaultTheme}>
      <EmotionWheel
        data={sampleEmotionWheelData}
        theme={defaultTheme}
        onSelectionChange={handleSelectionChange}
      />
    </EmotionWheelThemeProvider>
  );
}
```

### Uso Avançado
```tsx
<EmotionWheel
  data={emotionData}
  theme={customTheme}
  selectionMode="multiple"
  maxSelected={5}
  initialView={{ angleDeg: 45, scale: 1.2, translate: { x: 10, y: 10 } }}
  onSelectionChange={handleSelectionChange}
  onViewChange={handleViewChange}
  snapToSectors={true}
  inertia={true}
  minScale={0.3}
  maxScale={4.0}
  enablePan={true}
  labelFormatter={(label, node) => `${label} (${node.intensity})`}
/>
```

## Temas Personalizados

### Criando um Tema
```typescript
import { EmotionWheelTheme } from './types/emotion-wheel';

export const myCustomTheme: EmotionWheelTheme = {
  colors: {
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    background: '#f8f9fa',
    text: '#2d3436',
    border: '#ddd',
    hover: '#e9ecef',
    selected: '#007bff',
    disabled: '#6c757d',
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
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
```

## Integração com Backend

### Supabase
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

// Buscar dados de emoções
const { data: emotions } = await supabase
  .from('emotions')
  .select('*');

// Converter para formato do componente
const emotionWheelData: EmotionWheelData = {
  nodes: emotions.map(emotion => ({
    id: emotion.id,
    label: emotion.name,
    color: emotion.color,
    intensity: emotion.intensity,
    pathId: emotion.svg_path,
    disabled: !emotion.active,
  })),
  levels: emotion.levels,
  groups: emotion.groups,
};
```

## Testes

### Executar Testes
```bash
npm test
```

### Testes Disponíveis
- Renderização do componente
- Seleção de emoções
- Navegação por teclado
- Zoom e rotação
- Mudança de tema

## Performance

### Otimizações Implementadas
- `requestAnimationFrame` para animações suaves
- Debouncing em eventos de mouse
- Memoização de callbacks
- Transformações CSS para evitar re-renders
- Lazy loading de animações

### Boas Práticas
- Use `useCallback` para callbacks estáveis
- Evite re-renderizações desnecessárias
- Configure `maxSelected` apropriadamente
- Use temas otimizados para performance

## Acessibilidade

### Recursos Implementados
- Navegação por teclado completa
- Roles ARIA apropriados
- Labels descritivos
- Foco visível
- Suporte a leitores de tela

### Testes de Acessibilidade
```bash
npm run test:a11y
```

## Troubleshooting

### Problemas Comuns

1. **Componente não renderiza**
   - Verifique se os dados estão no formato correto
   - Confirme se o tema está configurado

2. **Interações não funcionam**
   - Verifique se os callbacks estão definidos
   - Confirme se as props estão corretas

3. **Performance lenta**
   - Reduza o número de emoções
   - Desabilite animações se necessário
   - Use `maxSelected` para limitar seleções

### Debug
```typescript
// Ativar logs de debug
<EmotionWheel
  data={data}
  theme={theme}
  onSelectionChange={(ids) => console.log('Selection:', ids)}
  onViewChange={(view) => console.log('View:', view)}
/>
```

## Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes
5. Submeta um pull request

## Licença

MIT License - veja o arquivo LICENSE para detalhes.