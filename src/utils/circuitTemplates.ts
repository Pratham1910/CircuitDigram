import { CircuitComponent, Wire } from '../store/circuitStore';

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'analog' | 'digital' | 'power' | 'learning';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  components: CircuitComponent[];
  wires: Wire[];
  thumbnail?: string;
}

export const CIRCUIT_TEMPLATES: CircuitTemplate[] = [
  {
    id: 'simple-led',
    name: 'Simple LED Circuit',
    description: 'Basic LED circuit with resistor and battery - perfect for beginners',
    category: 'learning',
    difficulty: 'beginner',
    components: [
      {
        id: 'battery-1',
        type: 'battery',
        x: 200,
        y: 200,
        rotation: 0,
        properties: { label: 'V1', value: '9V' },
        terminals: [
          { id: 'battery-1-t1', x: -40, y: 0, componentId: 'battery-1', name: 'T1' },
          { id: 'battery-1-t2', x: 40, y: 0, componentId: 'battery-1', name: 'T2' },
        ],
      },
      {
        id: 'resistor-1',
        type: 'resistor',
        x: 350,
        y: 200,
        rotation: 0,
        properties: { label: 'R1', value: '220Ω' },
        terminals: [
          { id: 'resistor-1-t1', x: -40, y: 0, componentId: 'resistor-1', name: 'T1' },
          { id: 'resistor-1-t2', x: 40, y: 0, componentId: 'resistor-1', name: 'T2' },
        ],
      },
      {
        id: 'led-1',
        type: 'led',
        x: 500,
        y: 200,
        rotation: 0,
        properties: { label: 'LED1', value: '' },
        terminals: [
          { id: 'led-1-t1', x: -40, y: 0, componentId: 'led-1', name: 'T1' },
          { id: 'led-1-t2', x: 40, y: 0, componentId: 'led-1', name: 'T2' },
        ],
      },
      {
        id: 'ground-1',
        type: 'ground',
        x: 350,
        y: 320,
        rotation: 0,
        properties: { label: '', value: '' },
        terminals: [
          { id: 'ground-1-t1', x: 0, y: -20, componentId: 'ground-1', name: 'T1' },
        ],
      },
    ],
    wires: [
      {
        id: 'wire-1',
        from: { componentId: 'battery-1', terminalId: 'battery-1-t2' },
        to: { componentId: 'resistor-1', terminalId: 'resistor-1-t1' },
        points: [
          { x: 240, y: 200 },
          { x: 310, y: 200 },
        ],
      },
      {
        id: 'wire-2',
        from: { componentId: 'resistor-1', terminalId: 'resistor-1-t2' },
        to: { componentId: 'led-1', terminalId: 'led-1-t1' },
        points: [
          { x: 390, y: 200 },
          { x: 460, y: 200 },
        ],
      },
      {
        id: 'wire-3',
        from: { componentId: 'led-1', terminalId: 'led-1-t2' },
        to: { componentId: 'ground-1', terminalId: 'ground-1-t1' },
        points: [
          { x: 540, y: 200 },
          { x: 540, y: 300 },
          { x: 350, y: 300 },
        ],
      },
      {
        id: 'wire-4',
        from: { componentId: 'battery-1', terminalId: 'battery-1-t1' },
        to: { componentId: 'ground-1', terminalId: 'ground-1-t1' },
        points: [
          { x: 160, y: 200 },
          { x: 160, y: 300 },
          { x: 350, y: 300 },
        ],
      },
    ],
  },
  {
    id: 'voltage-divider',
    name: 'Voltage Divider',
    description: 'Classic voltage divider circuit with two resistors',
    category: 'basic',
    difficulty: 'beginner',
    components: [
      {
        id: 'battery-2',
        type: 'battery',
        x: 200,
        y: 200,
        rotation: 0,
        properties: { label: 'Vin', value: '12V' },
        terminals: [
          { id: 'battery-2-t1', x: -40, y: 0, componentId: 'battery-2', name: 'T1' },
          { id: 'battery-2-t2', x: 40, y: 0, componentId: 'battery-2', name: 'T2' },
        ],
      },
      {
        id: 'resistor-2',
        type: 'resistor',
        x: 350,
        y: 150,
        rotation: 90,
        properties: { label: 'R1', value: '10kΩ' },
        terminals: [
          { id: 'resistor-2-t1', x: -40, y: 0, componentId: 'resistor-2', name: 'T1' },
          { id: 'resistor-2-t2', x: 40, y: 0, componentId: 'resistor-2', name: 'T2' },
        ],
      },
      {
        id: 'resistor-3',
        type: 'resistor',
        x: 350,
        y: 280,
        rotation: 90,
        properties: { label: 'R2', value: '10kΩ' },
        terminals: [
          { id: 'resistor-3-t1', x: -40, y: 0, componentId: 'resistor-3', name: 'T1' },
          { id: 'resistor-3-t2', x: 40, y: 0, componentId: 'resistor-3', name: 'T2' },
        ],
      },
      {
        id: 'ground-2',
        type: 'ground',
        x: 350,
        y: 380,
        rotation: 0,
        properties: { label: '', value: '' },
        terminals: [
          { id: 'ground-2-t1', x: 0, y: -20, componentId: 'ground-2', name: 'T1' },
        ],
      },
    ],
    wires: [
      {
        id: 'wire-5',
        from: { componentId: 'battery-2', terminalId: 'battery-2-t2' },
        to: { componentId: 'resistor-2', terminalId: 'resistor-2-t1' },
        points: [
          { x: 240, y: 200 },
          { x: 350, y: 200 },
          { x: 350, y: 110 },
        ],
      },
      {
        id: 'wire-6',
        from: { componentId: 'resistor-2', terminalId: 'resistor-2-t2' },
        to: { componentId: 'resistor-3', terminalId: 'resistor-3-t1' },
        points: [
          { x: 350, y: 190 },
          { x: 350, y: 240 },
        ],
      },
      {
        id: 'wire-7',
        from: { componentId: 'resistor-3', terminalId: 'resistor-3-t2' },
        to: { componentId: 'ground-2', terminalId: 'ground-2-t1' },
        points: [
          { x: 350, y: 320 },
          { x: 350, y: 360 },
        ],
      },
      {
        id: 'wire-8',
        from: { componentId: 'battery-2', terminalId: 'battery-2-t1' },
        to: { componentId: 'ground-2', terminalId: 'ground-2-t1' },
        points: [
          { x: 160, y: 200 },
          { x: 160, y: 360 },
          { x: 350, y: 360 },
        ],
      },
    ],
  },
  {
    id: 'rc-circuit',
    name: 'RC Time Constant',
    description: 'Resistor-Capacitor circuit demonstrating time constants',
    category: 'learning',
    difficulty: 'intermediate',
    components: [
      {
        id: 'battery-3',
        type: 'battery',
        x: 200,
        y: 250,
        rotation: 0,
        properties: { label: 'V1', value: '5V' },
        terminals: [
          { id: 'battery-3-t1', x: -40, y: 0, componentId: 'battery-3', name: 'T1' },
          { id: 'battery-3-t2', x: 40, y: 0, componentId: 'battery-3', name: 'T2' },
        ],
      },
      {
        id: 'resistor-4',
        type: 'resistor',
        x: 350,
        y: 250,
        rotation: 0,
        properties: { label: 'R1', value: '1kΩ' },
        terminals: [
          { id: 'resistor-4-t1', x: -40, y: 0, componentId: 'resistor-4', name: 'T1' },
          { id: 'resistor-4-t2', x: 40, y: 0, componentId: 'resistor-4', name: 'T2' },
        ],
      },
      {
        id: 'capacitor-1',
        type: 'capacitor',
        x: 500,
        y: 280,
        rotation: 90,
        properties: { label: 'C1', value: '100µF' },
        terminals: [
          { id: 'capacitor-1-t1', x: -40, y: 0, componentId: 'capacitor-1', name: 'T1' },
          { id: 'capacitor-1-t2', x: 40, y: 0, componentId: 'capacitor-1', name: 'T2' },
        ],
      },
      {
        id: 'ground-3',
        type: 'ground',
        x: 350,
        y: 380,
        rotation: 0,
        properties: { label: '', value: '' },
        terminals: [
          { id: 'ground-3-t1', x: 0, y: -20, componentId: 'ground-3', name: 'T1' },
        ],
      },
    ],
    wires: [
      {
        id: 'wire-9',
        from: { componentId: 'battery-3', terminalId: 'battery-3-t2' },
        to: { componentId: 'resistor-4', terminalId: 'resistor-4-t1' },
        points: [
          { x: 240, y: 250 },
          { x: 310, y: 250 },
        ],
      },
      {
        id: 'wire-10',
        from: { componentId: 'resistor-4', terminalId: 'resistor-4-t2' },
        to: { componentId: 'capacitor-1', terminalId: 'capacitor-1-t1' },
        points: [
          { x: 390, y: 250 },
          { x: 500, y: 250 },
          { x: 500, y: 240 },
        ],
      },
      {
        id: 'wire-11',
        from: { componentId: 'capacitor-1', terminalId: 'capacitor-1-t2' },
        to: { componentId: 'ground-3', terminalId: 'ground-3-t1' },
        points: [
          { x: 500, y: 320 },
          { x: 500, y: 360 },
          { x: 350, y: 360 },
        ],
      },
      {
        id: 'wire-12',
        from: { componentId: 'battery-3', terminalId: 'battery-3-t1' },
        to: { componentId: 'ground-3', terminalId: 'ground-3-t1' },
        points: [
          { x: 160, y: 250 },
          { x: 160, y: 360 },
          { x: 350, y: 360 },
        ],
      },
    ],
  },
];
