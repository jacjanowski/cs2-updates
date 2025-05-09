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
  
  // Handle [url] format (BBCode style)
  formattedText = formattedText.replace(/\[url=([^\]]+)\](.*?)\[\/url\]/g, (match, url, text) => {
    return `<a href="${url}" class="inline-link" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
  
  // Handle url= format (legacy style)
  formattedText = formattedText.replace(/url=([^\s]+)\s+(.*?)\/url/gs, (match, url, linkText) => {
    // Ensure the link text is properly cleaned up
    const cleanedText = linkText.trim().replace(/\n/g, ' ');
    // Return the link as an inline element within the text flow
    return `<a href="${url}" class="inline-link" target="_blank" rel="noopener noreferrer">${cleanedText}</a>`;
  });
  
  // Handle italics with [i]...[/i] (standard BBCode format)
  formattedText = formattedText.replace(/\[i\](.*?)\[\/i\]/gs, (match, text) => {
    return `<em>${text.trim()}</em>`;
  });
  
  // Handle italics - alternative format: i text /i (without brackets)
  formattedText = formattedText.replace(/(?<![a-zA-Z])i\s+(.*?)\s+\/i(?![a-zA-Z])/g, (match, text) => {
    return `<em>${text.trim()}</em>`;
  });
  
  // Handle bold with [b]...[/b]
  formattedText = formattedText.replace(/\[b\](.*?)\[\/b\]/gs, (match, text) => {
    return `<strong>${text.trim()}</strong>`;
  });
  
  // Handle underline with [u]...[/u]
  formattedText = formattedText.replace(/\[u\](.*?)\[\/u\]/gs, (match, text) => {
    return `<span class="underline">${text.trim()}</span>`;
  });
  
  // Handle strikethrough with [s]...[/s]
  formattedText = formattedText.replace(/\[s\](.*?)\[\/s\]/gs, (match, text) => {
    return `<span class="line-through">${text.trim()}</span>`;
  });
  
  // Handle quote blocks with [quote]...[/quote]
  formattedText = formattedText.replace(/\[quote\](.*?)\[\/quote\]/gs, (match, text) => {
    return `<blockquote class="border-l-4 border-primary/20 pl-4 py-1 my-4 italic text-muted-foreground">${text.trim()}</blockquote>`;
  });
  
  // Handle named quotes with [quote="name"]...[/quote]
  formattedText = formattedText.replace(/\[quote="([^"]+)"\](.*?)\[\/quote\]/gs, (match, name, text) => {
    return `<blockquote class="border-l-4 border-primary/20 pl-4 py-1 my-4">
      <div class="text-sm font-medium mb-1">${name} wrote:</div>
      <div class="italic text-muted-foreground">${text.trim()}</div>
    </blockquote>`;
  });
  
  // Handle code blocks with [code]...[/code]
  formattedText = formattedText.replace(/\[code\](.*?)\[\/code\]/gs, (match, text) => {
    return `<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code>${text.trim()}</code></pre>`;
  });
  
  // Process carousel tag with Splide
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
      // If no images found, return a placeholder
      return `<div class="bg-muted p-4 rounded-md text-center">No images found in carousel</div>`;
    }
    
    // Create a unique ID for this carousel
    const carouselId = `carousel-${Math.random().toString(36).substring(2, 10)}`;
    
    // If only one image, just display it without carousel
    if (images.length === 1) {
      return `<img src="${images[0]}" class="w-full max-h-[400px] object-contain my-4" alt="Update image" />`;
    }
    
    // Generate a placeholder that will be replaced with the carousel
    const imageDataAttr = encodeURIComponent(JSON.stringify(images));
    
    // Create a simple placeholder that will be replaced by JavaScript
    return `
      <div class="cs2-carousel" data-carousel-id="${carouselId}" data-images="${imageDataAttr}">
        <div class="cs2-carousel-loading text-center p-4 bg-muted/30 rounded-md">
          Loading images...
        </div>
      </div>
    `;
  });
  
  // Handle color with [color=X]...[/color]
  formattedText = formattedText.replace(/\[color=([^\]]+)\](.*?)\[\/color\]/gs, (match, color, text) => {
    return `<span style="color: ${color}">${text}</span>`;
  });
  
  // Handle size with [size=X]...[/size]
  formattedText = formattedText.replace(/\[size=([^\]]+)\](.*?)\[\/size\]/gs, (match, size, text) => {
    // Convert numeric sizes to appropriate rem values
    const sizeValue = parseInt(size);
    let fontSize = 'inherit';
    
    if (!isNaN(sizeValue)) {
      // Map numeric sizes to reasonable font sizes
      if (sizeValue <= 8) fontSize = '0.75rem'; // xs
      else if (sizeValue <= 10) fontSize = '0.875rem'; // sm
      else if (sizeValue <= 12) fontSize = '1rem'; // base
      else if (sizeValue <= 14) fontSize = '1.125rem'; // lg
      else if (sizeValue <= 16) fontSize = '1.25rem'; // xl
      else if (sizeValue <= 20) fontSize = '1.5rem'; // 2xl
      else fontSize = '1.875rem'; // 3xl and above
    } else {
      // Handle named sizes
      fontSize = size; // Use as is for CSS values like "larger", "smaller", etc.
    }
    
    return `<span style="font-size: ${fontSize}">${text}</span>`;
  });
  
  // Handle heading tags [h1], [h2], [h3], etc.
  formattedText = formattedText.replace(/\[h([1-6])\](.*?)\[\/h\1\]/g, (match, level, content) => {
    return `<h${level} class="font-bold my-3 text-${4-Math.min(parseInt(level), 3)}xl">${content}</h${level}>`;
  });
  
  // Handle lists
  // [list] and [/list] tags
  formattedText = formattedText.replace(/\[list\]/gi, '<ul class="my-4">');
  formattedText = formattedText.replace(/\[\/list\]/gi, '</ul>');
  
  // [ul] and [/ul] tags (alternative list format)
  formattedText = formattedText.replace(/\[ul\]/gi, '<ul class="my-4">');
  formattedText = formattedText.replace(/\[\/ul\]/gi, '</ul>');
  
  // [ol] and [/ol] tags (ordered lists)
  formattedText = formattedText.replace(/\[ol\]/gi, '<ol class="my-4 list-decimal pl-5">');
  formattedText = formattedText.replace(/\[\/ol\]/gi, '</ol>');
  
  // Handle list items with [*]
  formattedText = formattedText.replace(/\[\*\](.*?)(?=\[\*\]|\[\/list\]|\[\/ul\]|\[\/ol\]|$)/gs, '<li>$1</li>');
  
  // Handle list items with [li]...[/li]
  formattedText = formattedText.replace(/\[li\](.*?)\[\/li\]/gs, '<li>$1</li>');
  
  // Process section headers
  formattedText = formattedText.replace(/\[(.*?)\]/g, (match, content) => {
    // Skip if it's a tag we've already processed
    if (/list|ul|ol|\/list|\/ul|\/ol|\*|li|\/li|b|\/b|i|\/i|u|\/u|s|\/s|url|\/url|img|\/img|video|\/video|carousel|\/carousel|quote|\/quote|code|\/code|color|\/color|size|\/size/i.test(content)) {
      return match;
    }
    
    return `<div class="section-header">${content}</div>`;
  });
  
  // Replace [img]...[/img] with actual image tags
  formattedText = formattedText.replace(/\[img\](.*?)\[\/img\]/g, (match, imageUrl) => {
    if (!imageUrl || !imageUrl.trim()) {
      return ''; // Skip empty image tags
    }
    return `<img src="${imageUrl.trim()}" class="w-full max-h-[400px] object-contain my-4" alt="Update image" loading="lazy" />`;
  });
  
  // Process any orphaned or remaining [*] bullet points
  formattedText = formattedText.replace(/\[\*\](.*?)(?=$|\n)/g, '<li>$1</li>');
  
  // Clean up any broken HTML tags
  formattedText = fixHtmlTags(formattedText);
  
  return formattedText;
};
