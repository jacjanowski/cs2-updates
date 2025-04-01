
/**
 * Create a URL-friendly slug from a title
 */
export const getUpdateSlug = (title: string): string => {
  return encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'));
};

/**
 * Compare two slugs to see if they match, handling encoding differences
 */
export const compareUpdateSlugs = (slug1: string, slug2: string): boolean => {
  // Decode both slugs first to handle any encoding differences
  const decoded1 = decodeURIComponent(slug1).toLowerCase().replace(/\s+/g, '-');
  const decoded2 = decodeURIComponent(slug2).toLowerCase().replace(/\s+/g, '-');
  
  // Clean up and normalize both slugs
  const normalized1 = decoded1.replace(/[^\w-]/g, '');
  const normalized2 = decoded2.replace(/[^\w-]/g, '');
  
  return normalized1 === normalized2;
};
