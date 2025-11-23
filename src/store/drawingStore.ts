import { create } from 'zustand';

export type DrawingTool = 'pencil' | 'highlighter' | 'eraser' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'select';

export interface DrawingPath {
  id: string;
  tool: DrawingTool;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
}

export interface DrawingShape {
  id: string;
  tool: 'rectangle' | 'circle' | 'arrow' | 'line';
  start: { x: number; y: number };
  end: { x: number; y: number };
  color: string;
  width: number;
  opacity: number;
  fill?: boolean;
}

interface DrawingStore {
  drawingTool: DrawingTool;
  drawingColor: string;
  drawingWidth: number;
  drawingOpacity: number;
  fillShapes: boolean;
  paths: DrawingPath[];
  shapes: DrawingShape[];
  isDrawing: boolean;
  currentPath: DrawingPath | null;
  currentShape: DrawingShape | null;
  showDrawingTools: boolean;
  
  setDrawingTool: (tool: DrawingTool) => void;
  setDrawingColor: (color: string) => void;
  setDrawingWidth: (width: number) => void;
  setDrawingOpacity: (opacity: number) => void;
  setFillShapes: (fill: boolean) => void;
  
  startDrawing: (point: { x: number; y: number }) => void;
  continueDrawing: (point: { x: number; y: number }) => void;
  endDrawing: () => void;
  
  addPath: (path: DrawingPath) => void;
  addShape: (shape: DrawingShape) => void;
  removePath: (id: string) => void;
  removeShape: (id: string) => void;
  clearDrawings: () => void;
  
  toggleDrawingTools: () => void;
  setShowDrawingTools: (show: boolean) => void;
}

export const useDrawingStore = create<DrawingStore>((set, get) => ({
  drawingTool: 'pencil',
  drawingColor: '#3b82f6',
  drawingWidth: 3,
  drawingOpacity: 1,
  fillShapes: false,
  paths: [],
  shapes: [],
  isDrawing: false,
  currentPath: null,
  currentShape: null,
  showDrawingTools: false,

  setDrawingTool: (tool) => set({ drawingTool: tool }),
  setDrawingColor: (color) => set({ drawingColor: color }),
  setDrawingWidth: (width) => set({ drawingWidth: width }),
  setDrawingOpacity: (opacity) => set({ drawingOpacity: opacity }),
  setFillShapes: (fill) => set({ fillShapes: fill }),

  startDrawing: (point) => {
    const state = get();
    const { drawingTool, drawingColor, drawingWidth, drawingOpacity } = state;

    if (['pencil', 'highlighter', 'eraser'].includes(drawingTool)) {
      const newPath: DrawingPath = {
        id: `path-${Date.now()}`,
        tool: drawingTool,
        points: [point],
        color: drawingTool === 'eraser' ? '#ffffff' : drawingColor,
        width: drawingTool === 'highlighter' ? drawingWidth * 2 : drawingWidth,
        opacity: drawingTool === 'highlighter' ? 0.3 : drawingTool === 'eraser' ? 1 : drawingOpacity,
      };
      set({ isDrawing: true, currentPath: newPath });
    } else if (['line', 'arrow', 'rectangle', 'circle'].includes(drawingTool)) {
      const newShape: DrawingShape = {
        id: `shape-${Date.now()}`,
        tool: drawingTool as 'line' | 'arrow' | 'rectangle' | 'circle',
        start: point,
        end: point,
        color: drawingColor,
        width: drawingWidth,
        opacity: drawingOpacity,
        fill: state.fillShapes,
      };
      set({ isDrawing: true, currentShape: newShape });
    }
  },

  continueDrawing: (point) => {
    const state = get();
    if (!state.isDrawing) return;

    if (state.currentPath) {
      const updatedPath = {
        ...state.currentPath,
        points: [...state.currentPath.points, point],
      };
      set({ currentPath: updatedPath });
    } else if (state.currentShape) {
      const updatedShape = {
        ...state.currentShape,
        end: point,
      };
      set({ currentShape: updatedShape });
    }
  },

  endDrawing: () => {
    const state = get();
    if (!state.isDrawing) return;

    if (state.currentPath) {
      set({
        paths: [...state.paths, state.currentPath],
        currentPath: null,
        isDrawing: false,
      });
    } else if (state.currentShape) {
      set({
        shapes: [...state.shapes, state.currentShape],
        currentShape: null,
        isDrawing: false,
      });
    }
  },

  addPath: (path) => set((state) => ({ paths: [...state.paths, path] })),
  addShape: (shape) => set((state) => ({ shapes: [...state.shapes, shape] })),
  removePath: (id) => set((state) => ({ paths: state.paths.filter((p) => p.id !== id) })),
  removeShape: (id) => set((state) => ({ shapes: state.shapes.filter((s) => s.id !== id) })),
  
  clearDrawings: () => set({ paths: [], shapes: [], currentPath: null, currentShape: null }),

  toggleDrawingTools: () => set((state) => ({ showDrawingTools: !state.showDrawingTools })),
  setShowDrawingTools: (show) => set({ showDrawingTools: show }),
}));
