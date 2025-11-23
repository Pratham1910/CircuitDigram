import React, { useEffect, useRef } from 'react';
import { useDrawingStore } from '../store/drawingStore';
import { useCircuitStore } from '../store/circuitStore';

export function DrawingLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    drawingTool,
    paths,
    shapes,
    currentPath,
    currentShape,
    startDrawing,
    continueDrawing,
    endDrawing,
    showDrawingTools,
  } = useDrawingStore();

  const { zoom, panOffset } = useCircuitStore();

  // Draw all paths and shapes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply zoom and pan transformations
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw completed paths
    paths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width / zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = path.opacity;

      if (path.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    });

    // Draw current path (while drawing)
    if (currentPath && currentPath.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);

      for (let i = 1; i < currentPath.points.length; i++) {
        ctx.lineTo(currentPath.points[i].x, currentPath.points[i].y);
      }

      ctx.strokeStyle = currentPath.color;
      ctx.lineWidth = currentPath.width / zoom;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = currentPath.opacity;

      if (currentPath.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      }

      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // Draw completed shapes
    shapes.forEach((shape) => {
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.color;
      ctx.lineWidth = shape.width / zoom;
      ctx.globalAlpha = shape.opacity;

      if (shape.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.start.x, shape.start.y);
        ctx.lineTo(shape.end.x, shape.end.y);
        ctx.stroke();
      } else if (shape.tool === 'arrow') {
        drawArrow(ctx, shape.start.x, shape.start.y, shape.end.x, shape.end.y, shape.width / zoom);
      } else if (shape.tool === 'rectangle') {
        const width = shape.end.x - shape.start.x;
        const height = shape.end.y - shape.start.y;
        ctx.beginPath();
        ctx.rect(shape.start.x, shape.start.y, width, height);
        if (shape.fill) {
          ctx.globalAlpha = shape.opacity * 0.3;
          ctx.fill();
          ctx.globalAlpha = shape.opacity;
        }
        ctx.stroke();
      } else if (shape.tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(shape.end.x - shape.start.x, 2) + Math.pow(shape.end.y - shape.start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(shape.start.x, shape.start.y, radius, 0, Math.PI * 2);
        if (shape.fill) {
          ctx.globalAlpha = shape.opacity * 0.3;
          ctx.fill();
          ctx.globalAlpha = shape.opacity;
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    });

    // Draw current shape (while drawing)
    if (currentShape) {
      ctx.strokeStyle = currentShape.color;
      ctx.fillStyle = currentShape.color;
      ctx.lineWidth = currentShape.width / zoom;
      ctx.globalAlpha = currentShape.opacity;

      if (currentShape.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(currentShape.start.x, currentShape.start.y);
        ctx.lineTo(currentShape.end.x, currentShape.end.y);
        ctx.stroke();
      } else if (currentShape.tool === 'arrow') {
        drawArrow(ctx, currentShape.start.x, currentShape.start.y, currentShape.end.x, currentShape.end.y, currentShape.width / zoom);
      } else if (currentShape.tool === 'rectangle') {
        const width = currentShape.end.x - currentShape.start.x;
        const height = currentShape.end.y - currentShape.start.y;
        ctx.beginPath();
        ctx.rect(currentShape.start.x, currentShape.start.y, width, height);
        if (currentShape.fill) {
          ctx.globalAlpha = currentShape.opacity * 0.3;
          ctx.fill();
          ctx.globalAlpha = currentShape.opacity;
        }
        ctx.stroke();
      } else if (currentShape.tool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(currentShape.end.x - currentShape.start.x, 2) + Math.pow(currentShape.end.y - currentShape.start.y, 2)
        );
        ctx.beginPath();
        ctx.arc(currentShape.start.x, currentShape.start.y, radius, 0, Math.PI * 2);
        if (currentShape.fill) {
          ctx.globalAlpha = currentShape.opacity * 0.3;
          ctx.fill();
          ctx.globalAlpha = currentShape.opacity;
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // Restore context state
    ctx.restore();
  }, [paths, shapes, currentPath, currentShape, zoom, panOffset]);

  // Helper function to draw arrow
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    lineWidth: number
  ) => {
    const headLength = 20 / zoom;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Draw arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showDrawingTools || drawingTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;

    startDrawing({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!showDrawingTools || drawingTool === 'select') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;

    continueDrawing({ x, y });
  };

  const handleMouseUp = () => {
    if (!showDrawingTools || drawingTool === 'select') return;
    endDrawing();
  };

  const handleMouseLeave = () => {
    if (!showDrawingTools || drawingTool === 'select') return;
    endDrawing();
  };

  // Get cursor style based on tool
  const getCursorStyle = () => {
    if (!showDrawingTools) return 'default';
    switch (drawingTool) {
      case 'pencil':
      case 'highlighter':
        return 'crosshair';
      case 'eraser':
        return 'cell';
      case 'select':
        return 'default';
      default:
        return 'crosshair';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      className="absolute inset-0 pointer-events-auto"
      style={{ 
        cursor: getCursorStyle(),
        pointerEvents: showDrawingTools && drawingTool !== 'select' ? 'auto' : 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
}