import React, { useRef, useState } from 'react';
import {
  Image as ImageIcon,
  X,
  Minimize2,
  Maximize2,
  RotateCcw,
  Pin,
  PinOff,
  Layers,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useReferenceImageStore } from '../store/referenceImageStore';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

export function ReferenceImagePanel() {
  const {
    url,
    position,
    size,
    opacity,
    fullscreen,
    overlay,
    isPinned,
    showPanel,
    setImage,
    removeImage,
    setPosition,
    setSize,
    setOpacity,
    toggleFullscreen,
    toggleOverlay,
    togglePin,
    togglePanel,
    resetTransform,
  } = useReferenceImageStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      toast.error('Please upload a PNG, JPEG, or SVG image');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setImage(file, url);
    toast.success('Reference image uploaded successfully!');
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPinned || isResizing) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isPinned) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isResizing) {
      const newWidth = e.clientX - position.x;
      const newHeight = e.clientY - position.y;
      setSize({
        width: Math.max(200, newWidth),
        height: Math.max(150, newHeight),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, position, size]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart(size);
  };

  if (!showPanel) return null;

  if (!url) {
    // Upload prompt
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed top-20 right-6 z-30 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-96"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white">Reference Image</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Import a circuit diagram</p>
            </div>
          </div>
          <button
            onClick={togglePanel}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
        >
          <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
          <p className="text-gray-700 dark:text-gray-300 mb-1">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PNG, JPEG, or SVG (max 10MB)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={handleFileUpload}
          className="hidden"
        />

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            💡 <strong>Tip:</strong> Use reference images to trace and recreate existing circuits or learn from diagrams
          </p>
        </div>
      </motion.div>
    );
  }

  if (fullscreen) {
    // Fullscreen mode
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      >
        <img
          src={url}
          alt="Reference"
          className="max-w-[90%] max-h-[90%] object-contain"
          style={{ opacity }}
        />
        
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white transition-colors"
            title="Exit Fullscreen (F)"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={togglePanel}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm rounded-xl p-4 w-80">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-white" />
            <input
              type="range"
              min="0"
              max="100"
              value={opacity * 100}
              onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
              className="flex-1"
            />
            <span className="text-white text-sm w-12 text-right">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Normal floating window
  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      className={`fixed z-30 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col ${
        isPinned ? '' : 'cursor-move'
      }`}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 cursor-move">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="text-sm text-gray-900 dark:text-white">Reference Image</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePin();
            }}
            className={`p-2 rounded-lg transition-colors ${
              isPinned
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
            title={isPinned ? 'Unpin' : 'Pin in place'}
          >
            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleOverlay();
            }}
            className={`p-2 rounded-lg transition-colors ${
              overlay
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
            title="Toggle Overlay (O)"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
            title="Fullscreen (F)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              resetTransform();
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 overflow-hidden p-2 relative">
        <img
          src={url}
          alt="Reference"
          className="w-full h-full object-contain pointer-events-none"
          style={{ opacity }}
          draggable={false}
        />
      </div>

      {/* Controls */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <input
            type="range"
            min="0"
            max="100"
            value={opacity * 100}
            onChange={(e) => {
              e.stopPropagation();
              setOpacity(parseInt(e.target.value) / 100);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex-1"
          />
          <span className="text-xs text-gray-600 dark:text-gray-300 w-10 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>

      {/* Resize Handle */}
      {!isPinned && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-gray-400 dark:border-gray-500 rounded-br" />
        </div>
      )}
    </motion.div>
  );
}
