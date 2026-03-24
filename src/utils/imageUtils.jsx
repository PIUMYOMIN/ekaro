const getImageUrl = (image) => {
  const formatUrl = (path) => {
    if (path.startsWith('http')) {
      return path;
    }
    const cleanPath = path.replace('public/', '');
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  if (!image) return DEFAULT_PLACEHOLDER;

  const handlers = {
    string: (img) => formatUrl(img),
    object: (img) => {
      const path = img.url || img.path;
      return path ? formatUrl(path) : DEFAULT_PLACEHOLDER;
    }
  };

  const handler = handlers[typeof image];
  return handler ? handler(image) : DEFAULT_PLACEHOLDER;
};