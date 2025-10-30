/**
 * Shared Quote Style Configuration
 * This ensures consistent styling between preview, PDF, and print
 */

import { StyleSheet } from '@react-pdf/renderer';

// Typography scale
export const typography = {
  h1: { fontSize: 24, fontWeight: 'bold' as const },
  h2: { fontSize: 20, fontWeight: 'bold' as const },
  h3: { fontSize: 16, fontWeight: 'bold' as const },
  h4: { fontSize: 14, fontWeight: 'bold' as const },
  body: { fontSize: 10 },
  small: { fontSize: 9 },
  tiny: { fontSize: 8 },
};

// Color palette
export const colors = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  text: '#1e293b',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  background: '#ffffff',
  backgroundLight: '#f8fafc',
  success: '#10b981',
  error: '#ef4444',
};

// Spacing values (in points for PDF, can be converted to px for CSS)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

// PDF-specific styles using @react-pdf/renderer
export const pdfStyles = StyleSheet.create({
  // Page
  page: {
    padding: 40,
    fontSize: typography.body.fontSize,
    fontFamily: 'Helvetica',
    backgroundColor: colors.background,
    color: colors.text,
  },
  
  // Typography
  h1: {
    ...typography.h1,
    marginBottom: spacing.md,
    color: colors.text,
  },
  h2: {
    ...typography.h2,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  h3: {
    ...typography.h3,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  h4: {
    ...typography.h4,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  body: {
    ...typography.body,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  small: {
    ...typography.small,
    color: colors.textMuted,
  },
  
  // Layout sections
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottom: `2px solid ${colors.border}`,
  },
  
  // Header styles
  headerCentered: {
    marginBottom: spacing.xxl,
    textAlign: 'center' as const,
  },
  headerLeftRight: {
    marginBottom: spacing.xxl,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain' as const,
    marginBottom: spacing.md,
  },
  
  // Client info
  metadataRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingTop: spacing.lg,
    marginTop: spacing.lg,
    borderTop: `1px solid ${colors.border}`,
  },
  clientSection: {
    flex: 1,
  },
  quoteDetailsSection: {
    textAlign: 'right' as const,
  },
  sectionLabel: {
    fontSize: typography.tiny.fontSize,
    textTransform: 'uppercase' as const,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontWeight: 'bold' as const,
  },
  
  // Table styles
  table: {
    width: '100%' as const,
  },
  tableHeader: {
    flexDirection: 'row' as const,
    backgroundColor: colors.backgroundLight,
    padding: spacing.sm,
    borderBottom: `2px solid ${colors.border}`,
    fontWeight: 'bold' as const,
  },
  tableRow: {
    flexDirection: 'row' as const,
    padding: spacing.sm,
    borderBottom: `1px solid ${colors.border}`,
  },
  tableCol1: { width: '8%' as const },
  tableCol2: { width: '50%' as const },
  tableCol3: { width: '12%' as const },
  tableCol4: { width: '15%' as const },
  tableCol5: { width: '15%' as const, textAlign: 'right' as const },
  
  // Totals
  totalsSection: {
    marginTop: spacing.lg,
    marginLeft: 'auto' as const,
    width: '50%' as const,
  },
  totalRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    padding: spacing.sm,
    borderBottom: `1px solid ${colors.border}`,
  },
  totalRowFinal: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    padding: spacing.md,
    backgroundColor: colors.backgroundLight,
    fontWeight: 'bold' as const,
    fontSize: typography.h4.fontSize,
    marginTop: spacing.xs,
  },
  
  // Images
  image: {
    width: 50,
    height: 50,
    objectFit: 'cover' as const,
    borderRadius: 4,
  },
  imageSmall: {
    width: 30,
    height: 30,
    objectFit: 'cover' as const,
    borderRadius: 4,
  },
  imageLarge: {
    maxWidth: '100%' as const,
    maxHeight: 400,
    objectFit: 'contain' as const,
    marginVertical: spacing.lg,
  },
  
  // Signature
  signatureSection: {
    marginTop: spacing.xxl,
    paddingTop: spacing.xxl,
    borderTop: `1px solid ${colors.border}`,
  },
  signatureRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: spacing.lg,
  },
  signatureBox: {
    width: '45%' as const,
  },
  signatureLine: {
    borderTop: `1px solid ${colors.text}`,
    marginTop: 40,
    paddingTop: spacing.xs,
  },
  
  // Footer
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center' as const,
    fontSize: typography.tiny.fontSize,
    color: colors.textMuted,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: spacing.sm,
  },
  
  // Divider
  divider: {
    borderBottom: `1px solid ${colors.border}`,
    marginVertical: spacing.md,
  },
  dividerThick: {
    borderBottom: `2px solid ${colors.text}`,
    marginVertical: spacing.lg,
  },
  
  // Spacer
  spacer: {
    height: spacing.md,
  },
  spacerLarge: {
    height: spacing.xl,
  },
});

// CSS classes for preview/print (matching PDF styles)
export const cssClasses = {
  page: 'bg-white text-[#1e293b] p-10 font-sans text-[10pt]',
  h1: 'text-2xl font-bold mb-3 text-[#1e293b]',
  h2: 'text-xl font-bold mb-2 text-[#1e293b]',
  h3: 'text-base font-bold mb-2 text-[#1e293b]',
  h4: 'text-sm font-bold mb-1 text-[#1e293b]',
  body: 'text-[10pt] mb-1 text-[#1e293b]',
  small: 'text-[9pt] text-[#64748b]',
  section: 'mb-8',
  sectionTitle: 'text-base font-bold mb-3 pb-1 border-b-2 border-[#e2e8f0]',
  metadataRow: 'flex justify-between pt-4 mt-4 border-t border-[#e2e8f0]',
  table: 'w-full',
  tableHeader: 'flex bg-[#f8fafc] p-2 border-b-2 border-[#e2e8f0] font-bold',
  tableRow: 'flex p-2 border-b border-[#e2e8f0]',
  totalsSection: 'mt-4 ml-auto w-1/2',
  totalRow: 'flex justify-between p-2 border-b border-[#e2e8f0]',
  totalRowFinal: 'flex justify-between p-3 bg-[#f8fafc] font-bold text-sm mt-1',
  divider: 'border-b border-[#e2e8f0] my-3',
  spacer: 'h-3',
};
