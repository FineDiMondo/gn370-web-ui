import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      theme: "dark",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ backgroundColor: "#000000", color: "#FFFFFF", padding: "20px" }}>
        <style>
          {`
            * { box-sizing: border-box; }
            body {
              --primary: #00D9FF;
              --secondary: #32FF00;
              --danger: #FF0000;
              --warning: #FFD700;
              --bg-page: #000000;
              --bg-card: #0A0E27;
              --bg-hover: #141B2F;
              --text-primary: #FFFFFF;
              --text-secondary: #A8B5C8;
              --text-tertiary: #6B7A8C;
              --border: #1A1F3A;
              --font-mono: 'Fira Code', 'Courier New', monospace;
              --font-sans: 'Inter', '-apple-system', 'BlinkMacSystemFont', sans-serif;
            }
          `}
        </style>
        <Story />
      </div>
    ),
  ],
};
export default preview;
