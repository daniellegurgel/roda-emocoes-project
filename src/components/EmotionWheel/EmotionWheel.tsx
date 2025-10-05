import React from 'react';
import type { EmotionWheelProps } from '../../types';

const EmotionWheel: React.FC<EmotionWheelProps> = ({
  data,
  onEmotionClick,
  onEmotionHover,
  disabledEmotions = [],
  viewBox = '0 0 1000 1000',
  width = '100%',
  height = 'auto',
  padding = 20,
  className = '',
  style = {},
  showLabels = true,
  labelFormatter = (name) => name,
  centerComponent,
  colorScheme,
}) => {
  // TODO: Implementar lógica de renderização do SVG
  
  return (
    <div className={`emotion-wheel-container ${className}`} style={style}>
      <svg
        viewBox={viewBox}
        width={width}
        height={height}
        className="emotion-wheel-svg"
      >
        {/* Centro da roda */}
        <circle
          cx="500"
          cy="500"
          r="100"
          fill="#f0f0f0"
          stroke="#333"
          strokeWidth="2"
        />
        
        {/* Texto temporário */}
        <text
          x="500"
          y="500"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="24"
          fill="#333"
        >
          Emotion Wheel
        </text>
        
        <text
          x="500"
          y="530"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fill="#666"
        >
          {data.metadata.total_emocoes} emoções
        </text>
      </svg>
    </div>
  );
};

export default EmotionWheel;
