
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
  
  // Handle video tags with various attributes
  formattedText = formattedText.replace(/\[video(?:\s+[^\]]*?)?\](.*?)\[\/video\]/gs, (match, content) => {
    // Extract video attributes
    const mp4Match = match.match(/mp4=([^\s\]]+)/);
    const webmMatch = match.match(/webm=([^\s\]]+)/);
    const posterMatch = match.match(/poster=([^\s\]]+)/);
    const autoplayMatch = match.match(/autoplay=(true|false)/);
    const controlsMatch = match.match(/controls=(true|false)/);
    
    const mp4Src = mp4Match ? mp4Match[1] : '';
    const webmSrc = webmMatch ? webmMatch[1] : '';
    const poster = posterMatch ? posterMatch[1] : '';
    const autoplay = autoplayMatch ? autoplayMatch[1] === 'true' : true; // Default to true
    const controls = controlsMatch ? controlsMatch[1] === 'true' : true;
    
    if (mp4Src || webmSrc) {
      let videoHtml = `
        <div class="video-container">
          <video 
            ${controls ? 'controls' : ''}
            ${autoplay ? 'autoplay muted loop playsinline' : ''}
            ${poster ? `poster="${poster}"` : ''}
            class="w-full"
            preload="auto"
          >`;
          
      if (mp4Src) {
        videoHtml += `
            <source src="${mp4Src}" type="video/mp4">`;
      }
      
      if (webmSrc) {
        videoHtml += `
            <source src="${webmSrc}" type="video/webm">`;
      }
      
      // Add fallback but as a hidden div instead of text
      videoHtml += `
            <div class="video-fallback">Your browser does not support the video tag.</div>
          </video>
        </div>`;
        
      return videoHtml;
    }
    
    return match; // Return original if couldn't parse
  });
  
  // Handle url= format and convert to proper hyperlinks
  // This pattern handles both formats:
  // 1. url=link Text /url
  // 2. url=link\nText\n/url (with line breaks)
  formattedText = formattedText.replace(/url=([^\s]+)\s+(.*?)\/url/gs, (match, url, linkText) => {
    // Ensure the link text is properly cleaned up
    const cleanedText = linkText.trim().replace(/\n/g, ' ');
    // Return the link as an inline element within the text flow
    return `<a href="${url}" class="inline-link" target="_blank" rel="noopener noreferrer">${cleanedText}</a>`;
  });
  
  // Handle italics - format: i text /i
  formattedText = formattedText.replace(/i\s+(.*?)\s+\/i/g, (match, text) => {
    return `<em>${text.trim()}</em>`;
  });
  
  // Handle carousel tag - Use our custom Carousel component
  formattedText = formattedText.replace(/\[carousel\]([\s\S]*?)\[\/carousel\]/g, (match, content) => {
    // Extract all img tags from the carousel content
    const images = [];
    const imgRegex = /\[img\](.*?)\[\/img\]/g;
    let imgMatch;
    
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      if (imgMatch[1] && imgMatch[1].trim()) {
        images.push(imgMatch[1].trim());
      }
    }
    
    if (images.length === 0) {
      return match; // No images found, return original
    }
    
    // Create a unique ID for this carousel
    const carouselId = `carousel-${Math.random().toString(36).substring(2, 10)}`;
    
    // Generate HTML for our custom carousel component
    let carouselHtml = `
      <div class="cs2-carousel" data-carousel-id="${carouselId}" data-images="${encodeURIComponent(JSON.stringify(images))}">
        <div class="cs2-carousel-placeholder">
          <img src="${images[0]}" alt="Carousel image" class="w-full object-contain max-h-[400px]" />
          <div class="cs2-carousel-indicator">
            <span>1</span>/<span>${images.length}</span>
          </div>
        </div>
      </div>
    `;
    
    return carouselHtml;
  });
  
  // Handle heading tags [h1], [h2], [h3], etc.
  formattedText = formattedText.replace(/\[h([1-6])\](.*?)\[\/h\1\]/g, (match, level, content) => {
    return `<h${level} class="font-bold my-3 text-${4-Math.min(parseInt(level), 3)}xl">${content}</h${level}>`;
  });
  
  // Handle [list] and [/list] tags
  formattedText = formattedText.replace(/\[list\]/gi, '<ul class="my-4">');
  formattedText = formattedText.replace(/\[\/list\]/gi, '</ul>');
  
  // Handle [ul] and [/ul] tags
  formattedText = formattedText.replace(/\[ul\]/gi, '<ul class="my-4">');
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
    
    // Skip if it's an image, video, or carousel tag
    if (/img|\/img|video|\/video|carousel|\/carousel/.test(content)) {
      return match;
    }
    
    return `<div class="section-header">${content}</div>`;
  });
  
  // Replace [img]...[/img] with actual image tags
  formattedText = formattedText.replace(/\[img\](.*?)\[\/img\]/g, (match, imageUrl) => {
    return `<img src="${imageUrl}" class="w-full max-h-[400px] object-contain my-4" alt="Update image" />`;
  });
  
  // Process any orphaned or remaining [*] bullet points
  formattedText = formattedText.replace(/\[\*\](.*?)(?=$|\n)/g, '<li>$1</li>');
  
  // Clean up any broken HTML tags
  formattedText = fixHtmlTags(formattedText);
  
  return formattedText;
};
