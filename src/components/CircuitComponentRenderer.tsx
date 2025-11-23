import React from 'react';
import { CircuitComponent } from '../store/circuitStore';
import { getTerminalPosition } from '../utils/componentUtils';
import { useLearningStore } from '../store/learningStore';

interface CircuitComponentRendererProps {
  component: CircuitComponent;
  isSelected: boolean;
  onTerminalClick: (componentId: string, terminalId: string) => void;
  wireStart: { componentId: string; terminalId: string } | null;
}

export function CircuitComponentRenderer({
  component,
  isSelected,
  onTerminalClick,
  wireStart,
}: CircuitComponentRendererProps) {
  const { x, y, rotation, type, properties } = component;
  const { isLearningMode, currentStep, simulationSteps } = useLearningStore();

  // Check if this component is highlighted in learning mode
  const currentStepData = isLearningMode && currentStep < simulationSteps.length 
    ? simulationSteps[currentStep] 
    : null;
  const isHighlighted = currentStepData?.highlightedComponents.includes(component.id);

  const renderComponent = () => {
    switch (type) {
      case 'resistor':
        return (
          <g>
            <rect x={-30} y={-6} width={60} height={12} fill="none" stroke="#374151" strokeWidth={2} />
            <line x1={-40} y1={0} x2={-30} y2={0} stroke="#374151" strokeWidth={2} />
            <line x1={30} y1={0} x2={40} y2={0} stroke="#374151" strokeWidth={2} />
            {properties.value && (
              <text y={-15} textAnchor="middle" className="fill-gray-700" fontSize={12}>
                {properties.value}
              </text>
            )}
          </g>
        );

      case 'capacitor':
        return (
          <g>
            <line x1={-40} y1={0} x2={-5} y2={0} stroke="#374151" strokeWidth={2} />
            <line x1={-5} y1={-20} x2={-5} y2={20} stroke="#374151" strokeWidth={3} />
            <line x1={5} y1={-20} x2={5} y2={20} stroke="#374151" strokeWidth={3} />
            <line x1={5} y1={0} x2={40} y2={0} stroke="#374151" strokeWidth={2} />
            {properties.value && (
              <text y={-25} textAnchor="middle" className="fill-gray-700" fontSize={12}>
                {properties.value}
              </text>
            )}
          </g>
        );

      case 'inductor':
        return (
          <g>
            <line x1={-40} y1={0} x2={-20} y2={0} stroke="#374151" strokeWidth={2} />
            <path d="M -20 0 Q -15 -15 -10 0 T 0 0 T 10 0 T 20 0" fill="none" stroke="#374151" strokeWidth={2} />
            <line x1={20} y1={0} x2={40} y2={0} stroke="#374151" strokeWidth={2} />
            {properties.value && (
              <text y={-20} textAnchor="middle" className="fill-gray-700" fontSize={12}>
                {properties.value}
              </text>
            )}
          </g>
        );

      case 'diode':
        return (
          <g>
            <line x1={-40} y1={0} x2={-10} y2={0} stroke="#374151" strokeWidth={2} />
            <polygon points="-10,0 10,-15 10,15" fill="#374151" />
            <line x1={10} y1={-15} x2={10} y2={15} stroke="#374151" strokeWidth={3} />
            <line x1={10} y1={0} x2={40} y2={0} stroke="#374151" strokeWidth={2} />
          </g>
        );

      case 'led':
        return (
          <g>
            <line x1={-40} y1={0} x2={-10} y2={0} stroke="#374151" strokeWidth={2} />
            <polygon points="-10,0 10,-15 10,15" fill="#ef4444" />
            <line x1={10} y1={-15} x2={10} y2={15} stroke="#374151" strokeWidth={3} />
            <line x1={10} y1={0} x2={40} y2={0} stroke="#374151" strokeWidth={2} />
            <path d="M 5 -20 l 5 -8 l -3 0 l 0 -5" stroke="#f59e0b" strokeWidth={2} fill="none" />
            <path d="M 12 -20 l 5 -8 l -3 0 l 0 -5" stroke="#f59e0b" strokeWidth={2} fill="none" />
          </g>
        );

      case 'battery':
        return (
          <g>
            <line x1={-40} y1={0} x2={-10} y2={0} stroke="#374151" strokeWidth={2} />
            <line x1={-10} y1={-20} x2={-10} y2={20} stroke="#374151" strokeWidth={3} />
            <line x1={0} y1={-12} x2={0} y2={12} stroke="#374151" strokeWidth={2} />
            <line x1={10} y1={-20} x2={10} y2={20} stroke="#374151" strokeWidth={3} />
            <line x1={10} y1={0} x2={40} y2={0} stroke="#374151" strokeWidth={2} />
            {properties.value && (
              <text y={-25} textAnchor="middle" className="fill-gray-700" fontSize={12}>
                {properties.value}
              </text>
            )}
          </g>
        );

      case 'ac-source':
        return (
          <g>
            <circle cx={0} cy={0} r={20} fill="none" stroke="#374151" strokeWidth={2} />
            <path d="M -10 0 Q -5 -8 0 0 T 10 0" fill="none" stroke="#374151" strokeWidth={2} />
            <line x1={-40} y1={0} x2={-20} y2={0} stroke="#374151" strokeWidth={2} />
            <line x1={20} y1={0} x2={40} y2={0} stroke="#374151" strokeWidth={2} />
            {properties.value && (
              <text y={35} textAnchor="middle" className="fill-gray-700" fontSize={12}>
                {properties.value}
              </text>
            )}
          </g>
        );

      case 'transistor-npn':
        return (
          <g>
            <circle cx={0} cy={0} r={25} fill="none" stroke="#374151" strokeWidth={2} />
            <line x1={-8} y1={-15} x2={-8} y2={15} stroke="#374151" strokeWidth={3} />
            <line x1={-40} y1={0} x2={-8} y2={0} stroke="#374151" strokeWidth={2} />
            <line x1={-8} y1={-10} x2={15} y2={-25} stroke="#374151" strokeWidth={2} />
            <line x1={15} y1={-25} x2={15} y2={-40} stroke="#374151" strokeWidth={2} />
            <line x1={-8} y1={10} x2={15} y2={25} stroke="#374151" strokeWidth={2} />
            <line x1={15} y1={25} x2={15} y2={40} stroke="#374151" strokeWidth={2} />
            <polygon points="15,25 10,18 8,26" fill="#374151" />
            <text x={-50} y={5} className="fill-gray-700" fontSize={10}>B</text>
            <text x={20} y={-30} className="fill-gray-700" fontSize={10}>C</text>
            <text x={20} y={35} className="fill-gray-700" fontSize={10}>E</text>
          </g>
        );

      case 'ground':
        return (
          <g>
            <line x1={0} y1={-20} x2={0} y2={0} stroke="#374151" strokeWidth={2} />
            <line x1={-20} y1={0} x2={20} y2={0} stroke="#374151" strokeWidth={3} />
            <line x1={-12} y1={6} x2={12} y2={6} stroke="#374151" strokeWidth={2} />
            <line x1={-6} y1={12} x2={6} y2={12} stroke="#374151" strokeWidth={2} />
          </g>
        );

      case 'switch-spst':
        return (
          <g>
            <line x1={-40} y1={0} x2={-15} y2={0} stroke="#374151" strokeWidth={2} />
            <circle cx={-15} cy={0} r={3} fill="#374151" />
            <line x1={-15} y1={0} x2={10} y2={-12} stroke="#374151" strokeWidth={2} />
            <circle cx={15} cy={0} r={3} fill="#374151" />
            <line x1={15} y1={0} x2={40} y2={0} stroke="#374151" strokeWidth={2} />
          </g>
        );

      case 'connector':
        return (
          <g>
            <circle cx={0} cy={0} r={8} fill="#3b82f6" stroke="#1e40af" strokeWidth={2} />
            <text y={25} textAnchor="middle" className="fill-gray-700" fontSize={10}>
              {properties.label || 'CON'}
            </text>
          </g>
        );

      case 'label':
        return (
          <g>
            <text textAnchor="middle" className="fill-gray-900" fontSize={14}>
              {properties.label || 'Label'}
            </text>
          </g>
        );

      case 'text':
        return (
          <g>
            <rect 
              x={-60} 
              y={-15} 
              width={120} 
              height={30} 
              fill="white" 
              stroke="#94a3b8" 
              strokeWidth={1}
              rx={4}
            />
            <text 
              textAnchor="middle" 
              y={5} 
              className="fill-gray-900" 
              fontSize={12}
            >
              {properties.text || 'Double-click to edit'}
            </text>
          </g>
        );

      default:
        return (
          <g>
            <rect x={-20} y={-20} width={40} height={40} fill="#e5e7eb" stroke="#374151" strokeWidth={2} />
            <text textAnchor="middle" y={5} className="fill-gray-700" fontSize={10}>
              {type}
            </text>
          </g>
        );
    }
  };

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`}>
      {/* Selection indicator */}
      {isSelected && (
        <circle cx={0} cy={0} r={50} fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5,5" />
      )}

      {/* Highlight indicator */}
      {isHighlighted && (
        <circle cx={0} cy={0} r={50} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5,5" />
      )}

      {/* Component */}
      {renderComponent()}

      {/* Label */}
      {properties.label && type !== 'label' && (
        <text y={45} textAnchor="middle" className="fill-gray-600" fontSize={10}>
          {properties.label}
        </text>
      )}

      {/* Terminals */}
      {component.terminals.map(terminal => {
        const terminalPos = getTerminalPosition(component, terminal);
        const isWireStart = wireStart?.componentId === component.id && wireStart?.terminalId === terminal.id;
        
        return (
          <circle
            key={terminal.id}
            cx={terminal.x}
            cy={terminal.y}
            r={5}
            fill={isWireStart ? '#3b82f6' : '#10b981'}
            stroke="#065f46"
            strokeWidth={2}
            className="cursor-pointer hover:fill-blue-400"
            onClick={(e) => {
              e.stopPropagation();
              onTerminalClick(component.id, terminal.id);
            }}
          />
        );
      })}
    </g>
  );
}