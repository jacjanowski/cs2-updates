
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
    return `<div class="section-header">[${content}]</div>`;
  });
  
  // Process any orphaned or remaining [*] bullet points
  formattedText = formattedText.replace(/\[\*\](.*?)(?=$|\n)/g, '<li>$1</li>');
  
  // Clean up any broken HTML tags
  formattedText = fixHtmlTags(formattedText);
  
  return formattedText;
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
