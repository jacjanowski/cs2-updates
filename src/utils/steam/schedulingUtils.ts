
/**
 * Scheduling utilities for API check frequency
 */

// Check if we should fetch news based on last check time
export const shouldCheckForUpdate = (
  lastCheckedTime: number, 
  checkFrequency: 'hourly' | 'daily' | 'weekly'
): boolean => {
  if (lastCheckedTime === 0) return true;
  
  const now = Date.now();
  const timeSinceLastCheck = now - lastCheckedTime;
  
  // Convert frequency to milliseconds
  const frequencyMs = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000
  };
  
  return timeSinceLastCheck >= frequencyMs[checkFrequency];
}
