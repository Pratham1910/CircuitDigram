import { CircuitComponent, Wire, SimulationResult } from '../store/circuitStore';
import { parseComponentValue } from './componentUtils';

interface Node {
  id: string;
  voltage: number;
  components: string[];
}

interface CircuitMatrix {
  A: number[][];
  b: number[];
  nodes: string[];
}

export function runSimulation(
  components: CircuitComponent[],
  wires: Wire[]
): SimulationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Find all voltage sources
  const voltageSources = components.filter(c => 
    c.type === 'battery' || c.type === 'ac-source'
  );
  
  if (voltageSources.length === 0) {
    errors.push('No voltage source found in circuit');
    return { nodeVoltages: {}, componentCurrents: {}, errors, warnings };
  }
  
  // Build node map
  const nodeMap = buildNodeMap(components, wires);
  
  if (nodeMap.size === 0) {
    errors.push('No valid circuit connections found');
    return { nodeVoltages: {}, componentCurrents: {}, errors, warnings };
  }
  
  // Check for ground
  const groundComponents = components.filter(c => c.type === 'ground');
  if (groundComponents.length === 0) {
    warnings.push('No ground reference found - assuming arbitrary reference');
  }
  
  // Perform DC analysis
  try {
    const result = performDCAnalysis(components, wires, nodeMap, groundComponents);
    
    // Detect issues
    if (Object.keys(result.nodeVoltages).length === 0) {
      errors.push('Unable to solve circuit - check for open circuits');
    }
    
    // Check for unrealistic values
    Object.entries(result.nodeVoltages).forEach(([node, voltage]) => {
      if (Math.abs(voltage) > 1000) {
        warnings.push(`Node ${node} has high voltage: ${voltage.toFixed(2)}V`);
      }
    });
    
    Object.entries(result.componentCurrents).forEach(([id, current]) => {
      if (Math.abs(current) > 100) {
        warnings.push(`Component ${id} has high current: ${current.toFixed(2)}A`);
      }
    });
    
    return {
      ...result,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Simulation error: ${(error as Error).message}`);
    return { nodeVoltages: {}, componentCurrents: {}, errors, warnings };
  }
}

function buildNodeMap(
  components: CircuitComponent[],
  wires: Wire[]
): Map<string, Set<string>> {
  const nodeMap = new Map<string, Set<string>>();
  
  // Each terminal starts as its own node
  components.forEach(component => {
    component.terminals.forEach(terminal => {
      const terminalKey = `${component.id}:${terminal.id}`;
      nodeMap.set(terminalKey, new Set([terminalKey]));
    });
  });
  
  // Merge nodes connected by wires
  wires.forEach(wire => {
    const fromKey = `${wire.from.componentId}:${wire.from.terminalId}`;
    const toKey = `${wire.to.componentId}:${wire.to.terminalId}`;
    
    const fromNode = nodeMap.get(fromKey);
    const toNode = nodeMap.get(toKey);
    
    if (fromNode && toNode) {
      // Merge the two nodes
      const mergedNode = new Set([...fromNode, ...toNode]);
      mergedNode.forEach(key => nodeMap.set(key, mergedNode));
    }
  });
  
  return nodeMap;
}

function performDCAnalysis(
  components: CircuitComponent[],
  wires: Wire[],
  nodeMap: Map<string, Set<string>>,
  groundComponents: CircuitComponent[]
): Omit<SimulationResult, 'errors' | 'warnings'> {
  // Simplified DC analysis using nodal analysis
  
  // Get unique nodes
  const uniqueNodes = new Map<Set<string>, string>();
  let nodeIndex = 0;
  nodeMap.forEach((nodeSet) => {
    if (!Array.from(uniqueNodes.keys()).some(existingSet => 
      existingSet.size === nodeSet.size && 
      Array.from(nodeSet).every(item => existingSet.has(item))
    )) {
      uniqueNodes.set(nodeSet, `n${nodeIndex++}`);
    }
  });
  
  const nodes = Array.from(uniqueNodes.values());
  
  // Set ground node
  let groundNode = 'n0';
  if (groundComponents.length > 0) {
    const groundTerminal = `${groundComponents[0].id}:${groundComponents[0].terminals[0].id}`;
    const groundNodeSet = nodeMap.get(groundTerminal);
    if (groundNodeSet) {
      const foundNode = Array.from(uniqueNodes.entries()).find(([set]) => 
        set.size === groundNodeSet.size && 
        Array.from(groundNodeSet).every(item => set.has(item))
      );
      if (foundNode) {
        groundNode = foundNode[1];
      }
    }
  }
  
  // Initialize node voltages
  const nodeVoltages: { [key: string]: number } = {};
  nodes.forEach(node => {
    nodeVoltages[node] = node === groundNode ? 0 : 0;
  });
  
  // Find voltage sources and set their voltages
  components.forEach(component => {
    if (component.type === 'battery' || component.type === 'ac-source') {
      const voltage = parseComponentValue(component.properties.value || '0');
      
      if (component.terminals.length >= 2) {
        const posTerminal = `${component.id}:${component.terminals[1].id}`;
        const negTerminal = `${component.id}:${component.terminals[0].id}`;
        
        const posNodeSet = nodeMap.get(posTerminal);
        const negNodeSet = nodeMap.get(negTerminal);
        
        if (posNodeSet && negNodeSet) {
          const posNode = Array.from(uniqueNodes.entries()).find(([set]) => 
            set.size === posNodeSet.size && 
            Array.from(posNodeSet).every(item => set.has(item))
          )?.[1];
          
          const negNode = Array.from(uniqueNodes.entries()).find(([set]) => 
            set.size === negNodeSet.size && 
            Array.from(negNodeSet).every(item => set.has(item))
          )?.[1];
          
          if (posNode && negNode) {
            if (negNode === groundNode) {
              nodeVoltages[posNode] = voltage;
            } else if (posNode === groundNode) {
              nodeVoltages[negNode] = -voltage;
            } else {
              nodeVoltages[posNode] = voltage;
            }
          }
        }
      }
    }
  });
  
  // Calculate currents through components (simplified)
  const componentCurrents: { [key: string]: number } = {};
  
  components.forEach(component => {
    if (component.terminals.length >= 2) {
      const t1Key = `${component.id}:${component.terminals[0].id}`;
      const t2Key = `${component.id}:${component.terminals[1].id}`;
      
      const node1Set = nodeMap.get(t1Key);
      const node2Set = nodeMap.get(t2Key);
      
      if (node1Set && node2Set) {
        const node1 = Array.from(uniqueNodes.entries()).find(([set]) => 
          set.size === node1Set.size && 
          Array.from(node1Set).every(item => set.has(item))
        )?.[1];
        
        const node2 = Array.from(uniqueNodes.entries()).find(([set]) => 
          set.size === node2Set.size && 
          Array.from(node2Set).every(item => set.has(item))
        )?.[1];
        
        if (node1 && node2) {
          const v1 = nodeVoltages[node1] || 0;
          const v2 = nodeVoltages[node2] || 0;
          const voltageDiff = v2 - v1;
          
          let current = 0;
          
          switch (component.type) {
            case 'resistor': {
              const resistance = parseComponentValue(component.properties.value || '1k');
              current = resistance > 0 ? voltageDiff / resistance : 0;
              break;
            }
            case 'diode':
            case 'led': {
              // Simplified diode model
              const forwardVoltage = 0.7;
              if (voltageDiff > forwardVoltage) {
                current = (voltageDiff - forwardVoltage) / 100; // Assume 100Ω forward resistance
              }
              break;
            }
            case 'battery':
            case 'ac-source': {
              // Current through voltage source (simplified)
              current = 0.1; // Placeholder
              break;
            }
          }
          
          if (Math.abs(current) > 1e-10) {
            componentCurrents[component.id] = current;
          }
        }
      }
    }
  });
  
  // Mark wires with current
  wires.forEach(wire => {
    const fromComp = components.find(c => c.id === wire.from.componentId);
    if (fromComp && componentCurrents[fromComp.id]) {
      componentCurrents[wire.id] = componentCurrents[fromComp.id];
    }
  });
  
  return {
    nodeVoltages,
    componentCurrents,
  };
}
