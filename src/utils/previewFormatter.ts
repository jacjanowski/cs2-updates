
/**
 * Helper function to parse and format description content for previews
 */
export const getPreviewDescription = (description: string): string => {
  // Remove any HTML or special formatting
  const plainText = description.replace(/\[.*?\]|\*|\•|\-/g, '').replace(/\n/g, ' ');
  
  // Truncate to approximately 200 characters
  return plainText.length > 200
    ? plainText.substring(0, 200) + '...'
    : plainText;
};
