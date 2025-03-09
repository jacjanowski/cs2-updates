
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
  
  // Look for video poster images
  const posterRegex = /poster=(https?:\/\/[^"'\s\]]+)/g;
  while ((match = posterRegex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      images.push(match[1].trim());
    }
  }
  
  // Check for mp4/webm videos as potential image sources too
  const mp4Regex = /mp4=(https?:\/\/[^"'\s\]]+)/g;
  while ((match = mp4Regex.exec(content)) !== null) {
    // We don't directly use videos as images, but we note that 
    // this content has media
  }
  
  console.log("Extracted images:", images);
  return images;
};
