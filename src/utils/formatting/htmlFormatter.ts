
/**
 * Utility functions for fixing and formatting HTML content
 */

/**
 * Ensures HTML tags are properly closed and nested
 */
export function fixHtmlTags(html: string): string {
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

/**
 * Formats HTML content for display
 */
export function formatHtmlContent(html: string): string {
  if (!html) return '';
  
  // First, fix any HTML tag issues
  let formatted = fixHtmlTags(html);
  
  // Replace Steam BBCode-style tags with HTML
  // Bold text
  formatted = formatted.replace(/\[b\](.*?)\[\/b\]/g, '<strong>$1</strong>');
  
  // Italic text
  formatted = formatted.replace(/\[i\](.*?)\[\/i\]/g, '<em>$1</em>');
  
  // Underlined text
  formatted = formatted.replace(/\[u\](.*?)\[\/u\]/g, '<span style="text-decoration: underline;">$1</span>');
  
  // Links
  formatted = formatted.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="inline-link">$2</a>');
  formatted = formatted.replace(/\[url\](.*?)\[\/url\]/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="inline-link">$1</a>');
  
  // Handle lists
  formatted = formatted.replace(/\[list\](.*?)\[\/list\]/gs, '<ul>$1</ul>');
  formatted = formatted.replace(/\[\*\](.*?)(?=\[\*\]|\[\/list\])/g, '<li>$1</li>');
  
  // Convert simple line breaks to paragraphs for better readability
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = `<p>${formatted}</p>`;
  formatted = formatted.replace(/<p><\/p>/g, '');
  
  return formatted;
}
