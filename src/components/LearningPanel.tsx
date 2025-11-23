import React, { useEffect } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  Zap, BookOpen, Edit3, ChevronRight 
} from 'lucide-react';
import { useLearningStore } from '../store/learningStore';
import { useCircuitStore } from '../store/circuitStore';
import { generateSimulationSteps } from '../utils/learningSimulator';

export function LearningPanel() {
  const {
    isLearningMode,
    simulationSpeed,
    currentStep,
    simulationSteps,
    isPlaying,
    userNotes,
    setSimulationSpeed,
    nextStep,
    previousStep,
    reset,
    setIsPlaying,
    setUserNotes,
    updateParticles,
    setSimulationSteps,
    clearParticles,
  } = useLearningStore();

  const { components, wires, simulationResult } = useCircuitStore();

  // Define currentStepData before using it in effects
  const currentStepData = simulationSteps[currentStep];

  useEffect(() => {
    if (isLearningMode && simulationResult && simulationSteps.length === 0) {
      const steps = generateSimulationSteps(components, wires, simulationResult);
      setSimulationSteps(steps);
    }
  }, [isLearningMode, simulationResult, components, wires]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      updateParticles();
      
      // Generate new particles for wires with current flow
      if (currentStepData) {
        currentStepData.currentFlow.forEach(flow => {
          // Generate particles occasionally
          if (Math.random() < 0.1) {
            const particle = {
              id: `particle-${Date.now()}-${Math.random()}`,
              wireId: flow.wireId,
              progress: 0,
              speed: 1,
            };
            useLearningStore.getState().addParticle(particle);
          }
        });
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isPlaying, updateParticles, currentStepData]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    reset();
    clearParticles();
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-gray-900">Learning Mode</h2>
        </div>
        <p className="text-gray-600">
          Step-by-step circuit simulation with visual explanations
        </p>
      </div>

      {/* Simulation Controls */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-700">Simulation Controls</span>
          <span className="text-gray-500">
            Step {currentStep + 1} / {simulationSteps.length}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleReset}
            className="p-2 rounded hover:bg-gray-100 text-gray-600"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <button
            onClick={previousStep}
            disabled={currentStep === 0}
            className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className="flex-1 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Play
              </>
            )}
          </button>
          
          <button
            onClick={nextStep}
            disabled={currentStep === simulationSteps.length - 1}
            className="p-2 rounded hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">
            Animation Speed: {simulationSpeed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={simulationSpeed}
            onChange={(e) => setSimulationSpeed(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Current Step Information */}
      {currentStepData && (
        <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 mb-2">{currentStepData.title}</h3>
              <p className="text-gray-700 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Steps List */}
      <div className="p-4">
        <h3 className="text-gray-900 mb-3">Simulation Steps</h3>
        <div className="space-y-2">
          {simulationSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => useLearningStore.getState().setCurrentStep(index)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                index === currentStep
                  ? 'bg-blue-100 border-2 border-blue-500'
                  : index < currentStep
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-white ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-green-600'
                      : 'bg-gray-400'
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`flex-1 ${
                    index === currentStep
                      ? 'text-blue-900'
                      : 'text-gray-700'
                  }`}
                >
                  {step.title}
                </span>
                {index === currentStep && (
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* User Notes */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Edit3 className="w-4 h-4 text-gray-600" />
          <h3 className="text-gray-900">Your Notes</h3>
        </div>
        <textarea
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="Add your observations, questions, or learning notes here..."
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-gray-500 mt-2">
          Your notes will be included in the generated report
        </p>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h4 className="text-gray-900 mb-3">Color Legend</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-700">High Voltage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-700">Low Voltage / Ground</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-gray-700">Current Flow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-700">Active Component</span>
          </div>
        </div>
      </div>
    </div>
  );
}