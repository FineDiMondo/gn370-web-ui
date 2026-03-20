# GN370 Design System v1.0

**Status**: Foundation Phase
**Last Updated**: 20 Marzo 2026
**Maintainer**: Design Systems Team

---

## 🎨 Color Palette

### Core Colors (GN370 Theme)
```css
/* Semantic Colors */
--primary: #00D9FF;        /* Turquoise - Headers, primary action */
--secondary: #32FF00;      /* Green - Success, navigation */
--danger: #FF0000;         /* Red - Errors, warnings, ombre */
--warning: #FFD700;        /* Amber/Gold - Alerts, caution */
--info: #00D9FF;           /* Info messages */

/* Neutral Colors */
--bg-page: #000000;        /* Page background */
--bg-card: #0A0E27;        /* Card/modal background */
--bg-hover: #141B2F;       /* Hover state */
--text-primary: #FFFFFF;   /* Primary text */
--text-secondary: #A8B5C8; /* Secondary text, labels */
--text-tertiary: #6B7A8C;  /* Placeholder, disabled */
--border: #1A1F3A;         /* Borders, dividers */

/* Accessibility Variants */
--contrast-high-bg: #000000;
--contrast-high-text: #FFFFFF;
--contrast-high-accent: #FFFF00; /* High visibility */
```

