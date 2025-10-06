import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { EmotionWheelProps, Emotion, WheelViewState, EmotionWheelTheme } from '../../types';
import {
  createArcPath,
  calculateTextPosition,
  calculateAngleDistribution,
} from '../../utils/svgCalculations';

// Tema padrão
const defaultTheme: EmotionWheelTheme = {
  colors: {
    primary: '#e53935',
    secondary: '#42a5f5',
    tertiary: '#66bb6a',
    background: '#ffffff',
    text: '#333333',
    border: '#000000',
    hover: 'rgba(0, 0, 0, 0.1)',
    selected: '#2196f3',
    disabled: '#cccccc',
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    fontSize: {
      primary: '16px',
      secondary: '12px',
      tertiary: '11px',
    },
  },
  spacing: {
    padding: 20,
  },
  animations: {
    duration: 300,
    easing: 'ease-in-out',
  },
};

const EmotionWheel: React.FC<EmotionWheelProps> = ({
  data,
  selectionMode = 'multiple',
  selectedEmotions: externalSelectedEmotions,
  maxSelected,
  onEmotionClick,
  onEmotionHover,
  onSelectionChange,
  disabledEmotions = [],
  disabled = false,
  viewBox = '0 0 1000 1000',
  width = '100%',
  height,
  padding = 20,
  className = '',
  style = {},
  showLabels = true,
  labelFormatter = (name) => name,
  centerComponent,
  theme,
}) => {
  // Estado interno de seleção
  const [internalSelectedEmotions, setInternalSelectedEmotions] = useState<string[]>([]);
  const [viewState, setViewState] = useState<WheelViewState>({
    angleDeg: 0,
    scale: 1,
    translate: { x: 0, y: 0 }
  });

  // Estado para rotação por drag
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, angle: 0 });

  // Estado para controles de zoom
  const [showZoomControls, setShowZoomControls] = useState(false);

  // Seleção controlada vs não controlada
  const selectedEmotions = externalSelectedEmotions !== undefined ? externalSelectedEmotions : internalSelectedEmotions;
  const isControlled = externalSelectedEmotions !== undefined;

  // Estado para navegação por teclado
  const [focusedEmotion, setFocusedEmotion] = useState<string | null>(null);

  // Tema mesclado (usuário + padrão)
  const mergedTheme = useMemo(() => ({
    ...defaultTheme,
    ...theme,
    colors: { ...defaultTheme.colors, ...theme?.colors },
    typography: { ...defaultTheme.typography, ...theme?.typography },
    spacing: { ...defaultTheme.spacing, ...theme?.spacing },
    animations: { ...defaultTheme.animations, ...theme?.animations },
  }), [theme]);

  // Obter todas as emoções em ordem para navegação
  const allEmotions = useMemo(() => {
    const emotions: string[] = [];
    Object.keys(data.emocoes).forEach(emotionName => {
      if (!disabledEmotions.includes(emotionName) && !disabled) {
        emotions.push(emotionName);
      }
    });
    return emotions;
  }, [data.emocoes, disabledEmotions, disabled]);

  // Funções auxiliares para rotação
  const getMouseAngle = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return 0;

    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90; // +90 para começar do topo
    if (angle < 0) angle += 360;

    return angle;
  }, []);

  const snapToSector = useCallback((angle: number) => {
    if (!snapToSectors) return angle;

    // Calcular o setor mais próximo (simplificado - baseado em 6 emoções primárias)
    const sectorSize = 360 / 6; // 6 emoções primárias
    const sectorIndex = Math.round(angle / sectorSize);
    return sectorIndex * sectorSize;
  }, [snapToSectors]);

  // Funções de manipulação de seleção
  const handleEmotionSelection = useCallback((emotionName: string) => {
    if (disabled || disabledEmotions.includes(emotionName)) return;

    let newSelection: string[];

    if (selectionMode === 'single') {
      newSelection = selectedEmotions.includes(emotionName) ? [] : [emotionName];
    } else {
      // multiple mode
      if (selectedEmotions.includes(emotionName)) {
        // Remove se já está selecionado
        newSelection = selectedEmotions.filter(name => name !== emotionName);
      } else {
        // Adiciona se não está selecionado
        if (maxSelected && selectedEmotions.length >= maxSelected) {
          return; // Não permite seleção além do máximo
        }
        newSelection = [...selectedEmotions, emotionName];
      }
    }

    if (!isControlled) {
      setInternalSelectedEmotions(newSelection);
    }

    onSelectionChange?.(newSelection);
  }, [disabled, disabledEmotions, selectionMode, selectedEmotions, maxSelected, isControlled, onSelectionChange]);

  // Navegação por teclado
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!svgRef.current || allEmotions.length === 0) return;

    const currentIndex = focusedEmotion ? allEmotions.indexOf(focusedEmotion) : 0;
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (currentIndex + 1) % allEmotions.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : allEmotions.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (focusedEmotion) {
          handleEmotionSelection(focusedEmotion);
        }
        return;
      case 'r':
      case 'R':
        if (event.shiftKey) {
          event.preventDefault();
          setViewState(prev => ({ ...prev, angleDeg: 0 }));
          onViewChange?.({ ...viewState, angleDeg: 0 });
        }
        return;
      default:
        return;
    }

    const newFocusedEmotion = allEmotions[newIndex];
    setFocusedEmotion(newFocusedEmotion);

    // Focar o elemento SVG correspondente
    const element = svgRef.current.querySelector(`[data-emotion="${newFocusedEmotion}"]`) as SVGElement;
    if (element) {
      element.focus();
    }
  }, [focusedEmotion, allEmotions, handleEmotionSelection, viewState, onViewChange]);

  // Focus management
  useEffect(() => {
    if (focusedEmotion) {
      onEmotionHover?.(focusedEmotion, data.emocoes[focusedEmotion]);
    } else {
      onEmotionHover?.(null, null);
    }
  }, [focusedEmotion, onEmotionHover, data.emocoes]);

  // Modal focus trap e body scroll lock
  useEffect(() => {
    if (enableModal && modalProps?.isOpen) {
      // Bloquear scroll do body
      document.body.style.overflow = 'hidden';

      // Focus trap - focar no primeiro elemento focável do modal
      const modalContent = document.querySelector('[data-modal-content]') as HTMLElement;
      if (modalContent) {
        const focusableElements = modalContent.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0] as HTMLElement;
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }

      // Cleanup
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [enableModal, modalProps?.isOpen]);

  // Keyboard navigation no modal
  useEffect(() => {
    if (enableModal && modalProps?.isOpen) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          modalProps.onClose?.();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableModal, modalProps?.isOpen, modalProps?.onClose]);

  // Handlers para rotação por drag
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!enableRotation || !svgRef.current) return;

    event.preventDefault();
    setIsDragging(true);
    const startAngle = getMouseAngle(event.clientX, event.clientY);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      angle: startAngle
    });
  }, [enableRotation, getMouseAngle]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !enableRotation) return;

    const currentAngle = getMouseAngle(event.clientX, event.clientY);
    const startAngle = dragStart.angle;

    let deltaAngle = currentAngle - startAngle;

    // Normalizar ângulo
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    const newAngle = viewState.angleDeg + deltaAngle;

    setViewState(prev => ({
      ...prev,
      angleDeg: newAngle
    }));

    onViewChange?.({
      ...viewState,
      angleDeg: newAngle
    });
  }, [isDragging, enableRotation, getMouseAngle, dragStart.angle, viewState, onViewChange]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);

    // Aplicar snap se habilitado
    if (snapToSectors) {
      const snappedAngle = snapToSector(viewState.angleDeg);
      setViewState(prev => ({
        ...prev,
        angleDeg: snappedAngle
      }));
      onViewChange?.({
        ...viewState,
        angleDeg: snappedAngle
      });
    }
  }, [isDragging, snapToSectors, viewState, snapToSector, onViewChange]);

  // Funções para controle de zoom
  const handleZoom = useCallback((delta: number) => {
    if (!enableZoom) return;

    const zoomFactor = 1.1; // 10% por incremento
    const newScale = delta > 0
      ? Math.min(viewState.scale * zoomFactor, maxScale || 3)
      : Math.max(viewState.scale / zoomFactor, minScale || 0.5);

    setViewState(prev => ({
      ...prev,
      scale: newScale
    }));

    onViewChange?.({
      ...viewState,
      scale: newScale
    });
  }, [enableZoom, viewState, maxScale, minScale, onViewChange]);

  const handleZoomIn = useCallback(() => handleZoom(1), [handleZoom]);
  const handleZoomOut = useCallback(() => handleZoom(-1), [handleZoom]);

  const handleFitToView = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      scale: 1,
      angleDeg: 0,
      translate: { x: 0, y: 0 }
    }));
    onViewChange?.({
      angleDeg: 0,
      scale: 1,
      translate: { x: 0, y: 0 }
    });
  }, [onViewChange]);

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (!enableZoom) return;

    event.preventDefault();

    // Zoom com Ctrl/Cmd ou quando não há scroll vertical significativo
    if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) < Math.abs(event.deltaX)) {
      const delta = event.deltaY > 0 ? -1 : 1;
      handleZoom(delta);
    }
  }, [enableZoom, handleZoom]);

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

      const isDisabled = disabled || disabledEmotions.includes(emotion.name);
      const isSelected = selectedEmotions.includes(emotion.name);
      const isHovering = false; // Será implementado com estado de hover

      // Estados visuais baseados no tema
      const getVisualState = () => {
        if (isDisabled) return {
          opacity: 0.3,
          stroke: mergedTheme.colors.disabled,
          strokeWidth: 2,
          fill: color
        };
        if (isSelected) return {
          opacity: 1,
          stroke: mergedTheme.colors.selected,
          strokeWidth: 3,
          fill: color
        };
        return {
          opacity: 0.9,
          stroke: mergedTheme.colors.border,
          strokeWidth: 2,
          fill: color
        };
      };

      const visualState = getVisualState();

      return (
        <g key={`primary-${emotion.name}`}>
          <path
            d={path}
            fill={visualState.fill}
            stroke={visualState.stroke}
            strokeWidth={visualState.strokeWidth}
            opacity={visualState.opacity}
            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
            onClick={() => !isDisabled && (onEmotionClick?.(emotion.name, emotion.data), handleEmotionSelection(emotion.name))}
            onMouseEnter={() => !isDisabled && onEmotionHover?.(emotion.name, emotion.data)}
            onMouseLeave={() => onEmotionHover?.(null, null)}
            onFocus={() => setFocusedEmotion(emotion.name)}
            onBlur={() => setFocusedEmotion(null)}
            role="button"
            tabIndex={isDisabled ? -1 : 0}
            aria-pressed={isSelected}
            aria-label={`${emotion.name} - ${emotion.data.nivel}`}
            data-emotion={emotion.name}
            data-focused={focusedEmotion === emotion.name}
          />
          {showLabels && (
            <text
              x={textPos.x}
              y={textPos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
              fontSize={mergedTheme.typography.fontSize.primary}
              fontWeight="bold"
              fill={mergedTheme.colors.text}
              fontFamily={mergedTheme.typography.fontFamily}
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                textAlign: 'center'
              }}
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

        const isDisabled = disabled || disabledEmotions.includes(secondary.name);
        const isSelected = selectedEmotions.includes(secondary.name);

        const getVisualState = () => {
          if (isDisabled) return {
            opacity: 0.3,
            stroke: mergedTheme.colors.disabled,
            strokeWidth: 1.5,
            fill: color
          };
          if (isSelected) return {
            opacity: 1,
            stroke: mergedTheme.colors.selected,
            strokeWidth: 2.5,
            fill: color
          };
          return {
            opacity: 0.85,
            stroke: mergedTheme.colors.border,
            strokeWidth: 1.5,
            fill: color
          };
        };

        const visualState = getVisualState();

        segments.push(
          <g key={`secondary-${secondary.name}`}>
            <path
              d={path}
              fill={visualState.fill}
              stroke={visualState.stroke}
              strokeWidth={visualState.strokeWidth}
              opacity={visualState.opacity}
              style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
              onClick={() => !isDisabled && (onEmotionClick?.(secondary.name, secondary.data), handleEmotionSelection(secondary.name))}
              onMouseEnter={() => !isDisabled && onEmotionHover?.(secondary.name, secondary.data)}
              onMouseLeave={() => onEmotionHover?.(null, null)}
              onFocus={() => setFocusedEmotion(secondary.name)}
              onBlur={() => setFocusedEmotion(null)}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              aria-pressed={isSelected}
              aria-label={`${secondary.name} - ${secondary.data.nivel}`}
              data-emotion={secondary.name}
              data-focused={focusedEmotion === secondary.name}
            />
            {showLabels && (
              <text
                x={textPos.x}
                y={textPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                fontSize={mergedTheme.typography.fontSize.secondary}
                fontWeight="600"
                fill={mergedTheme.colors.text}
                fontFamily={mergedTheme.typography.fontFamily}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  textAlign: 'center'
                }}
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

          const isDisabled = disabled || disabledEmotions.includes(tertiary.name);
          const isSelected = selectedEmotions.includes(tertiary.name);

          const getVisualState = () => {
            if (isDisabled) return {
              opacity: 0.3,
              stroke: mergedTheme.colors.disabled,
              strokeWidth: 1,
              fill: color
            };
            if (isSelected) return {
              opacity: 1,
              stroke: mergedTheme.colors.selected,
              strokeWidth: 2,
              fill: color
            };
            return {
              opacity: 0.8,
              stroke: mergedTheme.colors.border,
              strokeWidth: 1,
              fill: color
            };
          };

          const visualState = getVisualState();

          segments.push(
            <g key={`tertiary-${tertiary.name}`}>
              <path
                d={path}
                fill={visualState.fill}
                stroke={visualState.stroke}
                strokeWidth={visualState.strokeWidth}
                opacity={visualState.opacity}
                style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                onClick={() => !isDisabled && (onEmotionClick?.(tertiary.name, tertiary.data), handleEmotionSelection(tertiary.name))}
                onMouseEnter={() => !isDisabled && onEmotionHover?.(tertiary.name, tertiary.data)}
                onMouseLeave={() => onEmotionHover?.(null, null)}
                onFocus={() => setFocusedEmotion(tertiary.name)}
                onBlur={() => setFocusedEmotion(null)}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                aria-pressed={isSelected}
                aria-label={`${tertiary.name} - ${tertiary.data.nivel}`}
                data-emotion={tertiary.name}
                data-focused={focusedEmotion === tertiary.name}
              />
              {showLabels && (
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${textPos.rotation}, ${textPos.x}, ${textPos.y})`}
                  fontSize={mergedTheme.typography.fontSize.tertiary}
                  fill={mergedTheme.colors.text}
                  fontFamily={mergedTheme.typography.fontFamily}
                  style={{
                    pointerEvents: 'none',
                    userSelect: 'none',
                    textAlign: 'center'
                  }}
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

  // Modal wrapper
  if (enableModal && modalProps?.isOpen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}
        onClick={modalProps.onClose}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            position: 'relative',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do modal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              {modalProps.title || 'Roda das Emoções'}
            </h2>
            <button
              onClick={modalProps.onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
                padding: '4px',
                borderRadius: '4px',
              }}
              aria-label="Fechar modal"
            >
              ×
            </button>
          </div>

          {/* Conteúdo do modal */}
          <div style={{ position: 'relative' }} data-modal-content>
            <EmotionWheelContent />
          </div>
        </div>
      </div>
    );
  }

  return <EmotionWheelContent />;

  function EmotionWheelContent() {
    return (
      <div className={`emotion-wheel-container ${className}`} style={style}>
        <svg
        ref={svgRef}
        viewBox={viewBox}
        width={width}
        height={height}
        className="emotion-wheel-svg"
        style={{
          width: '100%',
          height: 'auto',
          cursor: isDragging ? 'grabbing' : (enableRotation ? 'grab' : 'default')
        }}
        role="group"
        aria-label="Roda das Emoções - Selecione as emoções que está sentindo"
        aria-describedby="emotion-wheel-instructions"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocusedEmotion(allEmotions[0] || null)}
        onBlur={() => setFocusedEmotion(null)}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onMouseEnter={() => setShowZoomControls(true)}
        onMouseLeave={() => setShowZoomControls(false)}
      >
        {/* Screen reader instructions */}
        <desc id="emotion-wheel-instructions">
          Use Tab para navegar entre as emoções. Enter ou Espaço para selecionar/deselecionar.
          Setas para navegação circular. Shift+R para resetar rotação.
          {enableRotation ? ' Arraste para rotacionar a roda.' : ''}
        </desc>

        {/* Grupo principal com transformação de rotação e escala */}
        <g transform={`translate(${viewState.translate.x} ${viewState.translate.y}) scale(${viewState.scale}) rotate(${viewState.angleDeg} ${centerX} ${centerY})`}>
          {/* Tertiary (outer) */}
          {renderTertiaryEmotions()}

          {/* Secondary (middle) */}
          {renderSecondaryEmotions()}

          {/* Primary (inner) */}
          {renderPrimaryEmotions()}
        </g>

        {/* Center circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radiusInner}
          fill={mergedTheme.colors.background}
          stroke={mergedTheme.colors.border}
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
            fill={mergedTheme.colors.text}
            fontFamily={mergedTheme.typography.fontFamily}
          >
            Roda das Emoções
          </text>
        )}
      </svg>

      {/* Controles de zoom */}
      {enableZoom && showZoomControls && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'flex',
          gap: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={handleZoomOut}
            disabled={viewState.scale <= (minScale || 0.5)}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={handleFitToView}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Fit to view"
          >
            ⌂
          </button>
          <button
            onClick={handleZoomIn}
            disabled={viewState.scale >= (maxScale || 3)}
            style={{
              width: '32px',
              height: '32px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
};

export default EmotionWheel;
