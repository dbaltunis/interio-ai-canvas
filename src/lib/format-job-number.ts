/**
 * Format job number - shows the full number as-is
 * Industry standard: Always show full document numbers for clarity and auditability
 * Example: "JOB-0089" -> "JOB-0089"
 * Example: "INV-0001" -> "INV-0001"
 * Example: "QT-0012-v2" -> "QT-0012-v2" (preserves version)
 */
export const formatJobNumber = (jobNumber: string | null | undefined): string => {
  if (!jobNumber) return 'N/A';
  
  // Return the full number as-is - no truncation
  // This follows industry standards (QuickBooks, Xero) where document numbers
  // are always displayed in full for clarity and trust
  return jobNumber;
};

/**
 * Get full job number (unformatted) - same as formatJobNumber now
 */
export const getFullJobNumber = (jobNumber: string | null | undefined): string => {
  return jobNumber || 'N/A';
};
