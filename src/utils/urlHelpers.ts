
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
  
  // Direct full match comparison (first check)
  if (decoded1 === decoded2) {
    console.log("Direct match found between slugs:", decoded1);
    return true;
  }
  
  // Remove any URL encoding artifacts and normalize for comparison
  const cleaned1 = decoded1.replace(/%[0-9a-f]{2}/gi, '');
  const cleaned2 = decoded2.replace(/%[0-9a-f]{2}/gi, '');
  
  // If the slugs match after basic cleaning, return true
  if (cleaned1 === cleaned2) {
    console.log("Match found after basic cleaning:", cleaned1);
    return true;
  }
  
  // Apply more aggressive normalization
  // Replace special characters, multiple hyphens, and trim hyphens
  const normalized1 = cleaned1.replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const normalized2 = cleaned2.replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  
  // Debug comparison details
  console.log("Full slug comparison:", { 
    slug1_original: slug1, 
    slug2_original: slug2,
    normalized1,
    normalized2,
    exactMatch: normalized1 === normalized2
  });
  
  // Return exact match result
  return normalized1 === normalized2;
};
