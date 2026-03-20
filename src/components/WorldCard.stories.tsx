import type { Meta, StoryObj } from '@storybook/react';
import { WorldCard } from './WorldCard';

const meta = {
  title: 'GN370/WorldCard',
  component: WorldCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WorldCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic WorldCard showing all 9 Mondi
 */
export const AllWorlds: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', width: '1200px' }}>
      <WorldCard mondo="origini" status="complete" dataCount={5} />
      <WorldCard mondo="cicli" status="complete" dataCount={3} />
      <WorldCard mondo="doni" status="partial" dataCount={2} />
      <WorldCard mondo="ombre" status="partial" dataCount={1} />
      <WorldCard mondo="contesto" status="empty" dataCount={0} />
      <WorldCard mondo="struttura" status="empty" dataCount={0} />
      <WorldCard mondo="eredita" status="partial" dataCount={1} />
      <WorldCard mondo="nebbia" status="complete" dataCount={4} />
      <WorldCard mondo="radici" status="complete" dataCount={1} />
    </div>
  ),
};

/**
 * WorldCard with complete status (green checkmark)
 */
export const CompleteStatus: Story = {
  args: {
    mondo: 'origini',
    status: 'complete',
    dataCount: 5,
  },
};

/**
 * WorldCard with partial status (orange warning)
 */
export const PartialStatus: Story = {
  args: {
    mondo: 'cicli',
    status: 'partial',
    dataCount: 2,
  },
};

/**
 * WorldCard with empty status (grey question mark)
 */
export const EmptyStatus: Story = {
  args: {
    mondo: 'doni',
    status: 'empty',
    dataCount: 0,
  },
};

/**
 * WorldCard in active/selected state
 */
export const ActiveState: Story = {
  args: {
    mondo: 'ombre',
    isActive: true,
    status: 'complete',
    dataCount: 3,
  },
};

/**
 * WorldCard demonstrating hover state (simulated)
 */
export const HoverState: Story = {
  args: {
    mondo: 'nebbia',
    status: 'complete',
    dataCount: 4,
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '40px', background: '#000000' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Mobile responsive layout - single column
 */
export const MobileResponsive: Story = {
  render: () => (
    <div style={{ width: '375px', background: '#000000', padding: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <WorldCard mondo="origini" status="complete" dataCount={5} />
        <WorldCard mondo="cicli" status="partial" dataCount={2} />
        <WorldCard mondo="doni" status="empty" dataCount={0} />
      </div>
    </div>
  ),
};

/**
 * All mondo types with descriptive labels
 */
export const AllMondoTypes: Story = {
  render: () => (
    <div style={{ background: '#000000', padding: '40px' }}>
      <h2 style={{ color: '#FFFFFF', marginBottom: '30px' }}>I Nove Mondi di GN370</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <WorldCard mondo="origini" status="complete" onClick={() => alert('Navigating to ORIGINI')} />
        <WorldCard mondo="cicli" status="complete" onClick={() => alert('Navigating to CICLI')} />
        <WorldCard mondo="doni" status="partial" onClick={() => alert('Navigating to DONI')} />
        <WorldCard mondo="ombre" status="partial" onClick={() => alert('Navigating to OMBRE')} />
        <WorldCard mondo="contesto" status="empty" onClick={() => alert('Navigating to CONTESTO')} />
        <WorldCard mondo="struttura" status="empty" onClick={() => alert('Navigating to STRUTTURA')} />
        <WorldCard mondo="eredita" status="partial" onClick={() => alert('Navigating to EREDITÀ')} />
        <WorldCard mondo="nebbia" status="complete" onClick={() => alert('Navigating to NEBBIA')} />
        <WorldCard mondo="radici" status="complete" onClick={() => alert('Navigating to RADICI')} />
      </div>
    </div>
  ),
};

/**
 * Accessibility demo: keyboard navigation
 *
 * Press Tab to navigate, Enter/Space to activate
 */
export const Accessible: Story = {
  render: () => (
    <div style={{ background: '#000000', padding: '40px' }}>
      <h2 style={{ color: '#FFFFFF', marginBottom: '20px' }}>Accessible Navigation</h2>
      <p style={{ color: '#A8B5C8', marginBottom: '30px' }}>
        Press Tab to navigate between cards, Enter/Space to select.
        Try with screen reader (NVDA, JAWS, VoiceOver)
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1000px' }}>
        <WorldCard mondo="origini" status="complete" dataCount={5} />
        <WorldCard mondo="cicli" status="complete" dataCount={3} />
        <WorldCard mondo="doni" status="partial" dataCount={2} />
      </div>
    </div>
  ),
};

/**
 * Dark vs Light mode comparison
 */
export const ThemeComparison: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '40px' }}>
      {/* Dark mode */}
      <div style={{ background: '#000000', padding: '40px', flex: 1 }}>
        <h3 style={{ color: '#FFFFFF', marginBottom: '20px' }}>Dark Mode (Default)</h3>
        <WorldCard mondo="origini" status="complete" dataCount={5} />
      </div>

      {/* Light mode (simulated) */}
      <div style={{ background: '#FFFFFF', padding: '40px', flex: 1 }}>
        <h3 style={{ color: '#000000', marginBottom: '20px' }}>Light Mode (Future)</h3>
        <div style={{ '--bg-card': '#F5F7FA', '--text-primary': '#000000', '--text-secondary': '#333333', '--border': '#CCCCCC' } as React.CSSProperties}>
          <WorldCard mondo="origini" status="complete" dataCount={5} />
        </div>
      </div>
    </div>
  ),
};
