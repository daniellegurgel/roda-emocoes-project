import type { EmotionWheelData } from '../types/emotion-wheel';

export const sampleEmotionWheelData: EmotionWheelData = {
  nodes: [
    {
      id: 'joy',
      label: 'Joy',
      color: '#fbbf24',
      intensity: 0.8,
      pathId: 'M 200,200 L 250,150 A 50,50 0 0,1 300,200 A 50,50 0 0,1 250,250 Z',
    },
    {
      id: 'sadness',
      label: 'Sadness',
      color: '#3b82f6',
      intensity: 0.6,
      pathId: 'M 200,200 L 150,150 A 50,50 0 0,0 100,200 A 50,50 0 0,0 150,250 Z',
    },
    {
      id: 'anger',
      label: 'Anger',
      color: '#ef4444',
      intensity: 0.9,
      pathId: 'M 200,200 L 250,250 A 50,50 0 0,1 200,300 A 50,50 0 0,1 150,250 Z',
    },
    {
      id: 'fear',
      label: 'Fear',
      color: '#8b5cf6',
      intensity: 0.7,
      pathId: 'M 200,200 L 150,250 A 50,50 0 0,0 100,200 A 50,50 0 0,0 150,150 Z',
    },
    {
      id: 'surprise',
      label: 'Surprise',
      color: '#10b981',
      intensity: 0.5,
      pathId: 'M 200,200 L 250,200 A 50,50 0 0,1 200,250 A 50,50 0 0,1 150,200 Z',
    },
    {
      id: 'disgust',
      label: 'Disgust',
      color: '#f59e0b',
      intensity: 0.4,
      pathId: 'M 200,200 L 200,150 A 50,50 0 0,0 150,200 A 50,50 0 0,0 200,250 Z',
    },
  ],
  levels: [
    {
      minAngle: 0,
      maxAngle: 60,
      radius: 50,
    },
    {
      minAngle: 60,
      maxAngle: 120,
      radius: 100,
    },
    {
      minAngle: 120,
      maxAngle: 180,
      radius: 150,
    },
  ],
  groups: [
    {
      id: 'positive',
      label: 'Positive Emotions',
      color: '#10b981',
      nodes: [],
    },
    {
      id: 'negative',
      label: 'Negative Emotions',
      color: '#ef4444',
      nodes: [],
    },
  ],
};