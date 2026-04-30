---
name: Academic Clarity
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#414754'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#717786'
  outline-variant: '#c0c6d6'
  surface-tint: '#005db8'
  primary: '#005ab3'
  on-primary: '#ffffff'
  primary-container: '#0073e0'
  on-primary-container: '#fefcff'
  inverse-primary: '#aac7ff'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#306bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#9a4100'
  on-tertiary: '#ffffff'
  tertiary-container: '#c15300'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#aac7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468d'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea7'
  tertiary-fixed: '#ffdbcb'
  tertiary-fixed-dim: '#ffb691'
  on-tertiary-fixed: '#341100'
  on-tertiary-fixed-variant: '#783100'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

This design system is built for a professional networking environment focused on the bridge between academia and industry. The brand personality is efficient, high-trust, and institutional yet modern. It prioritizes clarity of information and ease of navigation to facilitate career-defining connections.

The design style is **Corporate / Modern**, characterized by a rigorous adherence to hierarchy, ample whitespace, and a disciplined use of color. It avoids decorative elements in favor of functional clarity, ensuring that user-generated content—such as resumes, portfolios, and job descriptions—remains the primary focus. The aesthetic evokes the reliability of a high-end SaaS platform with the accessibility of a university portal.

## Colors

The palette is anchored by a dual-blue system. The **Primary Action Color (#0082FD)** is reserved exclusively for interactive elements like buttons and active states, providing a clear signal for user progression. The **Primary Text Color (#2463EB)** is utilized for headers and key identifiers to maintain brand consistency throughout the typography.

Backgrounds are predominantly white (#FFFFFF) to maximize legibility. Subtle distinction between content areas is achieved through the use of light gray containers (#F8FAFC) and thin, high-clarity borders (#E2E8F0). This creates a "layered paper" effect that feels organized and academic.

## Typography

The typography system relies entirely on **Inter**, leveraging its utilitarian and highly legible characteristics. Hierarchy is established through weight and color rather than excessive scale.

Headlines use a tighter letter-spacing and a bold weight to command attention, while body text maintains a generous line-height to ensure readability during long browsing sessions. Label styles are occasionally uppercase with increased tracking to differentiate metadata from primary content. The secondary blue is used for primary headings to reinforce the professional identity.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop, centered on the screen with a maximum width of 1200px. Content is organized within a 12-column system using 24px gutters.

The spacing rhythm follows a 4px baseline grid. Internal component padding (e.g., inside cards or buttons) should prioritize the 8px (sm) and 16px (md) increments to maintain a compact, professional density. Section margins typically utilize 32px (xl) to allow the layout to breathe and reduce visual noise.

## Elevation & Depth

Depth is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. The background remains white (#FFFFFF), while secondary containers (sidebars, feed items, and cards) use a light gray surface (#F8FAFC).

To define boundaries, a 1px solid border (#E2E8F0) is applied. Shadows are used sparingly; when necessary for modals or dropdowns, they should be extremely soft, using a high blur radius (12px+) and low opacity (5-10%) to suggest a subtle lift without breaking the clean, flat aesthetic.

## Shapes

The shape language is defined by a consistent **8px (0.5rem)** corner radius. This "Rounded" setting strikes a balance between the rigid formality of square corners and the overly casual nature of pill-shaped elements.

This 8px radius applies to buttons, input fields, cards, and image containers. Small UI elements like tags or checkboxes may use a slightly reduced radius (4px) to maintain visual proportions, while large modal overlays may increase to 12px for a softer appearance.

## Components

### Buttons
Primary buttons use the #0082FD background with white text. Secondary buttons use a white background with a #E2E8F0 border and #2463EB text. Ghost buttons use no border and are reserved for low-priority actions.

### Cards
Cards are the primary content vehicle. They feature a white background, an 8px radius, and a 1px border (#E2E8F0). For grouped content, cards may be placed on top of a #F8FAFC container to create a clear visual hierarchy.

### Input Fields
Inputs use a white background, 8px radius, and a 1px border. On focus, the border transitions to #0082FD with a subtle 2px glow. Placeholder text is set in #94A3B8.

### Chips & Tags
Used for skills or industries, chips should have a light blue tint background (e.g., #EFF6FF) with #2463EB text to ensure they are distinct but not as prominent as primary action buttons.

### Lists & Navigation
Navigation items use #475569 for inactive states and #0082FD for active states, often accompanied by a 2px vertical or horizontal indicator bar. Lists use subtle dividers (#F1F5F9) to separate entries without creating heavy visual breaks.