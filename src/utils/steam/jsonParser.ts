
/**
 * Utilities for parsing JSON data from Steam API
 */

// Parse JSON data for image URL
export const parseJsonData = (jsonDataString: string): string | undefined => {
  if (!jsonDataString) return undefined;
  
  try {
    // First try to parse the JSON string properly
    let jsonData;
    try {
      jsonData = JSON.parse(jsonDataString);
    } catch (e) {
      // If parsing fails, use regex as fallback
      console.log("Falling back to regex for JSON parsing");
    }

    // If we successfully parsed the JSON
    if (jsonData) {
      // Try to get the image from the parsed JSON structure
      if (jsonData.localized_capsule_image && jsonData.localized_capsule_image.length > 0) {
        return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${jsonData.localized_capsule_image[0]}`;
      } else if (jsonData.localized_title_image && jsonData.localized_title_image.length > 0) {
        return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${jsonData.localized_title_image[0]}`;
      }
    }

    // Fallback to regex matching if JSON parsing didn't work or images weren't found
    const imagePathMatch = jsonDataString.match(/"localized_capsule_image":\s*\[\s*"([^"]+)"/);
    const titleImageMatch = jsonDataString.match(/"localized_title_image":\s*\[\s*"([^"]+)"/);
    
    // Use capsule image first, fall back to title image
    if (imagePathMatch && imagePathMatch[1]) {
      return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${imagePathMatch[1]}`;
    } else if (titleImageMatch && titleImageMatch[1]) {
      return `https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/clanevent/${titleImageMatch[1]}`;
    }
    
    // Try matching header image as last resort
    const headerImageMatch = jsonDataString.match(/"header_image":\s*"([^"]+)"/);
    if (headerImageMatch && headerImageMatch[1]) {
      return headerImageMatch[1]; // This might already be a full URL
    }

    console.log("No image found in JSON data");
    return undefined;
  } catch (error) {
    console.error("Error parsing JSON data:", error);
    return undefined;
  }
}
