
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
  console.log("Detailed slug comparison:", { 
    original1: slug1, 
    original2: slug2,
    decoded1,
    decoded2,
    cleaned1,
    cleaned2,
    normalized1,
    normalized2,
    match: normalized1 === normalized2
  });
  
  // Check if slugs are exactly the same after normalization
  if (normalized1 === normalized2) {
    return true;
  }
  
  // Additional check: see if one is contained within the other
  // This helps with partial matches (e.g., "counter-strike-2-update" vs "counter-strike-2-update-release-notes")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    console.log("Partial match found between slugs");
    return true;
  }
  
  return false;
};
