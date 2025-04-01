
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
  
  // Handle carousel tag - Use Shadcn UI carousel component
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
    
    // Create a proper carousel using Shadcn UI carousel markup
    let carouselHtml = `
      <div class="carousel-container my-6">
        <div class="relative w-full overflow-hidden rounded-lg">
          <div class="embla">
            <div class="embla__container">`;
    
    // Add each image as a slide
    images.forEach(imgSrc => {
      carouselHtml += `
              <div class="embla__slide min-w-0 flex-[0_0_100%]">
                <img src="${imgSrc}" class="w-full object-contain max-h-[400px]" alt="Carousel image" />
              </div>`;
    });
    
    // Close container
    carouselHtml += `
            </div>
          </div>
          
          <button class="embla__prev absolute left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m15 18-6-6 6-6"/></svg>
            <span class="sr-only">Previous slide</span>
          </button>
          
          <button class="embla__next absolute right-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md hover:bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m9 18 6-6-6-6"/></svg>
            <span class="sr-only">Next slide</span>
          </button>
        </div>
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const emblaNodes = document.querySelectorAll('.embla');
          
          emblaNodes.forEach(emblaNode => {
            // Don't initialize twice
            if (emblaNode.classList.contains('initialized')) return;
            
            const container = emblaNode.querySelector('.embla__container');
            const prevBtn = emblaNode.parentElement.querySelector('.embla__prev');
            const nextBtn = emblaNode.parentElement.querySelector('.embla__next');
            
            if (!container || !prevBtn || !nextBtn) return;
            
            // Add sliding functionality
            let currentIndex = 0;
            const slides = container.querySelectorAll('.embla__slide');
            const slideCount = slides.length;
            
            if (slideCount <= 1) {
              // Hide navigation if only one slide
              prevBtn.style.display = 'none';
              nextBtn.style.display = 'none';
              return;
            }
            
            const updateSlides = () => {
              slides.forEach((slide, index) => {
                slide.style.transform = \`translateX(\${(index - currentIndex) * 100}%)\`;
              });
              
              // Update button states
              prevBtn.style.opacity = currentIndex <= 0 ? '0.5' : '1';
              nextBtn.style.opacity = currentIndex >= slideCount - 1 ? '0.5' : '1';
            };
            
            // Initial position
            updateSlides();
            
            // Add click handlers
            prevBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              if (currentIndex > 0) {
                currentIndex--;
                updateSlides();
              }
            });
            
            nextBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              if (currentIndex < slideCount - 1) {
                currentIndex++;
                updateSlides();
              }
            });
            
            // Mark as initialized
            emblaNode.classList.add('initialized');
          });
        });
      </script>`;
    
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
