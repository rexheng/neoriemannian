/**
 * @fileoverview Tonnetz visualization component with animated traversal
 * @module components/TonnetzVisualiser
 */

import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '../utils/cn';
import { CHORD_COLOURS, STRINGS } from '../constants';
import Badge from './ui/Badge';

/**
 * SVG Grid Pattern component
 */
const GridPattern = memo(() => (
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1" />
    </pattern>
    {/* Glow filter for active node */}
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    {/* Arrow marker for edges */}
    <marker
      id="arrowhead"
      markerWidth="10"
      markerHeight="7"
      refX="9"
      refY="3.5"
      orient="auto"
    >
      <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
    </marker>
  </defs>
));

GridPattern.displayName = 'GridPattern';

/**
 * Edge/connection component between nodes
 */
const Edge = memo(({ from, to, type, isAnimating }) => {
  const [dashOffset, setDashOffset] = useState(0);
  
  useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setDashOffset(prev => (prev + 1) % 8);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating]);

  const pathLength = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
  );

  return (
    <g className="transition-opacity duration-300">
      {/* Main line */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#52525b"
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeDashoffset={isAnimating ? dashOffset : 0}
        className="transition-all duration-300"
      />
      {/* Transformation label */}
      <text
        x={(from.x + to.x) / 2}
        y={(from.y + to.y) / 2 - 8}
        textAnchor="middle"
        fill="#71717a"
        fontSize="10"
        className="font-bold select-none"
      >
        {type}
      </text>
    </g>
  );
});

Edge.displayName = 'Edge';

Edge.propTypes = {
  from: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
  to: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }).isRequired,
  type: PropTypes.string.isRequired,
  isAnimating: PropTypes.bool,
};

/**
 * Chord node component
 */
const ChordNode = memo(({ node, isActive, onClick }) => {
  const colors = CHORD_COLOURS[node.type] || CHORD_COLOURS.Unknown;
  
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    onClick?.(node);
  }, [onClick, node]);

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
  }, []);
  
  return (
    <g 
      className={cn(
        "transition-all duration-500 cursor-pointer",
        isActive && "animate-pulse"
      )}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      style={{ pointerEvents: 'auto' }}
    >
      {/* Glow effect for active node */}
      {isActive && (
        <circle
          cx={node.x}
          cy={node.y}
          r={20}
          fill={colors.fill}
          opacity={0.3}
          className="animate-ping"
        />
      )}
      
      {/* Main node circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={isActive ? 16 : 8}
        fill={colors.fill}
        stroke={isActive ? '#fff' : colors.stroke}
        strokeWidth={isActive ? 3 : 1}
        filter={isActive ? 'url(#glow)' : undefined}
        className="transition-all duration-300 hover:r-12"
        style={{
          transform: isActive ? 'scale(1)' : 'scale(1)',
          transformOrigin: `${node.x}px ${node.y}px`
        }}
      />

      {/* Label background and text for active node */}
      {isActive && (
        <g className="animate-in fade-in-0 zoom-in-95 duration-300">
          <rect
            x={node.x - 28}
            y={node.y + 22}
            width="56"
            height="20"
            rx="4"
            fill="#09090b"
            stroke="#27272a"
            strokeWidth="1"
          />
          <text
            x={node.x}
            y={node.y + 35}
            textAnchor="middle"
            fill="#e4e4e7"
            fontSize="10"
            className="font-bold tracking-wider select-none"
          >
            {node.label}
          </text>
        </g>
      )}
      
      {/* Small label for inactive nodes */}
      {!isActive && (
        <text
          x={node.x}
          y={node.y + 20}
          textAnchor="middle"
          fill="#71717a"
          fontSize="8"
          className="select-none"
        >
          {node.label?.split(' ')[0]}
        </text>
      )}
    </g>
  );
});

ChordNode.displayName = 'ChordNode';

ChordNode.propTypes = {
  node: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    label: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
};

/**
 * Main Tonnetz Visualiser component
 * Renders an interactive SVG showing chord traversal
 */
