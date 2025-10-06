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
 * Normalize an angle to [0, 360)
 */
export const normalizeAngle = (angleDeg: number): number => {
  const a = angleDeg % 360;
  return a < 0 ? a + 360 : a;
};

/**
 * Smallest signed delta from a to b in degrees (-180, 180]
 */
export const shortestAngleDelta = (fromDeg: number, toDeg: number): number => {
  let delta = normalizeAngle(toDeg) - normalizeAngle(fromDeg);
  if (delta > 180) delta -= 360;
  if (delta <= -180) delta += 360;
  return delta;
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
 * Compute label rotation to apply in SVG transform respecting flip rule.
 * Returns the angle to be fed directly to `transform="rotate(angle x y)"`.
 * Rule: flip when angle is in the lower semicircle, with a threshold band.
 */
export const calculateLabelTransformAngle = (
  startAngle: number,
  endAngle: number,
  thresholdDeg: number = 4
): number => {
  const midAngle = normalizeAngle((startAngle + endAngle) / 2);
  const inLower = midAngle >= (180 + thresholdDeg) && midAngle < (360 - thresholdDeg);
  return -midAngle + (inLower ? 180 : 0);
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

/**
 * Compute angle from center to a pointer coordinate. 0° at top, clockwise.
 */
export const angleFromPoint = (
  centerX: number,
  centerY: number,
  x: number,
  y: number
): number => {
  const dx = x - centerX;
  const dy = y - centerY;
  const radians = Math.atan2(dy, dx); // 0 at +X axis
  const deg = (radians * 180) / Math.PI;
  return normalizeAngle(deg + 90); // shift so 0 at top
};

/**
 * Compose root <g> transform from view state
 */
export const composeViewTransform = (
  centerX: number,
  centerY: number,
  angleDeg: number,
  scale: number,
  translate: { x: number; y: number }
): string => {
  const t = `translate(${translate.x} ${translate.y})`;
  const r = `rotate(${angleDeg} ${centerX} ${centerY})`;
  const s = `scale(${scale})`;
  return `${t} ${r} ${s}`;
};

/**
 * Snap an angle to the nearest target angle if within tolerance.
 */
export const snapAngle = (
  angleDeg: number,
  targets: number[],
  toleranceDeg: number
): number => {
  const normalized = normalizeAngle(angleDeg);
  let best = normalized;
  let bestDelta = Infinity;
  for (const t of targets) {
    const d = Math.abs(shortestAngleDelta(normalized, t));
    if (d < bestDelta) {
      bestDelta = d;
      best = t;
    }
  }
  return bestDelta <= toleranceDeg ? best : normalized;
};
