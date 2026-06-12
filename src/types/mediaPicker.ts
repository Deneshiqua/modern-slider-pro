export type MediaPickerPurpose = 'image' | 'video';

export type MediaPickerRequest = {
  purpose: MediaPickerPurpose;
  multiple?: boolean;
  onSelect: (url: string) => void;
  onCancel?: () => void;
};

export type MediaPickerHandler = (request: MediaPickerRequest) => void;
