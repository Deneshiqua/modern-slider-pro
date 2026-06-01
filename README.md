# modern-slider-pro

A visual drag-and-drop slider/carousel builder and runner for React. Design animated slides with a full-featured editor, then embed the result anywhere with a single component.

[![npm version](https://img.shields.io/npm/v/modern-slider-pro.svg)](https://www.npmjs.com/package/modern-slider-pro)
[![license](https://img.shields.io/npm/l/modern-slider-pro.svg)](./LICENSE)

---

## Features

- 🖱️ Drag, resize and rotate elements on a canvas — **1:1 cursor tracking** in slide logical coordinates (zoom-aware)
- 🎬 Per-element entrance animations (fade, slide, zoom, bounce…)
- 🗂️ Multi-slide support; **layer panel** tabs: **Slides** first, **Layers** second
- ▶️ Live preview with auto-play, navigation arrows and dots
- 🎨 Text, image, video, button and box elements (nested groups)
- 📐 Grid snapping, **snap-to-element guides** (guides while dragging; snap on release) and configurable canvas size
- 📐 **Layer alignment** — vertical / horizontal canvas alignment, 3×3 grid (element / group / canvas), multi-selection union snap with DOM refinement
- ➕ **Center guides** — optional vertical + horizontal lines at canvas center (Canvas settings)
- 📏 Optional Photoshop-style canvas rulers with **live pointer readout** on the rulers (Canvas settings)
- ⊞ **Fit to viewport** zoom in the canvas toolbar — scale the slide into the visible area
- 🌗 Dark / light theme ready — all styles scoped with ``msp-`` prefix (zero conflict)
- 💾 Versioned project JSON import / export
- ↩️ **Undo / redo** — slide-scoped history (other slides are unaffected); global undo for project-wide changes; **Reset slide** next to undo when the active slide has edits
- ↩️ Keyboard **Ctrl+Z** / **Ctrl+Y** (⌘ on macOS); layer selection is kept when the undo still leaves those elements on the slide
- 🔒 Rename, hide and lock layers
- 📦 CSS-isolated — all Tailwind utilities prefixed with ``msp-``, safe alongside any other CSS

---

## Installation

```bash
npm install modern-slider-pro
# or
pnpm add modern-slider-pro
# or
yarn add modern-slider-pro
```

### Peer dependencies

```bash
npm install react react-dom framer-motion
```

---

## Quick Start

### 1. Import the CSS (once, in your app entry)

```tsx
import 'modern-slider-pro/style.css';
```

### 2. Use the editor

```tsx
import { SliderEditor } from 'modern-slider-pro';
import type { SliderEditorSavePayload } from 'modern-slider-pro';

export default function App() {
  const handleSave = async (payload: SliderEditorSavePayload) => {
    await fetch('/api/sliders/homepage', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  };

  return <SliderEditor onSave={handleSave} saveButtonLabel="Save Slider" />;
}
```

### 3. Run a slider from saved project JSON

```tsx
import { SliderRunner } from 'modern-slider-pro';
import type { SliderProject } from 'modern-slider-pro';

export default function Hero() {
  const savedProject = localStorage.getItem('my-slider');
  const project = savedProject ? (JSON.parse(savedProject) as SliderProject) : undefined;

  return project ? <SliderRunner project={project} width="100%" /> : null;
}
```

---

## API

### ``<SliderEditor />``

Full drag-and-drop editor. No props required — manages its own state internally.
Use `onSave` to receive the full project payload:

```ts
type SliderEditorSavePayload = {
  version: 1;
  slides: Slide[];
  settings: SliderSettings;
  canvasSettings: CanvasSettings;
};
```

The legacy `onDemoSave(slides)` callback is still supported for apps that only store slides.

### ``<SliderRunner />``

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| ``project`` | ``SliderProject`` | No | Versioned payload produced by `SliderEditor` |
| ``slides`` | ``Slide[]`` | No | Legacy slide-only data |
| ``autoPlay`` | ``boolean`` | No | Overrides project autoplay setting |
| ``interval`` | ``number`` | No | Autoplay interval in milliseconds when overriding |
| ``showDots`` | ``boolean`` | No | Overrides project dots setting |
| ``showArrows`` | ``boolean`` | No | Overrides project arrows setting |
| ``width`` / ``height`` | ``string | number`` | No | Render size; defaults to project canvas size when `project` is provided |

### ``<EditorProvider>`` + ``useEditor()``

For advanced usage, wrap your own UI with ``EditorProvider`` and access the editor state via ``useEditor()``.

```tsx
import { EditorProvider, useEditor } from 'modern-slider-pro';

function MyControls() {
  const { slides, currentSlideIndex, setCurrentSlide } = useEditor();
  return <div>{slides.length} slides</div>;
}

export default function Page() {
  return (
    <EditorProvider>
      <MyControls />
    </EditorProvider>
  );
}
```

---

## Types

```ts
import type {
  Slide,
  EditorElement,
  ElementType,
  SliderProject,
  SliderEditorSavePayload,
  SliderSettings,
  CanvasSettings,
  AnimationConfig,
  ViewMode,
} from 'modern-slider-pro';
```

`CanvasSettings` includes grid, snap, canvas dimensions, **`showRulers`**, **`showCenterGuides`** (center crosshair in the editor), and other toggles saved in project JSON.

---

## Constants

```ts
import {
  DEFAULT_SLIDE,
  DEFAULT_SLIDER_SETTINGS,
  DEFAULT_CANVAS_SETTINGS,
  VIEWPORT_SIZE,
  ANIMATION_PRESETS,
} from 'modern-slider-pro';
```

---

## CSS Isolation

All Tailwind utility classes used internally are prefixed with ``msp-`` (e.g. ``msp-flex``, ``msp-text-sm``).
This means the package **will not conflict** with your own Tailwind setup or any other CSS framework.

You only need to import the bundled stylesheet once:

```tsx
import 'modern-slider-pro/style.css';
```

### Theme Variables

The package defines its theme variables inside `.msp-slider-pro`, so host apps do not need global theme patches.

No ``tailwind.config.js`` changes required in your project.

### Dropdowns feel “dead” or close on first tap?

Portals attach to ``document.body`` with high **z-index** values (near **100 000+**) so they sit above typical app chrome. If overlays still behave as if you clicked empty space, check the host layout for:

- another **fullscreen** or **fixed** layer with ``pointer-events: auto`` and a **higher** z-index capturing events
- a parent wrapping the editor with ``pointer-events: none`` without re-enabling them on interactive children

---

## Changelog

### 0.4.0 — 2026-05-20
- **Fixed**: Elements lagging behind the cursor while dragging — position now follows **slide-space pointer** math (same as rulers), not `react-rnd` scaled deltas alone; grab offset preserved for nested layers.
- **Fixed**: Janky drag when **snap to elements** was on — snapping applies on **release** only; guide lines still show during drag.
- **Fixed**: **Maximum update depth** loops with rulers open (throttled ruler viewport + pointer updates).
- **Fixed**: Layer panel re-render storm when only `x`/`y` changed during drag.
- **Fixed**: Double-step “jump” on canvas alignment clicks — single DOM-aware update when possible.
- **Improved**: **Row / column / multi-selection** alignment controls with measured bounds (`slideElementDomBox`) for accurate edge snap.
- **Improved**: Properties panel — **vertical alignment** section above **horizontal alignment**.
- **Improved**: Radix portaled UI (nested popovers/selects) and theme classes for embedded hosts.

### 0.3.0 — 2026-05-19
- **Added**: **Center guides** (`canvasSettings.showCenterGuides`) — draws a **+** (vertical & horizontal) at the slide center when enabled in **Canvas settings**.
- **Added**: **Ruler pointer indicators** — when rulers are on, the top/left rulers show Photoshop-style hairlines and logical (px) coordinates following the cursor over the canvas.
- **Added**: **Per-slide undo/redo** — changing slides keeps separate stacks; **Ctrl+Z** on slide B does not undo edits made on slide A. Project-wide actions (canvas/slider settings, add/remove slide, JSON load) use a **global** history chain.
- **Added**: **Reset slide** control in the toolbar (left of undo) to jump the active slide back to its state before the first edit on that slide in the session (redo can restore).
- **Improved**: **Undo/redo** no longer clears the layer selection when the selected elements still exist after the operation (`filterSelectionToSlideTree` + drill reconciliation).
- **Improved**: **Toolbar** — desktop / tablet / mobile view toggles are visually centered in the bar.
- **Improved**: **Layer panel** — removed the disabled **History** tab; tab order is **Slides** then **Layers** (default open tab remains **Layers**).

### 0.2.3 — 2026-05-19
- **Fixed**: Embed apps with heavy z-index stacking (shells, navbars, layouts) stealing pointer events — all Radix portaled layers now use stacked **semantic z-index tokens** (~100 010–100 400) instead of ``z-50`` / low hundreds.
- **Fixed**: **`data-radix-popper-content-wrapper`** often keeps a ~**100** inline `z-index`; inner `msp-z-overlay-*` cannot raise the portal against host layers stack — added a scoped rule (``:has([class*='msp-z-overlay-'])``) so the **wrapper** is lifted to **100450**, above host modals and MSP dialogs but below MSP toasts.

### 0.2.2 — 2026-05-19
- **Fixed**: Popovers and dialogs closing on the first click before a control could activate — caused by Radix overlays sharing the same `z-index`, and **Tooltip + Popover** nested on the same toolbar triggers. Layers are ordered (tooltip lowest, dialogs mid, selects/menus above dialogs); Canvas / Slider / App settings triggers use **`title`/`aria-label`** instead of nesting tooltip + popover.
- **Fixed**: Clicks on **Select** or **Dropdown** lists (portaled to `body`) being treated as “outside” the parent Popover/Dialog — `onInteractOutside` now ignores interactions that land on `[role="listbox"]` / `[role="menu"]`.

### 0.2.1 — 2026-05-18
- **Fixed**: Radix UI portals (popover, dialogs, dropdowns, select, tooltip, context menu) rendered under `document.body` **outside** `.msp-slider-pro`, where theme CSS variables (`--primary`, `--input`, `--border`, …) are defined — switches and outline buttons could look invisible in settings and other overlays. Portaled surfaces now apply the scoped `msp-slider-pro` theme classes automatically.

### 0.2.0 — 2026-05-17
- **Added**: Canvas rulers — top and left pixel guides that sync with zoom and scroll; enable **Show rulers** in **Canvas settings** (toolbar grid icon). New field: `canvasSettings.showRulers` in saved JSON (default `false`).
- **Added**: **Fit to viewport** in the canvas zoom bar — scales the slide to fit the scroll area and recenters the view.
- **Improved**: Canvas viewport controls (center view, pan space, zoom UX) and editor translations.

### 0.1.6 — 2026-05-14
- **Added**: `onSave(payload)` API with versioned `{ slides, settings, canvasSettings }` payload.
- **Added**: `SliderRunner` can render directly from `project={payload}` while preserving legacy `slides`.
- **Added**: Unsaved changes indicator, browser unload warning, undo/redo buttons and keyboard shortcuts.
- **Added**: Layer rename, visibility toggle and lock support.

### 0.1.5 — 2026-05-14
- **Fixed**: `SliderEditor` now mounts its own language, theme, published slides, editor, and tooltip providers.
- **Fixed**: Theme variables are scoped under `.msp-slider-pro`, so host apps do not need global theme patches.
- **Improved**: Public API now exports provider hooks and TypeScript types for advanced integrations.
- **Fixed**: Library declarations now expose the package API from `dist/index.d.ts`.

### 0.1.4 — 2026-05-14
- **Fixed**: Arbitrary CSS selectors with pseudo-classes (e.g., `[&>span:last-child]`) now correctly handle pseudo-classes without prefixing
  - Transform script now detects CSS selector syntax (`&`) and avoids prefixing selector parts
  - `transform Token()` improved to skip CSS selectors, leaving pseudo-classes intact
- Removed unnecessary vite post-build hook — transform script handles all CSS syntax correctly at source level
- Users no longer need any post-install patches!

### 0.1.3 — 2026-05-14
- **Fixed**: `:msp-last-child` CSS pseudo-class selector breaking Turbopack parser — now correctly emitted as `:last-child` (vite post-build hook)
- **Fixed**: `usePublishedSlides` now returns safe fallback when `PublishedSlidesProvider` is not mounted, preventing crashes
- Users no longer need the post-install patch script for these issues

### 0.1.2 — 2026-05-14
- **BREAKING**: Removed package-level `:root` and `.dark` CSS variable definitions — host app must provide theme variables
  - This allows seamless integration with host applications that have their own theme systems
  - Users no longer need the post-install patch to remove global theme pollution
- Added fallback implementations to context hooks (`useEditor`, `useTheme`, `useLanguage`) — components now render even outside providers
  - Prevents crashes when providers are accidentally omitted
  - Useful for testing or standalone component usage
- Enhanced `onDemoSave` callback — now receives edited `slides` payload as parameter
  - Host apps can now save the actual slide data when demo is updated
- Fixed CSS attribute selectors (`[stroke='#ccc']`, `data-selected='true'`) — removed stray `msp-` prefixes that broke CSS parsing
- Clean build with zero CSS warnings

### 0.1.1 — 2026-05-14
- Fixed modal/dialog positioning — ``translate-x[-50%]`` / ``translate-y[-50%]`` classes were missing ``msp-`` prefix, causing dialogs to render off-screen
- Fixed double-prefix (``msp-msp-``) issues in 21 UI components (``group-*``, ``peer-*``, ``has-[...]``, negative utilities)
- Canvas background area outside slides is now dark/light theme-aware
- Transform script is now fully idempotent — safe to re-run

### 0.1.0 — 2026-05-01
- Initial release
- Drag-and-drop editor with text, image, video and button elements
- Per-element animations with Framer Motion
- Multi-slide support, layer panel, live preview
- Full JSON import / export
- CSS-scoped with ``msp-`` Tailwind prefix

---

## Development

```bash
# Install dependencies
pnpm i

# Start dev server
pnpm dev

# Build app
pnpm build

# Build npm library
pnpm build:lib
```

---

## License

MIT © [deneshiqua](https://github.com/deneshiqua)
