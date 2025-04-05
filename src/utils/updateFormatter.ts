/**
 * Utility functions for formatting specific content tags
 */

// Import the fixHtmlTags function
import { fixHtmlTags } from './formatting/htmlFormatter';

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
    const controls = controlsMatch ? controlsMatch[1] === 'true' : false; // Default to false for cleaner look
    
    if (mp4Src || webmSrc) {
      let videoHtml = `
        <div class="video-container relative">
          <video 
            ${controls ? 'controls' : ''}
            autoplay muted loop playsinline
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
  
  // Also handle direct HTML video tags that might be in the content
  formattedText = formattedText.replace(/<video([^>]*)>([\s\S]*?)<\/video>/gi, (match, attributes, innerContent) => {
    // Make sure required attributes are set for proper video playback
    if (!attributes.includes('muted')) {
      attributes += ' muted';
    }
    if (!attributes.includes('autoplay')) {
      attributes += ' autoplay';
    }
    if (!attributes.includes('playsinline')) {
      attributes += ' playsinline';
    }
    if (!attributes.includes('loop')) {
      attributes += ' loop';
    }
    
    // Create wrapper and enhanced video tag
    return `<div class="video-container relative"><video${attributes}>${innerContent}</video></div>`;
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
  
  // Process carousel tag with data-attribute approach for proper component hydration
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
      return `<div class="w-full my-4">
        <img src="${images[0]}" class="w-full h-auto object-contain" alt="Update image" />
      </div>`;
    }
    
    // Generate a carousel container with data attributes
    const imagesJson = JSON.stringify(images);
    return `
      <div class="embedded-carousel" data-carousel-id="${carouselId}" data-carousel-images='${imagesJson.replace(/'/g, "&apos;")}'>
        <!-- Carousel will be rendered here by React -->
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
  formattedText = formattedText.replace(/\[list\]/gi, '<ul class="my-4">');
  formattedText = formattedText.replace(/\[\/list\]/gi, '</ul>');
  
  formattedText = formattedText.replace(/\[ul\]/gi, '<ul class="my-4">');
  formattedText = formattedText.replace(/\[\/ul\]/gi, '</ul>');
  
  formattedText = formattedText.replace(/\[ol\]/gi, '<ol class="my-4 list-decimal pl-5">');
  formattedText = formattedText.replace(/\[\/ol\]/gi, '</ol>');
  
  formattedText = formattedText.replace(/\[\*\](.*?)(?=\[\*\]|\[\/list\]|\[\/ul\]|\[\/ol\]|$)/gs, '<li>$1</li>');
  
  formattedText = formattedText.replace(/\[li\](.*?)\[\/li\]/gs, '<li>$1</li>');
  
  formattedText = formattedText.replace(/\[(.*?)\]/g, (match, content) => {
    if (/list|ul|ol|\/list|\/ul|\/ol|\*|li|\/li|b|\/b|i|\/i|u|\/u|s|\/s|url|\/url|img|\/img|video|\/video|carousel|\/carousel|quote|\/quote|code|\/code|color|\/color|size|\/size/i.test(content)) {
      return match;
    }
    
    return `<div class="section-header">${content}</div>`;
  });
  
  formattedText = formattedText.replace(/\[img\](.*?)\[\/img\]/g, (match, imageUrl) => {
    if (!imageUrl || !imageUrl.trim()) {
      return ''; // Skip empty image tags
    }
    return `<img src="${imageUrl.trim()}" class="w-full max-h-[500px] object-contain my-4" alt="Update image" loading="lazy" />`;
  });
  
  formattedText = formattedText.replace(/\[\*\](.*?)(?=$|\n)/g, '<li>$1</li>');
  
  formattedText = fixHtmlTags(formattedText);
  
  return formattedText;
};

// Extracts and returns all images from content
export const extractImagesFromContent = (content: string): string[] => {
  if (!content) return [];
  
  const images: string[] = [];
  
  // Extract all <img> tags
  const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(content)) !== null) {
    if (imgMatch[1] && !images.includes(imgMatch[1])) {
      images.push(imgMatch[1]);
    }
  }
  
  // Extract video thumbnails/posters
  const posterRegex = /<video[^>]*poster="([^"]*)"[^>]*>/gi;
  let posterMatch;
  while ((posterMatch = posterRegex.exec(content)) !== null) {
    if (posterMatch[1] && !images.includes(posterMatch[1])) {
      images.push(posterMatch[1]);
    }
  }
  
  // Look for [img] tags as well (BBCode style)
  const bbcodeRegex = /\[img\](.*?)\[\/img\]/gi;
  let bbcodeMatch;
  while ((bbcodeMatch = bbcodeRegex.exec(content)) !== null) {
    if (bbcodeMatch[1] && !images.includes(bbcodeMatch[1])) {
      images.push(bbcodeMatch[1]);
    }
  }
  
  return images;
};
