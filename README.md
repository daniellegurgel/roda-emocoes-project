# Roda de Emoções - Componente React Avançado

## 📋 Visão Geral

Este projeto implementa um componente React avançado para visualização interativa da "Roda de Emoções". O componente foi desenvolvido com base nas especificações técnicas fornecidas e inclui funcionalidades avançadas como:

- **Data-driven**: Emoções e configurações vêm de dados externos
- **Theming-driven**: Aparência controlada por temas
- **Interatividade completa**: Seleção, rotação, zoom
- **Acessibilidade total**: Navegação por teclado, ARIA, screen readers
- **Modal integrado**: Com focus trap e body scroll lock

## 🚀 Funcionalidades Implementadas

### ✅ Core Features
- [x] Componente React reutilizável
- [x] Renderização SVG inline
- [x] Sistema de seleção (single/multiple)
- [x] Estados visuais (normal/hover/selecionado/desabilitado)
- [x] Sistema de temas completo
- [x] Dados dinâmicos via JSON

### ✅ Interatividade Avançada
- [x] Rotação por drag com snap e inércia
- [x] Zoom (pinch/scroll/botões) com controles visuais
- [x] Navegação por teclado (Tab, Setas, Enter, Espaço)
- [x] Atalhos de teclado (Shift+R para resetar rotação)

### ✅ Acessibilidade (a11y)
- [x] Navegação completa por teclado
- [x] Atributos ARIA apropriados
- [x] Labels descritivos
- [x] Screen reader support
- [x] Focus management

### ✅ Modal Integration
- [x] Modal com backdrop click para fechar
- [x] Focus trap ativo
- [x] Body scroll lock
- [x] Escape key para fechar
- [x] Header customizável

### ✅ UX/UI
- [x] Responsividade total
- [x] Controles de zoom visuais
- [x] Cursor contextual (grab/grabbing)
- [x] Transições suaves
- [x] Orientação inteligente de texto

## 📦 Instalação

```bash
npm install
npm run dev
```

## 🎯 Uso Básico

```tsx
import { EmotionWheel } from './components/EmotionWheel';
import emotionsData from './data/emotions.json';

function App() {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  return (
    <EmotionWheel
      data={emotionsData}
      onSelectionChange={setSelectedEmotions}
      selectedEmotions={selectedEmotions}
      selectionMode="multiple"
      maxSelected={3}
      enableRotation={true}
      enableZoom={true}
    />
  );
}
```

## ⚙️ API Completa

### Props Principais

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `data` | `EmotionsData` | **obrigatório** | Dados das emoções |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | Modo de seleção |
| `selectedEmotions` | `string[]` | `[]` | Emoções selecionadas (controlado) |
| `maxSelected` | `number` | `undefined` | Máximo de seleções |
| `onSelectionChange` | `(selected: string[]) => void` | `undefined` | Callback de mudança de seleção |

### Recursos Avançados

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `enableRotation` | `boolean` | `false` | Habilita rotação por drag |
| `enableZoom` | `boolean` | `false` | Habilita zoom e controles |
| `enableModal` | `boolean` | `false` | Abre componente em modal |
| `snapToSectors` | `boolean` | `true` | Encaixe em setores na rotação |
| `minScale` | `number` | `0.5` | Escala mínima do zoom |
| `maxScale` | `number` | `3` | Escala máxima do zoom |

### Eventos

| Evento | Parâmetros | Descrição |
|--------|------------|-----------|
| `onEmotionClick` | `(emotion: string, data: Emotion) => void` | Clique em uma emoção |
| `onEmotionHover` | `(emotion: string \| null, data: Emotion \| null) => void` | Hover em uma emoção |
| `onViewChange` | `(viewState: WheelViewState) => void` | Mudança de visualização |

### Tema

```tsx
const theme = {
  colors: {
    primary: '#e53935',
    secondary: '#42a5f5',
    tertiary: '#66bb6a',
    selected: '#2196f3',
    hover: 'rgba(33, 150, 243, 0.1)',
    text: '#333333',
    background: '#ffffff',
    border: '#000000',
    disabled: '#cccccc'
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: {
      primary: '16px',
      secondary: '12px',
      tertiary: '11px'
    }
  }
};
```

## 🎮 Controles do Usuário

### Mouse/Toque
- **Clique**: Selecionar/deselecionar emoção
- **Arrastar**: Rotacionar roda (quando habilitado)
- **Scroll + Ctrl/Cmd**: Zoom (quando habilitado)
- **Pinch**: Zoom no mobile (quando habilitado)

### Teclado
- **Tab/Shift+Tab**: Navegar entre emoções
- **Setas**: Navegação circular entre emoções
- **Enter/Espaço**: Selecionar emoção focada
- **Shift+R**: Resetar rotação para 0°

### Modal
- **Esc**: Fechar modal
- **Clique no backdrop**: Fechar modal
- **Tab**: Navegação interna do modal

## 🔧 Estrutura de Dados

```typescript
interface EmotionsData {
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

interface Emotion {
  nivel: 'primaria' | 'secundaria' | 'terciaria';
  tamanho_original?: number;
  comportamento: string;
  cores?: EmotionColors;
  emocao_primaria?: string;
  emocao_secundaria?: string;
}
```

## 🌟 Exemplos Avançados

### Com Modal e Tema Customizado

```tsx
<EmotionWheel
  data={emotionsData}
  enableModal={true}
  modalProps={{
    isOpen: true,
    onClose: () => setModalOpen(false),
    title: 'Como você está se sentindo?'
  }}
  theme={{
    colors: {
      primary: '#ff6b6b',
      selected: '#4ecdc4',
      text: '#2c3e50'
    }
  }}
/>
```

### Modo Single Selection com Limite

```tsx
<EmotionWheel
  data={emotionsData}
  selectionMode="single"
  enableRotation={true}
  snapToSectors={true}
/>
```

## 📱 Responsividade

O componente é totalmente responsivo e funciona em:
- Desktop (mouse + teclado)
- Tablet (toque + teclado)
- Mobile (toque + gestos)

## ♿ Acessibilidade

- **WCAG 2.1 AA** compliance
- Navegação completa por teclado
- Screen reader otimizado
- Contraste adequado
- Focus indicators claros
- Labels descritivos

## 🔄 Estado de Desenvolvimento

Todas as funcionalidades da especificação técnica foram implementadas:

- ✅ Sistema de seleção avançado
- ✅ Estados visuais temáticos
- ✅ Acessibilidade completa
- ✅ Rotação com drag e snap
- ✅ Sistema de zoom com controles
- ✅ Modal com focus trap
- ✅ Regras de orientação de texto
- ✅ API completa conforme especificado

## 🚀 Próximos Passos

O componente está pronto para produção e pode ser facilmente integrado em qualquer aplicação React. Para versões futuras, considere adicionar:

- Animações com Framer Motion
- Testes automatizados (já estruturado)
- Suporte a gestos mobile nativos
- Internacionalização (i18n)

---

**Desenvolvido com ❤️ para proporcionar a melhor experiência de interação com a Roda de Emoções**