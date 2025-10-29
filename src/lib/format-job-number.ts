/**
 * Format job number - returns the full job number with prefix
 * Example: "JOB-0001" -> "JOB-0001"
 * Example: "QT-0002" -> "QT-0002"
 */
export const formatJobNumber = (jobNumber: string | null | undefined): string => {
  if (!jobNumber) return 'N/A';
  return jobNumber;
};

/**
 * Get full job number (unformatted)
 */
export const getFullJobNumber = (jobNumber: string | null | undefined): string => {
  return jobNumber || 'N/A';
};
