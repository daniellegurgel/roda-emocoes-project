import { EmotionWheel } from './components/EmotionWheel';
import emotionsData from './data/emotions.json';
import type { EmotionsData, Emotion } from './types';

function App() {
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Roda das Emoções
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {emotionsData.metadata.total_emocoes} emoções mapeadas
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <EmotionWheel
            data={emotionsData as EmotionsData}
            onEmotionClick={handleEmotionClick}
            onEmotionHover={handleEmotionHover}
            width="100%"
            height="auto"
            className="max-w-4xl mx-auto"
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Informações</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-yellow-500">
                {emotionsData.metadata.primarias}
              </div>
              <div className="text-sm text-gray-600">Primárias</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500">
                {emotionsData.metadata.secundarias}
              </div>
              <div className="text-sm text-gray-600">Secundárias</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-500">
                {emotionsData.metadata.terciarias}
              </div>
              <div className="text-sm text-gray-600">Terciárias</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
