
/**
 * Create a URL-friendly slug from a title
 */
export const getUpdateSlug = (title: string): string => {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .trim();                    // Trim any leading/trailing spaces
};
