// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import { PersonNavigation, type Person } from './PersonNavigation';
import { useState } from 'react';

const meta = {
  title: 'GN370/PersonNavigation',
  component: PersonNavigation,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PersonNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const mockPerson: Person = {
  id: 'p1',
  name: 'Giovanni Giardina',
  birthDate: '1850-05-15',
  birthPlace: 'Palermo, Sicily',
  occupation: 'Notaio',
  parents: [
    {
      id: 'p2',
      name: 'Antonio Giardina',
      birthDate: '1820-03-20',
      birthPlace: 'Palermo, Sicily',
      occupation: 'Avvocato',
      parents: [
        {
          id: 'p3',
          name: 'Giuseppe Giardina',
          birthDate: '1790-01-10',
          birthPlace: 'Palermo, Sicily',
          parents: [],
          children: [],
        },
      ],
      children: [],
    },
  ],
  spouse: {
    id: 'p4',
    name: 'Francesca Negrini',
    birthDate: '1855-07-22',
    birthPlace: 'Palermo, Sicily',
    parents: [],
    children: [],
  },
  children: [
    {
      id: 'p5',
      name: 'Luigi Giardina',
      birthDate: '1875-11-30',
      birthPlace: 'Palermo, Sicily',
      occupation: 'Ingegnere',
      parents: [],
      children: [],
    },
    {
      id: 'p6',
      name: 'Maria Giardina',
      birthDate: '1878-02-14',
      birthPlace: 'Palermo, Sicily',
      parents: [],
      children: [],
    },
    {
      id: 'p7',
      name: 'Antonino Giardina',
      birthDate: '1880-09-25',
      birthPlace: 'Palermo, Sicily',
      occupation: 'Medico',
      parents: [],
      children: [],
    },
  ],
};

const allPeople: Person[] = [
  { id: 'p3', name: 'Giuseppe Giardina', birthDate: '1790-01-10' },
  { id: 'p2', name: 'Antonio Giardina', birthDate: '1820-03-20' },
  { id: 'p1', name: 'Giovanni Giardina', birthDate: '1850-05-15' },
  { id: 'p4', name: 'Francesca Negrini', birthDate: '1855-07-22' },
  { id: 'p5', name: 'Luigi Giardina', birthDate: '1875-11-30' },
  { id: 'p6', name: 'Maria Giardina', birthDate: '1878-02-14' },
  { id: 'p7', name: 'Antonino Giardina', birthDate: '1880-09-25' },
  { id: 'p8', name: 'Palermo', birthPlace: 'Palermo, Sicily' },
];

/**
 * Default state with full family context
 */
export const Default: Story = {
  args: {
    currentPerson: mockPerson,
    allPeople: allPeople,
    onNavigate: (personId) => console.log('Navigate to:', personId),
  },
};

/**
 * Root person (no parents)
 */
export const RootPerson: Story = {
  args: {
    currentPerson: {
      id: 'p3',
      name: 'Giuseppe Giardina',
      birthDate: '1790-01-10',
      birthPlace: 'Palermo, Sicily',
      occupation: 'Proprietario',
      children: [mockPerson.parents![0]],
    },
    allPeople: allPeople,
    onNavigate: (personId) => console.log('Navigate to:', personId),
  },
};

/**
 * Person with only children (no spouse)
 */
export const PersonWithOnlyChildren: Story = {
  args: {
    currentPerson: {
      id: 'p1-modified',
      name: 'Giovanni Giardina',
      birthDate: '1850-05-15',
      birthPlace: 'Palermo, Sicily',
      occupation: 'Notaio',
      parents: mockPerson.parents,
      children: mockPerson.children,
    },
    allPeople: allPeople,
    onNavigate: (personId) => console.log('Navigate to:', personId),
  },
};

/**
 * Interactive navigation with state
 */
export const InteractiveNavigation: Story = {
  render: () => {
    const [currentPersonId, setCurrentPersonId] = useState('p1');

    const getCurrentPerson = (id: string): Person => {
      return (
        allPeople.find((p) => p.id === id) || mockPerson
      ) as Person;
    };

    const currentPerson = getCurrentPerson(currentPersonId);

    return (
      <div style={{ background: '#000000', minHeight: '100vh', padding: '20px' }}>
        <h2 style={{ color: '#FFFFFF', marginTop: 0 }}>Interactive Person Navigation</h2>
        <p style={{ color: '#A8B5C8' }}>
          Click previous/next buttons or use arrow keys to navigate. Try the search feature to find people by name.
        </p>

        <PersonNavigation
          currentPerson={currentPerson}
          allPeople={allPeople}
          onNavigate={(personId) => {
            console.log('Navigating to:', personId);
            setCurrentPersonId(personId);
          }}
        />

        <div style={{ marginTop: '20px', padding: '16px', background: '#0A0E27', borderRadius: '8px', border: '1px solid #1A1F3A' }}>
          <h3 style={{ color: '#00D9FF', margin: '0 0 8px 0' }}>Current Person: {currentPerson.name}</h3>
          <p style={{ color: '#A8B5C8', margin: 0 }}>
            ID: {currentPerson.id}
            <br />
            {currentPerson.birthDate && `Born: ${currentPerson.birthDate}`}
            <br />
            {currentPerson.birthPlace && `Place: ${currentPerson.birthPlace}`}
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Mobile responsive view (375px)
 */
export const MobileResponsive: Story = {
  render: () => (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '0' }}>
      <div style={{ width: '375px', margin: '0 auto', background: '#000000' }}>
        <p style={{ color: '#A8B5C8', padding: '20px 20px 0', marginBottom: '0' }}>
          📱 Mobile (375px): Compact breadcrumb, stacked controls
        </p>
        <PersonNavigation
          currentPerson={mockPerson}
          allPeople={allPeople}
          onNavigate={(personId) => console.log('Navigate to:', personId)}
        />
      </div>
    </div>
  ),
};

/**
 * Keyboard navigation demo
 */
export const KeyboardNavigation: Story = {
  render: () => (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '20px' }}>
      <h2 style={{ color: '#FFFFFF', marginTop: 0 }}>Keyboard Navigation Demo</h2>
      <ul style={{ color: '#A8B5C8', lineHeight: '1.8', marginBottom: '20px' }}>
        <li>🔑 <strong>← →</strong> Navigate to previous/next person</li>
        <li>🔑 <strong>↑</strong> Jump to parent</li>
        <li>🔑 <strong>↓</strong> Jump to first child</li>
        <li>🔑 <strong>Ctrl+F</strong> Focus search box</li>
      </ul>

      <PersonNavigation
        currentPerson={mockPerson}
        allPeople={allPeople}
        onNavigate={(personId) => console.log('Navigate to:', personId)}
      />

      <div style={{ marginTop: '20px', padding: '16px', background: '#0A0E27', borderRadius: '8px', border: '1px solid #1A1F3A' }}>
        <p style={{ color: '#A8B5C8', margin: 0 }}>
          Try using keyboard shortcuts to navigate! Open browser DevTools console to see navigation events.
        </p>
      </div>
    </div>
  ),
};

