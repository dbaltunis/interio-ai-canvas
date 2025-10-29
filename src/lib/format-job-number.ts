/**
 * Format job number to show only last 4 digits
 * Example: "JOB-17604720407774" -> "0774"
 * Example: "QT-17604720407774" -> "0774"
 * Example: "17604720407774" -> "0774"
 * Example: "QT-0001-v2" -> "0001"
 */
export const formatJobNumber = (jobNumber: string | null | undefined): string => {
  if (!jobNumber) return 'N/A';
  
  // Remove common prefixes (JOB-, QT-, J-, etc.) and version suffixes (-v2, -v3, etc.)
  let cleanedNumber = jobNumber
    .replace(/^(JOB-|QT-|J-)/i, '') // Remove prefix
    .replace(/-v\d+$/i, ''); // Remove version suffix like -v2, -v3
  
  // Extract just the numeric part if there are multiple segments
  if (cleanedNumber.includes('-')) {
    const parts = cleanedNumber.split('-');
    // Get the first numeric segment (the actual quote/job number)
    cleanedNumber = parts.find(p => /\d/.test(p)) || cleanedNumber;
  }
  
  // Return last 4 digits
  return cleanedNumber.slice(-4).padStart(4, '0');
};

/**
 * Get full job number (unformatted)
 */
export const getFullJobNumber = (jobNumber: string | null | undefined): string => {
  return jobNumber || 'N/A';
};
