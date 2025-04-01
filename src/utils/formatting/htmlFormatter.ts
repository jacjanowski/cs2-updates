
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