/**
 * Search functionality demo
 */
export const SearchDemo: Story = {
  args: {
    currentPerson: mockPerson,
    allPeople: allPeople,
    onNavigate: (personId) => console.log('Navigate to:', personId),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '20px' }}>
      <h2 style={{ color: '#FFFFFF', marginTop: 0 }}>Search Functionality</h2>
      <p style={{ color: '#A8B5C8' }}>
        Click the search icon to open search box. Type to search by name or place (e.g., "Palermo", "Maria").
      </p>

      <PersonNavigation {...args} />
    </div>
  ),
};

/**
 * Large family with many descendants
 */
export const LargeFamilyTree: Story = {
  args: {
    currentPerson: {
      ...mockPerson,
      children: [
        ...mockPerson.children!,
        {
          id: 'p8',
          name: 'Salvatore Giardina',
          birthDate: '1882-04-10',
          birthPlace: 'Palermo, Sicily',
          occupation: 'Commerciante',
          parents: [],
          children: [],
        },
        {
          id: 'p9',
          name: 'Rosalia Giardina',
          birthDate: '1885-08-16',
          birthPlace: 'Palermo, Sicily',
          parents: [],
          children: [],
        },
      ],
    },
    allPeople: allPeople,
    onNavigate: (personId) => console.log('Navigate to:', personId),
  },
};

/**
 * Accessibility testing
 */
export const AccessibilityDemo: Story = {
  render: () => (
    <div style={{ background: '#000000', minHeight: '100vh', padding: '20px' }}>
      <h2 style={{ color: '#FFFFFF', marginTop: 0 }}>Accessibility Features</h2>
      <ul style={{ color: '#A8B5C8', lineHeight: '1.8', marginBottom: '20px' }}>
        <li>🔑 <strong>Full keyboard navigation</strong> with Tab/Arrow keys</li>
        <li>🔊 <strong>ARIA labels</strong> on all buttons and navigation landmarks</li>
        <li>🔊 <strong>Role attributes</strong> for semantic HTML</li>
        <li>👁️ <strong>High contrast</strong> UI elements (4.5:1 ratio)</li>
        <li>👁️ <strong>Respects prefers-reduced-motion</strong> for animations</li>
        <li>👁️ <strong>High contrast mode support</strong> with enhanced borders</li>
      </ul>

      <PersonNavigation
        currentPerson={mockPerson}
        allPeople={allPeople}
        onNavigate={(personId) => console.log('Navigate to:', personId)}
      />
    </div>
  ),
};
