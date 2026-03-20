// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import RelationsView from './RelationsView';

const mockPerson = {
  id: 'p1',
  name: 'Giovanni Giardina',
  birthDate: '1850-03-20',
  birthPlace: 'Palermo, Sicily',
  occupation: 'Avvocato',
};

const mockParents = [
  {
    id: 'p-father',
    name: 'Antonio Giardina',
    birthDate: '1820-06-15',
    birthPlace: 'Palermo, Sicily',
    occupation: 'Barone',
  },
  {
    id: 'p-mother',
    name: 'Caterina Negrini',
    birthDate: '1825-12-08',
    birthPlace: 'Palermo, Sicily',
    occupation: undefined,
  },
];

const mockSpouse = {
  id: 'p-spouse',
  name: 'Francesca Caruso',
  birthDate: '1855-07-22',
  birthPlace: 'Palermo, Sicily',
  occupation: undefined,
};

const mockChildren = [
  {
    id: 'p-child1',
    name: 'Luigi Giardina',
    birthDate: '1875-02-14',
    birthPlace: 'Palermo, Sicily',
    occupation: 'Medico',
  },
  {
    id: 'p-child2',
    name: 'Maria Giardina',
    birthDate: '1878-09-10',
    birthPlace: 'Palermo, Sicily',
    occupation: undefined,
  },
  {
    id: 'p-child3',
    name: 'Antonino Giardina',
    birthDate: '1880-11-05',
    birthPlace: 'Palermo, Sicily',
    occupation: 'Architetto',
  },
];

const meta = {
  title: 'Relations/RelationsView',
  component: RelationsView,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#000000' },
        { name: 'light', value: '#FFFFFF' },
      ],
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RelationsView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullFamily: Story = {
  args: {
    currentPerson: mockPerson,
    parents: mockParents,
    spouse: mockSpouse,
    children: mockChildren,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
};

export const OnlyChildren: Story = {
  args: {
    currentPerson: mockPerson,
    children: mockChildren,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
};

export const OnlyParents: Story = {
  args: {
    currentPerson: mockPerson,
    parents: mockParents,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
};

export const OnlySpouse: Story = {
  args: {
    currentPerson: mockPerson,
    spouse: mockSpouse,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
};

export const NoRelations: Story = {
  args: {
    currentPerson: mockPerson,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
};

export const ManyChildren: Story = {
  args: {
    currentPerson: mockPerson,
    parents: mockParents,
    spouse: mockSpouse,
    children: Array.from({ length: 8 }, (_, i) => ({
      id: `p-child${i + 1}`,
      name: `Child ${i + 1}`,
      birthDate: `${1875 + i}-01-01`,
      birthPlace: 'Palermo, Sicily',
    })),
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
};

export const Mobile: Story = {
  args: {
    currentPerson: mockPerson,
    parents: mockParents,
    spouse: mockSpouse,
    children: mockChildren,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  args: {
    currentPerson: mockPerson,
    parents: mockParents,
    spouse: mockSpouse,
    children: mockChildren,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const MatrixView: Story = {
  args: {
    currentPerson: mockPerson,
    parents: mockParents,
    spouse: mockSpouse,
    children: mockChildren,
    viewMode: 'matrix' as const,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
};

export const Accessibility: Story = {
  args: {
    currentPerson: mockPerson,
    parents: mockParents,
    spouse: mockSpouse,
    children: mockChildren,
    onNavigate: (personId: string) => console.log('Navigate to:', personId),
  },
  parameters: {
    a11y: {
      config: {
        rules: {
          'color-contrast': { enabled: true },
          'button-name': { enabled: true },
        },
      },
    },
  },
};
