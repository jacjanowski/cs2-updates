
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
    const autoplay = autoplayMatch ? autoplayMatch[1] === 'true' : false;
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
      
      videoHtml += `
            <div class="video-fallback">Your browser does not support the video tag.</div>
          </video>
        </div>`;
        
      return videoHtml;
    }
    
    return match; // Return original if couldn't parse
  });
  
  // Handle url= format and convert to proper hyperlinks
  formattedText = formattedText.replace(/url=([^\s]+)\s+(.*?)\/url/gs, (match, url, linkText) => {
    const cleanedText = linkText.trim().replace(/\n/g, ' ');
    return `<a href="${url}" class="inline-link" target="_blank" rel="noopener noreferrer">${cleanedText}</a>`;
  });
  
  // Handle italics - FIXED: Properly match the pattern "i text /i" without requiring spaces
  formattedText = formattedText.replace(/i\s+(.*?)\s+\/i/g, '<em>$1</em>');
  // Additional pattern for "i text/i" (no space before closing)
  formattedText = formattedText.replace(/i\s+(.*?)\/i/g, '<em>$1</em>');
  
  // Handle carousel tag - Using a simpler implementation with shadcn/ui carousel
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
    
    // Create a carousel using shadcn/ui structure
    let carouselHtml = `
      <div class="carousel-container my-6">
        <div class="shadcn-carousel">
          <div class="overflow-hidden">
            <div class="flex transition-transform duration-300 space-x-4">`;
    
    // Add each image as a slide
    images.forEach((imgSrc, index) => {
      carouselHtml += `
              <div class="carousel-slide min-w-full flex-shrink-0" data-index="${index}">
                <img src="${imgSrc}" class="w-full object-contain max-h-[400px]" alt="Carousel image ${index + 1}" />
              </div>`;
    });
    
    // Close the carousel structure
    carouselHtml += `
            </div>
          </div>
          
          <div class="flex justify-between mt-4">
            <button class="carousel-prev bg-primary text-white rounded-full p-2 hover:bg-primary/90">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              <span class="sr-only">Previous</span>
            </button>
            
            <button class="carousel-next bg-primary text-white rounded-full p-2 hover:bg-primary/90">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              <span class="sr-only">Next</span>
            </button>
          </div>
        </div>
        
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            const carouselContainers = document.querySelectorAll('.carousel-container');
            
            carouselContainers.forEach(container => {
              if (container.classList.contains('js-processed')) return;
              
              const slides = container.querySelectorAll('.carousel-slide');
              const slideCount = slides.length;
              const slideContainer = container.querySelector('.flex');
              const prevBtn = container.querySelector('.carousel-prev');
              const nextBtn = container.querySelector('.carousel-next');
              
              if (!slideContainer || !prevBtn || !nextBtn) return;
              
              let currentIndex = 0;
              
              function updateSlides() {
                const offset = -100 * currentIndex;
                slideContainer.style.transform = \`translateX(\${offset}%)\`;
                
                // Update active state
                slides.forEach((slide, index) => {
                  if (index === currentIndex) {
                    slide.setAttribute('aria-current', 'true');
                  } else {
                    slide.removeAttribute('aria-current');
                  }
                });
              }
              
              prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                updateSlides();
              });
              
              nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % slideCount;
                updateSlides();
              });
              
              // Handle keyboard navigation
              container.setAttribute('tabindex', '0');
              container.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                  prevBtn.click();
                } else if (e.key === 'ArrowRight') {
                  nextBtn.click();
                }
              });
              
              // Initial setup
              updateSlides();
              container.classList.add('js-processed');
            });
          });
        </script>
      </div>`;
    
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
