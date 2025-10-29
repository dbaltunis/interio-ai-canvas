/**
 * Format job number - shows prefix with last 4 digits only
 * Example: "JOB-17604720407774" -> "JOB-0774"
 * Example: "QT-17604720407774-v2" -> "QT-0774-v2" (preserves version)
 * Example: "QT-0001" -> "QT-0001"
 */
export const formatJobNumber = (jobNumber: string | null | undefined): string => {
  if (!jobNumber) return 'N/A';
  
  // Extract prefix (JOB-, QT-, INV-, etc.)
  const prefixMatch = jobNumber.match(/^([A-Z]+-)/i);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  
  // Extract version suffix if exists (-v2, -v3, etc.)
  const versionMatch = jobNumber.match(/(-v\d+)$/i);
  const version = versionMatch ? versionMatch[1] : '';
  
  // Remove prefix and version suffix, extract numbers only
  let numberPart = jobNumber
    .replace(/^[A-Z]+-/i, '')
    .replace(/-v\d+$/i, '')
    .replace(/[^0-9]/g, '');
  
  // Get last 4 digits
  const last4 = numberPart.slice(-4).padStart(4, '0');
  
  return `${prefix}${last4}${version}`;
};

/**
 * Get full job number (unformatted)
 */
export const getFullJobNumber = (jobNumber: string | null | undefined): string => {
  return jobNumber || 'N/A';
};
