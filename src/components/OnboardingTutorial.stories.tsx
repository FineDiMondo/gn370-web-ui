// @ts-nocheck
import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingTutorial, DEFAULT_ONBOARDING_STEPS } from './OnboardingTutorial';

const meta = {
  title: 'GN370/OnboardingTutorial',
  component: OnboardingTutorial,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof OnboardingTutorial>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  args: {
    steps: DEFAULT_ONBOARDING_STEPS,
    isOpen: true,
    onClose: () => alert('Closed'),
    onComplete: () => alert('Completed'),
    startAtStep: 0,
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '40px', color: '#FFFFFF' }}>
        <h1>GN370 - Benvenuto</h1>
      </div>
      <OnboardingTutorial {...args} />
    </div>
  ),
};

export const Step2_Import: Story = {
  args: {
    steps: DEFAULT_ONBOARDING_STEPS,
    isOpen: true,
    onClose: () => alert('Closed'),
    onComplete: () => alert('Completed'),
    startAtStep: 1,
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <OnboardingTutorial {...args} />
    </div>
  ),
};

export const Step6_Help: Story = {
  args: {
    steps: DEFAULT_ONBOARDING_STEPS,
    isOpen: true,
    onClose: () => alert('Closed'),
    onComplete: () => alert('Completed'),
    startAtStep: 5,
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <OnboardingTutorial {...args} />
    </div>
  ),
};

export const Complete: Story = {
  args: {
    steps: DEFAULT_ONBOARDING_STEPS,
    isOpen: true,
    onClose: () => alert('Closed'),
    onComplete: () => alert('Completed'),
    startAtStep: 7,
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <OnboardingTutorial {...args} />
    </div>
  ),
};

export const Closed: Story = {
  args: {
    steps: DEFAULT_ONBOARDING_STEPS,
    isOpen: false,
    onClose: () => alert('Closed'),
    onComplete: () => alert('Completed'),
  },
  render: (args) => (
    <div style={{ background: '#000000', minHeight: '100vh', position: 'relative' }}>
      <div style={{ padding: '40px', color: '#FFFFFF' }}>
        <h1>Tutorial Chiuso</h1>
      </div>
      <OnboardingTutorial {...args} />
    </div>
  ),
};
