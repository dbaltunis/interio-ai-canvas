/**
 * Format job number to display full number
 * Example: "JOB-17604720407774" -> "JOB-17604720407774"
 * Example: "17604720407774" -> "17604720407774"
 * Example: "J-1234567890" -> "J-1234567890"
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
