import React from 'react';
import { useCircuitStore } from '../store/circuitStore';
import { AlertCircle, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

export function SimulationPanel() {
  const { simulationResult, components } = useCircuitStore();

  if (!simulationResult) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-gray-900">Simulation</h2>
        </div>
        <div className="p-4">
          <p className="text-gray-600">Run simulation to see results</p>
        </div>
      </div>
    );
  }

  const { nodeVoltages, componentCurrents, errors, warnings } = simulationResult;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-gray-900">Simulation Results</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Errors */}
        {errors.length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="text-red-900">Errors</h3>
            </div>
            <ul className="space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="text-red-700">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="text-yellow-900">Warnings</h3>
            </div>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li key={index} className="text-yellow-700">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success message */}
        {errors.length === 0 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-900">Simulation completed successfully</span>
            </div>
          </div>
        )}

        {/* Node Voltages */}
        {Object.keys(nodeVoltages).length > 0 && (
          <div>
            <h3 className="text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Node Voltages
            </h3>
            <div className="space-y-2">
              {Object.entries(nodeVoltages).map(([nodeId, voltage]) => (
                <div key={nodeId} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-700">Node {nodeId}</span>
                  <span className="text-gray-900">{voltage.toFixed(3)} V</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Component Currents */}
        {Object.keys(componentCurrents).length > 0 && (
          <div>
            <h3 className="text-gray-900 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Component Currents
            </h3>
            <div className="space-y-2">
              {Object.entries(componentCurrents).map(([componentId, current]) => {
                const component = components.find(c => c.id === componentId);
                const label = component?.properties.label || component?.type || componentId;
                
                return (
                  <div key={componentId} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-700">{label}</span>
                    <span className="text-gray-900">{Math.abs(current).toFixed(3)} A</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-gray-600 p-3 bg-blue-50 border border-blue-200 rounded">
          <h4 className="text-blue-900 mb-2">About Simulation</h4>
          <p>
            This is a basic DC circuit simulator. It calculates:
          </p>
          <ul className="mt-2 space-y-1">
            <li>• Node voltages using KCL</li>
            <li>• Current through components</li>
            <li>• Open/short circuit detection</li>
          </ul>
          <p className="mt-2">
            Red animated wires indicate current flow.
          </p>
        </div>
      </div>
    </div>
  );
}
