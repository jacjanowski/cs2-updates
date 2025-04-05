
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
  const posterRegex = /poster=["']?(https?:\/\/[^"'\s\]]+)/g;
  while ((match = posterRegex.exec(content)) !== null) {
    if (match[1] && match[1].trim()) {
      images.push(match[1].trim());
    }
  }
  
  // Extract mp4/webm videos as potential image sources too
  const videoSrcRegex = /(mp4|webm)=["']?(https?:\/\/[^"'\s\]]+)/g;
  while ((match = videoSrcRegex.exec(content)) !== null) {
    // For videos, we don't directly add them to images
    // But we note their existence for debugging
    console.log(`Found video source (${match[1]}):`, match[2]);
  }
  
  return images;
};

/**
 * Extract videos from content
 */
export const extractVideosFromContent = (content: string): Array<{mp4?: string, webm?: string, poster?: string}> => {
  if (!content) return [];
  
  const videos: Array<{mp4?: string, webm?: string, poster?: string}> = [];
  
  // Find all [video] tags
  const videoBlockRegex = /\[video(?:\s+[^\]]*?)?\].*?\[\/video\]/gs;
  let videoBlock;
  
  while ((videoBlock = videoBlockRegex.exec(content)) !== null) {
    const block = videoBlock[0];
    
    // Extract individual attributes
    const mp4Match = block.match(/mp4=["']?(https?:\/\/[^"'\s\]]+)/);
    const webmMatch = block.match(/webm=["']?(https?:\/\/[^"'\s\]]+)/);
    const posterMatch = block.match(/poster=["']?(https?:\/\/[^"'\s\]]+)/);
    
    const videoObj: {mp4?: string, webm?: string, poster?: string} = {};
    
    if (mp4Match && mp4Match[1]) videoObj.mp4 = mp4Match[1];
    if (webmMatch && webmMatch[1]) videoObj.webm = webmMatch[1];
    if (posterMatch && posterMatch[1]) videoObj.poster = posterMatch[1];
    
    if (videoObj.mp4 || videoObj.webm) {
      videos.push(videoObj);
    }
  }
  
  return videos;
};
