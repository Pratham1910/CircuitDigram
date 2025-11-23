import React from 'react';
import { useReferenceImageStore } from '../store/referenceImageStore';
import { useCircuitStore } from '../store/circuitStore';

export function ReferenceImageOverlay() {
  const { url, opacity, overlay } = useReferenceImageStore();
  const { zoom, panOffset } = useCircuitStore();

  if (!url || !overlay) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
      }}
    >
      <img
        src={url}
        alt="Reference Overlay"
        className="absolute top-0 left-0 w-full h-full object-contain"
        style={{
          opacity: opacity * 0.5, // Reduce opacity for overlay mode
          mixBlendMode: 'multiply',
        }}
        draggable={false}
      />
    </div>
  );
}
