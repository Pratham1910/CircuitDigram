import React, { useState } from 'react';
import { 
  Pencil, Highlighter, Eraser, Minus, ArrowRight, Square, Circle, 
  Hand, Trash2, Palette, X, Check
} from 'lucide-react';
import { useDrawingStore, DrawingTool } from '../store/drawingStore';
import { motion, AnimatePresence } from 'motion/react';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#000000', // black
  '#6b7280', // gray
  '#ffffff', // white
];

const STROKE_WIDTHS = [1, 2, 3, 5, 8, 12, 16];

export function DrawingToolbar() {
  const {
    drawingTool,
    drawingColor,
    drawingWidth,
    drawingOpacity,
    fillShapes,
    setDrawingTool,
    setDrawingColor,
    setDrawingWidth,
    setDrawingOpacity,
    setFillShapes,
    clearDrawings,
    showDrawingTools,
    toggleDrawingTools,
  } = useDrawingStore();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWidthPicker, setShowWidthPicker] = useState(false);

  if (!showDrawingTools) {
    return (
      <motion.button
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={toggleDrawingTools}
        className="absolute right-1 bottom-1 bg-gradient-to-br from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-110"
        title="Open Drawing Tools"
      >
        <Pencil className="w-6 h-6" />
      </motion.button>
    );
  }

  const tools: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <Hand className="w-4 h-4" />, label: 'Select' },
    { id: 'pencil', icon: <Pencil className="w-4 h-4" />, label: 'Pencil' },
    { id: 'highlighter', icon: <Highlighter className="w-4 h-4" />, label: 'Highlighter' },
    { id: 'eraser', icon: <Eraser className="w-4 h-4" />, label: 'Eraser' },
    { id: 'line', icon: <Minus className="w-4 h-4" />, label: 'Line' },
    { id: 'arrow', icon: <ArrowRight className="w-4 h-4" />, label: 'Arrow' },
    { id: 'rectangle', icon: <Square className="w-4 h-4" />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle className="w-4 h-4" />, label: 'Circle' },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 w-16">
        {/* Close Button */}
        <button
          onClick={toggleDrawingTools}
          className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 mb-2 transition-colors"
          title="Close Drawing Tools"
        >
          <X className="w-4 h-4 mx-auto" />
        </button>

        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

        {/* Drawing Tools */}
        <div className="space-y-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setDrawingTool(tool.id)}
              className={`w-full p-2 rounded-lg transition-all ${
                drawingTool === tool.id
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowWidthPicker(false);
            }}
            className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Color"
          >
            <div
              className="w-6 h-6 rounded-full mx-auto border-2 border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: drawingColor }}
            />
          </button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute left-20 top-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 w-64"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Choose Color</span>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setDrawingColor(color);
                        setShowColorPicker(false);
                      }}
                      className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                        drawingColor === color
                          ? 'border-purple-600 shadow-lg'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 dark:text-gray-400">Custom Color</label>
                  <input
                    type="color"
                    value={drawingColor}
                    onChange={(e) => setDrawingColor(e.target.value)}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <label className="text-xs text-gray-600 dark:text-gray-400">
                    Opacity: {Math.round(drawingOpacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={drawingOpacity}
                    onChange={(e) => setDrawingOpacity(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stroke Width */}
        <div className="relative mt-1">
          <button
            onClick={() => {
              setShowWidthPicker(!showWidthPicker);
              setShowColorPicker(false);
            }}
            className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Stroke Width"
          >
            <div
              className="h-1 bg-gray-800 dark:bg-gray-200 rounded-full mx-auto"
              style={{ width: `${Math.min(drawingWidth * 4, 24)}px` }}
            />
          </button>

          <AnimatePresence>
            {showWidthPicker && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute left-20 top-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 w-48"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Stroke Width</span>
                  <button
                    onClick={() => setShowWidthPicker(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {STROKE_WIDTHS.map((width) => (
                    <button
                      key={width}
                      onClick={() => {
                        setDrawingWidth(width);
                        setShowWidthPicker(false);
                      }}
                      className={`w-full p-2 rounded-lg flex items-center justify-between transition-colors ${
                        drawingWidth === width
                          ? 'bg-purple-100 dark:bg-purple-900'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div
                        className="bg-gray-800 dark:bg-gray-200 rounded-full"
                        style={{ width: '100%', height: `${width}px` }}
                      />
                      {drawingWidth === width && <Check className="w-4 h-4 text-purple-600 ml-2" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fill Toggle for Shapes */}
        {['rectangle', 'circle'].includes(drawingTool) && (
          <>
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
            <button
              onClick={() => setFillShapes(!fillShapes)}
              className={`w-full p-2 rounded-lg transition-colors ${
                fillShapes
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
              title="Fill Shape"
            >
              <Palette className="w-4 h-4 mx-auto" />
            </button>
          </>
        )}

        <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

        {/* Clear All */}
        <button
          onClick={() => {
            if (confirm('Clear all drawings?')) {
              clearDrawings();
            }
          }}
          className="w-full p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          title="Clear All Drawings"
        >
          <Trash2 className="w-4 h-4 mx-auto" />
        </button>
      </div>
    </motion.div>
  );
}
