import React, { useState } from 'react';
import { X, Search, Zap, BookOpen, Cpu, Battery } from 'lucide-react';
import { CIRCUIT_TEMPLATES, CircuitTemplate } from '../utils/circuitTemplates';
import { useCircuitStore } from '../store/circuitStore';
import { useProjectStore } from '../store/projectStore';
import { toast } from 'sonner@2.0.3';

interface TemplatesModalProps {
  onClose: () => void;
}

export function TemplatesModal({ onClose }: TemplatesModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { importCircuit } = useCircuitStore();
  const { createProject } = useProjectStore();

  const categories = [
    { id: 'all', name: 'All Templates', icon: Zap },
    { id: 'learning', name: 'Learning', icon: BookOpen },
    { id: 'basic', name: 'Basic Circuits', icon: Battery },
    { id: 'analog', name: 'Analog', icon: Cpu },
  ];

  const filteredTemplates = CIRCUIT_TEMPLATES.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const loadTemplate = (template: CircuitTemplate) => {
    createProject(template.name);
    importCircuit({
      components: template.components,
      wires: template.wires,
    });
    toast.success(`Loaded: ${template.name}`);
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Circuit Templates</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-4 border-b border-gray-200 flex gap-2 overflow-x-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-emerald-500 transition-all hover:shadow-lg cursor-pointer group"
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-gray-900 group-hover:text-emerald-600 transition-colors">
                      {template.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getDifficultyColor(
                        template.difficulty
                      )}`}
                    >
                      {template.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.components.length} components</span>
                    <span className="text-emerald-600 group-hover:underline">
                      Load template →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
