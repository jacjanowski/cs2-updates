
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
  // Decode both slugs to handle encoding differences
  const decoded1 = decodeURIComponent(slug1).toLowerCase();
  const decoded2 = decodeURIComponent(slug2).toLowerCase();
  
  // Use exact match comparison for reliability
  return decoded1 === decoded2;
};
