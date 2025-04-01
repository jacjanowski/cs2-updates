
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
  
  // Normalize both slugs for comparison (remove special characters, replace spaces with hyphens)
  const normalized1 = decoded1.replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const normalized2 = decoded2.replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  // Debug slugs to console
  console.log("Slug comparison:", { 
    original1: slug1, 
    original2: slug2,
    normalized1,
    normalized2,
    match: normalized1 === normalized2
  });
  
  return normalized1 === normalized2;
};
