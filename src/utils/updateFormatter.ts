
import { formatHtmlContent } from './formatting/htmlFormatter';

interface CarouselData {
  id: string;
  images: string[];
}

let carouselCounter = 0;
const extractedCarousels: CarouselData[] = [];

export const formatDescription = (description: string): string => {
  // Reset carousel counter and extracted images for this format operation
  carouselCounter = 0;
  extractedCarousels.length = 0;
  
  // Format the HTML content using our formatter
  let formattedContent = formatHtmlContent(description);
  
  // Process VIDEO tags
  formattedContent = processVideoTags(formattedContent);
  
  // Process IMG tags to create carousels for consecutive images
  formattedContent = processImageGroups(formattedContent);
  
  // Process remaining standalone images
  formattedContent = processStandaloneImages(formattedContent);
  
  return formattedContent;
};

const processVideoTags = (content: string): string => {
  const videoRegex = /<video[^>]*>(.*?)<\/video>/gis;
  
  return content.replace(videoRegex, (videoTag) => {
    if (videoTag.includes('gfycat.com') || videoTag.includes('giant.gfycat.com')) {
      // Extract the Gfycat ID
      const gfycatIdMatch = videoTag.match(/(?:gfycat\.com\/|giant\.gfycat\.com\/)([a-zA-Z0-9]+)/i);
      const gfycatId = gfycatIdMatch ? gfycatIdMatch[1] : null;
      
      if (gfycatId) {
        // Create an iframe for Gfycat embeds
        return `<div class="video-container aspect-video">
          <iframe src="https://gfycat.com/ifr/${gfycatId}" 
            frameborder="0" scrolling="no" width="100%" height="100%" 
            allowfullscreen>
          </iframe>
        </div>`;
      }
    }
    
    // Check for source tags with src attributes
    const sourceMatch = videoTag.match(/<source[^>]*src="([^"]+)"[^>]*>/i);
    const srcMatch = videoTag.match(/src="([^"]+)"/i);
    const posterMatch = videoTag.match(/poster="([^"]+)"/i);
    
    const videoSrc = sourceMatch ? sourceMatch[1] : (srcMatch ? srcMatch[1] : null);
    const posterSrc = posterMatch ? posterMatch[1] : null;
    
    if (videoSrc) {
      // Create a clean video container
      return `<div class="video-container">
        <video 
          ${posterSrc ? `poster="${posterSrc}"` : ''} 
          controls 
          autoplay 
          loop 
          muted 
          playsinline
          class="w-full">
            <source src="${videoSrc}" type="${getVideoMimeType(videoSrc)}">
            <div class="video-fallback">Your browser does not support video playback.</div>
        </video>
      </div>`;
    }
    
    // Return original tag if we couldn't process it
    return videoTag;
  });
};

const getVideoMimeType = (url: string): string => {
  const extension = url.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'ogg':
      return 'video/ogg';
    case 'mov':
      return 'video/quicktime';
    default:
      return 'video/mp4'; // Default to mp4
  }
};

const processImageGroups = (content: string): string => {
  // First, identify all image tags
  const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/gi;
  const imgMatches: { full: string, src: string, index: number }[] = [];
  
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    imgMatches.push({
      full: match[0],
      src: match[1],
      index: match.index
    });
  }
  
  // If we found fewer than 2 images, no need to create carousels
  if (imgMatches.length < 2) {
    return content;
  }
  
  // Identify consecutive images (images that have no significant content between them)
  const groupedImages: { startIndex: number, endIndex: number, srcs: string[] }[] = [];
  let currentGroup: { startIndex: number, endIndex: number, srcs: string[] } | null = null;
  
  for (let i = 0; i < imgMatches.length; i++) {
    const current = imgMatches[i];
    const next = i < imgMatches.length - 1 ? imgMatches[i + 1] : null;
    
    // Start a new group if we don't have one
    if (!currentGroup) {
      currentGroup = {
        startIndex: current.index,
        endIndex: current.index + current.full.length,
        srcs: [current.src]
      };
    } else {
      // Add to existing group
      currentGroup.endIndex = current.index + current.full.length;
      currentGroup.srcs.push(current.src);
    }
    
    // Check if we should close this group
    if (!next || (next.index - currentGroup.endIndex > 100)) {
      // If there's more than 100 characters between images, consider them separate
      // Or if this is the last image
      
      // Only create a carousel for groups with at least 2 images
      if (currentGroup.srcs.length >= 2) {
        groupedImages.push(currentGroup);
      }
      
      currentGroup = null;
    }
  }
  
  // Replace image groups with carousels, starting from the end to not mess up indices
  let modifiedContent = content;
  
  // Process groups in reverse order to maintain correct indices
  for (let i = groupedImages.length - 1; i >= 0; i--) {
    const group = groupedImages[i];
    
    // Create a carousel for this group
    const carouselId = `carousel-${++carouselCounter}`;
    const carouselHtml = createCarouselHtml(group.srcs, carouselId);
    
    // Store the carousel data for potential future use
    extractedCarousels.push({
      id: carouselId,
      images: group.srcs
    });
    
    // Replace the group of images with the carousel
    modifiedContent = modifiedContent.substring(0, group.startIndex) + 
                      carouselHtml + 
                      modifiedContent.substring(group.endIndex);
  }
  
  return modifiedContent;
};

const createCarouselHtml = (images: string[], carouselId: string): string => {
  if (!images || images.length === 0) {
    return '';
  }
  
  // If only one image, just display it without carousel
  if (images.length === 1) {
    return `<div class="w-full my-4">
      <img src="${images[0]}" class="w-full h-auto object-contain" alt="Update image" />
    </div>`;
  }
  
  // Generate HTML for a simple custom carousel
  return `
    <div class="custom-carousel my-4 relative border border-border rounded-md overflow-hidden" data-carousel-id="${carouselId}">
      <div class="carousel-container">
        ${images.map((img, index) => 
          `<div class="carousel-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
            <img src="${img}" class="w-full h-auto object-contain mx-auto" alt="Carousel image ${index + 1}" />
          </div>`
        ).join('')}
        
        <button class="carousel-button prev absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground w-8 h-8 rounded-full flex items-center justify-center" aria-label="Previous slide">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        
        <button class="carousel-button next absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground w-8 h-8 rounded-full flex items-center justify-center" aria-label="Next slide">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        
        <div class="carousel-indicators absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          ${images.map((_, index) => 
            `<button class="w-2 h-2 rounded-full ${index === 0 ? 'active bg-primary' : 'bg-background/50'}" data-index="${index}" aria-label="Go to slide ${index + 1}"></button>`
          ).join('')}
        </div>
        
        <div class="carousel-counter absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium">
          1 / ${images.length}
        </div>
      </div>
    </div>
  `;
};

const processStandaloneImages = (content: string): string => {
  // Find any remaining image tags not in carousels
  return content.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, (match, imageUrl) => {
    // Skip image tags that are already inside a carousel
    const isInCarousel = extractedCarousels.some(carousel => 
      carousel.images.includes(imageUrl)
    );
    
    if (isInCarousel) {
      return match; // Return original tag if it's part of a carousel
    }
    
    // Skip empty image URLs
    if (!imageUrl || !imageUrl.trim()) {
      return ''; // Skip empty image tags
    }
    return `<img src="${imageUrl.trim()}" class="w-full max-h-[500px] object-contain my-4" alt="Update image" loading="lazy" />`;
  });
};

// Export the extractImagesFromContent function from mediaExtractor
export { extractImagesFromContent } from './formatting/mediaExtractor';
