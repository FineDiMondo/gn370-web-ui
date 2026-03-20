// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import AlbumView from './AlbumView';

const meta = {
  title: 'Albums/AlbumView',
  component: AlbumView,
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
} satisfies Meta<typeof AlbumView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    personId: 'p1',
    photos: [],
  },
};

export const WithPhotos: Story = {
  args: {
    personId: 'p1',
    photos: [
      {
        id: 'photo-1',
        url: 'https://via.placeholder.com/200',
        title: 'Giovanni Giardina',
        date: '1880',
        personId: 'p1',
      },
      {
        id: 'photo-2',
        url: 'https://via.placeholder.com/200',
        title: 'Family Portrait',
        date: '1885',
        personId: 'p1',
      },
      {
        id: 'photo-3',
        url: 'https://via.placeholder.com/200',
        title: 'Wedding Day',
        date: '1878',
        personId: 'p1',
      },
      {
        id: 'photo-4',
        url: 'https://via.placeholder.com/200',
        title: 'Children',
        date: '1890',
        personId: 'p1',
      },
      {
        id: 'photo-5',
        url: 'https://via.placeholder.com/200',
        title: 'Estate',
        date: '1875',
        personId: 'p1',
      },
      {
        id: 'photo-6',
        url: 'https://via.placeholder.com/200',
        title: 'Business Portrait',
        date: '1882',
        personId: 'p1',
      },
    ],
  },
};

export const ManyPhotos: Story = {
  args: {
    personId: 'p1',
    photos: Array.from({ length: 24 }, (_, i) => ({
      id: `photo-${i + 1}`,
      url: 'https://via.placeholder.com/200',
      title: `Photo ${i + 1}`,
      date: `${1870 + Math.floor(i / 4)}`,
      personId: 'p1',
    })),
  },
};

export const Mobile: Story = {
  args: {
    personId: 'p1',
    photos: [
      {
        id: 'photo-1',
        url: 'https://via.placeholder.com/200',
        title: 'Photo 1',
        date: '1880',
        personId: 'p1',
      },
      {
        id: 'photo-2',
        url: 'https://via.placeholder.com/200',
        title: 'Photo 2',
        date: '1885',
        personId: 'p1',
      },
      {
        id: 'photo-3',
        url: 'https://via.placeholder.com/200',
        title: 'Photo 3',
        date: '1890',
        personId: 'p1',
      },
    ],
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  args: {
    personId: 'p1',
    photos: Array.from({ length: 12 }, (_, i) => ({
      id: `photo-${i + 1}`,
      url: 'https://via.placeholder.com/200',
      title: `Photo ${i + 1}`,
      date: `${1870 + Math.floor(i / 3)}`,
      personId: 'p1',
    })),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const WithLongTitle: Story = {
  args: {
    personId: 'p1',
    photos: [
      {
        id: 'photo-1',
        url: 'https://via.placeholder.com/200',
        title: 'Very Long Photo Title That Might Overflow The Card',
        date: '1880',
        personId: 'p1',
      },
      {
        id: 'photo-2',
        url: 'https://via.placeholder.com/200',
        title: 'Short',
        date: '1885',
        personId: 'p1',
      },
    ],
  },
};

export const Loading: Story = {
  args: {
    personId: 'p1',
    photos: undefined,
    isLoading: true,
  },
};
