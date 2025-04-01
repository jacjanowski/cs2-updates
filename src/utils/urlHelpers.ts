
/**
 * Create a URL-friendly slug from a title
 */
export const getUpdateSlug = (title: string): string => {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .trim();                    // Trim any leading/trailing spaces
};

/**
 * Compare two slugs for equality, ignoring minor differences
 * that might occur during URL encoding/decoding
 */
export const compareUpdateSlugs = (slug1: string, slug2: string): boolean => {
  // Normalize both slugs by removing any trailing dashes and trimming
  const normalizedSlug1 = slug1.replace(/-+$/, '').trim();
  const normalizedSlug2 = slug2.replace(/-+$/, '').trim();
  
  console.log(`Comparing slugs more carefully: [${normalizedSlug1}] vs [${normalizedSlug2}]`);
  return normalizedSlug1 === normalizedSlug2;
};
