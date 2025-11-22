import { supabase } from "@/integrations/supabase/client";

/**
 * Maps category to SKU prefix
 */
const getCategoryPrefix = (category: string): string => {
  const cat = category?.toLowerCase() || '';
  
  if (cat.includes('fabric') || cat.includes('curtain') || cat.includes('blind') || cat.includes('sheer')) {
    return 'FAB';
  }
  if (cat.includes('hardware') || cat.includes('track') || cat.includes('rod') || cat.includes('bracket') || cat.includes('motor')) {
    return 'HW';
  }
  if (cat.includes('wallcovering') || cat.includes('wallpaper') || cat.includes('wall')) {
    return 'WALL';
  }
  if (cat.includes('trim') || cat.includes('accessory')) {
    return 'TRIM';
  }
  
  return 'PROD';
};

/**
 * Generates unique SKU in format: {PREFIX}-{YYYYMM}-{SEQUENCE}
 * Example: FAB-202511-001, HW-202511-042
 */
export const generateSKU = async (
  category: string,
  userId: string
): Promise<string> => {
  try {
    const prefix = getCategoryPrefix(category);
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const searchPattern = `${prefix}-${yearMonth}-%`;
    
    // Query existing SKUs with same prefix and month
    const { data, error } = await supabase
      .from('enhanced_inventory_items')
      .select('sku')
      .eq('user_id', userId)
      .like('sku', searchPattern)
      .order('sku', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error querying SKUs:', error);
      // Fallback to timestamp-based SKU
      return `${prefix}-${Date.now()}`;
    }
    
    let sequence = 1;
    
    if (data && data.length > 0 && data[0].sku) {
      // Extract sequence number from last SKU
      const lastSku = data[0].sku;
      const parts = lastSku.split('-');
      if (parts.length === 3) {
        const lastSequence = parseInt(parts[2], 10);
        if (!isNaN(lastSequence)) {
          sequence = lastSequence + 1;
        }
      }
    }
    
    // Format: PREFIX-YYYYMM-SEQUENCE (padded to 3 digits)
    const sequenceStr = String(sequence).padStart(3, '0');
    return `${prefix}-${yearMonth}-${sequenceStr}`;
    
  } catch (error) {
    console.error('SKU generation failed:', error);
    // Fallback to timestamp-based SKU
    const prefix = getCategoryPrefix(category);
    return `${prefix}-${Date.now()}`;
  }
};
