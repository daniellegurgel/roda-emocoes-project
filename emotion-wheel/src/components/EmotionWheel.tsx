import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { EmotionWheelProps, WheelViewState } from '../types/emotion-wheel';

const EmotionWheel: React.FC<EmotionWheelProps> = ({
  data,
  theme,
  selectionMode = 'multiple',
  maxSelected,
  initialView = { angleDeg: 0, scale: 1, translate: { x: 0, y: 0 } },
  onSelectionChange,
  onViewChange,
  snapToSectors = true,
  snapToleranceDeg = 5,
  inertia = false,
  minScale = 0.5,
  maxScale = 3.0,
  disableKeyboard = false,
  disableRotation = false,
  disableZoom = false,
  disableModalCloseOnEsc = false,
  labelFormatter = (label) => label,
}) => {
  const [viewState, setViewState] = useState<WheelViewState>(initialView);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [rotationVelocity, setRotationVelocity] = useState(0);
  const [lastRotationTime, setLastRotationTime] = useState(0);
  const [lastRotationAngle, setLastRotationAngle] = useState(0);

  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Handle selection logic
  const handleNodeClick = useCallback((nodeId: string) => {
    if (data.nodes.find(node => node.id === nodeId)?.disabled) return;

    setSelectedIds(prev => {
      let newSelection: string[];
      
      if (selectionMode === 'single') {
        newSelection = prev.includes(nodeId) ? [] : [nodeId];
      } else {
        if (prev.includes(nodeId)) {
          newSelection = prev.filter(id => id !== nodeId);
        } else {
          const maxSelect = maxSelected || data.nodes.length;
          if (prev.length < maxSelect) {
            newSelection = [...prev, nodeId];
          } else {
            newSelection = prev;
          }
        }
      }
      
      onSelectionChange(newSelection);
      return newSelection;
    });
  }, [data.nodes, selectionMode, maxSelected, onSelectionChange]);

  // Handle rotation
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disableRotation) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastRotationTime(Date.now());
    setLastRotationAngle(viewState.angleDeg);
  }, [disableRotation, viewState.angleDeg]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart || disableRotation) return;

    const centerX = (svgRef.current?.clientWidth || 0) / 2;
    const centerY = (svgRef.current?.clientHeight || 0) / 2;
    
    const startAngle = Math.atan2(dragStart.y - centerY, dragStart.x - centerX);
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
    
    const newAngle = viewState.angleDeg + deltaAngle;
    const now = Date.now();
    const timeDelta = now - lastRotationTime;
    
    if (timeDelta > 0) {
      const velocity = (newAngle - lastRotationAngle) / timeDelta;
      setRotationVelocity(velocity);
    }
    
    setLastRotationTime(now);
    setLastRotationAngle(newAngle);
    
    const newViewState = { ...viewState, angleDeg: newAngle };
    setViewState(newViewState);
    onViewChange?.(newViewState);
    
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, disableRotation, viewState, lastRotationTime, lastRotationAngle, onViewChange]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    setDragStart(null);
  }, [isDragging]);

  // Handle zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (disableZoom) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(minScale, Math.min(maxScale, viewState.scale * delta));
    
    if (newScale !== viewState.scale) {
      const newViewState = { ...viewState, scale: newScale };
      setViewState(newViewState);
      onViewChange?.(newViewState);
    }
  }, [disableZoom, viewState, minScale, maxScale, onViewChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disableKeyboard) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        const leftAngle = viewState.angleDeg - 15;
        const newLeftViewState = { ...viewState, angleDeg: leftAngle };
        setViewState(newLeftViewState);
        onViewChange?.(newLeftViewState);
        break;
      case 'ArrowRight':
        e.preventDefault();
        const rightAngle = viewState.angleDeg + 15;
        const newRightViewState = { ...viewState, angleDeg: rightAngle };
        setViewState(newRightViewState);
        onViewChange?.(newRightViewState);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (hoveredId) {
          handleNodeClick(hoveredId);
        }
        break;
      case 'Escape':
        if (!disableModalCloseOnEsc) {
          setSelectedIds([]);
          onSelectionChange([]);
        }
        break;
    }
  }, [disableKeyboard, viewState, onViewChange, hoveredId, handleNodeClick, disableModalCloseOnEsc, onSelectionChange]);

  // Inertia animation
  useEffect(() => {
    if (!inertia || !isDragging || Math.abs(rotationVelocity) < 0.1) return;

    const animate = () => {
      setViewState(prev => {
        const newAngle = prev.angleDeg + rotationVelocity * 16; // 60fps
        const newViewState = { ...prev, angleDeg: newAngle };
        onViewChange?.(newViewState);
        return newViewState;
      });
      
      setRotationVelocity(prev => prev * 0.95); // Friction
      
      if (Math.abs(rotationVelocity) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [inertia, isDragging, rotationVelocity, onViewChange]);

  // Snap to sectors
  useEffect(() => {
    if (!snapToSectors || isDragging) return;

    const snapAngle = Math.round(viewState.angleDeg / 15) * 15;
    if (Math.abs(viewState.angleDeg - snapAngle) > snapToleranceDeg) return;

    const newViewState = { ...viewState, angleDeg: snapAngle };
    setViewState(newViewState);
    onViewChange?.(newViewState);
  }, [snapToSectors, isDragging, viewState, snapToleranceDeg, onViewChange]);

  return (
    <div
      className="emotion-wheel-container"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 400 400"
        style={{
          width: '100%',
          height: '100%',
          background: theme.colors.background,
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g
          transform={`rotate(${viewState.angleDeg}) scale(${viewState.scale}) translate(${viewState.translate.x}, ${viewState.translate.y})`}
        >
          {/* Render emotion nodes */}
          {data.nodes.map((node) => {
            const isSelected = selectedIds.includes(node.id);
            const isHovered = hoveredId === node.id;
            const isDisabled = node.disabled;

            return (
              <g key={node.id}>
                <motion.path
                  d={node.pathId}
                  fill={
                    isDisabled
                      ? theme.colors.disabled
                      : isSelected
                      ? theme.colors.selected
                      : isHovered
                      ? theme.colors.hover
                      : node.color
                  }
                  stroke={theme.colors.border}
                  strokeWidth="2"
                  style={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontFamily: theme.typography.fontFamily,
                    fontSize: theme.typography.fontSize.medium,
                    fontWeight: theme.typography.fontWeight.normal,
                    fill: theme.colors.text,
                    pointerEvents: 'none',
                  }}
                >
                  {labelFormatter(node.label, node)}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default EmotionWheel;