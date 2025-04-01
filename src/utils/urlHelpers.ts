
/**
 * Create a URL-friendly slug from a title
 */
export const getUpdateSlug = (title: string): string => {
  // Create a consistent, URL-friendly slug
  return encodeURIComponent(title.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Remove duplicate hyphens
    .trim());                  // Trim leading/trailing spaces
};

/**
 * Compare two slugs to see if they match, handling encoding differences
 */
export const compareUpdateSlugs = (slug1: string, slug2: string): boolean => {
  if (!slug1 || !slug2) return false;
  
  // Decode both slugs to handle encoding differences
  const decoded1 = decodeURIComponent(slug1).toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
    
  const decoded2 = decodeURIComponent(slug2).toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  // Use exact match comparison for reliability
  const isMatch = decoded1 === decoded2;
  console.log(`[compareUpdateSlugs] Comparing "${decoded1}" with "${decoded2}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
  return isMatch;
};

/**
 * Create a unique identifier for an update using both title and date
 * This ensures we have a truly unique identifier even if titles are reused
 */
export const getUpdateUniqueId = (title: string, date: string): string => {
  const dateStr = new Date(date).toISOString().split('T')[0]; // YYYY-MM-DD format
  return `${getUpdateSlug(title)}_${dateStr}`;
};

