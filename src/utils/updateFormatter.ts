
/**
 * Utility functions for formatting update content
 */

/**
 * Formats the description text into structured HTML
 */
export const formatDescription = (description: string): string => {
  if (!description) return '';
  
  // First, normalize line breaks
  let formattedText = description.replace(/\r\n/g, '\n');
  
  // Handle [list] and [/list] tags
  formattedText = formattedText.replace(/\[list\]/gi, '<ul>');
  formattedText = formattedText.replace(/\[\/list\]/gi, '</ul>');
  
  // Handle [ul] and [/ul] tags
  formattedText = formattedText.replace(/\[ul\]/gi, '<ul>');
  formattedText = formattedText.replace(/\[\/ul\]/gi, '</ul>');
  
  // Handle nested lists with [*] and bullet points
  formattedText = formattedText.replace(/\[\*\](.*?)(?=\[list\])/g, '<li>$1');
  formattedText = formattedText.replace(/\[\*\](.*?)(?=\[\*\]|$|\[\/list\])/gs, '<li>$1</li>');
  
  // Process section headers
  formattedText = formattedText.replace(/\[(.*?)\]/g, (match, content) => {
    // Skip if it's a list tag that we've already processed
    if (/list|ul|\/list|\/ul|\*/.test(content)) {
      return match;
    }
    
    // Skip if it's an image or video tag
    if (/img|\/img|video|\/video/.test(content)) {
      return match;
    }
    
    return `<div class="section-header">[${content}]</div>`;
  });
  
  // Replace [img]...[/img] with actual image tags
  formattedText = formattedText.replace(/\[img\](.*?)\[\/img\]/g, (match, imageUrl) => {
    return `<img src="${imageUrl}" class="w-full max-h-[400px] object-contain my-4" crossorigin="anonymous" />`;
  });
  
  // Handle video tags
  formattedText = formattedText.replace(/\[video.*?\](.*?)\[\/video\]/gs, (match, content) => {
    // Extract video sources
    const mp4Match = content.match(/mp4=(.*?)($|\s)/);
    const webmMatch = content.match(/webm=(.*?)($|\s)/);
    const posterMatch = content.match(/poster=(.*?)($|\s)/);
    
    const mp4Src = mp4Match ? mp4Match[1] : '';
    const webmSrc = webmMatch ? webmMatch[1] : '';
    const poster = posterMatch ? posterMatch[1] : '';
    
    if (mp4Src || webmSrc) {
      return `
        <div class="video-container my-4">
          <video 
            controls 
            poster="${poster}"
            class="w-full max-h-[500px]"
            crossorigin="anonymous"
          >
            ${mp4Src ? `<source src="${mp4Src}" type="video/mp4">` : ''}
            ${webmSrc ? `<source src="${webmSrc}" type="video/webm">` : ''}
            Your browser does not support the video tag.
          </video>
        </div>
      `;
    }
    
    return match; // Return original if couldn't parse
  });
  
  // Process any orphaned or remaining [*] bullet points
  formattedText = formattedText.replace(/\[\*\](.*?)(?=$|\n)/g, '<li>$1</li>');
  
  // Clean up any broken HTML tags
  formattedText = fixHtmlTags(formattedText);
  
  return formattedText;
};

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

/**
 * Ensures HTML tags are properly closed and nested
 */
function fixHtmlTags(html: string): string {
  let fixed = html;
  
  // Fix unclosed list items
  fixed = fixed.replace(/<li>(.*?)(?=<li>|<ul>|<\/ul>)/g, '<li>$1</li>');
  
  // Fix nested lists structure
  fixed = fixed.replace(/<li>(.*?)<ul>/g, '<li>$1<ul>');
  fixed = fixed.replace(/<\/ul>(.*?)<\/li>/g, '</ul></li>');
  
  // Ensure proper nesting for lists within list items
  fixed = fixed.replace(/<li>(.*?)<\/li><ul>/g, '<li>$1<ul>');
  fixed = fixed.replace(/<\/ul><\/li>/g, '</ul></li>');
  
  // Fix any remaining unclosed tags
  const openLiCount = (fixed.match(/<li>/g) || []).length;
  const closeLiCount = (fixed.match(/<\/li>/g) || []).length;
  const openUlCount = (fixed.match(/<ul>/g) || []).length;
  const closeUlCount = (fixed.match(/<\/ul>/g) || []).length;
  
  // Add missing closing </li> tags
  if (openLiCount > closeLiCount) {
    for (let i = 0; i < openLiCount - closeLiCount; i++) {
      fixed += '</li>';
    }
  }
  
  // Add missing closing </ul> tags
  if (openUlCount > closeUlCount) {
    for (let i = 0; i < openUlCount - closeUlCount; i++) {
      fixed += '</ul>';
    }
  }
  
  return fixed;
}
