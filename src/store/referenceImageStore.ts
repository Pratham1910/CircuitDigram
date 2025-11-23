import { create } from 'zustand';

export interface ReferenceImageState {
  file?: File;
  url?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  fullscreen: boolean;
  overlay: boolean;
  isPinned: boolean;
  showPanel: boolean;
  originalSize: { width: number; height: number };
}

interface ReferenceImageStore extends ReferenceImageState {
  setImage: (file: File, url: string) => void;
  removeImage: () => void;
  setPosition: (position: { x: number; y: number }) => void;
  setSize: (size: { width: number; height: number }) => void;
  setOpacity: (opacity: number) => void;
  increaseOpacity: () => void;
  decreaseOpacity: () => void;
  toggleFullscreen: () => void;
  toggleOverlay: () => void;
  togglePin: () => void;
  togglePanel: () => void;
  resetTransform: () => void;
  setOriginalSize: (size: { width: number; height: number }) => void;
  exportState: () => ExportedReferenceState;
  importState: (state: ExportedReferenceState) => Promise<void>;
}

export interface ExportedReferenceState {
  imageBase64?: string;
  fileName?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  opacity: number;
  fullscreen: boolean;
  overlay: boolean;
  isPinned: boolean;
  originalSize: { width: number; height: number };
}

const DEFAULT_SIZE = { width: 400, height: 300 };
const DEFAULT_POSITION = { x: 100, y: 100 };
const DEFAULT_OPACITY = 0.7;

export const useReferenceImageStore = create<ReferenceImageStore>((set, get) => ({
  file: undefined,
  url: undefined,
  position: DEFAULT_POSITION,
  size: DEFAULT_SIZE,
  opacity: DEFAULT_OPACITY,
  fullscreen: false,
  overlay: false,
  isPinned: false,
  showPanel: false,
  originalSize: DEFAULT_SIZE,

  setImage: (file, url) => {
    // Load image to get original dimensions
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const maxWidth = 600;
      const maxHeight = 450;
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      set({
        file,
        url,
        originalSize: { width: img.width, height: img.height },
        size: { width, height },
        showPanel: true,
      });
    };
    img.src = url;
  },

  removeImage: () =>
    set({
      file: undefined,
      url: undefined,
      position: DEFAULT_POSITION,
      size: DEFAULT_SIZE,
      opacity: DEFAULT_OPACITY,
      fullscreen: false,
      overlay: false,
      isPinned: false,
      showPanel: false,
      originalSize: DEFAULT_SIZE,
    }),

  setPosition: (position) => set({ position }),
  setSize: (size) => set({ size }),
  setOpacity: (opacity) => set({ opacity: Math.max(0, Math.min(1, opacity)) }),
  
  increaseOpacity: () => {
    const { opacity } = get();
    set({ opacity: Math.min(1, opacity + 0.1) });
  },
  
  decreaseOpacity: () => {
    const { opacity } = get();
    set({ opacity: Math.max(0, opacity - 0.1) });
  },

  toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
  toggleOverlay: () => set((state) => ({ overlay: !state.overlay })),
  togglePin: () => set((state) => ({ isPinned: !state.isPinned })),
  togglePanel: () => set((state) => ({ showPanel: !state.showPanel })),

  resetTransform: () =>
    set({
      position: DEFAULT_POSITION,
      size: DEFAULT_SIZE,
      opacity: DEFAULT_OPACITY,
      fullscreen: false,
      overlay: false,
    }),

  setOriginalSize: (originalSize) => set({ originalSize }),

  exportState: () => {
    const state = get();
    if (!state.url) {
      return {
        position: state.position,
        size: state.size,
        opacity: state.opacity,
        fullscreen: state.fullscreen,
        overlay: state.overlay,
        isPinned: state.isPinned,
        originalSize: state.originalSize,
      };
    }

    return {
      imageBase64: state.url,
      fileName: state.file?.name,
      position: state.position,
      size: state.size,
      opacity: state.opacity,
      fullscreen: state.fullscreen,
      overlay: state.overlay,
      isPinned: state.isPinned,
      originalSize: state.originalSize,
    };
  },

  importState: async (exportedState) => {
    if (exportedState.imageBase64) {
      // Convert base64 back to File
      const response = await fetch(exportedState.imageBase64);
      const blob = await response.blob();
      const file = new File([blob], exportedState.fileName || 'reference.png', {
        type: blob.type,
      });

      set({
        file,
        url: exportedState.imageBase64,
        position: exportedState.position,
        size: exportedState.size,
        opacity: exportedState.opacity,
        fullscreen: exportedState.fullscreen,
        overlay: exportedState.overlay,
        isPinned: exportedState.isPinned,
        originalSize: exportedState.originalSize,
        showPanel: true,
      });
    }
  },
}));
