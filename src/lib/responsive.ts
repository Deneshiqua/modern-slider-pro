import { EditorElement, ResponsiveElementProperties, ResponsivePropertyMode, ViewMode } from '@/types/editor';

export const resolveElementProperties = (
  element: EditorElement,
  viewMode: ViewMode,
): EditorElement => {
  const override = element.responsive?.[viewMode];

  if (!override) return element;

  return {
    ...element,
    x: override.x ?? element.x,
    y: override.y ?? element.y,
    rotation: override.rotation ?? element.rotation,
    style: {
      ...element.style,
      ...override.style,
    },
    children: element.children?.map(child => resolveElementProperties(child, viewMode)),
  };
};

export const getElementPropertiesForMode = (
  element: EditorElement,
  mode: ResponsivePropertyMode,
): EditorElement => {
  if (mode === 'default') return element;

  return resolveElementProperties(element, mode);
};

export const mergeResponsiveElementUpdates = (
  element: EditorElement,
  mode: ResponsivePropertyMode,
  updates: Partial<EditorElement>,
): Partial<EditorElement> => {
  if (mode === 'default') return updates;

  const currentOverride = element.responsive?.[mode];
  const nextOverride: ResponsiveElementProperties = { ...currentOverride };

  if (updates.x !== undefined) nextOverride.x = updates.x;
  if (updates.y !== undefined) nextOverride.y = updates.y;
  if (updates.rotation !== undefined) nextOverride.rotation = updates.rotation;
  if (updates.style !== undefined) {
    nextOverride.style = {
      ...currentOverride?.style,
      ...updates.style,
    };
  }

  return {
    responsive: {
      ...element.responsive,
      [mode]: nextOverride,
    },
  };
};
