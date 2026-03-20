// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import ResourcesView from './ResourcesView';

const mockResources = [
  {
    id: 'res-1',
    title: 'Archivi di Stato - Palermo',
    type: 'archivio' as const,
    url: 'https://palermo.archiviodistato.it',
    description: 'Archivio di Stato con registri parrocchiali, censi e atti notarili dal XVII al XX secolo',
    tags: ['Sicilia', 'Palermo', 'Registri'],
    dateAdded: '2026-01-15',
  },
  {
    id: 'res-2',
    title: 'FamilySearch',
    type: 'database' as const,
    url: 'https://www.familysearch.org',
    description: 'Banca dati genealogica mondiale con milioni di documenti digitali',
    tags: ['Genealogia', 'Internazionale', 'Digitale'],
    dateAdded: '2025-12-20',
  },
  {
    id: 'res-3',
    title: 'Giardina Family History by Prof. Antonio Giardina',
    type: 'bibliografia' as const,
    url: '#',
    description: 'Studio storico completo sulla famiglia Giardina dal XV al XX secolo',
    tags: ['Giardina', 'Storia', 'Libro'],
    dateAdded: '2025-10-10',
  },
  {
    id: 'res-4',
    title: 'Documenti Notarili Giardina-Negrini',
    type: 'fonte' as const,
    url: '#',
    description: 'Collezione privata di atti notarili riguardanti matrimoni, eredità e proprietà',
    tags: ['Documenti', 'Privato', 'Notarile'],
    dateAdded: '2025-11-05',
  },
];

const meta = {
  title: 'Resources/ResourcesView',
  component: ResourcesView,
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
} satisfies Meta<typeof ResourcesView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullResourceList: Story = {
  args: {
    resources: mockResources,
    onVisit: (url: string) => console.log('Visit:', url),
  },
};

export const FilteredByArchivio: Story = {
  args: {
    resources: mockResources.filter((r) => r.type === 'archivio'),
    onVisit: (url: string) => console.log('Visit:', url),
  },
};

export const FilteredByDatabase: Story = {
  args: {
    resources: mockResources.filter((r) => r.type === 'database'),
    onVisit: (url: string) => console.log('Visit:', url),
  },
};

export const Empty: Story = {
  args: {
    resources: [],
    onVisit: (url: string) => console.log('Visit:', url),
  },
};

export const SearchResults: Story = {
  args: {
    resources: mockResources,
    searchQuery: 'Giardina',
    onVisit: (url: string) => console.log('Visit:', url),
  },
};

export const ManyResources: Story = {
  args: {
    resources: Array.from({ length: 20 }, (_, i) => ({
      id: `res-${i + 1}`,
      title: `Resource ${i + 1}`,
      type: (['archivio', 'database', 'bibliografia', 'fonte'] as const)[i % 4],
      url: `https://example.com/resource-${i + 1}`,
      description: `Description for resource ${i + 1}`,
      tags: [`Tag${i}`, 'Genealogia'],
      dateAdded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })),
    onVisit: (url: string) => console.log('Visit:', url),
  },
};

export const Mobile: Story = {
  args: {
    resources: mockResources,
    onVisit: (url: string) => console.log('Visit:', url),
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  args: {
    resources: mockResources,
    onVisit: (url: string) => console.log('Visit:', url),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const Desktop: Story = {
  args: {
    resources: mockResources,
    onVisit: (url: string) => console.log('Visit:', url),
  },
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

export const Loading: Story = {
  args: {
    resources: undefined,
    isLoading: true,
    onVisit: (url: string) => console.log('Visit:', url),
  },
};

export const Accessibility: Story = {
  args: {
    resources: mockResources,
    onVisit: (url: string) => console.log('Visit:', url),
  },
  parameters: {
    a11y: {
      config: {
        rules: {
          'color-contrast': { enabled: true },
          'link-name': { enabled: true },
          'button-name': { enabled: true },
        },
      },
    },
  },
};
