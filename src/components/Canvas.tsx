import React, { useRef, useEffect, useState } from 'react';
import { useCircuitStore, CircuitComponent } from '../store/circuitStore';
import { CircuitComponentRenderer } from './CircuitComponentRenderer';
import { WireRenderer } from './WireRenderer';
import { DrawingLayer } from './DrawingLayer';
import { ReferenceImageOverlay } from './ReferenceImageOverlay';
import { createComponent, getTerminalPosition } from '../utils/componentUtils';

export function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedComponentId, setDraggedComponentId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const {
    components,
    wires,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    selectedComponentId,
    tool,
    wireStart,
    setWireStart,
    addWire,
    zoom,
    panOffset,
    setPanOffset,
    gridEnabled,
  } = useCircuitStore();

  const gridSize = 20;

  const snapToGrid = (value: number) => {
    if (!gridEnabled) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const screenToSVG = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - panOffset.x) / zoom;
    const y = (clientY - rect.top - panOffset.y) / zoom;
    return { x, y };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentData = e.dataTransfer.getData('component');
    if (!componentData) return;

    const componentDef = JSON.parse(componentData);
    const { x, y } = screenToSVG(e.clientX, e.clientY);
    
    const newComponent = createComponent(
      componentDef.type,
      snapToGrid(x),
      snapToGrid(y),
      componentDef.defaultValue
    );
    
    addComponent(newComponent);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    const { x, y } = screenToSVG(e.clientX, e.clientY);

    if (tool === 'pan' || e.shiftKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (tool === 'select') {
      // Check if clicking on a component
      let foundComponent = false;
      for (const component of components) {
        const dx = x - component.x;
        const dy = y - component.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 40) {
          setDraggedComponentId(component.id);
          setDragOffset({ x: x - component.x, y: y - component.y });
          setIsDragging(true);
          selectComponent(component.id);
          foundComponent = true;
          break;
        }
      }
      if (!foundComponent) {
        selectComponent(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (isDragging && draggedComponentId) {
      const { x, y } = screenToSVG(e.clientX, e.clientY);
      updateComponent(draggedComponentId, {
        x: snapToGrid(x - dragOffset.x),
        y: snapToGrid(y - dragOffset.y),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedComponentId(null);
    setIsPanning(false);
  };

  const handleTerminalClick = (componentId: string, terminalId: string) => {
    if (tool !== 'wire') return;

    if (!wireStart) {
      setWireStart({ componentId, terminalId });
    } else {
      if (wireStart.componentId !== componentId) {
        const component1 = components.find(c => c.id === wireStart.componentId);
        const component2 = components.find(c => c.id === componentId);
        
        if (component1 && component2) {
          const terminal1 = component1.terminals.find(t => t.id === wireStart.terminalId);
          const terminal2 = component2.terminals.find(t => t.id === terminalId);
          
          if (terminal1 && terminal2) {
            const start = getTerminalPosition(component1, terminal1);
            const end = getTerminalPosition(component2, terminal2);
            
            addWire({
              id: `wire-${Date.now()}-${Math.random()}`,
              from: { componentId: wireStart.componentId, terminalId: wireStart.terminalId },
              to: { componentId, terminalId },
              points: [start, end],
            });
          }
        }
      }
      setWireStart(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Delete' && selectedComponentId) {
      deleteComponent(selectedComponentId);
    }
    if (e.key === 'Escape') {
      selectComponent(null);
      setWireStart(null);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId]);

  return (
    <div
      className="flex-1 bg-gray-100 overflow-hidden relative"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <svg
        ref={svgRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        id="circuit-canvas"
      >
        <defs>
          <pattern
            id="grid"
            width={gridSize * zoom}
            height={gridSize * zoom}
            patternUnits="userSpaceOnUse"
            x={panOffset.x}
            y={panOffset.y}
          >
            <circle cx={0} cy={0} r={1} fill="#d1d5db" />
          </pattern>
        </defs>

        {gridEnabled && (
          <rect width="100%" height="100%" fill="url(#grid)" />
        )}

        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
          {/* Render wires first (below components) */}
          {wires.map(wire => (
            <WireRenderer key={wire.id} wire={wire} />
          ))}

          {/* Render components */}
          {components.map(component => (
            <CircuitComponentRenderer
              key={component.id}
              component={component}
              isSelected={component.id === selectedComponentId}
              onTerminalClick={handleTerminalClick}
              wireStart={wireStart}
            />
          ))}

          {/* Wire preview */}
          {tool === 'wire' && wireStart && (
            <text
              x={10 / zoom}
              y={30 / zoom}
              className="fill-blue-600"
              fontSize={14 / zoom}
            >
              Click a terminal to complete the wire
            </text>
          )}
        </g>
      </svg>

      {/* Instructions overlay */}
      {components.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 max-w-md">
            <h3 className="text-gray-900 mb-2">Get Started</h3>
            <ul className="text-gray-600 space-y-1">
              <li>• Drag components from the left panel onto the canvas</li>
              <li>• Use the Wire tool to connect components</li>
              <li>• Click Simulate to test your circuit</li>
              <li>• Export your design when ready</li>
            </ul>
          </div>
        </div>
      )}

      {/* Drawing Layer for annotations */}
      <DrawingLayer />
      {/* Reference Image Overlay */}
      <ReferenceImageOverlay />
    </div>
  );
}