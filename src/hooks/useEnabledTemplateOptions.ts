import { useMemo } from "react";
import { useTemplateOptionSettings } from "./useTemplateOptionSettings";

/**
 * Hook to get enabled option IDs for a template
 * If template has no settings, all options are enabled by default
 */
export const useEnabledTemplateOptions = (templateId?: string) => {
  const { data: templateSettings = [] } = useTemplateOptionSettings(templateId);

  // Blacklist approach: only store explicitly disabled options
  // Options without records are enabled by default
  const disabledOptionIds = useMemo(() => {
    return new Set(
      templateSettings
        .filter(setting => !setting.is_enabled)
        .map(setting => setting.treatment_option_id)
    );
  }, [templateSettings]);

  const isOptionEnabled = (optionId: string) => {
    // If NOT in disabled set, it's enabled
    return !disabledOptionIds.has(optionId);
  };

  return {
    disabledOptionIds,
    isOptionEnabled,
    hasSettings: templateSettings.length > 0,
  };
};
