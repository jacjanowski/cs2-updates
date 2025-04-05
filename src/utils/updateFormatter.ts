
/**
 * Utility functions for formatting specific content tags
 */

// Import the fixHtmlTags function
import { fixHtmlTags } from './formatting/htmlFormatter';
import { extractImagesFromContent as extractMediaImages } from './formatting/mediaExtractor';

/**
 * Formats the description text into structured HTML
 */
export const formatDescription = (description: string): string => {
  if (!description) return '';
  
  // First, normalize line breaks
  let formattedText = description.replace(/\r\n/g, '\n');
  
  // Handle standard image tags - needs to come before carousel processing
  formattedText = formattedText.replace(/\[img\](.*?)\[\/img\]/g, (match, imgUrl) => {
    if (imgUrl && imgUrl.trim()) {
      return `<div class="my-4">
        <img src="${imgUrl.trim()}" class="max-w-full h-auto object-contain rounded-md" loading="lazy" alt="Update image" />
      </div>`;
    }
    return '';
  });

  // Handle video tags
  formattedText = formattedText.replace(/\[video\](.*?)\[\/video\]/g, (match, videoUrl) => {
    if (videoUrl && videoUrl.trim()) {
      return `<div class="aspect-w-16 aspect-h-9 my-4 rounded-md overflow-hidden">
        <iframe src="${videoUrl.trim()}" frameborder="0" allowfullscreen class="w-full h-full"></iframe>
      </div>`;
    }
    return '';
  });

  // Handle URLs
  formattedText = formattedText.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, (match, url, linkText) => {
    if (url && url.trim() && linkText && linkText.trim()) {
      return `<a href="${url.trim()}" target="_blank" rel="noopener noreferrer" class="underline">${linkText.trim()}</a>`;
    }
    return '';
  });

  // Handle bold tags
  formattedText = formattedText.replace(/\[b\](.*?)\[\/b\]/g, (match, text) => {
    if (text && text.trim()) {
      return `<strong>${text.trim()}</strong>`;
    }
    return '';
  });

  // Handle italic tags
  formattedText = formattedText.replace(/\[i\](.*?)\[\/i\]/g, (match, text) => {
    if (text && text.trim()) {
      return `<em>${text.trim()}</em>`;
    }
    return '';
  });

  // Handle line breaks
  formattedText = formattedText.replace(/\[br\]/g, '<br />');

  // Handle color tags
  formattedText = formattedText.replace(/\[color=(.*?)\](.*?)\[\/color\]/g, (match, color, text) => {
    if (color && color.trim() && text && text.trim()) {
      return `<span style="color: ${color.trim()};">${text.trim()}</span>`;
    }
    return '';
  });

  // Handle size tags
  formattedText = formattedText.replace(/\[size=(.*?)\](.*?)\[\/size\]/g, (match, size, text) => {
    if (size && size.trim() && text && text.trim()) {
      return `<span style="font-size: ${size.trim()};">${text.trim()}</span>`;
    }
    return '';
  });

  // Handle heading tags
  formattedText = formattedText.replace(/\[h1\](.*?)\[\/h1\]/g, (match, text) => {
    if (text && text.trim()) {
      return `<h1>${text.trim()}</h1>`;
    }
    return '';
  });
  formattedText = formattedText.replace(/\[h2\](.*?)\[\/h2\]/g, (match, text) => {
    if (text && text.trim()) {
      return `<h2>${text.trim()}</h2>`;
    }
    return '';
  });
  formattedText = formattedText.replace(/\[h3\](.*?)\[\/h3\]/g, (match, text) => {
    if (text && text.trim()) {
      return `<h3>${text.trim()}</h3>`;
    }
    return '';
  });
  formattedText = formattedText.replace(/\[h4\](.*?)\[\/h4\]/g, (match, text) => {
    if (text && text.trim()) {
      return `<h4>${text.trim()}</h4>`;
    }
    return '';
  });
  formattedText = formattedText.replace(/\[h5\](.*?)\[\/h5\]/g, (match, text) => {
    if (text && text.trim()) {
      return `<h5>${text.trim()}</h5>`;
    }
    return '';
  });
  formattedText = formattedText.replace(/\[h6\](.*?)\[\/h6\]/g, (match, text) => {
    if (text && text.trim()) {
      return `<h6>${text.trim()}</h6>`;
    }
    return '';
  });
  
  // Process carousel tag with dedicated HTML structure for reliable rendering
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
    
    // Create a placeholder that will be replaced with the actual carousel component
    return `<div class="dynamic-carousel-placeholder" 
      data-carousel-id="${carouselId}" 
      data-images='${JSON.stringify(images)}'></div>`;
  });
  
  // Apply HTML fixes
  formattedText = fixHtmlTags(formattedText);
  
  return formattedText;
};

// Extracts and returns all images from content
export const extractImagesFromContent = (content: string): string[] => {
  if (!content) return [];
  
  return extractMediaImages(content);
};
