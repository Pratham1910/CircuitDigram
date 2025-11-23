import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { ComponentType, useCircuitStore } from '../store/circuitStore';
import { templates, getTemplateWithWires } from '../utils/templates';
import { toast } from 'sonner@2.0.3';

interface ComponentDefinition {
  type: ComponentType;
  name: string;
  category: string;
  defaultValue?: string;
}

const COMPONENTS: ComponentDefinition[] = [
  { type: 'resistor', name: 'Resistor', category: 'Passive', defaultValue: '1kΩ' },
  { type: 'capacitor', name: 'Capacitor', category: 'Passive', defaultValue: '10µF' },
  { type: 'inductor', name: 'Inductor', category: 'Passive', defaultValue: '100mH' },
  { type: 'diode', name: 'Diode', category: 'Semiconductor' },
  { type: 'led', name: 'LED', category: 'Semiconductor' },
  { type: 'transistor-npn', name: 'NPN Transistor', category: 'Semiconductor' },
  { type: 'transistor-pnp', name: 'PNP Transistor', category: 'Semiconductor' },
  { type: 'mosfet', name: 'MOSFET', category: 'Semiconductor' },
  { type: 'battery', name: 'Battery', category: 'Source', defaultValue: '9V' },
  { type: 'ac-source', name: 'AC Source', category: 'Source', defaultValue: '120V' },
  { type: 'switch-spst', name: 'Switch (SPST)', category: 'Control' },
  { type: 'switch-spdt', name: 'Switch (SPDT)', category: 'Control' },
  { type: 'ic', name: 'IC Block', category: 'Integrated' },
  { type: 'connector', name: 'Connector', category: 'Other' },
  { type: 'ground', name: 'Ground', category: 'Other' },
  { type: 'label', name: 'Text Label', category: 'Other' },
  { type: 'text', name: 'Text Field', category: 'Other' },
];

export function ComponentLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['Passive', 'Semiconductor', 'Source'])
  );

  const filteredComponents = COMPONENTS.filter(comp =>
    comp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(COMPONENTS.map(c => c.category)));

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleDragStart = (e: React.DragEvent, component: ComponentDefinition) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const loadTemplate = (templateName: string) => {
    const template = templates[templateName];
    if (!template) {
      toast.error('Template not found');
      return;
    }
    const templateWithWires = getTemplateWithWires(template);
    useCircuitStore.getState().loadCircuit(templateWithWires);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-900 mb-3">Components</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {categories.map(category => {
          const categoryComponents = filteredComponents.filter(c => c.category === category);
          if (categoryComponents.length === 0) return null;

          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="border-b border-gray-200">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50"
              >
                <span className="text-gray-700">{category}</span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-2 pb-2">
                  {categoryComponents.map(component => (
                    <div
                      key={component.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, component)}
                      className="p-3 mb-1 bg-gray-50 hover:bg-blue-50 rounded cursor-move border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-900">{component.name}</span>
                      </div>
                      {component.defaultValue && (
                        <span className="text-gray-500 mt-1 block">
                          {component.defaultValue}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-gray-600">
          Drag components onto the canvas to start building your circuit.
        </p>
      </div>
    </div>
  );
}