import React, { useRef, useState } from 'react';
import { 
  Download, Upload, Play, FileText, RotateCcw, RotateCw, 
  Trash2, ZoomIn, ZoomOut, Grid3x3, Move, MousePointer, Cable, Layers, BookOpen, 
  Moon, Sun, Lightbulb, Save, Image as ImageIcon
} from 'lucide-react';
import { useCircuitStore } from '../store/circuitStore';
import { useLearningStore } from '../store/learningStore';
import { useThemeStore } from '../store/themeStore';
import { useReferenceImageStore } from '../store/referenceImageStore';
import { exportToPNG, exportToSVG, exportToJSON, exportToHTML } from '../utils/exportUtils';
import { generateReport } from '../utils/reportGenerator';
import { runSimulation } from '../utils/simulator';
import { toast } from 'sonner@2.0.3';
import { templates, getTemplateWithWires } from '../utils/templates';
import { TemplatesModal } from './TemplatesModal';
import { TutorialOverlay } from './TutorialOverlay';

interface TopBarProps {
  onToggleSimulation: () => void;
}

export function TopBar({ onToggleSimulation }: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  const { 
    components, 
    wires, 
    tool, 
    setTool, 
    zoom, 
    setZoom, 
    gridEnabled, 
    toggleGrid,
    clearCircuit,
    importCircuit,
    undo,
    redo,
    setSimulationResult
  } = useCircuitStore();

  const handleExportPNG = async () => {
    try {
      await exportToPNG();
      toast.success('Circuit exported as PNG');
    } catch (error) {
      toast.error('Failed to export PNG');
    }
  };

  const handleExportSVG = () => {
    try {
      exportToSVG();
      toast.success('Circuit exported as SVG');
    } catch (error) {
      toast.error('Failed to export SVG');
    }
  };

  const handleExportJSON = () => {
    try {
      exportToJSON({ components, wires });
      toast.success('Circuit exported as JSON');
    } catch (error) {
      toast.error('Failed to export JSON');
    }
  };

  const handleExportHTML = () => {
    try {
      exportToHTML();
      toast.success('Circuit exported as HTML');
    } catch (error) {
      toast.error('Failed to export HTML');
    }
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importCircuit(data);
        toast.success('Circuit imported successfully');
      } catch (error) {
        toast.error('Failed to import circuit');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSimulate = () => {
    try {
      const result = runSimulation(components, wires);
      setSimulationResult(result);
      onToggleSimulation();
      toast.success('Simulation completed');
    } catch (error) {
      toast.error('Simulation failed: ' + (error as Error).message);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await generateReport(components, wires);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = getTemplateWithWires(templateId);
    if (template) {
      importCircuit({ components: template.components, wires: template.wires });
      toast.success(`Loaded template: ${template.name}`);
    }
  };

  const { isLearningMode, setLearningMode } = useLearningStore();
  const { togglePanel } = useReferenceImageStore();

  const handleToggleLearningMode = () => {
    setLearningMode(!isLearningMode);
    if (!isLearningMode) {
      toast.success('Learning Mode activated');
    } else {
      toast.info('Learning Mode deactivated');
    }
  };

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-gray-900 mr-4">Circuit Designer</h1>
        
        {/* Tools */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            onClick={() => setTool('select')}
            className={`p-2 rounded hover:bg-gray-100 ${tool === 'select' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Select"
          >
            <MousePointer className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('wire')}
            className={`p-2 rounded hover:bg-gray-100 ${tool === 'wire' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Wire"
          >
            <Cable className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTool('pan')}
            className={`p-2 rounded hover:bg-gray-100 ${tool === 'pan' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Pan"
          >
            <Move className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1 border-r border-gray-200 pr-2">
          <button
            onClick={() => setZoom(zoom - 0.1)}
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-gray-600 min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(zoom + 0.1)}
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Grid & History */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleGrid}
            className={`p-2 rounded hover:bg-gray-100 ${gridEnabled ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            title="Toggle Grid"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={undo}
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Import/Export */}
        <div className="flex items-center gap-1">
          <div className="relative group">
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={handleImportJSON}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                Import JSON
              </button>
            </div>
          </div>

          <div className="relative group">
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={handleExportPNG}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                Export PNG
              </button>
              <button
                onClick={handleExportSVG}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                Export SVG
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                Export JSON
              </button>
              <button
                onClick={handleExportHTML}
                className="w-full px-4 py-2 text-left hover:bg-gray-50"
              >
                Export HTML
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => setShowTemplates(true)}
          className="px-3 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center gap-2"
          title="Load Circuit Templates"
        >
          <Layers className="w-4 h-4" />
          Templates
        </button>

        <button
          onClick={() => setShowTutorial(true)}
          className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-2"
          title="Quick Start Tutorial"
        >
          <Lightbulb className="w-4 h-4" />
          Tutorial
        </button>

        <button
          onClick={togglePanel}
          className="px-3 py-1.5 rounded bg-cyan-100 hover:bg-cyan-200 text-cyan-700 flex items-center gap-2"
          title="Reference Image"
        >
          <ImageIcon className="w-4 h-4" />
          Reference
        </button>

        <button
          onClick={handleToggleLearningMode}
          className={`px-3 py-1.5 rounded flex items-center gap-2 ${
            isLearningMode 
              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          title="Toggle Learning Mode"
        >
          <BookOpen className="w-4 h-4" />
          Learning
        </button>

        <button
          onClick={handleSimulate}
          className="px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Simulate
        </button>

        <button
          onClick={handleGenerateReport}
          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Report
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => {
            if (confirm('Clear all components and wires?')) {
              clearCircuit();
              toast.success('Circuit cleared');
            }
          }}
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          title="Clear Circuit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Templates Modal */}
      {showTemplates && (
        <TemplatesModal onClose={() => setShowTemplates(false)} />
      )}

      {/* Tutorial Overlay */}
      {showTutorial && (
        <TutorialOverlay onClose={() => setShowTutorial(false)} />
      )}
    </div>
  );
}