// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import { BottomNavigation, useBottomNavigation } from './BottomNavigation';

const meta = {
  title: 'GN370/BottomNavigation',
  component: BottomNavigation,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state: Home tab active
 */
export const Home: Story = {
  args: {
    activeItem: 'home',
    onNavigate: (item) => alert(`Navigating to: ${item}`),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '20px', color: '#FFFFFF' }}>
        <h1>Home</h1>
        <p>9 Mondi - Main genealogy view</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Family Tree tab active
 */
export const FamilyTree: Story = {
  args: {
    activeItem: 'family',
    onNavigate: (item) => alert(`Navigating to: ${item}`),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '20px', color: '#FFFFFF' }}>
        <h1>Family Tree</h1>
        <p>Genealogical visualization</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Person tab active
 */
export const Person: Story = {
  args: {
    activeItem: 'person',
    onNavigate: (item) => alert(`Navigating to: ${item}`),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '20px', color: '#FFFFFF' }}>
        <h1>Person Details</h1>
        <p>Individual genealogical information</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Help tab active
 */
export const Help: Story = {
  args: {
    activeItem: 'help',
    onNavigate: (item) => alert(`Navigating to: ${item}`),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '20px', color: '#FFFFFF' }}>
        <h1>Help & Support</h1>
        <p>Documentation and user guides</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Settings tab active
 */
export const Settings: Story = {
  args: {
    activeItem: 'settings',
    onNavigate: (item) => alert(`Navigating to: ${item}`),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '20px', color: '#FFFFFF' }}>
        <h1>Settings</h1>
        <p>User preferences and configuration</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Mobile viewport (375px width)
 */
export const Mobile: Story = {
  args: {
    activeItem: 'home',
    onNavigate: (item) => console.log('Navigate:', item),
  },
  render: (args) => (
    <div style={{ width: '375px', background: '#000000', minHeight: '100vh', margin: '0 auto' }}>
      <div style={{ padding: '20px', color: '#FFFFFF', marginBottom: '64px' }}>
        <h1>Mobile Layout</h1>
        <p>375px viewport with bottom navigation fixed</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Tablet viewport (768px width)
 * Note: Bottom nav should be hidden on tablet (640px+)
 */
export const Tablet: Story = {
  args: {
    activeItem: 'home',
    onNavigate: (item) => console.log('Navigate:', item),
    showOnDesktop: true, /* Show on tablet for demo */
  },
  render: (args) => (
    <div style={{ width: '768px', background: '#000000', minHeight: '100vh', margin: '0 auto' }}>
      <div style={{ padding: '20px', color: '#FFFFFF', marginBottom: '64px' }}>
        <h1>Tablet Layout</h1>
        <p>768px viewport - navigation normally hidden here</p>
        <p>showOnDesktop={'{true}'} for demo purposes</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Mobile landscape orientation (short height)
 */
export const MobileLandscape: Story = {
  args: {
    activeItem: 'home',
    onNavigate: (item) => console.log('Navigate:', item),
  },
  render: (args) => (
    <div style={{ width: '667px', height: '375px', background: '#000000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', color: '#FFFFFF', flex: 1 }}>
        <h1>Mobile Landscape</h1>
        <p>Height: 375px - nav bar reduces height</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * With notch (safe area simulation)
 */
export const WithNotch: Story = {
  args: {
    activeItem: 'home',
    onNavigate: (item) => console.log('Navigate:', item),
  },
  render: (args) => (
    <div style={{
      width: '375px',
      background: '#000000',
      minHeight: '100vh',
      margin: '0 auto',
      position: 'relative',
    }}>
      {/* Notch simulation */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '150px',
        height: '24px',
        background: '#000000',
        borderRadius: '0 0 20px 20px',
        zIndex: 999,
      }} />

      <div style={{ padding: '20px', paddingTop: '50px', color: '#FFFFFF', marginBottom: '64px' }}>
        <h1>With Notch</h1>
        <p>iPhone notch simulation - safe area respected</p>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Interactive state transitions
 * Click items to change active state
 */
export const Interactive: Story = {
  render: () => {
    const { activeItem, handleNavigate } = useBottomNavigation('home');

    return (
      <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
        <div style={{ padding: '20px', color: '#FFFFFF', marginBottom: '64px' }}>
          <h1>Interactive Demo</h1>
          <p>Current page: <strong>{activeItem}</strong></p>
          <p style={{ color: '#A8B5C8', marginTop: '16px' }}>
            Click navigation items below to switch pages
          </p>
        </div>
        <BottomNavigation
          activeItem={activeItem}
          onNavigate={handleNavigate}
        />
      </div>
    );
  },
};

/**
 * Accessibility demo
 * Test keyboard navigation (Tab, Arrow keys)
 */
export const Accessibility: Story = {
  args: {
    activeItem: 'home',
    onNavigate: (item) => console.log('Navigate:', item),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '20px', color: '#FFFFFF', marginBottom: '64px' }}>
        <h1>Accessibility Testing</h1>
        <ul style={{ color: '#A8B5C8', lineHeight: '1.8' }}>
          <li>🔑 Press Tab to focus navigation items</li>
          <li>🔑 Press Enter or Space to navigate</li>
          <li>🔊 Screen reader announces: "Home, active page" etc.</li>
          <li>👁️ Focus outline visible (cyan border)</li>
          <li>👁️ High contrast active state (#00D9FF)</li>
          <li>♿ Touch targets: 48px minimum (WCAG AAA)</li>
        </ul>
      </div>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * All states in grid (responsive)
 */
export const AllStates: Story = {
  render: () => {
    const states: Array<'home' | 'family' | 'person' | 'help' | 'settings'> = [
      'home',
      'family',
      'person',
      'help',
      'settings',
    ];

    return (
      <div style={{ background: '#000000', padding: '20px' }}>
        <h2 style={{ color: '#FFFFFF', marginBottom: '20px' }}>All Navigation States</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(375px, 1fr))', gap: '20px' }}>
          {states.map((state) => (
            <div key={state} style={{ border: '1px solid #1A1F3A', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '16px', background: '#0A0E27', color: '#FFFFFF' }}>
                <h3 style={{ margin: 0, marginBottom: '8px', textTransform: 'capitalize' }}>
                  {state} Active
                </h3>
              </div>
              <div style={{ position: 'relative', height: '200px' }}>
                <BottomNavigation
                  activeItem={state}
                  onNavigate={(item) => console.log('Navigate:', item)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * Dark theme (default)
 */
export const DarkTheme: Story = {
  args: {
    activeItem: 'home',
    onNavigate: (item) => console.log('Navigate:', item),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      <BottomNavigation {...args} />
    </div>
  ),
};

/**
 * Documentation: Component specs
 */
export const Documentation: Story = {
  render: () => (
    <div style={{ background: '#000000', padding: '40px', color: '#FFFFFF' }}>
      <h2 style={{ marginBottom: '20px' }}>BottomNavigation Component Specs</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
        <div>
          <h3>Mobile (&lt;640px)</h3>
          <ul style={{ lineHeight: '1.8', color: '#A8B5C8' }}>
            <li>Height: 64px (48px + safe area)</li>
            <li>Position: Fixed bottom</li>
            <li>5 tabs visible</li>
            <li>Touch target: 48px minimum</li>
            <li>Icon: 24px</li>
            <li>Label: 10px (uppercase)</li>
            <li>Indicator: Active dot bottom-center</li>
          </ul>
        </div>

        <div>
          <h3>Tablet/Desktop (&gt;640px)</h3>
          <ul style={{ lineHeight: '1.8', color: '#A8B5C8' }}>
            <li>Hidden by default</li>
            <li>Can show with: showOnDesktop</li>
            <li>Responsive sizing</li>
            <li>Landscape-aware</li>
            <li>Safe area support</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#0A0E27', borderRadius: '8px' }}>
        <h3>Usage Example</h3>
        <pre style={{ overflow: 'auto', fontSize: '12px', color: '#32FF00' }}>
{`const { activeItem, handleNavigate } = useBottomNavigation('home');

<BottomNavigation
  activeItem={activeItem}
  onNavigate={handleNavigate}
/>
`}
        </pre>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#1A1F3A', borderRadius: '8px' }}>
        <h3>Navigation Items</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>ID</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Label</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}>home</td>
              <td style={{ padding: '8px' }}>Home</td>
              <td style={{ padding: '8px' }}>9 Mondi main view</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}>family</td>
              <td style={{ padding: '8px' }}>Family</td>
              <td style={{ padding: '8px' }}>Family tree visualization</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}>person</td>
              <td style={{ padding: '8px' }}>Person</td>
              <td style={{ padding: '8px' }}>Person detail view</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '8px' }}>help</td>
              <td style={{ padding: '8px' }}>Help</td>
              <td style={{ padding: '8px' }}>Help & documentation</td>
            </tr>
            <tr>
              <td style={{ padding: '8px' }}>settings</td>
              <td style={{ padding: '8px' }}>Settings</td>
              <td style={{ padding: '8px' }}>User preferences</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  ),
};
