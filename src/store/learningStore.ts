import { create } from 'zustand';

export interface SimulationStep {
  id: number;
  title: string;
  description: string;
  highlightedComponents: string[];
  highlightedWires: string[];
  currentFlow: {
    wireId: string;
    direction: 'forward' | 'reverse';
  }[];
}

export interface CurrentFlowParticle {
  id: string;
  wireId: string;
  progress: number; // 0 to 1
  speed: number;
}

interface LearningStore {
  isLearningMode: boolean;
  simulationSpeed: number;
  currentStep: number;
  simulationSteps: SimulationStep[];
  particles: CurrentFlowParticle[];
  isPlaying: boolean;
  userNotes: string;
  
  setLearningMode: (mode: boolean) => void;
  setSimulationSpeed: (speed: number) => void;
  setCurrentStep: (step: number) => void;
  setSimulationSteps: (steps: SimulationStep[]) => void;
  addParticle: (particle: CurrentFlowParticle) => void;
  updateParticles: () => void;
  clearParticles: () => void;
  setIsPlaying: (playing: boolean) => void;
  setUserNotes: (notes: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  reset: () => void;
}

export const useLearningStore = create<LearningStore>((set, get) => ({
  isLearningMode: false,
  simulationSpeed: 1,
  currentStep: 0,
  simulationSteps: [],
  particles: [],
  isPlaying: false,
  userNotes: '',

  setLearningMode: (mode) => set({ isLearningMode: mode }),
  
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  
  setCurrentStep: (step) => {
    const { simulationSteps } = get();
    if (step >= 0 && step < simulationSteps.length) {
      set({ currentStep: step });
    }
  },
  
  setSimulationSteps: (steps) => set({ simulationSteps: steps, currentStep: 0 }),
  
  addParticle: (particle) => {
    set((state) => ({
      particles: [...state.particles, particle],
    }));
  },
  
  updateParticles: () => {
    const { particles, simulationSpeed, isPlaying } = get();
    if (!isPlaying) return;
    
    set({
      particles: particles
        .map((p) => ({
          ...p,
          progress: p.progress + (p.speed * simulationSpeed * 0.01),
        }))
        .filter((p) => p.progress <= 1),
    });
  },
  
  clearParticles: () => set({ particles: [] }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setUserNotes: (notes) => set({ userNotes: notes }),
  
  nextStep: () => {
    const { currentStep, simulationSteps } = get();
    if (currentStep < simulationSteps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  reset: () => {
    set({
      currentStep: 0,
      particles: [],
      isPlaying: false,
    });
  },
}));
