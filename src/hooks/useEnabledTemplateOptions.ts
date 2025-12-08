import { useMemo } from "react";
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

  const isOptionEnabled = (optionId: string) => {
    // WHITELIST: Must be explicitly enabled in settings
    // If no settings exist, nothing is enabled (forces template configuration)
    if (templateSettings.length === 0) {
      return false;
    }
    return enabledOptionIds.has(optionId);
  };

  return {
    enabledOptionIds,
    isOptionEnabled,
    hasSettings: templateSettings.length > 0,
    isLoading,
  };
};
