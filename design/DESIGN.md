---
name: High-Integrity Fintech
colors:
  surface: '#f9f9ff'
  surface-dim: '#cadaff'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e8edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d7e2ff'
  on-surface: '#041b3c'
  on-surface-variant: '#434654'
  inverse-surface: '#1d3052'
  inverse-on-surface: '#edf0ff'
  outline: '#737685'
  outline-variant: '#c3c6d6'
  surface-tint: '#0c56d0'
  primary: '#003d9b'
  on-primary: '#ffffff'
  primary-container: '#0052cc'
  on-primary-container: '#c4d2ff'
  inverse-primary: '#b2c5ff'
  secondary: '#285ab9'
  on-secondary: '#ffffff'
  secondary-container: '#709bfe'
  on-secondary-container: '#003179'
  tertiary: '#004e32'
  on-tertiary: '#ffffff'
  tertiary-container: '#006844'
  on-tertiary-container: '#72e9af'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#0040a2'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#b1c6ff'
  on-secondary-fixed: '#001946'
  on-secondary-fixed-variant: '#00419d'
  tertiary-fixed: '#82f9be'
  tertiary-fixed-dim: '#65dca4'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005235'
  background: '#f9f9ff'
  on-background: '#041b3c'
  surface-variant: '#d7e2ff'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
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
  margin-mobile: 16px
  gutter-mobile: 12px
  touch-target-min: 44px
---

## Brand & Style

This design system is built on the pillars of **security, clarity, and guidance**. Designed for a mobile-first loan application, the visual language prioritizes user confidence through a professional and modern aesthetic.

The style is **Corporate Modern with a Focus on Accessibility**. It utilizes a systematic approach to hierarchy, ensuring that complex financial information is digestible and transparent. The interface employs generous whitespace to reduce cognitive load, while subtle depth markers (shadows and tonal layers) provide clear mental models of the application flow. The emotional response should be one of calm assurance—moving the user from the stress of borrowing to the relief of a structured, supportive path.

## Colors

The palette is anchored in deep, trustworthy blues to establish authority and institutional stability. 

- **Primary & Secondary Blues:** Used for the most critical actions and brand touchpoints. They provide high contrast against the background to guide the eye toward "Next" and "Submit" actions.
- **Surface & Background:** A clean `#F4F5F7` background is used to differentiate the app frame from card-based content surfaces (`#FFFFFF`), creating a clear "layered" feel.
- **Semantic Colors:** Success, Warning, and Error colors are calibrated for high legibility. Error states specifically use a high-chroma red to ensure immediate visibility during sensitive data entry (like account numbers).
- **Contrast:** All color combinations must meet WCAG 2.1 AA standards (4.5:1 for normal text) to ensure accessibility for all users.

## Typography

The typography system uses **Inter**, a typeface specifically designed for high legibility on screens. 

- **Hierarchy:** We use semi-bold and bold weights for headings to create a clear "scan-path" for users.
- **Scale:** On mobile devices, large headlines scale down to prevent excessive word-wrapping, maintaining a maximum of 2-3 lines for main headers.
- **Readability:** Line heights are set at 1.5x for body text to improve readability for users with visual impairments or dyslexia.
- **Bi-directional Support:** Inter provides excellent glyph support for LTR and RTL transitions. When switching to Hebrew, line heights should be increased by an additional 10% to accommodate tall characters.

## Layout & Spacing

This design system follows a **4px baseline grid** to ensure mathematical harmony across all components.

- **Mobile First:** The layout uses a fluid 4-column grid on mobile with 16px side margins. 
- **Touch Targets:** No interactive element (buttons, checkboxes, links) should be smaller than 44x44px.
- **Spacing Rhythm:** Use `16px (md)` for standard spacing between content blocks and `24px (lg)` to separate distinct sections or card groups.
- **RTL Considerations:** Layouts must mirror horizontally. Icons indicating direction (like "Back" arrows) must be flipped, while progress bars should fill from right-to-left.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Ambient Shadows**.

- **Z-0 (Background):** `#F4F5F7` - The base of the application.
- **Z-1 (Surface/Cards):** `#FFFFFF` - Used for input groups, loan details, and list items. Features a subtle `0px 2px 4px rgba(23, 43, 77, 0.05)` shadow.
- **Z-2 (Active/Floating):** Used for bottom sheets and modals. Features a more pronounced `0px 8px 16px rgba(23, 43, 77, 0.12)` shadow.
- **Focus States:** High-visibility 2px solid rings in Primary Blue are required for all keyboard and screen-reader focusable elements.

## Shapes

The design system utilizes **Rounded** corners to appear approachable and modern without losing its professional edge.

- **Default (8px):** Applied to standard buttons, input fields, and small cards.
- **Large (16px):** Applied to main container cards and bottom sheets.
- **Pill:** Reserved exclusively for status indicators (tags/chips) to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Solid `#0052CC` with White text. 52px height for mobile primary actions.
- **Secondary:** Outline or light blue tint. Used for "Cancel" or "Save Draft".
- **States:** Hover/Press states should darken the background by 10%. Disabled states use `#EBECF0` with `#A5ADBA` text.

### Input Fields
- **Structure:** Label (14px Bold) top-aligned, persistent placeholder text, and clear error text below the field.
- **Interaction:** 12px internal padding. On focus, the border transitions from grey to Primary Blue.

### Cards
- Used to group related loan information (e.g., "Monthly Payment", "Interest Rate").
- Must include a 16px internal padding (gutter-md).

### Progress Indicators
- **Steppers:** Clear numeric indicators (1, 2, 3) used for the loan application flow to show the user exactly where they are.
- **Status Chips:** Use semantic background tints (e.g., Light Green for "Approved") with high-contrast text.

### Selection Controls
- **Checkboxes/Radios:** Minimum 24x24px visual size within a 44x44px touch area. Use the Primary Blue for the active state.