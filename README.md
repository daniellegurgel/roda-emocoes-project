# Roda das Emoções - Componente React

Componente React interativo e reutilizável da Roda das Emoções de Danielle Gurgel, com 126 emoções mapeadas.

## 🎯 Características

- ✅ **126 emoções** organizadas em 3 níveis hierárquicos
- ✅ **Data-driven** - Totalmente configurável via JSON
- ✅ **Agnóstico** - Componente independente e reutilizável
- ✅ **TypeScript** - Tipagem completa
- ✅ **Responsivo** - Adapta-se ao contêiner

## 📊 Estrutura das Emoções

- **6 Primárias**: FELICIDADE, SURPRESA, TRISTEZA, NOJO, RAIVA, MEDO
- **40 Secundárias**: Derivadas das primárias
- **80 Terciárias**: Emoções específicas no contexto de trading

## 🚀 Instalação e Uso

\`\`\`bash
npm install
npm run dev
\`\`\`

## 📦 Uso do Componente

\`\`\`tsx
import { EmotionWheel } from './components/EmotionWheel';
import emotionsData from './data/emotions.json';

<EmotionWheel
  data={emotionsData}
  onEmotionClick={(emotion, data) => console.log(emotion)}
  width="100%"
/>
\`\`\`

## 📄 Licença

Propriedade de Danielle Gurgel - Todos os direitos reservados

**Versão:** 1.0.0 | **Data:** 05/10/2025
