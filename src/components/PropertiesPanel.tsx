import React, { useState, useEffect } from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { RotateCw, Trash2 } from 'lucide-react';

export function PropertiesPanel() {
  const { selectedComponentId, components, updateComponent, deleteComponent } = useCircuitStore();
  
  const component = components.find(c => c.id === selectedComponentId);
  
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [text, setText] = useState('');
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (component) {
      setLabel(component.properties.label || '');
      setValue(component.properties.value || '');
      setText(component.properties.text || '');
      setRotation(component.rotation || 0);
    }
  }, [component]);

  if (!component) return null;

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    updateComponent(component.id, {
      properties: { ...component.properties, label: newLabel }
    });
  };

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    updateComponent(component.id, {
      properties: { ...component.properties, value: newValue }
    });
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    updateComponent(component.id, {
      properties: { ...component.properties, text: newText }
    });
  };

  const handleRotationChange = (newRotation: number) => {
    setRotation(newRotation);
    updateComponent(component.id, { rotation: newRotation });
  };

  const handleDelete = () => {
    if (confirm('Delete this component?')) {
      deleteComponent(component.id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-900">Properties</h2>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">
            Component Type
          </label>
          <input
            type="text"
            value={component.type}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Label
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Enter label..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {component.type !== 'label' && component.type !== 'connector' && component.type !== 'ground' && component.type !== 'text' && (
          <div>
            <label className="block text-gray-700 mb-2">
              Value
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Enter value..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-500 mt-1">
              Examples: 1kΩ, 10µF, 100mH, 9V
            </p>
          </div>
        )}

        {component.type === 'text' && (
          <div>
            <label className="block text-gray-700 mb-2">
              Text Content
            </label>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your text here..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        )}

        <div>
          <label className="block text-gray-700 mb-2">
            Rotation
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="360"
              step="90"
              value={rotation}
              onChange={(e) => handleRotationChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-gray-600 min-w-[3rem] text-center">
              {rotation}°
            </span>
            <button
              onClick={() => handleRotationChange((rotation + 90) % 360)}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Position
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={Math.round(component.x)}
              onChange={(e) => updateComponent(component.id, { x: Number(e.target.value) })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="X"
            />
            <input
              type="number"
              value={Math.round(component.y)}
              onChange={(e) => updateComponent(component.id, { y: Number(e.target.value) })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Y"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete Component
          </button>
        </div>

        <div className="text-gray-600 p-3 bg-gray-50 rounded">
          <p className="mb-2">Keyboard Shortcuts:</p>
          <ul className="space-y-1">
            <li>• Delete: Remove component</li>
            <li>• Esc: Deselect</li>
            <li>• V: Select tool</li>
            <li>• W: Wire tool</li>
          </ul>
        </div>
      </div>
    </div>
  );
}