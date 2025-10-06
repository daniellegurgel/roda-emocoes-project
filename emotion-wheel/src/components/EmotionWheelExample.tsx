import React, { useState } from 'react';
import EmotionWheel from './EmotionWheel';
import { EmotionWheelThemeProvider } from './EmotionWheelThemeProvider';
import ThemeSwitcher from './ThemeSwitcher';
import { defaultTheme } from '../themes/defaultTheme';
import { sampleEmotionWheelData } from '../data/sampleData';
import type { EmotionNode, EmotionWheelTheme } from '../types/emotion-wheel';

const EmotionWheelExample: React.FC = () => {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [currentTheme, setCurrentTheme] = useState<EmotionWheelTheme>(defaultTheme);
  const [viewState, setViewState] = useState({
    angleDeg: 0,
    scale: 1,
    translate: { x: 0, y: 0 }
  });

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedEmotions(selectedIds);
    console.log('Selected emotions:', selectedIds);
  };

  const handleViewChange = (view: typeof viewState) => {
    setViewState(view);
    console.log('View changed:', view);
  };

  const selectedEmotionData = selectedEmotions.map(id => 
    sampleEmotionWheelData.nodes.find(node => node.id === id)
  ).filter(Boolean) as EmotionNode[];

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      backgroundColor: currentTheme.colors.background,
      color: currentTheme.colors.text,
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '10px',
        color: currentTheme.colors.text 
      }}>
        Roda de Emoções - Exemplo Interativo
      </h1>
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: currentTheme.colors.text,
        opacity: 0.8
      }}>
        Clique nas emoções para selecioná-las. Use o mouse para rotacionar e o scroll para dar zoom.
      </p>
      
      <ThemeSwitcher 
        currentTheme={currentTheme} 
        onThemeChange={setCurrentTheme} 
      />
      
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ color: currentTheme.colors.text }}>Controles:</h3>
        <ul style={{ 
          textAlign: 'left', 
          color: currentTheme.colors.text,
          opacity: 0.8
        }}>
          <li><strong>Clique:</strong> Selecionar/deselecionar emoção</li>
          <li><strong>Arrastar:</strong> Rotacionar a roda</li>
          <li><strong>Scroll:</strong> Zoom in/out</li>
          <li><strong>Setas:</strong> Rotacionar com teclado</li>
          <li><strong>Enter/Espaço:</strong> Selecionar emoção focada</li>
          <li><strong>Escape:</strong> Limpar seleção</li>
        </ul>
      </div>

      <div style={{ 
        border: `2px solid ${currentTheme.colors.border}`, 
        borderRadius: currentTheme.radii.large, 
        overflow: 'hidden',
        marginBottom: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        height: '500px'
      }}>
        <EmotionWheelThemeProvider theme={currentTheme}>
          <EmotionWheel
            data={sampleEmotionWheelData}
            theme={currentTheme}
            selectionMode="multiple"
            maxSelected={5}
            initialView={viewState}
            onSelectionChange={handleSelectionChange}
            onViewChange={handleViewChange}
            snapToSectors={true}
            inertia={true}
            minScale={0.5}
            maxScale={2.0}
            enablePan={true}
          />
        </EmotionWheelThemeProvider>
      </div>

      {selectedEmotionData.length > 0 && (
        <div style={{ 
          backgroundColor: currentTheme.colors.hover, 
          padding: '15px', 
          borderRadius: currentTheme.radii.medium,
          border: `1px solid ${currentTheme.colors.border}`,
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            color: currentTheme.colors.text,
            margin: '0 0 10px 0'
          }}>
            Emoções Selecionadas ({selectedEmotionData.length}):
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {selectedEmotionData.map(emotion => (
              <div
                key={emotion.id}
                style={{
                  backgroundColor: emotion.color,
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: '500',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                }}
              >
                {emotion.label}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        fontSize: '14px', 
        color: currentTheme.colors.text,
        opacity: 0.7
      }}>
        <h4 style={{ color: currentTheme.colors.text }}>Estado da Visualização:</h4>
        <pre style={{ 
          backgroundColor: currentTheme.colors.hover, 
          padding: '10px', 
          borderRadius: currentTheme.radii.small,
          overflow: 'auto',
          border: `1px solid ${currentTheme.colors.border}`,
          color: currentTheme.colors.text
        }}>
          {JSON.stringify(viewState, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EmotionWheelExample;