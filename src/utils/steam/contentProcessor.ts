
/**
 * Content processing utilities for Steam API data
 */

// Process HTML content to extract structured information
export const processHtmlContent = (htmlContent: string): string => {
  if (!htmlContent) return '';
  
  // Replace HTML line breaks with newlines
  let content = htmlContent.replace(/<br\s*\/?>/gi, '\n');
  
  // Replace HTML lists with formatted bullet points
  content = content.replace(/<ul>(.*?)<\/ul>/gis, (match, listContent) => {
    // Extract list items and format them with bullet points
    const items = listContent.match(/<li>(.*?)<\/li>/gis) || [];
    return items
      .map(item => '• ' + item.replace(/<li>(.*?)<\/li>/i, '$1'))
      .join('\n');
  });
  
  // Remove remaining HTML tags
  content = content.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Clean up extra whitespace
  content = content.replace(/\n\s*\n/g, '\n\n');
  
  return content.trim();
}

// Look for image URLs embedded in the body content
export const extractImageFromBody = (body: string): string | undefined => {
  if (!body) return undefined;
  
  // Look for img tags in the body
  const imgMatch = body.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  // Try to find images in custom formats like [img]{URL}
  const customImgMatch = body.match(/\[img\]\{([^}]+)\}/i);
  if (customImgMatch && customImgMatch[1]) {
    return customImgMatch[1];
  }
  
  return undefined;
}
