/**
 * Utility to disable Shopify widgets in dashboard settings
 * This clears enabled Shopify widgets from localStorage
 */
export const disableShopifyWidgets = () => {
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Find dashboard widget keys
    const widgetKeys = keys.filter(key => 
      key === 'dashboard_widgets' || key.startsWith('dashboard_widgets_')
    );
    
    widgetKeys.forEach(key => {
      const saved = localStorage.getItem(key);
      if (!saved) return;
      
      try {
        const widgets = JSON.parse(saved);
        
        // Disable all Shopify widgets
        const updated = widgets.map((widget: any) => {
          if (widget.integrationType === 'shopify' && widget.enabled) {
            console.log(`Disabling Shopify widget: ${widget.name}`);
            return { ...widget, enabled: false };
          }
          return widget;
        });
        
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.error(`Error processing ${key}:`, e);
      }
    });
    
    console.log('✅ Disabled all Shopify widgets. Please refresh the page.');
    return true;
  } catch (error) {
    console.error('Error disabling Shopify widgets:', error);
    return false;
  }
};

// Auto-run on import during development
if (typeof window !== 'undefined') {
  (window as any).disableShopifyWidgets = disableShopifyWidgets;
}
