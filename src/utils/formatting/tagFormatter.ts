
/**
 * Utility functions for formatting specific content tags
 */

// Import the fixHtmlTags function
import { fixHtmlTags } from './htmlFormatter';

/**
 * Formats the description text with BBCode into structured HTML
 */
export const formatDescription = (description: string): string => {
  if (!description) return '';
  
  // First, normalize line breaks
  let formattedText = description.replace(/\r\n/g, '\n');
  
  // Handle BBCode video tags
  formattedText = formattedText.replace(/\[video(?:=([^\]]+))?\](.*?)\[\/video\]/gs, (match, attributes, content) => {
    // Extract video attributes if present
    const mp4Match = attributes ? attributes.match(/mp4=([^ ]+)/) : null;
    const webmMatch = attributes ? attributes.match(/webm=([^ ]+)/) : null;
    const posterMatch = attributes ? attributes.match(/poster=([^ ]+)/) : null;
    const autoplayMatch = attributes ? attributes.match(/autoplay=(true|false)/) : null;
    const controlsMatch = attributes ? attributes.match(/controls=(true|false)/) : null;
    
    const mp4Src = mp4Match ? mp4Match[1] : '';
    const webmSrc = webmMatch ? webmMatch[1] : '';
    const poster = posterMatch ? posterMatch[1] : '';
    const autoplay = autoplayMatch ? autoplayMatch[1] === 'true' : false;
    const controls = controlsMatch ? controlsMatch[1] === 'true' : true;
    
    // Use content as source if no specific format provided
    const sourceSrc = content.trim() || mp4Src || webmSrc;
    
    if (sourceSrc) {
      let videoHtml = `
        <div class="video-container">
          <video 
            ${controls ? 'controls' : ''}
            ${autoplay ? 'autoplay muted loop playsinline' : ''}
            ${poster ? `poster="${poster}"` : ''}
            class="w-full"
            preload="auto"
          >`;
          
      if (mp4Src || (sourceSrc && !webmSrc)) {
        videoHtml += `
            <source src="${mp4Src || sourceSrc}" type="video/mp4">`;
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
  
  // Handle BBCode URL tags [url=http://example.com]text[/url]
  formattedText = formattedText.replace(/\[url=([^\]]+)\](.*?)\[\/url\]/gs, (match, url, linkText) => {
    const cleanedText = linkText.trim().replace(/\n/g, ' ');
    return `<a href="${url}" class="inline-link" target="_blank" rel="noopener noreferrer">${cleanedText}</a>`;
  });
  
  // Handle BBCode italics with [i]text[/i]
  formattedText = formattedText.replace(/\[i\](.*?)\[\/i\]/gs, '<em>$1</em>');
  
  // Handle BBCode bold with [b]text[/b]
  formattedText = formattedText.replace(/\[b\](.*?)\[\/b\]/gs, '<strong>$1</strong>');
  
  // Handle BBCode carousel with custom implementation using shadcn/ui carousel
  formattedText = formattedText.replace(/\[carousel\]([\s\S]*?)\[\/carousel\]/g, (match, content) => {
    // Extract all img tags from the carousel content using BBCode syntax
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
        <div class="embla">
          <div class="embla__viewport">
            <div class="embla__container">`;
    
    // Add each image as a slide
    images.forEach((imgSrc) => {
      carouselHtml += `
              <div class="embla__slide">
                <div class="embla__slide__inner">
                  <img src="${imgSrc}" alt="Carousel image" />
                </div>
              </div>`;
    });
    
    // Close the carousel structure and add buttons
    carouselHtml += `
            </div>
          </div>
          <button class="embla__prev embla-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            <span class="sr-only">Previous</span>
          </button>
          <button class="embla__next embla-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            <span class="sr-only">Next</span>
          </button>
        </div>
      </div>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const carouselContainers = document.querySelectorAll('.embla');
          
          carouselContainers.forEach(container => {
            const viewport = container.querySelector('.embla__viewport');
            const slides = container.querySelectorAll('.embla__slide');
            const prevBtn = container.querySelector('.embla__prev');
            const nextBtn = container.querySelector('.embla__next');
            
            if (!viewport || slides.length === 0) return;
            
            let currentIndex = 0;
            const slideCount = slides.length;
            
            const updateSlides = () => {
              slides.forEach((slide, index) => {
                if (index === currentIndex) {
                  slide.classList.add('is-selected');
                } else {
                  slide.classList.remove('is-selected');
                }
                
                slide.style.transform = \`translateX(\${100 * (index - currentIndex)}%)\`;
              });
            };
            
            // Initialize
            updateSlides();
            
            // Add event listeners
            if (prevBtn) {
              prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                updateSlides();
              });
            }
            
            if (nextBtn) {
              nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % slideCount;
                updateSlides();
              });
            }
          });
        });
      </script>`;
    
    return carouselHtml;
  });
  
  // Handle BBCode heading tags [h1]text[/h1], [h2]text[/h2], etc.
  formattedText = formattedText.replace(/\[h([1-6])\](.*?)\[\/h\1\]/g, (match, level, content) => {
    return `<h${level} class="font-bold my-3 text-${4-Math.min(parseInt(level), 3)}xl">${content}</h${level}>`;
  });
  
  // Handle BBCode list tags [list][*]item1[*]item2[/list]
  formattedText = formattedText.replace(/\[list\]([\s\S]*?)\[\/list\]/gi, (match, content) => {
    const listItems = content.split(/\[\*\]/).filter(item => item.trim());
    if (listItems.length === 0) return match;
    
    let listHtml = '<ul class="my-4">';
    listItems.forEach(item => {
      listHtml += `<li>${item.trim()}</li>`;
    });
    listHtml += '</ul>';
    
    return listHtml;
  });
  
  // Handle BBCode ordered list [ol][*]item1[*]item2[/ol]
  formattedText = formattedText.replace(/\[ol\]([\s\S]*?)\[\/ol\]/gi, (match, content) => {
    const listItems = content.split(/\[\*\]/).filter(item => item.trim());
    if (listItems.length === 0) return match;
    
    let listHtml = '<ol class="my-4 list-decimal pl-5">';
    listItems.forEach(item => {
      listHtml += `<li>${item.trim()}</li>`;
    });
    listHtml += '</ol>';
    
    return listHtml;
  });
  
  // Handle BBCode img tags [img]url[/img]
  formattedText = formattedText.replace(/\[img\](.*?)\[\/img\]/g, (match, imageUrl) => {
    return `<img src="${imageUrl.trim()}" class="w-full max-h-[400px] object-contain my-4" alt="Update image" />`;
  });
  
  // Handle BBCode quote [quote]text[/quote]
  formattedText = formattedText.replace(/\[quote\](.*?)\[\/quote\]/gs, (match, content) => {
    return `<blockquote class="border-l-4 border-primary/30 pl-4 italic my-4">${content.trim()}</blockquote>`;
  });
  
  // Handle BBCode code [code]text[/code]
  formattedText = formattedText.replace(/\[code\](.*?)\[\/code\]/gs, (match, content) => {
    return `<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code>${content.trim()}</code></pre>`;
  });
  
  // Clean up any broken HTML tags
  formattedText = fixHtmlTags(formattedText);
  
  return formattedText;
};
