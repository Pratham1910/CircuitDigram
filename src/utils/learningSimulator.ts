import { CircuitComponent, Wire, SimulationResult } from '../store/circuitStore';
import { SimulationStep } from '../store/learningStore';
import { parseComponentValue } from './componentUtils';

export function generateSimulationSteps(
  components: CircuitComponent[],
  wires: Wire[],
  simulationResult: SimulationResult
): SimulationStep[] {
  const steps: SimulationStep[] = [];
  let stepId = 0;

  // Step 1: Circuit Overview
  steps.push({
    id: stepId++,
    title: 'Circuit Overview',
    description: `This circuit contains ${components.length} components and ${wires.length} connections. Let's analyze how current flows through this circuit.`,
    highlightedComponents: [],
    highlightedWires: [],
    currentFlow: [],
  });

  // Step 2: Identify Power Sources
  const powerSources = components.filter(
    (c) => c.type === 'battery' || c.type === 'ac-source'
  );

  if (powerSources.length > 0) {
    steps.push({
      id: stepId++,
      title: 'Power Source Initialization',
      description: `The circuit has ${powerSources.length} power source(s). ${
        powerSources[0].properties.value || 'Unknown voltage'
      } is supplied by ${powerSources[0].properties.label || 'the battery'}.`,
      highlightedComponents: powerSources.map((s) => s.id),
      highlightedWires: [],
      currentFlow: [],
    });
  }

  // Step 3: Ground Reference
  const grounds = components.filter((c) => c.type === 'ground');
  if (grounds.length > 0) {
    steps.push({
      id: stepId++,
      title: 'Ground Reference',
      description: `Ground symbols establish the 0V reference point for the circuit. All voltages are measured relative to ground.`,
      highlightedComponents: grounds.map((g) => g.id),
      highlightedWires: [],
      currentFlow: [],
    });
  }

  // Step 4: Current Path Detection
  const wiresWithCurrent = wires.filter(
    (w) => simulationResult.componentCurrents[w.id]
  );

  if (wiresWithCurrent.length > 0) {
    steps.push({
      id: stepId++,
      title: 'Current Path Established',
      description: `Current flows through ${wiresWithCurrent.length} wire(s) in the circuit. The yellow animation shows the direction of electron flow.`,
      highlightedComponents: [],
      highlightedWires: wiresWithCurrent.map((w) => w.id),
      currentFlow: wiresWithCurrent.map((w) => ({
        wireId: w.id,
        direction: 'forward' as const,
      })),
    });
  }

  // Step 5: Analyze Each Component Type
  const resistors = components.filter((c) => c.type === 'resistor');
  if (resistors.length > 0) {
    resistors.forEach((resistor) => {
      const current = simulationResult.componentCurrents[resistor.id];
      if (current) {
        const resistance = parseComponentValue(resistor.properties.value || '0');
        const voltageDrop = current * resistance;
        
        steps.push({
          id: stepId++,
          title: `Resistor Analysis: ${resistor.properties.label || 'R'}`,
          description: `This resistor (${resistor.properties.value || 'unknown'}) carries ${Math.abs(current).toFixed(3)}A of current. By Ohm's Law (V=IR), the voltage drop across it is ${voltageDrop.toFixed(3)}V. Resistors limit current flow and dissipate energy as heat.`,
          highlightedComponents: [resistor.id],
          highlightedWires: wires
            .filter(
              (w) =>
                w.from.componentId === resistor.id ||
                w.to.componentId === resistor.id
            )
            .map((w) => w.id),
          currentFlow: [],
        });
      }
    });
  }

  const diodes = components.filter((c) => c.type === 'diode' || c.type === 'led');
  if (diodes.length > 0) {
    diodes.forEach((diode) => {
      const current = simulationResult.componentCurrents[diode.id];
      const isLED = diode.type === 'led';
      
      if (current && Math.abs(current) > 0.001) {
        steps.push({
          id: stepId++,
          title: `${isLED ? 'LED' : 'Diode'} Analysis: ${diode.properties.label || 'D'}`,
          description: `This ${isLED ? 'LED' : 'diode'} is forward-biased with ${Math.abs(current).toFixed(3)}A flowing through it. ${
            isLED
              ? 'The LED emits light as current flows through it.'
              : 'The diode allows current to flow in one direction only.'
          } Forward voltage drop is approximately 0.7V for regular diodes and 2-3V for LEDs.`,
          highlightedComponents: [diode.id],
          highlightedWires: wires
            .filter(
              (w) =>
                w.from.componentId === diode.id || w.to.componentId === diode.id
            )
            .map((w) => w.id),
          currentFlow: [],
        });
      } else {
        steps.push({
          id: stepId++,
          title: `${isLED ? 'LED' : 'Diode'} Analysis: ${diode.properties.label || 'D'}`,
          description: `This ${isLED ? 'LED' : 'diode'} is reverse-biased or not conducting. No current flows through it, and it acts as an open circuit.`,
          highlightedComponents: [diode.id],
          highlightedWires: [],
          currentFlow: [],
        });
      }
    });
  }

  const capacitors = components.filter((c) => c.type === 'capacitor');
  if (capacitors.length > 0) {
    capacitors.forEach((cap) => {
      steps.push({
        id: stepId++,
        title: `Capacitor: ${cap.properties.label || 'C'}`,
        description: `This capacitor (${cap.properties.value || 'unknown'}) stores electrical energy in an electric field. In DC steady-state analysis, it acts as an open circuit. In AC circuits, it would allow alternating current to pass based on its reactance.`,
        highlightedComponents: [cap.id],
        highlightedWires: [],
        currentFlow: [],
      });
    });
  }

  const transistors = components.filter(
    (c) => c.type === 'transistor-npn' || c.type === 'transistor-pnp'
  );
  if (transistors.length > 0) {
    transistors.forEach((trans) => {
      steps.push({
        id: stepId++,
        title: `Transistor: ${trans.properties.label || 'Q'}`,
        description: `This ${trans.type.toUpperCase()} transistor acts as an electronic switch or amplifier. When the base current is sufficient, it allows current to flow from collector to emitter. The transistor can amplify small signals or switch larger loads.`,
        highlightedComponents: [trans.id],
        highlightedWires: [],
        currentFlow: [],
      });
    });
  }

  // Step: Node Voltage Analysis
  if (Object.keys(simulationResult.nodeVoltages).length > 0) {
    const sortedNodes = Object.entries(simulationResult.nodeVoltages).sort(
      ([, a], [, b]) => b - a
    );
    
    steps.push({
      id: stepId++,
      title: 'Node Voltage Analysis',
      description: `The circuit has ${sortedNodes.length} unique voltage nodes. The highest voltage is ${sortedNodes[0][1].toFixed(2)}V at node ${sortedNodes[0][0]}, and the lowest is ${sortedNodes[sortedNodes.length - 1][1].toFixed(2)}V at node ${sortedNodes[sortedNodes.length - 1][0]}.`,
      highlightedComponents: [],
      highlightedWires: [],
      currentFlow: [],
    });
  }

  // Final Step: Steady State
  steps.push({
    id: stepId++,
    title: 'Steady-State Condition',
    description: `The circuit has reached steady-state where all voltages and currents are constant. Energy is being continuously supplied by the power source and dissipated by resistive components. ${
      simulationResult.errors.length > 0
        ? 'However, there are errors that need attention.'
        : 'The circuit is operating normally.'
    }`,
    highlightedComponents: components.map((c) => c.id),
    highlightedWires: wiresWithCurrent.map((w) => w.id),
    currentFlow: wiresWithCurrent.map((w) => ({
      wireId: w.id,
      direction: 'forward' as const,
    })),
  });

  return steps;
}

