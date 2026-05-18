import { EditorElement, ResponsiveElementProperties, ResponsivePropertyMode, ViewMode } from '@/types/editor';

export const resolveElementProperties = (
  element: EditorElement,
  viewMode: ViewMode,
): EditorElement => {
  const override = element.responsive?.[viewMode];

  if (!override) return element;

  const mergedHoverStyle: EditorElement['hoverStyle'] =
    override.hoverStyle === undefined && element.hoverStyle === undefined
      ? undefined
      : {
          ...(element.hoverStyle ?? {}),
          ...(override.hoverStyle ?? {}),
        };

  const hoverStyleMerged =
    mergedHoverStyle && Object.keys(mergedHoverStyle).length > 0 ? mergedHoverStyle : undefined;

  return {
    ...element,
    x: override.x ?? element.x,
    y: override.y ?? element.y,
    rotation: override.rotation ?? element.rotation,
    style: {
      ...element.style,
      ...override.style,
    },
    ...(hoverStyleMerged ? { hoverStyle: hoverStyleMerged } : {}),
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
  if (mode === 'default') {
    const { hoverStyle, ...rest } = updates;
    const merged: Partial<EditorElement> = { ...rest };

    if (hoverStyle !== undefined) {
      merged.hoverStyle = {
        ...(element.hoverStyle ?? {}),
        ...hoverStyle,
      };
    }

    return merged;
  }

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
  if (updates.hoverStyle !== undefined) {
    nextOverride.hoverStyle = {
      ...(currentOverride?.hoverStyle ?? {}),
      ...updates.hoverStyle,
    };
  }

  return {
    responsive: {
      ...element.responsive,
      [mode]: nextOverride,
    },
  };
};
