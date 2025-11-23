import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { ProjectTabs } from './components/ProjectTabs';
import { ComponentLibrary } from './components/ComponentLibrary';
import { Canvas } from './components/Canvas';
import { PropertiesPanel } from './components/PropertiesPanel';
import { SimulationPanel } from './components/SimulationPanel';
import { LearningPanel } from './components/LearningPanel';
import { TopBar } from './components/TopBar';
import { DrawingToolbar } from './components/DrawingToolbar';
import { ReferenceImagePanel } from './components/ReferenceImagePanel';
import { useCircuitStore } from './store/circuitStore';
import { useLearningStore } from './store/learningStore';
import { useThemeStore } from './store/themeStore';
import { useReferenceImageStore } from './store/referenceImageStore';
import { Toaster } from 'sonner@2.0.3';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showSimulation, setShowSimulation] = useState(false);
  const selectedComponentId = useCircuitStore(state => state.selectedComponentId);
  const { setTool, undo, redo } = useCircuitStore();
  const { isLearningMode } = useLearningStore();
  const { isDarkMode } = useThemeStore();
  const { togglePanel, toggleFullscreen, toggleOverlay, increaseOpacity, decreaseOpacity } = useReferenceImageStore();

  // Initialize dark mode on app load
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Keyboard shortcuts disabled per user preference.
  }, [setTool, undo, redo, showLanding, togglePanel, toggleFullscreen, toggleOverlay, increaseOpacity, decreaseOpacity]);

  // Show landing page
  if (showLanding) {
    return (
      <>
        <Toaster position="top-right" />
        <LandingPage onEnter={() => setShowLanding(false)} />
      </>
    );
  }

  // Show main app
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
      <Toaster position="top-right" />
      <TopBar onToggleSimulation={() => setShowSimulation(!showSimulation)} />
      <ProjectTabs />
      
      {/* Drawing Toolbar - Floating on left */}
      <DrawingToolbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Component Library */}
        <ComponentLibrary />
        
        {/* Center - Canvas */}
        <Canvas />
        
        {/* Right Sidebar - Properties & Simulation */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {isLearningMode ? (
            <LearningPanel />
          ) : showSimulation ? (
            <SimulationPanel />
          ) : (
            selectedComponentId && <PropertiesPanel />
          )}
        </div>
      </div>
      
      {/* Reference Image Panel - Floating */}
      <ReferenceImagePanel />
    </div>
  );
}