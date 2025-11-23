import { CircuitComponent, Wire } from '../store/circuitStore';
import { useLearningStore } from '../store/learningStore';
import { generateCurrentFlowExplanation } from './learningSimulator';
import { useCircuitStore } from '../store/circuitStore';
import { jsPDF } from 'jspdf';

export async function generateReport(
  components: CircuitComponent[],
  wires: Wire[]
): Promise<void> {
  // Get simulation result and user notes
  const simulationResult = useCircuitStore.getState().simulationResult;
  const userNotes = useLearningStore.getState().userNotes;

  // Get the circuit SVG and convert to image
  const svg = document.getElementById('circuit-canvas');
  if (!svg) {
    throw new Error('Canvas not found');
  }

  // Create PDF with jsPDF directly
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  let yPos = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  // Title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Circuit Design Report', margin, yPos);
  yPos += 15;

  // Info box
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
  yPos += 6;
  pdf.text('Designer: Circuit Designer Application', margin, yPos);
  yPos += 12;

  // Circuit Overview
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Circuit Overview', margin, yPos);
  yPos += 8;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Components: ${components.length}`, margin, yPos);
  yPos += 6;
  pdf.text(`Wire Connections: ${wires.length}`, margin, yPos);
  yPos += 6;
  pdf.text(`Power Sources: ${components.filter(c => c.type === 'battery' || c.type === 'ac-source').length}`, margin, yPos);
  yPos += 12;

  // Circuit Diagram
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Circuit Diagram', margin, yPos);
  yPos += 10;

  try {
    // Convert SVG to canvas then to image
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          canvas.width = 1200;
          canvas.height = 600;
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          pdf.addImage(imgData, 'JPEG', margin, yPos, contentWidth, (contentWidth * 0.5));
          
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          resolve(); // Continue even if image fails
        };
        img.src = url;
      });
      
      yPos += (contentWidth * 0.5) + 15;
    }
  } catch (error) {
    console.error('Failed to add circuit diagram:', error);
    pdf.text('(Circuit diagram could not be generated)', margin, yPos);
    yPos += 15;
  }

  // Component List
  if (yPos > 250) {
    pdf.addPage();
    yPos = 20;
  }
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Component List', margin, yPos);
  yPos += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  components.forEach((comp, index) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }
    const label = comp.properties.label || `${comp.type}-${index + 1}`;
    const value = comp.properties.value || 'N/A';
    pdf.text(`${index + 1}. ${label} (${comp.type}) - ${value}`, margin, yPos);
    yPos += 5;
  });

  yPos += 8;

  // Wiring Summary
  if (yPos > 250) {
    pdf.addPage();
    yPos = 20;
  }
  
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Wiring Summary', margin, yPos);
  yPos += 8;

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  wires.forEach((wire, index) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }
    const fromComp = components.find(c => c.id === wire.from.componentId);
    const toComp = components.find(c => c.id === wire.to.componentId);
    const fromLabel = fromComp?.properties.label || fromComp?.type || 'Unknown';
    const toLabel = toComp?.properties.label || toComp?.type || 'Unknown';
    
    pdf.text(`${index + 1}. ${fromLabel} → ${toLabel}`, margin, yPos);
    yPos += 5;
  });

  // Simulation Results
  if (simulationResult) {
    if (yPos > 200) {
      pdf.addPage();
      yPos = 20;
    }
    
    yPos += 8;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Simulation Results', margin, yPos);
    yPos += 8;

    pdf.setFontSize(12);
    pdf.text('Node Voltages', margin, yPos);
    yPos += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    Object.entries(simulationResult.nodeVoltages).forEach(([node, voltage]) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(`${node}: ${voltage.toFixed(4)} V`, margin + 5, yPos);
      yPos += 5;
    });

    yPos += 5;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Component Currents', margin, yPos);
    yPos += 6;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    
    Object.entries(simulationResult.componentCurrents)
      .filter(([id, current]) => Math.abs(current) > 0.00001)
      .forEach(([id, current]) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        const comp = components.find(c => c.id === id) || wires.find(w => w.id === id);
        const label = comp && 'properties' in comp 
          ? comp.properties.label || comp.type || id 
          : id;
        pdf.text(`${label}: ${Math.abs(current).toFixed(6)} A`, margin + 5, yPos);
        yPos += 5;
      });
  }

  // User Notes
  if (userNotes) {
    if (yPos > 230) {
      pdf.addPage();
      yPos = 20;
    }
    
    yPos += 8;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('User Notes', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(userNotes, contentWidth);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(line, margin, yPos);
      yPos += 5;
    });
  }

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      `Generated by CircuitForge - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  pdf.save(`circuit-report-${Date.now()}.pdf`);
}