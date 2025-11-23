import { CircuitComponent, Wire } from '../store/circuitStore';
import { createComponent } from './componentUtils';

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  components: CircuitComponent[];
  wires: Wire[];
}

export const templates: CircuitTemplate[] = [
  {
    id: 'simple-led',
    name: 'Simple LED Circuit',
    description: 'Basic LED with resistor and battery',
    components: [
      createComponent('battery', 300, 200, '9V'),
      createComponent('resistor', 400, 200, '220Ω'),
      createComponent('led', 500, 200),
      createComponent('ground', 300, 300),
    ],
    wires: [],
  },
  {
    id: 'voltage-divider',
    name: 'Voltage Divider',
    description: 'Two resistors in series with voltage source',
    components: [
      createComponent('battery', 300, 200, '12V'),
      createComponent('resistor', 400, 200, '1kΩ'),
      createComponent('resistor', 500, 200, '1kΩ'),
      createComponent('ground', 300, 300),
    ],
    wires: [],
  },
  {
    id: 'rc-filter',
    name: 'RC Low-Pass Filter',
    description: 'Simple RC filter circuit',
    components: [
      createComponent('ac-source', 300, 200, '5V'),
      createComponent('resistor', 400, 200, '1kΩ'),
      createComponent('capacitor', 500, 250, '100µF'),
      createComponent('ground', 500, 350),
    ],
    wires: [],
  },
  {
    id: 'transistor-switch',
    name: 'Transistor Switch',
    description: 'NPN transistor as a switch',
    components: [
      createComponent('battery', 300, 200, '9V'),
      createComponent('transistor-npn', 400, 250),
      createComponent('resistor', 350, 250, '10kΩ'),
      createComponent('led', 400, 150),
      createComponent('resistor', 400, 350, '220Ω'),
      createComponent('ground', 300, 400),
    ],
    wires: [],
  },
];

// Auto-wire templates based on typical connections
export function getTemplateWithWires(templateId: string): CircuitTemplate | null {
  const template = templates.find(t => t.id === templateId);
  if (!template) return null;

  // Clone the template
  const clonedTemplate = {
    ...template,
    components: template.components.map(c => ({ ...c })),
  };

  // Add appropriate wires based on template type
  const wires: Wire[] = [];

  if (templateId === 'simple-led') {
    const [battery, resistor, led, ground] = clonedTemplate.components;
    
    // Battery + to Resistor
    wires.push({
      id: `wire-${Date.now()}-1`,
      from: { componentId: battery.id, terminalId: battery.terminals[1].id },
      to: { componentId: resistor.id, terminalId: resistor.terminals[0].id },
      points: [
        { x: battery.x + 40, y: battery.y },
        { x: resistor.x - 40, y: resistor.y },
      ],
    });

    // Resistor to LED
    wires.push({
      id: `wire-${Date.now()}-2`,
      from: { componentId: resistor.id, terminalId: resistor.terminals[1].id },
      to: { componentId: led.id, terminalId: led.terminals[0].id },
      points: [
        { x: resistor.x + 40, y: resistor.y },
        { x: led.x - 40, y: led.y },
      ],
    });

    // LED to Ground
    wires.push({
      id: `wire-${Date.now()}-3`,
      from: { componentId: led.id, terminalId: led.terminals[1].id },
      to: { componentId: ground.id, terminalId: ground.terminals[0].id },
      points: [
        { x: led.x + 40, y: led.y },
        { x: led.x + 40, y: ground.y - 20 },
        { x: ground.x, y: ground.y - 20 },
      ],
    });

    // Ground to Battery -
    wires.push({
      id: `wire-${Date.now()}-4`,
      from: { componentId: ground.id, terminalId: ground.terminals[0].id },
      to: { componentId: battery.id, terminalId: battery.terminals[0].id },
      points: [
        { x: ground.x, y: ground.y - 20 },
        { x: battery.x - 40, y: ground.y - 20 },
        { x: battery.x - 40, y: battery.y },
      ],
    });
  }

  return {
    ...clonedTemplate,
    wires,
  };
}
