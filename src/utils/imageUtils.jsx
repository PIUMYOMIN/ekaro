import { DEFAULT_PLACEHOLDER, IMAGE_BASE_URL } from '../config';
const getImageUrl = (image) => {
  if (!image) return DEFAULT_PLACEHOLDER;
  if (typeof image === 'string') {
    if (image.startsWith('http')) return image;
    const cleanPath = image.replace('public/', '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  }
  if (typeof image === 'object') {
    if (image.url) {
      if (image.url.startsWith('http')) return image.url;
      const cleanPath = image.url.replace('public/', '');
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
    if (image.path) {
      const cleanPath = image.path.replace('public/', '');
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }
  }
  return DEFAULT_PLACEHOLDER;
};