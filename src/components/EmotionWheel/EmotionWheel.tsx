import React, { useMemo } from 'react';
import type { EmotionWheelProps, Emotion } from '../../types';
import {
  createArcPath,
  calculateTextPosition,
  calculateAngleDistribution,
} from '../../utils/svgCalculations';

const EmotionWheel: React.FC<EmotionWheelProps> = ({
  data,
  onEmotionClick,
  onEmotionHover,
  disabledEmotions = [],
  viewBox = '0 0 1000 1000',
  width = '100%',
  height,
  padding = 20,
  className = '',
  style = {},
  showLabels = true,
  labelFormatter = (name) => name,
  centerComponent,
  colorScheme,
}) => {
  // Center and radius calculations
  const centerX = 500;
  const centerY = 500;
  const radiusInner = 150; // Center circle
  const radiusPrimary = 250; // Primary emotions
  const radiusSecondary = 350; // Secondary emotions
  const radiusTertiary = 450; // Tertiary emotions (outer)

  // Process emotions data
  const processedData = useMemo(() => {
    const { emocoes } = data;
    
    // Group emotions by level
    const primarias: Array<{ name: string; data: Emotion; size: number }> = [];
    const secundarias: Record<string, Array<{ name: string; data: Emotion }>> = {};
    const terciarias: Record<string, Array<{ name: string; data: Emotion }>> = {};

    Object.entries(emocoes).forEach(([name, emotion]) => {
      if (emotion.nivel === 'primaria') {
        primarias.push({
          name,
          data: emotion,
          size: emotion.tamanho_original || 1,
        });
      } else if (emotion.nivel === 'secundaria') {
        const primary = emotion.emocao_primaria || 'UNKNOWN';
        if (!secundarias[primary]) secundarias[primary] = [];
        secundarias[primary].push({ name, data: emotion });
      } else if (emotion.nivel === 'terciaria') {
        const secondary = emotion.emocao_secundaria || 'UNKNOWN';
        if (!terciarias[secondary]) terciarias[secondary] = [];
        terciarias[secondary].push({ name, data: emotion });
      }
    });

    // Calculate angles for primary emotions
    const primaryAngles = calculateAngleDistribution(primarias);

    return { primarias, secundarias, terciarias, primaryAngles };
  }, [data]);

  // Render primary emotions
  const renderPrimaryEmotions = () => {
    const { primarias, primaryAngles } = processedData;

    return primaryAngles.map((angleData, index) => {
      const emotion = primarias[index];
      const color = emotion.data.cores?.centro.hex || '#cccccc';
      const path = createArcPath(
        centerX,
        centerY,
        radiusInner,
        radiusPrimary,
        angleData.startAngle,
        angleData.endAngle
      );

      const textPos = calculateTextPosition(
        centerX,
        centerY,
        (radiusInner + radiusPrimary) / 2,
        angleData.startAngle,
        angleData.endAngle
      );

      const isDisabled = disabledEmotions.includes(emotion.name);

      return (
        <g key={`primary-${emotion.name}`}>
          <path
            d={path}
            fill={color}
            stroke="#000"
            strokeWidth="2"
            opacity={isDisabled ? 0.3 : 0.9}
            style={{ cursor: 'pointer' }}
            onClick={() => !isDisabled && onEmotionClick?.(emotion.name, emotion.data)}
            onMouseEnter={() => !isDisabled && onEmotionHover?.(emotion.name, emotion.data)}
            onMouseLeave={() => onEmotionHover?.(null, null)}
          />
          {showLabels && (
            <text
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${-textPos.rotation}, ${textPos.x}, ${textPos.y})`}
              fontSize="16"
              fontWeight="bold"
              fill="#333"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {labelFormatter(emotion.name)}
            </text>
          )}
        </g>
      );
    });
  };

  // Render secondary emotions
  const renderSecondaryEmotions = () => {
    const { secundarias, primaryAngles } = processedData;
    const segments: JSX.Element[] = [];

    primaryAngles.forEach((primaryAngle, primaryIndex) => {
      const primaryName = processedData.primarias[primaryIndex].name;
      const secondaryList = secundarias[primaryName] || [];

      if (secondaryList.length === 0) return;

      const anglePerSecondary =
        (primaryAngle.endAngle - primaryAngle.startAngle) / secondaryList.length;

      secondaryList.forEach((secondary, secIndex) => {
        const startAngle = primaryAngle.startAngle + secIndex * anglePerSecondary;
        const endAngle = startAngle + anglePerSecondary;
        
        const primaryEmotion = data.emocoes[primaryName];
        const color = primaryEmotion.cores?.meio.hex || '#dddddd';

        const path = createArcPath(
          centerX,
          centerY,
          radiusPrimary,
          radiusSecondary,
          startAngle,
          endAngle
        );

        const textPos = calculateTextPosition(
          centerX,
          centerY,
          (radiusPrimary + radiusSecondary) / 2,
          startAngle,
          endAngle
        );

        const isDisabled = disabledEmotions.includes(secondary.name);

        segments.push(
          <g key={`secondary-${secondary.name}`}>
            <path
              d={path}
              fill={color}
              stroke="#000"
              strokeWidth="1.5"
              opacity={isDisabled ? 0.3 : 0.85}
              style={{ cursor: 'pointer' }}
              onClick={() => !isDisabled && onEmotionClick?.(secondary.name, secondary.data)}
              onMouseEnter={() => !isDisabled && onEmotionHover?.(secondary.name, secondary.data)}
              onMouseLeave={() => onEmotionHover?.(null, null)}
            />
            {showLabels && (
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${-textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                fontSize="12"
                fontWeight="600"
                fill="#333"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {labelFormatter(secondary.name)}
              </text>
            )}
          </g>
        );
      });
    });

    return segments;
  };

  // Render tertiary emotions
  const renderTertiaryEmotions = () => {
    const { secundarias, terciarias, primaryAngles } = processedData;
    const segments: JSX.Element[] = [];

    primaryAngles.forEach((primaryAngle, primaryIndex) => {
      const primaryName = processedData.primarias[primaryIndex].name;
      const secondaryList = secundarias[primaryName] || [];

      if (secondaryList.length === 0) return;

      const anglePerSecondary =
        (primaryAngle.endAngle - primaryAngle.startAngle) / secondaryList.length;

      secondaryList.forEach((secondary, secIndex) => {
        const secondaryStartAngle = primaryAngle.startAngle + secIndex * anglePerSecondary;
        const secondaryEndAngle = secondaryStartAngle + anglePerSecondary;

        const tertiaryList = terciarias[secondary.name] || [];

        if (tertiaryList.length === 0) return;

        const anglePerTertiary =
          (secondaryEndAngle - secondaryStartAngle) / tertiaryList.length;

        tertiaryList.forEach((tertiary, terIndex) => {
          const startAngle = secondaryStartAngle + terIndex * anglePerTertiary;
          const endAngle = startAngle + anglePerTertiary;

          const primaryEmotion = data.emocoes[primaryName];
          const color = primaryEmotion.cores?.externa.hex || '#eeeeee';

          const path = createArcPath(
            centerX,
            centerY,
            radiusSecondary,
            radiusTertiary,
            startAngle,
            endAngle
          );

          const textPos = calculateTextPosition(
            centerX,
            centerY,
            (radiusSecondary + radiusTertiary) / 2,
            startAngle,
            endAngle
          );

          const isDisabled = disabledEmotions.includes(tertiary.name);

          segments.push(
            <g key={`tertiary-${tertiary.name}`}>
              <path
                d={path}
                fill={color}
                stroke="#000"
                strokeWidth="1"
                opacity={isDisabled ? 0.3 : 0.8}
                style={{ cursor: 'pointer' }}
                onClick={() => !isDisabled && onEmotionClick?.(tertiary.name, tertiary.data)}
                onMouseEnter={() => !isDisabled && onEmotionHover?.(tertiary.name, tertiary.data)}
                onMouseLeave={() => onEmotionHover?.(null, null)}
              />
              {showLabels && (
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${-textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                  fontSize="10"
                  fill="#333"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {labelFormatter(tertiary.name)}
                </text>
              )}
            </g>
          );
        });
      });
    });

    return segments;
  };

  return (
    <div className={`emotion-wheel-container ${className}`} style={style}>
      <svg
        viewBox={viewBox}
        width={width}
        height={height}
        className="emotion-wheel-svg"
        style={{ width: '100%', height: 'auto' }}
      >
        {/* Tertiary (outer) */}
        {renderTertiaryEmotions()}
        
        {/* Secondary (middle) */}
        {renderSecondaryEmotions()}
        
        {/* Primary (inner) */}
        {renderPrimaryEmotions()}

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusInner}
          fill="#ffffff"
          stroke="#333"
          strokeWidth="2"
        />

        {/* Center content */}
        {centerComponent ? (
          <foreignObject
            x={centerX - radiusInner}
            y={centerY - radiusInner}
            width={radiusInner * 2}
            height={radiusInner * 2}
          >
            {centerComponent}
          </foreignObject>
        ) : (
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#333"
          >
            Roda das Emoções
          </text>
        )}
      </svg>
    </div>
  );
};

export default EmotionWheel;
