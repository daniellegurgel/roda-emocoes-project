import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import type { EmotionWheelProps, Emotion, EmotionWheelTheme } from '../../types';
import {
  createArcPath,
  calculateTextPosition,
  calculateAngleDistribution,
  calculateLabelTransformAngle,
  angleFromPoint,
  composeViewTransform,
  snapAngle,
  normalizeAngle,
} from '../../utils/svgCalculations';

const DEFAULT_THEME: EmotionWheelTheme = {
  colors: {
    label: '#333',
    labelSecondary: '#444',
    outline: '#000',
    focusOutline: '#1d4ed8',
    selectedOutline: '#ea580c',
    disabledOpacity: 0.35,
    hoverOpacity: 0.9,
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
  // new props
  selectionMode = 'multiple',
  maxSelected,
  selected,
  defaultSelected = [],
  onChange,
  ariaLabel = 'Roda das Emoções',
  getItemAriaLabel,
  theme: themeProp,
  readOnly = false,
  disabled = false,
  // view props
  viewState,
  defaultViewState,
  onViewChange,
  minScale = 0.6,
  maxScale = 2,
  snapToSectors = true,
  snapToleranceDeg = 6,
}) => {
  // Center and radius calculations
  const centerX = 500;
  const centerY = 500;
  const radiusInner = 150; // Center circle
  const radiusPrimary = 250; // Primary emotions
  const radiusSecondary = 350; // Secondary emotions
  const radiusTertiary = 450; // Tertiary emotions (outer)

  const theme = useMemo(() => ({ ...DEFAULT_THEME, ...(themeProp || {}) }), [themeProp]);

  // Selection state (controlled/uncontrolled)
  const [uncontrolledSelected, setUncontrolledSelected] = useState<string[]>(defaultSelected);
  const effectiveSelected = selected ?? uncontrolledSelected;
  const selectedSet = useMemo(() => new Set(effectiveSelected), [effectiveSelected]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  // Refs for keyboard navigation
  const itemRefs = useRef<Map<string, SVGPathElement | null>>(new Map());
  const setItemRef = useCallback((id: string) => (el: SVGPathElement | null) => {
    itemRefs.current.set(id, el);
  }, []);

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

    // Build segment lists for secondary/tertiary with angles for navigation and labels
    const secondarySegments: Array<{ name: string; data: Emotion; startAngle: number; endAngle: number; primaryName: string }> = [];
    const tertiarySegments: Array<{ name: string; data: Emotion; startAngle: number; endAngle: number; secondaryName: string; primaryName: string }> = [];

    primaryAngles.forEach((primaryAngle, primaryIndex) => {
      const primaryName = primarias[primaryIndex].name;
      const secondaryList = secundarias[primaryName] || [];
      if (secondaryList.length === 0) return;
      const anglePerSecondary = (primaryAngle.endAngle - primaryAngle.startAngle) / secondaryList.length;
      secondaryList.forEach((secondary, secIndex) => {
        const startAngle = primaryAngle.startAngle + secIndex * anglePerSecondary;
        const endAngle = startAngle + anglePerSecondary;
        secondarySegments.push({ name: secondary.name, data: secondary.data, startAngle, endAngle, primaryName });

        const tertiaryList = terciarias[secondary.name] || [];
        if (tertiaryList.length > 0) {
          const anglePerTertiary = (endAngle - startAngle) / tertiaryList.length;
          tertiaryList.forEach((tertiary, terIndex) => {
            const tStart = startAngle + terIndex * anglePerTertiary;
            const tEnd = tStart + anglePerTertiary;
            tertiarySegments.push({ name: tertiary.name, data: tertiary.data, startAngle: tStart, endAngle: tEnd, secondaryName: secondary.name, primaryName });
          });
        }
      });
    });

    return { primarias, secundarias, terciarias, primaryAngles, secondarySegments, tertiarySegments };
  }, [data]);

  // Ordered ids for deterministic selection order and keyboard nav
  const orderedIds = useMemo(() => {
    // Rank by startAngle (ascending) then by level (terciaria > secundaria > primaria)
    const primarySegs = processedData.primaryAngles.map((p, idx) => ({ id: processedData.primarias[idx].name, start: p.startAngle, level: 0 }));
    const secondarySegs = processedData.secondarySegments.map((s) => ({ id: s.name, start: s.startAngle, level: 1 }));
    const tertiarySegs = processedData.tertiarySegments.map((t) => ({ id: t.name, start: t.startAngle, level: 2 }));
    return [...tertiarySegs, ...secondarySegs, ...primarySegs]
      .sort((a, b) => (a.start === b.start ? b.level - a.level : a.start - b.start))
      .map((s) => s.id);
  }, [processedData]);

  const sortSelectedDeterministically = useCallback((ids: string[]): string[] => {
    const indexMap = new Map(orderedIds.map((id, i) => [id, i] as const));
    return [...ids].sort((a, b) => (indexMap.get(a)! - indexMap.get(b)!));
  }, [orderedIds]);

  const emitChange = useCallback((nextIds: string[]) => {
    const sorted = sortSelectedDeterministically(nextIds);
    onChange?.(sorted);
  }, [onChange, sortSelectedDeterministically]);

  const toggleSelection = useCallback((id: string) => {
    if (readOnly || disabled) return;
    const isSelected = selectedSet.has(id);
    let next: string[] = [];
    if (selectionMode === 'single') {
      next = isSelected ? [] : [id];
    } else {
      if (isSelected) {
        next = effectiveSelected.filter((e) => e !== id);
      } else {
        next = [...effectiveSelected, id];
        if (typeof maxSelected === 'number' && next.length > maxSelected) {
          next = next.slice(next.length - maxSelected);
        }
      }
    }
    if (selected === undefined) {
      setUncontrolledSelected(next);
    }
    emitChange(next);
  }, [disabled, readOnly, selectedSet, selectionMode, effectiveSelected, maxSelected, selected, emitChange]);

  const handleKeyActivate = useCallback((e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSelection(id);
    }
  }, [toggleSelection]);

  const focusByArrow = useCallback((direction: 1 | -1) => {
    const active = document.activeElement as (HTMLElement | null);
    const currentId = active?.getAttribute?.('data-emotion-id');
    const currentIndex = currentId ? orderedIds.indexOf(currentId) : -1;
    const nextIndex = currentIndex === -1
      ? (direction === 1 ? 0 : orderedIds.length - 1)
      : (currentIndex + direction + orderedIds.length) % orderedIds.length;
    const nextId = orderedIds[nextIndex];
    const el = itemRefs.current.get(nextId);
    el?.focus();
  }, [orderedIds]);

  const handleContainerKeyDown = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
    if (e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusByArrow(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusByArrow(-1);
    }
  }, [focusByArrow]);

  // View state (rotation/zoom)
  const initialView = useMemo(() => (
    defaultViewState ?? { angleDeg: 0, scale: 1, translate: { x: 0, y: 0 } }
  ), [defaultViewState]);
  const [internalView, setInternalView] = useState(initialView);
  const view = viewState ?? internalView;
  const setView = useCallback((next: typeof internalView) => {
    if (viewState === undefined) setInternalView(next);
    onViewChange?.(next);
  }, [viewState, onViewChange]);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{ active: boolean; baseAngle: number; pointerStart: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (readOnly || disabled) return;
    const svg = svgRef.current;
    if (!svg) return;
    svg.setPointerCapture(e.pointerId);
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const pointerAngle = angleFromPoint(cx, cy, e.clientX, e.clientY);
    dragRef.current = { active: true, baseAngle: view.angleDeg, pointerStart: pointerAngle };
  }, [disabled, readOnly, view.angleDeg]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const info = dragRef.current;
    const svg = svgRef.current;
    if (!info || !info.active || !svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const current = angleFromPoint(cx, cy, e.clientX, e.clientY);
    const delta = current - info.pointerStart;
    const nextAngle = normalizeAngle(info.baseAngle + delta);
    setView({ ...view, angleDeg: nextAngle });
  }, [setView, view]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (svg) {
      try { svg.releasePointerCapture(e.pointerId); } catch {}
    }
    const info = dragRef.current;
    if (!info) return;
    dragRef.current = null;
    if (snapToSectors && processedData.primaryAngles.length > 0) {
      const centers = processedData.primaryAngles.map((a) => (a.startAngle + a.endAngle) / 2);
      const snapped = snapAngle(view.angleDeg, centers, snapToleranceDeg);
      setView({ ...view, angleDeg: snapped });
    }
  }, [processedData.primaryAngles, setView, view, snapToSectors, snapToleranceDeg]);

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    if (readOnly || disabled) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.95 : 1.05;
    const nextScale = clamp(view.scale * factor, minScale, maxScale);
    if (nextScale !== view.scale) setView({ ...view, scale: nextScale });
  }, [disabled, readOnly, view, minScale, maxScale, setView]);

  // Keyboard shortcuts for rotation/zoom
  const handleContainerKeyDownEnhanced = useCallback((e: React.KeyboardEvent<SVGSVGElement>) => {
    if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !e.altKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      focusByArrow(1);
      return;
    }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && !e.altKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      focusByArrow(-1);
      return;
    }
    // Rotation shortcuts
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      const delta = e.key === 'ArrowRight' ? 5 : -5;
      setView({ ...view, angleDeg: normalizeAngle(view.angleDeg + delta) });
      return;
    }
    // Reset angle
    if (e.shiftKey && (e.key.toLowerCase?.() === 'r')) {
      e.preventDefault();
      setView({ ...view, angleDeg: 0 });
      return;
    }
    // Zoom +/- and fit
    if (e.key === '+' || e.key === '=' ) {
      e.preventDefault();
      const nextScale = clamp(view.scale * 1.05, minScale, maxScale);
      setView({ ...view, scale: nextScale });
      return;
    }
    if (e.key === '-') {
      e.preventDefault();
      const nextScale = clamp(view.scale * 0.95, minScale, maxScale);
      setView({ ...view, scale: nextScale });
      return;
    }
    if (e.key === '0') {
      e.preventDefault();
      setView({ ...view, scale: 1 });
    }
  }, [focusByArrow, setView, view, minScale, maxScale]);

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

      const isDisabled = disabledEmotions.includes(emotion.name) || disabled;
      const isSelected = selectedSet.has(emotion.name);
      const isHovered = hoveredId === emotion.name;
      const strokeColor = isSelected ? theme.colors.selectedOutline : theme.colors.outline;
      const strokeWidth = isSelected ? 2.5 : 2;
      const opacity = isDisabled ? theme.colors.disabledOpacity : (isSelected ? theme.colors.selectedOpacity : (isHovered ? theme.colors.hoverOpacity : 0.9));

      return (
        <g key={`primary-${emotion.name}`}>
          <path
            d={path}
            fill={color}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            opacity={opacity}
            style={{ cursor: isDisabled || readOnly ? 'not-allowed' : 'pointer', pointerEvents: 'visiblePainted' }}
            data-emotion-id={emotion.name}
            role={selectionMode === 'single' ? 'radio' : 'option'}
            aria-checked={selectionMode === 'single' ? isSelected : undefined}
            aria-selected={selectionMode === 'multiple' ? isSelected : undefined}
            aria-disabled={isDisabled}
            aria-label={getItemAriaLabel ? getItemAriaLabel(emotion.name, emotion.data) : `${labelFormatter(emotion.name)}`}
            tabIndex={isDisabled ? -1 : 0}
            ref={setItemRef(emotion.name)}
            onClick={() => {
              if (isDisabled || readOnly) return;
              toggleSelection(emotion.name);
              onEmotionClick?.(emotion.name, emotion.data);
            }}
            onFocus={() => setFocusedId(emotion.name)}
            onBlur={() => setFocusedId((prev) => (prev === emotion.name ? null : prev))}
            onKeyDown={(e) => handleKeyActivate(e, emotion.name)}
            onMouseEnter={() => {
              if (!isDisabled) {
                setHoveredId(emotion.name);
                onEmotionHover?.(emotion.name, emotion.data);
              }
            }}
            onMouseLeave={() => {
              if (hoveredId === emotion.name) setHoveredId(null);
              onEmotionHover?.(null, null);
            }}
          />
          {showLabels && (
            <text
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${calculateLabelTransformAngle(angleData.startAngle, angleData.endAngle)}, ${textPos.x}, ${textPos.y})`}
              fontSize={theme.typography.primaryLabelSize}
              fontWeight={theme.typography.primaryWeight}
              fill={theme.colors.label}
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

        const isDisabled = disabledEmotions.includes(secondary.name) || disabled;
        const isSelected = selectedSet.has(secondary.name);
        const isHovered = hoveredId === secondary.name;
        const strokeColor = isSelected ? theme.colors.selectedOutline : theme.colors.outline;
        const strokeWidth = isSelected ? 2 : 1.5;
        const opacity = isDisabled ? theme.colors.disabledOpacity : (isSelected ? theme.colors.selectedOpacity : (isHovered ? theme.colors.hoverOpacity : 0.85));

        segments.push(
          <g key={`secondary-${secondary.name}`}>
            <path
              d={path}
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              opacity={opacity}
              style={{ cursor: isDisabled || readOnly ? 'not-allowed' : 'pointer', pointerEvents: 'visiblePainted' }}
              data-emotion-id={secondary.name}
              role={selectionMode === 'single' ? 'radio' : 'option'}
              aria-checked={selectionMode === 'single' ? isSelected : undefined}
              aria-selected={selectionMode === 'multiple' ? isSelected : undefined}
              aria-disabled={isDisabled}
              aria-label={getItemAriaLabel ? getItemAriaLabel(secondary.name, secondary.data) : `${labelFormatter(secondary.name)}`}
              tabIndex={isDisabled ? -1 : 0}
              ref={setItemRef(secondary.name)}
              onClick={() => {
                if (isDisabled || readOnly) return;
                toggleSelection(secondary.name);
                onEmotionClick?.(secondary.name, secondary.data);
              }}
              onFocus={() => setFocusedId(secondary.name)}
              onBlur={() => setFocusedId((prev) => (prev === secondary.name ? null : prev))}
              onKeyDown={(e) => handleKeyActivate(e, secondary.name)}
              onMouseEnter={() => {
                if (!isDisabled) {
                  setHoveredId(secondary.name);
                  onEmotionHover?.(secondary.name, secondary.data);
                }
              }}
              onMouseLeave={() => {
                if (hoveredId === secondary.name) setHoveredId(null);
                onEmotionHover?.(null, null);
              }}
            />
            {showLabels && (
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${calculateLabelTransformAngle(startAngle, endAngle)}, ${textPos.x}, ${textPos.y})`}
                fontSize={theme.typography.secondaryLabelSize}
                fontWeight={theme.typography.secondaryWeight}
                fill={theme.colors.label}
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
            radiusSecondary + (radiusTertiary - radiusSecondary) * 0.6,
            startAngle,
            endAngle
          );

          const isDisabled = disabledEmotions.includes(tertiary.name) || disabled;
          const isSelected = selectedSet.has(tertiary.name);
          const isHovered = hoveredId === tertiary.name;
          const strokeColor = isSelected ? theme.colors.selectedOutline : theme.colors.outline;
          const strokeWidth = isSelected ? 1.5 : 1;
          const opacity = isDisabled ? theme.colors.disabledOpacity : (isSelected ? theme.colors.selectedOpacity : (isHovered ? theme.colors.hoverOpacity : 0.8));

          segments.push(
            <g key={`tertiary-${tertiary.name}`}>
              <path
                d={path}
                fill={color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                opacity={opacity}
                style={{ cursor: isDisabled || readOnly ? 'not-allowed' : 'pointer', pointerEvents: 'visiblePainted' }}
                data-emotion-id={tertiary.name}
                role={selectionMode === 'single' ? 'radio' : 'option'}
                aria-checked={selectionMode === 'single' ? isSelected : undefined}
                aria-selected={selectionMode === 'multiple' ? isSelected : undefined}
                aria-disabled={isDisabled}
                aria-label={getItemAriaLabel ? getItemAriaLabel(tertiary.name, tertiary.data) : `${labelFormatter(tertiary.name)}`}
                tabIndex={isDisabled ? -1 : 0}
                ref={setItemRef(tertiary.name)}
                onClick={() => {
                  if (isDisabled || readOnly) return;
                  toggleSelection(tertiary.name);
                  onEmotionClick?.(tertiary.name, tertiary.data);
                }}
                onFocus={() => setFocusedId(tertiary.name)}
                onBlur={() => setFocusedId((prev) => (prev === tertiary.name ? null : prev))}
                onKeyDown={(e) => handleKeyActivate(e, tertiary.name)}
                onMouseEnter={() => {
                  if (!isDisabled) {
                    setHoveredId(tertiary.name);
                    onEmotionHover?.(tertiary.name, tertiary.data);
                  }
                }}
                onMouseLeave={() => {
                  if (hoveredId === tertiary.name) setHoveredId(null);
                  onEmotionHover?.(null, null);
                }}
              />
              {showLabels && (
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${calculateLabelTransformAngle(startAngle, endAngle)}, ${textPos.x}, ${textPos.y})`}
                  fontSize={theme.typography.tertiaryLabelSize}
                  fontWeight={theme.typography.tertiaryWeight}
                  fill={theme.colors.labelSecondary}
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
        role={selectionMode === 'single' ? 'radiogroup' : 'listbox'}
        aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
        aria-label={ariaLabel}
        onKeyDown={handleContainerKeyDownEnhanced}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        ref={svgRef}
      >
        {/* root group with view transforms */}
        <g transform={composeViewTransform(centerX, centerY, view.angleDeg, view.scale, view.translate)}>
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
            fontSize={18}
            fontWeight={700}
            fill={theme.colors.label}
          >
            Roda das Emoções
          </text>
        )}
        </g>
      </svg>
    </div>
  );
};

export default EmotionWheel;
