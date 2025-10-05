/**
 * Utility functions for SVG wheel calculations
 */

export interface Point {
  x: number;
  y: number;
}

export interface EmotionSegment {
  name: string;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  color: string;
  level: 'primaria' | 'secundaria' | 'terciaria';
}

/**
 * Convert degrees to radians
 */
export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calculate point on circle given angle and radius
 */
export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): Point => {
  const angleInRadians = degreesToRadians(angleInDegrees - 90); // -90 to start from top
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

/**
 * Create SVG path for a circular segment (arc)
 */
export const createArcPath = (
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const end = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const innerEnd = polarToCartesian(centerX, centerY, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  const d = [
    `M ${start.x} ${start.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');

  return d;
};

/**
 * Calculate text position and rotation for a segment
 */
export const calculateTextPosition = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): { x: number; y: number; rotation: number } => {
  const midAngle = (startAngle + endAngle) / 2;
  const point = polarToCartesian(centerX, centerY, radius, midAngle);
  
  return {
    x: point.x,
    y: point.y,
    rotation: midAngle,
  };
};

/**
 * Calculate angle distribution based on emotion sizes
 */
export const calculateAngleDistribution = (
  emotions: Array<{ name: string; size: number }>
): Array<{ name: string; startAngle: number; endAngle: number }> => {
  const totalSize = emotions.reduce((sum, e) => sum + e.size, 0);
  const degreesPerUnit = 360 / totalSize;
  
  let currentAngle = 0;
  return emotions.map((emotion) => {
    const angleSpan = emotion.size * degreesPerUnit;
    const segment = {
      name: emotion.name,
      startAngle: currentAngle,
      endAngle: currentAngle + angleSpan,
    };
    currentAngle += angleSpan;
    return segment;
  });
};
