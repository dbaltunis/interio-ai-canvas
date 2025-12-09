import { useMemo, useEffect } from "react";
import { useTemplateOptionSettings } from "./useTemplateOptionSettings";

/**
 * Hook to get enabled option IDs for a template
 * WHITELIST approach: Only options explicitly enabled in template_option_settings are shown
 * If template has no settings configured, NO options are shown (forces configuration)
 */
export const useEnabledTemplateOptions = (templateId?: string) => {
  const { data: templateSettings = [], isLoading } = useTemplateOptionSettings(templateId);

  // WHITELIST: Only explicitly enabled options are shown
  const enabledOptionIds = useMemo(() => {
    return new Set(
      templateSettings
        .filter(setting => setting.is_enabled === true)
        .map(setting => setting.treatment_option_id)
    );
  }, [templateSettings]);

  // Debug logging for options filtering
  useEffect(() => {
    if (!isLoading && templateId) {
      console.log('🔍 useEnabledTemplateOptions Debug:', {
        templateId,
        totalSettings: templateSettings.length,
        enabledCount: enabledOptionIds.size,
        enabledIds: Array.from(enabledOptionIds),
        allSettings: templateSettings.map(s => ({
          optionId: s.treatment_option_id,
          enabled: s.is_enabled
        }))
      });
    }
  }, [templateId, templateSettings, enabledOptionIds, isLoading]);

  const isOptionEnabled = (optionId: string) => {
    // WHITELIST: Must be explicitly enabled in settings
    // If no settings exist, nothing is enabled (forces template configuration)
    if (templateSettings.length === 0) {
      console.log('⚠️ isOptionEnabled: No settings exist for template, returning false for:', optionId);
      return false;
    }
    const enabled = enabledOptionIds.has(optionId);
    console.log(`🎯 isOptionEnabled(${optionId}): ${enabled}`);
    return enabled;
  };

  return {
    enabledOptionIds,
    isOptionEnabled,
    hasSettings: templateSettings.length > 0,
    isLoading,
  };
};
