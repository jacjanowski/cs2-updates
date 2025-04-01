
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
  
  // Remove any URL encoding artifacts
  const cleaned1 = decoded1.replace(/%[0-9a-f]{2}/gi, '');
  const cleaned2 = decoded2.replace(/%[0-9a-f]{2}/gi, '');
  
  // Normalize both slugs for comparison (remove special characters, replace spaces with hyphens)
  const normalized1 = cleaned1.replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const normalized2 = cleaned2.replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  // Debug slugs to console for troubleshooting
  console.log("Comparing slugs:", { 
    original1: slug1, 
    original2: slug2,
    normalized1,
    normalized2,
    exactMatch: normalized1 === normalized2
  });
  
  // Only use exact matching - the partial matching was causing the issues
  return normalized1 === normalized2;
};
