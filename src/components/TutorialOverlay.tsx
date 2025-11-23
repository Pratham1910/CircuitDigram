import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TutorialStep {
  title: string;
  description: string;
  target?: string;
  image?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to CircuitForge! 🎉',
    description: 'Your powerful circuit design and simulation tool. Let\'s take a quick tour to get you started.',
  },
  {
    title: 'Component Library 📚',
    description: 'Browse and drag components from the left sidebar. We have resistors, capacitors, LEDs, transistors, and more!',
    target: 'component-library',
  },
  {
    title: 'Design Canvas 🎨',
    description: 'Drop components here! Click and drag to position them. Use the mouse wheel to zoom, and middle-click to pan.',
    target: 'canvas',
  },
  {
    title: 'Wire Tool 🔌',
    description: 'Click the Wire tool to connect components. Click on terminals to create connections.',
    target: 'toolbar',
  },
  {
    title: 'Templates 📋',
    description: 'Start fast with pre-built circuits! Click Templates in the top bar to load example circuits.',
  },
  {
    title: 'Simulation ⚡',
    description: 'Click Simulate to analyze your circuit. View voltages, currents, and enable Learning Mode for detailed explanations.',
    target: 'simulation',
  },
  {
    title: 'Multiple Projects 📑',
    description: 'Work on multiple circuits at once! Use tabs at the top to create and switch between projects.',
    target: 'tabs',
  },
  {
    title: 'Export & Share 📄',
    description: 'Generate professional PDF reports with circuit diagrams, component lists, and simulation results.',
  },
];

interface TutorialOverlayProps {
  onClose: () => void;
}

export function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorial-completed', 'true');
    onClose();
  };

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Step {currentStep + 1} of {TUTORIAL_STEPS.length}
                  </span>
                </div>
                <h2 className="text-gray-900 dark:text-white mb-2">{step.title}</h2>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex gap-2">
                {TUTORIAL_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-emerald-500 w-6'
                        : index < currentStep
                        ? 'bg-emerald-300'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
