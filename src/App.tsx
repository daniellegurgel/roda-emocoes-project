import { EmotionWheel } from './components/EmotionWheel';
import emotionsData from './data/emotions.json';
import type { EmotionsData, Emotion, EmotionWheelTheme, WheelViewState } from './types';
import './App.css';

function App() {
  const theme: EmotionWheelTheme = {
    colors: {
      label: '#111827',
      labelSecondary: '#374151',
      outline: '#111827',
      focusOutline: '#2563eb',
      selectedOutline: '#f97316',
      disabledOpacity: 0.35,
      hoverOpacity: 0.92,
      selectedOpacity: 1,
    },
    typography: {
      primaryLabelSize: 16,
      secondaryLabelSize: 12,
      tertiaryLabelSize: 11,
      primaryWeight: 700,
      secondaryWeight: 600,
      tertiaryWeight: 600,
    },
  };

  const defaultView: WheelViewState = {
    angleDeg: 0,
    scale: 1,
    translate: { x: 0, y: 0 },
  };

  const handleEmotionClick = (emotion: string, data: Emotion) => {
    console.log('Clicked:', emotion, data);
    alert(`Você clicou em: ${emotion}\n\nNível: ${data.nivel}\nComportamento: ${data.comportamento}`);
  };

  const handleEmotionHover = (emotion: string | null, data: Emotion | null) => {
    if (emotion) {
      console.log('Hovering:', emotion);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 'bold', 
          textAlign: 'center', 
          marginBottom: '0.5rem',
          color: '#1f2937'
        }}>
          Roda das Emoções
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: '#6b7280', 
          marginBottom: '2rem' 
        }}>
          {emotionsData.metadata.total_emocoes} emoções mapeadas
        </p>
        
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          padding: '2rem' 
        }}>
          <EmotionWheel
            data={emotionsData as EmotionsData}
            onEmotionClick={handleEmotionClick}
            onEmotionHover={handleEmotionHover}
            width="100%"
            selectionMode="multiple"
            defaultSelected={["FELICIDADE"]}
            onChange={(ids) => console.log('selected ->', ids)}
            theme={theme}
            defaultViewState={defaultView}
            onViewChange={(v) => console.log('view ->', v)}
            style={{ maxWidth: '800px', margin: '0 auto' }}
          />
        </div>

        <div style={{ 
          marginTop: '2rem', 
          backgroundColor: 'white', 
          borderRadius: '0.5rem', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          padding: '1.5rem' 
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Informações
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '1rem', 
            textAlign: 'center' 
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#eab308' }}>
                {emotionsData.metadata.primarias}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Primárias</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {emotionsData.metadata.secundarias}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Secundárias</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7' }}>
                {emotionsData.metadata.terciarias}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Terciárias</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
