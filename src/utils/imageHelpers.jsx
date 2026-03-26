// src/utils/imageHelpers.jsx
import { IMAGE_BASE_URL, DEFAULT_PLACEHOLDER } from "../config";

export const getImageUrl = (image) => {
  if (image == null) return DEFAULT_PLACEHOLDER;     // FIX: catches both null and undefined

  if (typeof image === 'string') {
    if (!image) return DEFAULT_PLACEHOLDER;          // empty string guard
    if (image.startsWith('http')) return image;
    const cleanPath = image.replace('public/', '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  }

  if (typeof image === 'object') {
    if (image.url != null && image.url !== '') {
      if (image.url.startsWith('http')) return image.url;
      const cleanPath = image.url.replace('public/', '');
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
    if (image.path != null && image.path !== '') {
      if (image.path.startsWith('http')) return image.path;
      const cleanPath = image.path.replace('public/', '');
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
  }

  return DEFAULT_PLACEHOLDER;
};