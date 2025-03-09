
/**
 * Utility functions for extracting media from content
 */

/**
 * Extract images from content (for thumbnails)
 */
export const extractImagesFromContent = (content: string): string[] => {
  if (!content) return [];
  
  const images: string[] = [];
  
  // Extract [img]URL[/img] format
  const imgRegex = /\[img\](.*?)\[\/img\]/g;
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      images.push(match[1].trim());
    }
  }
  
  // Also look for other image formats like:
  // [img=URL]
  const altImgRegex = /\[img=(.*?)\]/g;
  while ((match = altImgRegex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      images.push(match[1].trim());
    }
  }
  
  // Also check for video poster images
  const posterRegex = /poster=(https?:\/\/[^"'\s]+)/g;
  while ((match = posterRegex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      images.push(match[1].trim());
    }
  }
  
  console.log("Extracted images:", images);
  return images;
};