### Color Usage
| Component | Color | Usage |
|-----------|-------|-------|
| Button Primary | --primary (#00D9FF) | CTA, primary action |
| Button Secondary | --secondary (#32FF00) | Confirm, approve |
| Button Danger | --danger (#FF0000) | Delete, critical |
| Link | --primary (#00D9FF) | Hyperlinks, navigation |
| Error State | --danger (#FF0000) | Form validation, alerts |
| Success State | --secondary (#32FF00) | Confirmation messages |
| Warning/Caution | --warning (#FFD700) | Non-blocking alerts |
| Background | --bg-page (#000000) | Page fill |
| Cards | --bg-card (#0A0E27) | Content containers |
| Text | --text-primary (#FFFFFF) | Body text |
| Placeholder | --text-tertiary (#6B7A8C) | Empty states, disabled |
| Border | --border (#1A1F3A) | Dividers, edges |

### Light Mode Variant
```css
--primary: #0099CC;       /* Darker turquoise */
--bg-page: #FFFFFF;
--bg-card: #F5F7FA;
--text-primary: #000000;
--text-secondary: #333333;
--border: #CCCCCC;
```

---

## 📝 Typography

### Font Stack
```css
--font-mono: 'Fira Code', 'Courier New', monospace;     /* Terminal aesthetic */
--font-sans: 'Inter', '-apple-system', 'BlinkMacSystemFont', sans-serif; /* Readability */
--font-serif: 'Georgia', serif;                         /* Genealogical documents */
```

**Recommendation**: Use `--font-sans` per default (readability), `--font-mono` per dati/ID.

### Scale
```css
/* Typography Scale (8px base) */
--text-xs: 12px;      /* 1.5rem, line-height: 1.4 */
--text-sm: 14px;      /* Small labels, helpers */
--text-base: 16px;    /* Body text (default) */
--text-lg: 18px;      /* Section titles */
--text-xl: 24px;      /* Page headings */
--text-2xl: 32px;     /* Hero/display */

/* Weights */
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.8;
```

### Type Examples
```
Display (H1)
  Size: 32px, Bold, line-height: 1.2

Page Title (H2)
  Size: 24px, SemiBold, line-height: 1.3

Section Title (H3)
  Size: 18px, SemiBold, line-height: 1.4

Body
  Size: 16px, Regular, line-height: 1.5

Small Text
  Size: 14px, Regular, line-height: 1.5

Tiny/Helper
  Size: 12px, Regular, line-height: 1.4
```

---

## 📏 Spacing Scale

**Base Unit**: 8px

```css
--space-xs: 4px;      /* 0.5x base */
--space-sm: 8px;      /* 1x base */
--space-md: 16px;     /* 2x base */
--space-lg: 24px;     /* 3x base */
--space-xl: 32px;     /* 4x base */
--space-2xl: 48px;    /* 6x base */
--space-3xl: 64px;    /* 8x base */
```

### Component Spacing
| Component | Padding | Margin Bottom |
|-----------|---------|----------------|
| Button | 12px 24px (py-md px-lg) | 16px |
| Input | 12px 16px (py-md px-md) | 16px |
| Card | 24px (p-lg) | 24px |
| Section | 32px (p-xl) | 32px |
| Modal | 24px (p-lg) | — |

---

## 🔲 Components

### 1. Button
```tsx
// Props
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Examples
<Button variant="primary" size="md">Carica GEDCOM</Button>
<Button variant="secondary" size="sm">Cancella</Button>
<Button variant="danger" size="md" disabled>Elimina</Button>
<Button variant="ghost" size="sm">Skip Tutorial</Button>
```

### 2. Input
```tsx
interface InputProps {
  type: 'text' | 'email' | 'date' | 'number' | 'file';
  placeholder?: string;
  value?: string;
  error?: string;
  onChange?: (value: string) => void;
}

// Examples
<Input type="text" placeholder="Ricerca persona..." />
<Input type="date" placeholder="Data nascita" error="Data invalida" />
<Input type="file" accept=".ged" placeholder="Carica GEDCOM" />
```

### 3. Card
```tsx
interface CardProps {
  title?: string;
  variant?: 'default' | 'elevated';
  children: React.ReactNode;
}

// Example
<Card title="Pietro Giardina (1600-1670)">
  <p>Occupazione: Mercante</p>
  <p>Luogo: Palermo</p>
</Card>
```

### 4. Modal
```tsx
interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

// Example
<Modal isOpen={true} title="Carica GEDCOM" onClose={handleClose}>
  <ModalBody>
    <Input type="file" />
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={handleClose}>Cancella</Button>
    <Button variant="primary" onClick={handleSubmit}>Carica</Button>
  </ModalFooter>
</Modal>
```

### 5. Toast Notification
```tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

// Example
<Toast type="success" message="✓ GEDCOM caricato (366 persone)" duration={3000} />
<Toast type="error" message="❌ GEDCOM non valido: manca campo BIRT" />
```

### 6. Badge/Tag
```tsx
interface BadgeProps {
  text: string;
  variant: 'success' | 'warning' | 'error' | 'info';
}

// Example
<Badge variant="success" text="VALID" />
<Badge variant="warning" text="INCOMPLETE" />
<Badge variant="error" text="ERROR" />
```

### 7. Tooltip
```tsx
interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Example
<Tooltip text="Familiari biologici della persona">
  <span>Genitori</span>
</Tooltip>
```

### 8. Skeleton (Loading)
```tsx
interface SkeletonProps {
  type: 'text' | 'circle' | 'rect';
  width?: string;
  height?: string;
}

// Example
<Skeleton type="rect" width="100%" height="200px" />
<Skeleton type="circle" width="48px" height="48px" />
```

### 9. WorldCard (GN370-Specific)
```tsx
interface WorldCardProps {
  mondo: 'origini' | 'cicli' | 'doni' | 'ombre' | 'contesto' | 'struttura' | 'eredita' | 'nebbia' | 'radici';
  isActive: boolean;
  onClick: () => void;
  status: 'complete' | 'partial' | 'empty';
}

// Example
<WorldCard
  mondo="origini"
  isActive={false}
  status="complete"
  onClick={() => handleWorldClick('origini')}
/>
```

---

## 🎭 Icon System

**Library**: lucide-react (48 icons inclusi)

### Core Icons
```tsx
import {
  Users,        // Famiglia
  Clock,        // Timeline/Vita
  Briefcase,    // Professione
  AlertCircle,  // Difficoltà
  BookOpen,     // Storia
  Dna,          // Genetica
  Home,         // Eredità
  Search,       // Lacune
  Globe,        // Radici
  CheckCircle,  // Successo
  AlertTriangle,// Warning
  XCircle       // Errore
} from 'lucide-react';

// Size variants
<Users size={16} /> {/* sm */}
<Users size={24} /> {/* md */}
<Users size={32} /> {/* lg */}
<Users size={48} /> {/* xl */}

// Color
<Users color="var(--primary)" />
<Users color="var(--danger)" />
<Users color="var(--secondary)" />
```

---

## 🌓 Dark/Light Mode

### Implementation
```css
/* CSS Custom Properties approach */
:root {
  --primary: #00D9FF;
  --bg-page: #000000;
  --text-primary: #FFFFFF;
}

[data-theme="light"] {
  --primary: #0099CC;
  --bg-page: #FFFFFF;
  --text-primary: #000000;
}

[data-theme="high-contrast"] {
  --primary: #FFFF00;
  --bg-page: #000000;
  --text-primary: #FFFFFF;
  --contrast: 21:1; /* AAA */
}
```

### React Hook
```tsx
// useTheme.ts
export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'high-contrast'>('dark');

  const switchTheme = (newTheme: typeof theme) => {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);
  };

  return { theme, switchTheme };
};

// Component
function ThemeToggle() {
  const { theme, switchTheme } = useTheme();
  return (
    <button onClick={() => switchTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

---

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance Checklist
- [ ] **1.4.3 Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- [ ] **2.1.1 Keyboard**: All interactions accessible via keyboard
- [ ] **2.1.2 No Keyboard Trap**: Focus can move away from component
- [ ] **2.4.3 Focus Order**: Logical tab order
- [ ] **3.2.1 Consistent Navigation**: Menus consistent across app
- [ ] **3.3.4 Error Prevention**: Warnings before destructive actions
- [ ] **4.1.3 Status Messages**: ARIA live regions for dynamic content

### ARIA Attributes
```tsx
// Alert/Error message
<div role="alert" aria-live="polite">
  ❌ GEDCOM non valido
</div>

// Loading state
<div role="status" aria-live="busy">
  Caricamento in corso...
</div>

// Button with label
<button aria-label="Chiudi modal">×</button>

// Disabled form
<input disabled aria-disabled="true" />

// Expandable section
<button aria-expanded={isOpen} aria-controls="section-content">
  9 Mondi
</button>
<div id="section-content" hidden={!isOpen}>
  {content}
</div>
```

### Screen Reader Testing
- [ ] Test con NVDA (Windows)
- [ ] Test con JAWS (if available)
- [ ] Test con VoiceOver (macOS)
- [ ] Use axe DevTools browser extension

---

## 📱 Responsive Breakpoints

```css
/* Mobile-First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }

/* TailwindCSS shorthand */
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  3 columns on desktop, 1 on mobile
</div>
```

---

## 🎬 Animation & Motion

### Transition Timing
```css
--duration-fast: 150ms;    /* Micro-interactions */
--duration-normal: 300ms;  /* UI transitions */
--duration-slow: 500ms;    /* Entrance animations */

--easing-ease: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--easing-ease-in: cubic-bezier(0.42, 0, 1, 1);
--easing-ease-out: cubic-bezier(0, 0, 0.58, 1);
```

### Common Patterns
```tsx
// Fade in
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }} />

// Slide in
<motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }} />

// Stagger list
<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.label}
    </motion.div>
  ))}
</motion.div>
```

**Library**: Framer Motion (already in package.json)

---

## 📋 Implementation Checklist

### Phase 1: Setup
- [ ] Create design token file (tokens.ts)
- [ ] Setup TailwindCSS with custom config
- [ ] Create Storybook project
- [ ] Setup GitHub Pages for Storybook hosting

### Phase 2: Core Components
- [ ] Button component + stories
- [ ] Input component + stories
- [ ] Card component + stories
- [ ] Modal component + stories

### Phase 3: Extended Components
- [ ] Toast notification system
- [ ] Badge/Tag component
- [ ] Tooltip component
- [ ] Skeleton loader
- [ ] WorldCard component (GN370-specific)

### Phase 4: Documentation
- [ ] Color palette documentation
- [ ] Typography guidelines
- [ ] Spacing guidelines
- [ ] Component API documentation
- [ ] Accessibility checklist per component

### Phase 5: Tooling
- [ ] Lighthouse CI integration
- [ ] Chromatic (visual regression) setup
- [ ] A11y testing (axe-core) integration

---

## 🔗 References

- **TailwindCSS**: https://tailwindcss.com/
- **Storybook**: https://storybook.js.org/
- **Framer Motion**: https://www.framer.com/motion/
- **Lucide Icons**: https://lucide.dev/
- **WCAG 2.1 AA**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring**: https://www.w3.org/WAI/ARIA/apg/

---

**Next**: Begin Task #7 (Redesign 9 Mondi) using this design system.
