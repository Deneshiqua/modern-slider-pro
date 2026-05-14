# modern-slider-pro

A visual drag-and-drop slider/carousel builder and runner for React. Build animated slides with a full-featured editor, then embed the result anywhere with a single component.

[![npm version](https://img.shields.io/npm/v/modern-slider-pro.svg)](https://www.npmjs.com/package/modern-slider-pro)
[![license](https://img.shields.io/npm/l/modern-slider-pro.svg)](./LICENSE)

---

## Features

- 🖱️ Drag, resize and rotate elements on a canvas
- 🎬 Per-element entrance animations (fade, slide, zoom, bounce…)
- 🗂️ Multi-slide support with layer panel
- ▶️ Live preview with auto-play, navigation arrows and dots
- 🎨 Text, image and video elements
- 📐 Grid, snap-to-element guides and configurable canvas size
- 🌗 Dark / light theme ready (CSS variables)
- 💾 Full JSON import / export

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

Make sure these are installed in your project:

```bash
npm install react react-dom framer-motion
```

---

## Quick start

### 1. Import the CSS (once, in your app entry)

```tsx
import 'modern-slider-pro/style.css';
```

### 2. Use the editor

```tsx
import { SliderEditor } from 'modern-slider-pro';

export default function App() {
  return <SliderEditor />;
}
```

### 3. Run a slider from saved JSON

```tsx
import { SliderRunner } from 'modern-slider-pro';
import type { Slide, SliderSettings } from 'modern-slider-pro';

const slides: Slide[] = JSON.parse(localStorage.getItem('my-slider') ?? '[]');
const settings: SliderSettings = { autoPlay: true, interval: 4, loop: true, showArrows: true, showDots: true };

export default function Hero() {
  return <SliderRunner slides={slides} settings={settings} />;
}
```

---

## API

### `<SliderEditor />`

Full drag-and-drop editor. No props required — manages its own state internally.  
Use the toolbar's **Kaydet / Export JSON** button to get the slide data.

### `<SliderRunner slides settings />`

| Prop | Type | Description |
|------|------|-------------|
| `slides` | `Slide[]` | Slides produced by the editor |
| `settings` | `SliderSettings` | Auto-play, arrows, dots, interval, loop |

### `<EditorProvider>` + `useEditor()`

For advanced usage, wrap your own UI with `EditorProvider` and access the editor state via `useEditor()`.

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

## License

MIT © [deneshiqua](https://github.com/deneshiqua)


## technology stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

All shadcn/ui components have been downloaded under `@/components/ui`.

## File Structure

- `index.html` - HTML entry point
- `vite.config.ts` - Vite configuration file
- `tailwind.config.js` - Tailwind CSS configuration file
- `package.json` - NPM dependencies and scripts
- `src/app.tsx` - Root component of the project
- `src/main.tsx` - Project entry point
- `src/index.css` - Existing CSS configuration
- `src/pages/Index.tsx` - Home page logic

## Components

- All shadcn/ui components are pre-downloaded and available at `@/components/ui`

## Styling

- Add global styles to `src/index.css` or create new CSS files as needed
- Use Tailwind classes for styling components

## Development

- Import components from `@/components/ui` in your React components
- Customize the UI by modifying the Tailwind configuration

## Note

- The `@/` path alias points to the `src/` directory
- In your typescript code, don't re-export types that you're already importing

# Commands

**Install Dependencies**

```shell
pnpm i
```

**Add Dependencies**

```shell
pnpm add some_new_dependency

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
pnpm run build
```
