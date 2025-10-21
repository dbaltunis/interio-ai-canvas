/**
 * Format job number to show only last 4 digits
 * Example: "JOB-17604720407774" -> "JOB-0774"
 * Example: "17604720407774" -> "0774"
 * Example: "J-1234567890" -> "J-7890"
 */
export const formatJobNumber = (jobNumber: string | null | undefined): string => {
  if (!jobNumber) return 'N/A';
  
  // If job number contains a hyphen, preserve the prefix
  if (jobNumber.includes('-')) {
    const parts = jobNumber.split('-');
    const prefix = parts[0];
    const number = parts[parts.length - 1];
    const last4 = number.slice(-4);
    return `${prefix}-${last4}`;
  }
  
  // Otherwise just return last 4 digits
  return jobNumber.slice(-4);
};

/**
 * Get full job number (unformatted)
 */
export const getFullJobNumber = (jobNumber: string | null | undefined): string => {
  return jobNumber || 'N/A';
};
