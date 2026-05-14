# Development Plan

## Phase 1: Infrastructure & Settings
- [ ] Setup `ThemeContext` for Dark/Light mode support.
- [ ] Setup `LanguageContext` for Internationalization (English/Turkish).
- [ ] Update `EditorLayout` and `App.tsx` to wrap providers.
- [ ] Add Theme and Language toggle controls to the UI (e.g., in a Header or Settings panel).

## Phase 2: Media Manager (Backend & UI)
- [ ] Initialize Supabase Storage bucket `media`.
- [ ] Create `MediaManager` component:
    - [ ] File Upload area (Drag & Drop).
    - [ ] Image Grid view.
    - [ ] Selection logic.
- [ ] Update `Sidebar` to open `MediaManager` when clicking "Image".

## Phase 3: Video Support
- [ ] Update `EditorElement` type definition to include `video` type and `videoUrl` property.
- [ ] Update `DraggableElement` to render YouTube/Video embeds.
- [ ] Add "Video" button to `Sidebar`.

## Phase 4: Context Menu & Layer Management
- [ ] Create `ContextMenu` component with options:
    - [ ] Delete
    - [ ] Duplicate
    - [ ] Bring to Front
    - [ ] Send to Back
    - [ ] Bring Forward
    - [ ] Send Backward
    - [ ] (For Images) Fit / Fill
- [ ] Implement Z-index manipulation functions in `EditorContext`.
- [ ] Update `Canvas` to handle right-click (context menu).
- [ ] Update `PropertiesPanel` to add Layer management buttons.