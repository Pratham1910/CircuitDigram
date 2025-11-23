import { CircuitComponent, ComponentType, Terminal } from '../store/circuitStore';

export function createComponent(
  type: ComponentType,
  x: number,
  y: number,
  defaultValue?: string
): CircuitComponent {
  const id = `${type}-${Date.now()}-${Math.random()}`;
  
  // Define terminals based on component type
  const terminals: Terminal[] = [];
  
  switch (type) {
    case 'resistor':
    case 'capacitor':
    case 'inductor':
    case 'diode':
    case 'led':
    case 'battery':
    case 'ac-source':
    case 'switch-spst':
      terminals.push(
        { id: `${id}-t1`, x: -40, y: 0, componentId: id, name: 'T1' },
        { id: `${id}-t2`, x: 40, y: 0, componentId: id, name: 'T2' }
      );
      break;
    
    case 'transistor-npn':
    case 'transistor-pnp':
    case 'mosfet':
      terminals.push(
        { id: `${id}-base`, x: -40, y: 0, componentId: id, name: 'Base' },
        { id: `${id}-collector`, x: 15, y: -40, componentId: id, name: 'Collector' },
        { id: `${id}-emitter`, x: 15, y: 40, componentId: id, name: 'Emitter' }
      );
      break;
    
    case 'switch-spdt':
      terminals.push(
        { id: `${id}-common`, x: -40, y: 0, componentId: id, name: 'Common' },
        { id: `${id}-no`, x: 40, y: -15, componentId: id, name: 'NO' },
        { id: `${id}-nc`, x: 40, y: 15, componentId: id, name: 'NC' }
      );
      break;
    
    case 'ic':
      terminals.push(
        { id: `${id}-pin1`, x: -30, y: -20, componentId: id, name: 'Pin1' },
        { id: `${id}-pin2`, x: -30, y: 0, componentId: id, name: 'Pin2' },
        { id: `${id}-pin3`, x: -30, y: 20, componentId: id, name: 'Pin3' },
        { id: `${id}-pin4`, x: 30, y: -20, componentId: id, name: 'Pin4' },
        { id: `${id}-pin5`, x: 30, y: 0, componentId: id, name: 'Pin5' },
        { id: `${id}-pin6`, x: 30, y: 20, componentId: id, name: 'Pin6' }
      );
      break;
    
    case 'connector':
      terminals.push(
        { id: `${id}-t1`, x: 0, y: 0, componentId: id, name: 'T1' }
      );
      break;
    
    case 'ground':
      terminals.push(
        { id: `${id}-t1`, x: 0, y: -20, componentId: id, name: 'T1' }
      );
      break;
    
    case 'label':
      // Labels don't have terminals
      break;
    
    case 'text':
      // Text fields don't have terminals
      break;
  }

  return {
    id,
    type,
    x,
    y,
    rotation: 0,
    properties: {
      label: '',
      value: defaultValue || '',
    },
    terminals,
  };
}

export function getTerminalPosition(component: CircuitComponent, terminal: Terminal) {
  const rad = (component.rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  
  return {
    x: component.x + terminal.x * cos - terminal.y * sin,
    y: component.y + terminal.x * sin + terminal.y * cos,
  };
}

export function parseComponentValue(value: string): number {
  if (!value) return 0;
  
  const match = value.match(/^([\d.]+)\s*([a-zA-ZµΩ]+)?$/);
  if (!match) return 0;
  
  const num = parseFloat(match[1]);
  const unit = match[2]?.toLowerCase() || '';
  
  // Handle prefixes
  const multipliers: { [key: string]: number } = {
    'p': 1e-12,
    'n': 1e-9,
    'µ': 1e-6,
    'u': 1e-6,
    'm': 1e-3,
    'k': 1e3,
    'meg': 1e6,
    'g': 1e9,
  };
  
  for (const [prefix, multiplier] of Object.entries(multipliers)) {
    if (unit.startsWith(prefix)) {
      return num * multiplier;
    }
  }
  
  return num;
}