const TonnetzVisualiser = memo(({ 
  history, 
  edges, 
  viewBox,
  currentChord,
  onViewBoxChange,
  onNodeClick,
  className 
}) => {
  const svgRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [localViewBox, setLocalViewBox] = useState(viewBox);
  
  // Sync local viewBox with prop when it changes externally
  useEffect(() => {
    setLocalViewBox(viewBox);
  }, [viewBox]);
  
  // Memoize viewBox string
  const viewBoxString = useMemo(() => 
    `${localViewBox.x} ${localViewBox.y} ${localViewBox.w} ${localViewBox.h}`,
    [localViewBox]
  );

  // Handle mouse/touch down for panning
  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return; // Only left click for mouse
    setIsPanning(true);
    setPanStart({ 
      x: e.clientX, 
      y: e.clientY,
      vbX: localViewBox.x,
      vbY: localViewBox.y
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [localViewBox]);

  // Handle mouse/touch move for panning
  const handlePointerMove = useCallback((e) => {
    if (!isPanning) return;
    
    const svg = svgRef.current;
    if (!svg) return;
    
    // Calculate scale factor based on viewBox vs actual size
    const rect = svg.getBoundingClientRect();
    const scaleX = localViewBox.w / rect.width;
    const scaleY = localViewBox.h / rect.height;
    
    const dx = (e.clientX - panStart.x) * scaleX;
    const dy = (e.clientY - panStart.y) * scaleY;
    
    setLocalViewBox(prev => ({
      ...prev,
      x: panStart.vbX - dx,
      y: panStart.vbY - dy
    }));
  }, [isPanning, panStart, localViewBox.w, localViewBox.h]);

  // Handle mouse/touch up to end panning
  const handlePointerUp = useCallback((e) => {
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    // Notify parent of viewBox change
    if (onViewBoxChange) {
      onViewBoxChange(localViewBox);
    }
  }, [localViewBox, onViewBoxChange]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Convert mouse position to SVG coordinates
    const svgX = localViewBox.x + (mouseX / rect.width) * localViewBox.w;
    const svgY = localViewBox.y + (mouseY / rect.height) * localViewBox.h;
    
    // Zoom factor
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newW = Math.max(100, Math.min(1000, localViewBox.w * zoomFactor));
    const newH = Math.max(100, Math.min(1000, localViewBox.h * zoomFactor));
    
    // Adjust position to zoom toward mouse
    const newX = svgX - (mouseX / rect.width) * newW;
    const newY = svgY - (mouseY / rect.height) * newH;
    
    setLocalViewBox({ x: newX, y: newY, w: newW, h: newH });
  }, [localViewBox]);

  // Center view on current chord
  const centerOnCurrent = useCallback(() => {
    if (history.length > 0) {
      const current = history[history.length - 1];
      setLocalViewBox(prev => ({
        ...prev,
        x: current.x - prev.w / 2,
        y: current.y - prev.h / 2
      }));
    }
  }, [history]);

  return (
    <div className={cn(
      "flex-1 relative bg-zinc-950 overflow-hidden min-h-[300px] md:min-h-0",
      className
    )}>
      {/* Status badge */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
        <Badge 
          variant="secondary" 
          className="bg-zinc-900/80 backdrop-blur text-zinc-500 border-zinc-800 text-xs"
        >
          {history.length} nodes • {edges.length} edges
        </Badge>
      </div>

      {/* Center button */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 sm:top-4 z-10">
        <button
          onClick={centerOnCurrent}
          className="px-3 py-1.5 text-xs bg-zinc-900/80 backdrop-blur text-zinc-400 border border-zinc-800 rounded-md hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
        >
          Center View
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex flex-wrap gap-1.5 sm:gap-2 max-w-[200px] sm:max-w-none justify-end">
        {Object.entries(CHORD_COLOURS).slice(0, 4).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1 sm:gap-1.5">
            <div 
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
              style={{ backgroundColor: colors.fill }}
            />
            <span className="text-[10px] sm:text-xs text-zinc-500 hidden sm:inline">{type}</span>
          </div>
        ))}
      </div>

      {/* Pan/zoom hint */}
      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10">
        <span className="text-[10px] text-zinc-600">
          Drag to pan • Scroll to zoom
        </span>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        viewBox={viewBoxString}
        className={cn(
          "w-full h-full transition-all duration-200",
          isPanning ? "cursor-grabbing" : "cursor-grab"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: 'none' }}
      >
        <GridPattern />
        
        {/* Background grid */}
        <rect
          x={viewBox.x - 1000}
          y={viewBox.y - 1000}
          width={viewBox.w + 2000}
          height={viewBox.h + 2000}
          fill="url(#grid)"
        />

        {/* Render edges */}
        <g className="edges">
          {edges.map((edge, i) => (
            <Edge
              key={i}
              from={edge.from}
              to={edge.to}
              type={edge.type}
              isAnimating={i === edges.length - 1}
            />
          ))}
        </g>

        {/* Render nodes */}
        <g className="nodes">
          {history.map((node, i) => {
            // Check if this node matches the current chord
            const isActive = currentChord && node.notes && 
              JSON.stringify([...node.notes].sort()) === JSON.stringify([...currentChord].sort());
            return (
              <ChordNode
                key={node.id}
                node={node}
                isActive={isActive}
                onClick={onNodeClick}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
});

TonnetzVisualiser.displayName = 'TonnetzVisualiser';

TonnetzVisualiser.propTypes = {
  history: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    x: PropTypes.number,
    y: PropTypes.number,
    label: PropTypes.string,
    type: PropTypes.string,
    notes: PropTypes.arrayOf(PropTypes.number),
  })).isRequired,
  edges: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.object,
    to: PropTypes.object,
    type: PropTypes.string,
  })).isRequired,
  viewBox: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    w: PropTypes.number,
    h: PropTypes.number,
  }).isRequired,
  currentChord: PropTypes.arrayOf(PropTypes.number),
  onViewBoxChange: PropTypes.func,
  onNodeClick: PropTypes.func,
  className: PropTypes.string,
};

export default TonnetzVisualiser;
