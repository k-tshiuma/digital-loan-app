---
name: FinBest High-Integrity Fintech
colors:
  surface: '#f4f7fb'
  surface-dim: '#e2e8f0'
  surface-bright: '#ffffff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8fafc'
  surface-container: '#f1f5f9'
  surface-container-high: '#e2e8f0'
  surface-container-highest: '#cbd5e1'
  on-surface: '#0b1a2d'
  on-surface-variant: '#475569'
  inverse-surface: '#0b1a2d'
  inverse-on-surface: '#f0f9ff'
  outline: '#64748b'
  outline-variant: '#cbd5e1'
  surface-tint: '#0284c7'
  primary: '#0284c7'
  on-primary: '#ffffff'
  primary-container: '#e0f2fe'
  on-primary-container: '#0369a1'
  inverse-primary: '#38bdf8'
  secondary: '#0b1a2d'
  on-secondary: '#ffffff'
  secondary-container: '#10243e'
  on-secondary-container: '#38bdf8'
  tertiary: '#ff6b35'
  on-tertiary: '#ffffff'
  tertiary-container: '#fff7ed'
  on-tertiary-container: '#c2410c'
  accent-indigo: '#4f46e5'
  error: '#dc2626'
  on-error: '#ffffff'
  error-container: '#fee2e2'
  on-error-container: '#991b1b'
  background: '#f4f7fb'
  on-background: '#0b1a2d'
typography:
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
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

This design system is inspired by the **FinBest Banking & Finance** aesthetic, built on the pillars of **security, clarity, and guidance**. Designed for a mobile-first loan application, the visual language prioritizes user confidence through a professional and modern aesthetic.

The style is **Fintech Modern with High Legibility**. It utilizes a systematic approach to hierarchy, ensuring that complex financial information is digestible and transparent. The interface employs generous whitespace to reduce cognitive load, while subtle depth markers (shadows and tonal layers) provide clear mental models of the application flow.

## Colors

The palette is anchored in FinBest's deep midnight navy, vibrant cyan-blue, energetic coral orange, and cool ambient surfaces:

- **Midnight Navy (`#0B1A2D`):** Primary brand anchor, dark hero surfaces, high-contrast headings, and deep trust elements.
- **Vibrant Cerulean / Cyan (`#0284C7`):** Primary interactive CTA color, active progress markers, sparkles, and financial rates.
- **Coral / Sunset Orange (`#FF6B35`):** Warm accent, badges, and high-priority callout indicators.
- **Royal Indigo / Violet (`#4F46E5`):** Gradient flourish and accent highlights.
- **Surface & Background (`#F4F7FB`):** A clean cool-grey background differentiating the app frame from card-based content surfaces (`#FFFFFF`).
- **Semantic Colors:** Success (Emerald `#10B981`), Warning (Amber `#F59E0B`), and Error (Crimson `#DC2626`).

## Typography

The typography system uses **Plus Jakarta Sans**, a modern geometric grotesque typeface designed for screens.

- **Hierarchy:** Bold (700) and Extra-Bold (800) weights with tight letter-spacing (-0.025em) for headings.
- **Scale:** On mobile devices, large headlines scale down to prevent excessive word-wrapping.
- **Readability:** Line heights are set at 1.5x for body text.
- **Multi-language Support:** Paired with **Heebo** for RTL Hebrew, **Sarabun** for Thai, and **Noto Sans SC** for Simplified Chinese.

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