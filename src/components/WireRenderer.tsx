import React from 'react';
import { Wire } from '../store/circuitStore';
import { useCircuitStore } from '../store/circuitStore';
import { useLearningStore } from '../store/learningStore';

interface WireRendererProps {
  wire: Wire;
}

export function WireRenderer({ wire }: WireRendererProps) {
  const components = useCircuitStore(state => state.components);
  const selectedWireId = useCircuitStore(state => state.selectedWireId);
  const selectWire = useCircuitStore(state => state.selectWire);
  const deleteWire = useCircuitStore(state => state.deleteWire);
  const simulationResult = useCircuitStore(state => state.simulationResult);
  
  const { isLearningMode, currentStep, simulationSteps, particles } = useLearningStore();

  const fromComponent = components.find(c => c.id === wire.from.componentId);
  const toComponent = components.find(c => c.id === wire.to.componentId);

  if (!fromComponent || !toComponent) return null;

  const fromTerminal = fromComponent.terminals.find(t => t.id === wire.from.terminalId);
  const toTerminal = toComponent.terminals.find(t => t.id === wire.to.terminalId);

  if (!fromTerminal || !toTerminal) return null;

  // Calculate terminal positions with rotation
  const getRotatedTerminalPos = (comp: typeof fromComponent, terminal: typeof fromTerminal) => {
    const rad = (comp.rotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return {
      x: comp.x + terminal.x * cos - terminal.y * sin,
      y: comp.y + terminal.x * sin + terminal.y * cos,
    };
  };

  const start = getRotatedTerminalPos(fromComponent, fromTerminal);
  const end = getRotatedTerminalPos(toComponent, toTerminal);

  // Simple auto-routing with right angles
  const midX = (start.x + end.x) / 2;
  const pathData = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;

  const isSelected = selectedWireId === wire.id;
  
  // Check if this wire has current flowing (from simulation)
  const hasCurrent = simulationResult?.componentCurrents[wire.id];
  
  // Check if this wire is highlighted in learning mode
  const currentStepData = isLearningMode && currentStep < simulationSteps.length 
    ? simulationSteps[currentStep] 
    : null;
  const isHighlighted = currentStepData?.highlightedWires.includes(wire.id);
  const hasFlowAnimation = currentStepData?.currentFlow.some(f => f.wireId === wire.id);

  // Get particles for this wire
  const wireParticles = particles.filter(p => p.wireId === wire.id);

  // Calculate wire color based on learning mode
  let wireColor = '#374151'; // default gray
  if (isLearningMode && isHighlighted) {
    wireColor = '#fbbf24'; // yellow for highlighted
  } else if (hasCurrent) {
    wireColor = '#ef4444'; // red for current
  } else if (isSelected) {
    wireColor = '#3b82f6'; // blue for selected
  }

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        selectWire(wire.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (confirm('Delete this wire?')) {
          deleteWire(wire.id);
        }
      }}
    >
      {/* Wire path */}
      <path
        d={pathData}
        fill="none"
        stroke={wireColor}
        strokeWidth={isSelected || isHighlighted ? 3 : 2}
        className="cursor-pointer hover:stroke-blue-400"
      />

      {/* Current flow animation */}
      {(hasCurrent || hasFlowAnimation) && (
        <>
          <path
            d={pathData}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={4}
            strokeDasharray="10,10"
            className="animate-pulse"
            opacity={0.6}
          >
            <animate
              attributeName="stroke-dashoffset"
              from="0"
              to="20"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
          
          {/* Current arrow */}
          <polygon
            points={`${end.x - 5},${end.y - 5} ${end.x + 5},${end.y} ${end.x - 5},${end.y + 5}`}
            fill="#ef4444"
          />
        </>
      )}

      {/* Learning mode: Current flow particles */}
      {isLearningMode && hasFlowAnimation && wireParticles.map(particle => {
        // Calculate position along path based on progress
        const pathLength = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
        const segment1Length = Math.abs(midX - start.x);
        const segment2Length = Math.abs(end.y - start.y);
        const segment3Length = Math.abs(end.x - midX);
        
        let x, y;
        const totalProgress = particle.progress * pathLength;
        
        if (totalProgress < segment1Length) {
          // First horizontal segment
          x = start.x + (totalProgress / segment1Length) * (midX - start.x);
          y = start.y;
        } else if (totalProgress < segment1Length + segment2Length) {
          // Vertical segment
          x = midX;
          const vertProgress = (totalProgress - segment1Length) / segment2Length;
          y = start.y + vertProgress * (end.y - start.y);
        } else {
          // Final horizontal segment
          x = midX;
          const finalProgress = (totalProgress - segment1Length - segment2Length) / segment3Length;
          x = midX + finalProgress * (end.x - midX);
          y = end.y;
        }
        
        return (
          <g key={particle.id}>
            <circle cx={x} cy={y} r={4} fill="#fbbf24" opacity={0.8}>
              <animate
                attributeName="r"
                values="4;6;4"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx={x} cy={y} r={8} fill="#fbbf24" opacity={0.3}>
              <animate
                attributeName="r"
                values="8;12;8"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}

      {/* Hover target (wider invisible path for easier selection) */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={10}
        className="cursor-pointer"
      />
    </g>
  );
}