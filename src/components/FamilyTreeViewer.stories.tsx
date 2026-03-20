// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import { FamilyTreeViewer, type FamilyTreePerson } from './FamilyTreeViewer';
import { useState } from 'react';

const meta = {
  title: 'GN370/FamilyTreeViewer',
  component: FamilyTreeViewer,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FamilyTreeViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockFamily: FamilyTreePerson = {
  id: 'p1',
  name: 'Giovanni Giardina',
  birthDate: '1850-05-15',
  birthPlace: 'Palermo, Sicily',
  occupation: 'Notaio',
  gender: 'M',
  parents: [
    {
      id: 'p2',
      name: 'Antonio Giardina',
      birthDate: '1820-03-20',
      birthPlace: 'Palermo, Sicily',
      occupation: 'Avvocato',
      gender: 'M',
      parents: [
        {
          id: 'p3',
          name: 'Giuseppe Giardina',
          birthDate: '1790-01-10',
          birthPlace: 'Palermo, Sicily',
          gender: 'M',
        },
      ],
    },
  ],
  spouse: {
    id: 'p4',
    name: 'Francesca Negrini',
    birthDate: '1855-07-22',
    birthPlace: 'Palermo, Sicily',
    gender: 'F',
  },
  children: [
    {
      id: 'p5',
      name: 'Luigi Giardina',
      birthDate: '1875-11-30',
      birthPlace: 'Palermo, Sicily',
      occupation: 'Ingegnere',
      gender: 'M',
    },
    {
      id: 'p6',
      name: 'Maria Giardina',
      birthDate: '1878-02-14',
      birthPlace: 'Palermo, Sicily',
      gender: 'F',
    },
    {
      id: 'p7',
      name: 'Antonino Giardina',
      birthDate: '1880-09-25',
      birthPlace: 'Palermo, Sicily',
      occupation: 'Medico',
      gender: 'M',
    },
  ],
};

export const Default: Story = {
  args: {
    rootPerson: mockFamily,
    showLabels: true,
    maxGenerations: 5,
  },
};

export const WithSelection: Story = {
  args: {
    rootPerson: mockFamily,
    selectedPersonId: 'p2',
    showLabels: true,
  },
};

export const InteractiveNavigation: Story = {
  render: () => {
    const [selectedId, setSelectedId] = useState('p1');
    return (
      <div style={{ background: '#000000', height: '100vh' }}>
        <FamilyTreeViewer
          rootPerson={mockFamily}
          selectedPersonId={selectedId}
          onPersonClick={setSelectedId}
          showLabels={true}
        />
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#0A0E27', padding: '16px', borderRadius: '8px', border: '1px solid #1A1F3A', color: '#FFFFFF' }}>
          <p style={{ margin: 0, marginBottom: '8px' }}>Selected: {mockFamily.id === selectedId ? mockFamily.name : 'Other'}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#A8B5C8' }}>Use arrow keys or click nodes to navigate</p>
        </div>
      </div>
    );
  },
};

export const MobileView: Story = {
  render: () => (
    <div style={{ width: '375px', height: '667px', border: '2px solid #666', background: '#000000' }}>
      <FamilyTreeViewer rootPerson={mockFamily} showLabels={true} maxGenerations={4} />
    </div>
  ),
};

export const LargeFamily: Story = {
  args: {
    rootPerson: {
      ...mockFamily,
      children: [
        ...mockFamily.children!,
        { id: 'p8', name: 'Salvatore Giardina', birthDate: '1882-04-10', gender: 'M' },
        { id: 'p9', name: 'Rosalia Giardina', birthDate: '1885-08-16', gender: 'F' },
      ],
    },
    showLabels: true,
  },
};

export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ background: '#000000', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', color: '#FFFFFF' }}>
        <h2 style={{ margin: 0 }}>Keyboard Navigation Demo</h2>
        <ul style={{ color: '#A8B5C8', fontSize: '14px', margin: '10px 0 0 0' }}>
          <li>↑ Jump to parent</li>
          <li>↓ Jump to first child</li>
          <li>Enter to select</li>
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <FamilyTreeViewer rootPerson={mockFamily} showLabels={true} />
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div style={{ background: '#000000', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', color: '#FFFFFF' }}>
        <h2 style={{ margin: 0 }}>Accessibility Features</h2>
        <ul style={{ color: '#A8B5C8', fontSize: '12px' }}>
          <li>Semantic SVG with ARIA labels</li>
          <li>Full keyboard navigation</li>
          <li>Screen reader compatible</li>
          <li>High contrast support</li>
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <FamilyTreeViewer rootPerson={mockFamily} showLabels={true} />
      </div>
    </div>
  ),
};
