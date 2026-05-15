# modern-slider-pro

A visual drag-and-drop slider/carousel builder and runner for React. Design animated slides with a full-featured editor, then embed the result anywhere with a single component.

[![npm version](https://img.shields.io/npm/v/modern-slider-pro.svg)](https://www.npmjs.com/package/modern-slider-pro)
[![license](https://img.shields.io/npm/l/modern-slider-pro.svg)](./LICENSE)

---

## Features

- 🖱️ Drag, resize and rotate elements on a canvas
- 🎬 Per-element entrance animations (fade, slide, zoom, bounce…)
- 🗂️ Multi-slide support with layer panel
- ▶️ Live preview with auto-play, navigation arrows and dots
- 🎨 Text, image, video and button elements
- 📐 Grid snapping, snap-to-element guides and configurable canvas size
- 🌗 Dark / light theme ready — all styles scoped with ``msp-`` prefix (zero conflict)
- 💾 Versioned project JSON import / export
- ↩️ Undo / redo with keyboard shortcuts
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

---

## Changelog

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
