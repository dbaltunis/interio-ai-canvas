/**
 * Script to clear Shopify widgets from user's dashboard settings
 * Run this in browser console to remove enabled Shopify widgets
 */

// Get current user ID from auth
const userId = localStorage.getItem('supabase.auth.token');

if (userId) {
  const storageKey = `dashboard_widgets_${userId}`;
  const saved = localStorage.getItem(storageKey);
  
  if (saved) {
    const widgets = JSON.parse(saved);
    
    // Disable all Shopify widgets
    const updated = widgets.map((widget: any) => {
      if (widget.integrationType === 'shopify') {
        return { ...widget, enabled: false };
      }
      return widget;
    });
    
    localStorage.setItem(storageKey, JSON.stringify(updated));
    console.log('✅ Disabled Shopify widgets. Refresh the page.');
  }
}

// Also clear non-user-specific storage
const generalKey = 'dashboard_widgets';
const generalSaved = localStorage.getItem(generalKey);

if (generalSaved) {
  const widgets = JSON.parse(generalSaved);
  
  const updated = widgets.map((widget: any) => {
    if (widget.integrationType === 'shopify') {
      return { ...widget, enabled: false };
    }
    return widget;
  });
  
  localStorage.setItem(generalKey, JSON.stringify(updated));
  console.log('✅ Disabled Shopify widgets in general storage. Refresh the page.');
}
