import { create } from 'zustand';
import { CircuitComponent, Wire, SimulationResult } from './circuitStore';

export interface Project {
  id: string;
  name: string;
  components: CircuitComponent[];
  wires: Wire[];
  simulationResult: SimulationResult | null;
  zoom: number;
  pan: { x: number; y: number };
  createdAt: number;
  updatedAt: number;
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string;
  
  createProject: (name?: string) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  updateProjectData: (id: string, data: Partial<Project>) => void;
  getActiveProject: () => Project | undefined;
  duplicateProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [
    {
      id: 'default',
      name: 'Untitled Circuit 1',
      components: [],
      wires: [],
      simulationResult: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ],
  activeProjectId: 'default',

  createProject: (name) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: name || `Untitled Circuit ${get().projects.length + 1}`,
      components: [],
      wires: [],
      simulationResult: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    set((state) => ({
      projects: [...state.projects, newProject],
      activeProjectId: newProject.id,
    }));
  },

  deleteProject: (id) => {
    const state = get();
    if (state.projects.length === 1) {
      // Don't delete the last project
      return;
    }
    
    const newProjects = state.projects.filter((p) => p.id !== id);
    const newActiveId = state.activeProjectId === id 
      ? newProjects[0].id 
      : state.activeProjectId;
    
    set({
      projects: newProjects,
      activeProjectId: newActiveId,
    });
  },

  setActiveProject: (id) => {
    set({ activeProjectId: id });
  },

  renameProject: (id, name) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, name, updatedAt: Date.now() } : p
      ),
    }));
  },

  updateProjectData: (id, data) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
      ),
    }));
  },

  getActiveProject: () => {
    const state = get();
    return state.projects.find((p) => p.id === state.activeProjectId);
  },

  duplicateProject: (id) => {
    const state = get();
    const project = state.projects.find((p) => p.id === id);
    if (!project) return;

    const newProject: Project = {
      ...project,
      id: `project-${Date.now()}`,
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      projects: [...state.projects, newProject],
      activeProjectId: newProject.id,
    }));
  },
}));
