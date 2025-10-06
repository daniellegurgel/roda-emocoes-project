import { useState } from 'react';
import { EmotionWheel } from './components/EmotionWheel';
import emotionsData from './data/emotions.json';
import type { EmotionsData, Emotion } from './types';
import './App.css';

function App() {
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEmotionClick = (emotion: string, data: Emotion) => {
    console.log('Clicked:', emotion, data);
  };

  const handleEmotionHover = (emotion: string | null, data: Emotion | null) => {
    if (emotion) {
      console.log('Hovering:', emotion);
    }
  };

  const handleSelectionChange = (newSelection: string[]) => {
    console.log('Selection changed:', newSelection);
    setSelectedEmotions(newSelection);
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

        {/* Botão para abrir modal */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Abrir Roda das Emoções
          </button>
        </div>

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
            onSelectionChange={handleSelectionChange}
            selectedEmotions={selectedEmotions}
            selectionMode="multiple"
            maxSelected={3}
            width="100%"
            style={{ maxWidth: '800px', margin: '0 auto' }}
            enableRotation={true}
            enableZoom={true}
            snapToSectors={true}
            theme={{
              colors: {
                primary: '#e53935',
                secondary: '#42a5f5',
                tertiary: '#66bb6a',
                selected: '#2196f3',
                hover: 'rgba(33, 150, 243, 0.1)',
              }
            }}
          />
        </div>

        {/* Modal */}
        <EmotionWheel
          data={emotionsData as EmotionsData}
          onEmotionClick={handleEmotionClick}
          onEmotionHover={handleEmotionHover}
          onSelectionChange={handleSelectionChange}
          selectedEmotions={selectedEmotions}
          selectionMode="multiple"
          maxSelected={3}
          enableModal={true}
          modalProps={{
            isOpen: isModalOpen,
            onClose: () => setIsModalOpen(false),
            title: 'Selecione suas emoções'
          }}
          enableRotation={true}
          enableZoom={true}
          snapToSectors={true}
          theme={{
            colors: {
              primary: '#e53935',
              secondary: '#42a5f5',
              tertiary: '#66bb6a',
              selected: '#2196f3',
              hover: 'rgba(33, 150, 243, 0.1)',
            }
          }}
        />

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
