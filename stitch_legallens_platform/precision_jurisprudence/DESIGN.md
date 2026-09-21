---
name: Precision Jurisprudence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#824500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a65900'
  on-tertiary-container: '#ffede1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  citation-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

The design system projects absolute authority, forensic rigor, and friction-free speed. Designed for litigators, general counsels, and appellate teams, the UI strips away decorative excess to focus on evidentiary integrity and structured textual extraction. 

The aesthetic is grounded in **Technical Precision and Modern Corporate Rigor**, drawing on the utilitarian efficiency of Linear, the clarity of Notion, and the structural exactitude of Harvey. Interfaces are organized around document density, split-pane analytical views, and unyielding visual hierarchy. Users should experience the calm confidence of a perfectly compiled legal brief: every conclusion tied to a source, every status verifiable at a glance, and no cognitive overhead introduced by decorative clutter.

## Colors

The palette relies on stark structural contrast and precise semantic status mapping to govern evidentiary confidence.

### Core Canvas & Structure
- **Canvas Base**: `#F8FAFC` (Slate 50) serves as the ambient frame and app scaffolding.
- **Card / Surface Elevated**: `#FFFFFF` (Pure White) houses discrete legal instruments, briefs, and analysis modules.
- **Surface Inset / Sidebar**: `#F1F5F9` (Slate 100) provides grounding for document trees, metadata panels, and linear progress tracks.
- **Borders & Dividers**: `#E2E8F0` (Slate 200) strictly maintained at 1px to structure content without heavy framing. Secondary internal dividers use `#F1F5F9`.

### Text Hierarchy
- **Primary Text**: `#0F172A` (Slate 900) for headlines, brief summaries, and critical claims.
- **Secondary Text**: `#1E293B` (Slate 800) for analysis body copy and primary metadata labels.
- **Muted / Supporting**: `#334155` (Slate 700) for narrative annotations and contextual subheaders.
- **Tertiary / Citation**: `#64748B` (Slate 500) for timestamps, clause cross-references, and document numbering.

### Brand Accents
- **Primary Brand**: `#2563EB` (Royal Indigo) for focal actions, active citation selection, and primary progression controls.
- **Primary Hover / Active**: `#1D4ED8` for pressed states and active tab highlights.

### Strict Semantic Evidence Palette
Every evidence tag, badge, and source anchor strictly maps to one of four evidentiary confidence states:
1. **Verified / Direct Source**: `#059669` (Text/Dot) on `#ECFDF5` (Surface) with `#A7F3D0` border.
2. **Needs Review / Derived Reasoning**: `#D97706` (Text/Dot) on `#FFFBEB` (Surface) with `#FDE68A` border.
3. **Document Conflict / Contradiction**: `#DC2626` (Text/Dot) on `#FEF2F2` (Surface) with `#FECACA` border.
4. **Missing Citation / Unsubstantiated**: `#64748B` (Text/Dot) on `#F1F5F9` (Surface) with `#CBD5E1` border.

## Typography

Typography establishes an uncompromising hierarchy between analytical commentary and evidentiary proof.

- **Headlines (Plus Jakarta Sans)**: Used for brief titles, case names, and section partitions. The subtle geometric curves provide high polish while maintaining a formal, commanding presence.
- **Body & Interface (Inter)**: The operational workhorse. Configured with tabular numbers (`tnum`) enabled globally to ensure claim amounts, dates, and paragraph counts align seamlessly across dynamic panels.
- **Citations & Statues (JetBrains Mono)**: Reserved for statutory markers, clause pointers (e.g., `p. 7 · § 12`), contract clause keys, and source checksums. The monospace font immediately signals to counsel that an item is an exact extract from an indexed source rather than generated prose.

## Layout & Spacing

The layout is built upon an asymmetric, responsive multi-pane layout optimized for high-density document comparison.

### Layout Mechanics
- **Split Analysis Panes**: The core desktop workspace utilizes a 3-column split: Document Tree/Outline (240px fixed), Synthesis Brief (flexible 60% ratio), and Verifiable Source PDF/Clause Inspector (flexible 40% ratio).
- **Rhythm Scale**: Spacing is calculated on a tight 4px baseline system (`0.25rem` intervals) to maximize screen real estate without feeling cluttered. 
- **Adaptive Breakpoints**:
  - **Desktop (1280px+)**: Tri-pane layout active. Gutters set to `1.5rem` (`gutter-lg`).
  - **Tablet / Laptop (768px – 1279px)**: Dual-pane layout (Document tree collapses into a slide-over panel; Brief and Citation inspector share 50/50 split).
  - **Mobile (< 768px)**: Single column stacked layout. Panels switch via a persistent top view-toggle (Brief | Source | Timeline). Margins drop to `1rem`.

