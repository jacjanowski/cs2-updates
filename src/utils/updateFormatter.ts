
/**
 * Utility functions for formatting update content
 * This file aggregates and re-exports formatting utilities from specialized modules
 */

// Import specialized formatters
import { formatDescription } from './formatting/tagFormatter';
import { extractImagesFromContent } from './formatting/mediaExtractor';
import { fixHtmlTags } from './formatting/htmlFormatter';

// Re-export the utilities
export {
  formatDescription,
  extractImagesFromContent,
  fixHtmlTags
};
