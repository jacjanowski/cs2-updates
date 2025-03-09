
/**
 * Utility functions for formatting update content
 */

/**
 * Formats the description text into structured HTML
 */
export const formatDescription = (description: string): string => {
  if (!description) return '';
  
  const lines = description.split('\n');
  let htmlOutput = '';
  let inList = false;
  let currentListType = '';
  let indentLevel = 0;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return; // Skip empty lines
    
    // Check for section headers like [MAPS], [MISC]
    if (/^\[(.*)\]$/.test(trimmedLine)) {
      // Close any open list
      if (inList) {
        htmlOutput += '</ul>';
        inList = false;
        indentLevel = 0;
      }
      
      const sectionName = trimmedLine.match(/^\[(.*)\]$/)?.[1] || '';
      htmlOutput += `<div class="section-header">[${sectionName}]</div>`;
    }
    // Check for explicit list tags
    else if (trimmedLine.toLowerCase() === '[list]') {
      htmlOutput += '<ol>';
      inList = true;
      currentListType = 'ol';
    }
    else if (trimmedLine.toLowerCase() === '[/list]') {
      if (inList && currentListType === 'ol') {
        htmlOutput += '</ol>';
        inList = false;
      }
    }
    else if (trimmedLine.toLowerCase() === '[ul]') {
      htmlOutput += '<ul>';
      inList = true;
      currentListType = 'ul';
    }
    else if (trimmedLine.toLowerCase() === '[/ul]') {
      if (inList && currentListType === 'ul') {
        htmlOutput += '</ul>';
        inList = false;
      }
    }
    // Check for bullet points at the start of a line (* or - or •)
    else if (/^[•\-*]\s/.test(trimmedLine)) {
      const lineContent = trimmedLine.replace(/^[•\-*]\s/, '');
      
      // Check if we're not already in a list
      if (!inList) {
        htmlOutput += '<ul>';
        inList = true;
        currentListType = 'ul';
        indentLevel = 0;
      }
      
      // If we were in a nested list at a deeper level, close the deeper lists
      if (indentLevel > 0) {
        for (let i = 0; i < indentLevel; i++) {
          htmlOutput += '</ul>';
        }
        indentLevel = 0;
      }
      
      htmlOutput += `<li>${lineContent}`;
      
      // Check if the next line is a sub-bullet
      const nextLineIndex = lines.indexOf(line) + 1;
      if (nextLineIndex < lines.length && /^\s+[•\-*○]\s/.test(lines[nextLineIndex].trim())) {
        htmlOutput += '<ul>';
        indentLevel++;
      } else {
        htmlOutput += '</li>';
      }
    }
    // Check for indented sub-bullets (circles in the image)
    else if (/^\s+[•\-*○]\s/.test(trimmedLine)) {
      const lineContent = trimmedLine.replace(/^\s+[•\-*○]\s/, '');
      
      if (!inList) {
        // This shouldn't happen, but just in case
        htmlOutput += '<ul><li><ul>';
        inList = true;
        currentListType = 'ul';
        indentLevel = 1;
      }
      
      htmlOutput += `<li>${lineContent}</li>`;
      
      // Check if the next line is not a sub-bullet (to close the sublist)
      const nextLineIndex = lines.indexOf(line) + 1;
      if (nextLineIndex >= lines.length || !/^\s+[•\-*○]\s/.test(lines[nextLineIndex].trim())) {
        htmlOutput += '</ul></li>';
        indentLevel--;
      }
    }
    // Regular text
    else {
      // Close any open list
      if (inList) {
        // Close nested lists if any
        for (let i = 0; i <= indentLevel; i++) {
          htmlOutput += '</ul>';
        }
        inList = false;
        indentLevel = 0;
      }
      htmlOutput += `<p>${trimmedLine}</p>`;
    }
  });
  
  // Close any open list at the end
  if (inList) {
    for (let i = 0; i <= indentLevel; i++) {
      htmlOutput += currentListType === 'ul' ? '</ul>' : '</ol>';
    }
  }
  
  return htmlOutput;
};