export function generateCurrentFlowExplanation(
  components: CircuitComponent[],
  wires: Wire[],
  simulationResult: SimulationResult
): string {
  let explanation = 'Current Flow Analysis:\n\n';

  // Find power source
  const powerSource = components.find(
    (c) => c.type === 'battery' || c.type === 'ac-source'
  );

  if (powerSource) {
    explanation += `The circuit is powered by a ${powerSource.type === 'battery' ? 'DC battery' : 'AC source'} `;
    explanation += `providing ${powerSource.properties.value || 'unknown voltage'}.\n\n`;
  }

  // Trace current path
  const wiresWithCurrent = wires.filter(
    (w) => simulationResult.componentCurrents[w.id]
  );

  if (wiresWithCurrent.length > 0) {
    explanation += 'Current Path:\n';
    wiresWithCurrent.forEach((wire, index) => {
      const fromComp = components.find((c) => c.id === wire.from.componentId);
      const toComp = components.find((c) => c.id === wire.to.componentId);
      const current = Math.abs(simulationResult.componentCurrents[wire.id]);
      
      explanation += `${index + 1}. From ${fromComp?.properties.label || fromComp?.type || 'unknown'} `;
      explanation += `to ${toComp?.properties.label || toComp?.type || 'unknown'} `;
      explanation += `(${current.toFixed(3)}A)\n`;
    });
    explanation += '\n';
  }

  // Component behavior
  explanation += 'Component Behavior:\n';
  
  components.forEach((comp) => {
    const current = simulationResult.componentCurrents[comp.id];
    
    if (current && Math.abs(current) > 0.001) {
      const label = comp.properties.label || comp.type;
      
      switch (comp.type) {
        case 'resistor': {
          const resistance = parseComponentValue(comp.properties.value || '0');
          const voltageDrop = current * resistance;
          explanation += `• ${label} (${comp.properties.value}): ${voltageDrop.toFixed(3)}V drop, ${Math.abs(current).toFixed(3)}A current\n`;
          break;
        }
        case 'led':
          explanation += `• ${label}: Forward-biased, emitting light with ${Math.abs(current).toFixed(3)}A\n`;
          break;
        case 'diode':
          explanation += `• ${label}: Conducting ${Math.abs(current).toFixed(3)}A in forward direction\n`;
          break;
        default:
          if (comp.type !== 'ground' && comp.type !== 'connector') {
            explanation += `• ${label}: Active with ${Math.abs(current).toFixed(3)}A\n`;
          }
      }
    }
  });

  return explanation;
}
