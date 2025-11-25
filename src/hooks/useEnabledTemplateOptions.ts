import { useMemo } from "react";
import { useTemplateOptionSettings } from "./useTemplateOptionSettings";

/**
 * Hook to get enabled option IDs for a template
 * If template has no settings, all options are enabled by default
 */
export const useEnabledTemplateOptions = (templateId?: string) => {
  const { data: templateSettings = [] } = useTemplateOptionSettings(templateId);

  const enabledOptionIds = useMemo(() => {
    if (!templateId || templateSettings.length === 0) {
      return null; // No filtering - all options enabled
    }

    // Only include options that are explicitly enabled
    return new Set(
      templateSettings
        .filter(setting => setting.is_enabled)
        .map(setting => setting.treatment_option_id)
    );
  }, [templateId, templateSettings]);

  const isOptionEnabled = (optionId: string) => {
    if (!enabledOptionIds) return true; // No filtering
    return enabledOptionIds.has(optionId);
  };

  return {
    enabledOptionIds,
    isOptionEnabled,
    hasSettings: templateSettings.length > 0,
  };
};
