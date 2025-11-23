import { create } from 'zustand';

export type ComponentType = 
  | 'resistor' | 'capacitor' | 'inductor' | 'diode' | 'led'
  | 'battery' | 'ac-source' | 'transistor-npn' | 'transistor-pnp' | 'mosfet'
  | 'switch-spst' | 'switch-spdt' | 'ic' | 'connector' | 'ground' | 'label' | 'text';

export interface Terminal {
  id: string;
  x: number;
  y: number;
  componentId: string;
  name: string;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: number;
  properties: {
    label?: string;
    value?: string;
    [key: string]: any;
  };
  terminals: Terminal[];
}

export interface Wire {
  id: string;
  from: { componentId: string; terminalId: string };
  to: { componentId: string; terminalId: string };
  points: { x: number; y: number }[];
}

export interface SimulationResult {
  nodeVoltages: { [nodeId: string]: number };
  componentCurrents: { [componentId: string]: number };
  errors: string[];
  warnings: string[];
}

interface CircuitStore {
  components: CircuitComponent[];
  wires: Wire[];
  selectedComponentId: string | null;
  selectedWireId: string | null;
  tool: 'select' | 'wire' | 'pan';
  wireStart: { componentId: string; terminalId: string } | null;
  zoom: number;
  panOffset: { x: number; y: number };
  gridEnabled: boolean;
  simulationResult: SimulationResult | null;
  history: { components: CircuitComponent[]; wires: Wire[] }[];
  historyIndex: number;

  // Actions
  addComponent: (component: CircuitComponent) => void;
  updateComponent: (id: string, updates: Partial<CircuitComponent>) => void;
  deleteComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  
  addWire: (wire: Wire) => void;
  deleteWire: (id: string) => void;
  selectWire: (id: string | null) => void;
  
  setTool: (tool: 'select' | 'wire' | 'pan') => void;
  setWireStart: (start: { componentId: string; terminalId: string } | null) => void;
  
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  toggleGrid: () => void;
  
  setSimulationResult: (result: SimulationResult | null) => void;
  
  clearCircuit: () => void;
  importCircuit: (data: { components: CircuitComponent[]; wires: Wire[] }) => void;
  loadProject: (data: { components: CircuitComponent[]; wires: Wire[]; zoom?: number; pan?: { x: number; y: number } }) => void;
  
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

export const useCircuitStore = create<CircuitStore>((set, get) => ({
  components: [],
  wires: [],
  selectedComponentId: null,
  selectedWireId: null,
  tool: 'select',
  wireStart: null,
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  gridEnabled: true,
  simulationResult: null,
  history: [],
  historyIndex: -1,

  addComponent: (component) => {
    set((state) => ({ 
      components: [...state.components, component]
    }));
    get().pushHistory();
  },

  updateComponent: (id, updates) => {
    set((state) => ({
      components: state.components.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    }));
    get().pushHistory();
  },

  deleteComponent: (id) => {
    set((state) => ({
      components: state.components.filter((c) => c.id !== id),
      wires: state.wires.filter((w) => 
        w.from.componentId !== id && w.to.componentId !== id
      ),
      selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
    }));
    get().pushHistory();
  },

  selectComponent: (id) => {
    set({ selectedComponentId: id, selectedWireId: null });
  },

  addWire: (wire) => {
    set((state) => ({ wires: [...state.wires, wire] }));
    get().pushHistory();
  },

  deleteWire: (id) => {
    set((state) => ({
      wires: state.wires.filter((w) => w.id !== id),
      selectedWireId: state.selectedWireId === id ? null : state.selectedWireId,
    }));
    get().pushHistory();
  },

  selectWire: (id) => {
    set({ selectedWireId: id, selectedComponentId: null });
  },

  setTool: (tool) => {
    set({ tool, wireStart: null });
  },

  setWireStart: (start) => {
    set({ wireStart: start });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.25, Math.min(3, zoom)) });
  },

  setPanOffset: (offset) => {
    set({ panOffset: offset });
  },

  toggleGrid: () => {
    set((state) => ({ gridEnabled: !state.gridEnabled }));
  },

  setSimulationResult: (result) => {
    set({ simulationResult: result });
  },

  clearCircuit: () => {
    set({ 
      components: [], 
      wires: [], 
      selectedComponentId: null,
      selectedWireId: null,
      simulationResult: null 
    });
    get().pushHistory();
  },

  importCircuit: (data) => {
    set({ 
      components: data.components, 
      wires: data.wires,
      selectedComponentId: null,
      selectedWireId: null
    });
    get().pushHistory();
  },

  loadProject: (data) => {
    set({ 
      components: data.components, 
      wires: data.wires,
      selectedComponentId: null,
      selectedWireId: null,
      zoom: data.zoom || 1,
      panOffset: data.pan || { x: 0, y: 0 }
    });
  },

  pushHistory: () => {
    const { components, wires, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ components: [...components], wires: [...wires] });
    set({ 
      history: newHistory.slice(-50), // Keep last 50 states
      historyIndex: Math.min(newHistory.length - 1, 49)
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      set({ 
        components: [...state.components],
        wires: [...state.wires],
        historyIndex: newIndex
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      set({ 
        components: [...state.components],
        wires: [...state.wires],
        historyIndex: newIndex
      });
    }
  },
}));