interface MetaTagsProps {
  title: string;
  description?: string;
  image?: string;
  url: string;
}

export function MetaTags({ title, description, image, url }: MetaTagsProps) {
  // Update document title
  document.title = title;

  // Find or create meta tags
  function updateMetaTag(property: string, content: string) {
    let meta = document.querySelector(`meta[property="${property}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  // Basic meta tags
  updateMetaTag('description', description || '');
  updateMetaTag('og:title', title);
  updateMetaTag('og:description', description || '');
  updateMetaTag('og:url', url);
  updateMetaTag('og:type', 'website');

  // Twitter Card meta tags
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', title);
  updateMetaTag('twitter:description', description || '');
  updateMetaTag('twitter:url', url);

  // Image meta tags (if provided)
  if (image) {
    updateMetaTag('og:image', image);
    updateMetaTag('twitter:image', image);
  }

  return null;
}
