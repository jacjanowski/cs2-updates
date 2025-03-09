
/**
 * Utility functions for formatting specific content tags
 */

// Import the fixHtmlTags function
import { fixHtmlTags } from './htmlFormatter';

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