## Elevation & Depth

Visual depth is achieved through **structural 1px borders paired with ultra-diffused, cool-slate ambient shadows**. Heavy drop shadows are strictly avoided to preserve technical cleanliness.

- **Level 0 (Canvas Base - `#F8FAFC`)**: Background level. Zero shadow.
- **Level 1 (Workplace Cards & Split Panels - `#FFFFFF`)**: Bound by a crisp `1px solid #E2E8F0` border. Shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Level 2 (Hovered Brief Blocks & Interactive Clause Cards)**: `1px solid #CBD5E1`. Shadow: `0 4px 12px -2px rgba(15, 23, 42, 0.06), 0 2px 4px -1px rgba(15, 23, 42, 0.02)`.
- **Level 3 (Citation Popovers & Floating Evidence Drawers)**: `1px solid #E2E8F0`. Shadow: `0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Modals & Deep Review Sheets)**: `1px solid #CBD5E1`. Shadow: `0 20px 30px -10px rgba(15, 23, 42, 0.12)`.

## Shapes

The design system utilizes **Soft (`roundedness: 1`) geometric shapes**. 

- Base UI components (inputs, list rows, standard buttons, and structural card panels) feature a uniform corner radius of `0.25rem` (4px) to `0.375rem` (6px) to communicate institutional stability and structural discipline.
- Containers and modal dialogs cap at `0.5rem` (8px).
- Status indicators, semantic evidence badges, and citation reference tokens break from the angular structure using fully pill-shaped contours (`9999px`) to immediately differentiate metadata from content blocks.

## Components

### Buttons
- **Primary**: Deep Blue (`#2563EB`) solid fill, white text, 4px corner radius, font weight 500, height 36px (compact). Subtle hover to `#1D4ED8`. Active state shifts `translate-y-px`.
- **Secondary / Outline**: Crisp White background, 1px border (`#E2E8F0`), `#0F172A` text. Hover shifts background to `#F8FAFC` and border to `#CBD5E1`.
- **Ghost / Action**: Transparent background with `#334155` text for auxiliary toolbars; active hover adds `#F1F5F9`.

### Semantic Evidence Badges (Pill Badges with Dot Indicators)
- Pill shape with full border radius (`rounded-full`), height 24px, padding 2px 10px.
- Internal layout features a centered 6px diameter circular dot positioned 6px to the left of the label.
- **Verified**: `#ECFDF5` background, `#059669` text, `#A7F3D0` border, `#059669` pulsating/solid dot.
- **Needs Review**: `#FFFBEB` background, `#D97706` text, `#FDE68A` border, `#D97706` dot.
- **Document Conflict**: `#FEF2F2` background, `#DC2626` text, `#FECACA` border, `#DC2626` dot.
- **Missing Citation**: `#F1F5F9` background, `#64748B` text, `#CBD5E1` border, `#64748B` dot.

### High-Contrast Monospace Clause Citations
- Encapsulated within inline tokens: background `#F1F5F9`, border `1px solid #E2E8F0`, corner radius 4px, padding 2px 6px.
- Rendered exclusively in `JetBrains Mono` (`citation-code`, 12px, `#334155`).
- Displays structured clause pointers (e.g., `p. 7 · § 12` or `Ex. B · ¶ 4(a)`). Hover triggers an immediate stroke shift to `#2563EB` and opens the evidentiary reference tooltip.

### Linear Workflow Breadcrumbs
- Minimal step indicators using chevron dividers (`/` or `›` in `#94A3B8`).
- Current step highlighted in `#0F172A` (weight 600) with a subtle blue baseline tick indicator (2px height, `#2563EB`).
- Completed steps display a `#059669` miniature checkmark icon.

### Cards & Analytical Modules
- Crisp white canvas (`#FFFFFF`), bounded by `1px solid #E2E8F0`.
- Card headers feature an integrated top border accent strip or subtle bottom divider with label in `Plus Jakarta Sans` 14px (weight 600).
- Internal section spacing locked to `space-md` (`0.75rem`) and `space-lg` (`1rem`).

### Form Inputs & Search Fields
- Inset white background with `1px solid #CBD5E1`, text size 14px (`Inter`).
- Focused state: Border transforms to `#2563EB` with zero blur ring; replaced instead with a sharp `1px` outer keyline ring (`box-shadow: 0 0 0 1px #2563EB`).
- Integrated keyboard shortcuts rendered in small monospace tags (`Cmd+K`, `Esc`) anchored right.

### Evidentiary Split Viewers
- Parallel comparative containers linking brief statements to exact optical character coordinates on the uploaded legal PDF.
- Connected via a highlighted blue hairline anchor ray on selection.