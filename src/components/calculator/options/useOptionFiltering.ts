
import { type WindowCoveringOption } from "@/hooks/useWindowCoveringOptions";

export const useOptionFiltering = (availableOptions: WindowCoveringOption[], selectedOptions: string[]) => {
  // Check if motorised option is selected
  const isMotorisedSelected = () => {
    return availableOptions.some(option => 
      selectedOptions.includes(option.id) && 
      option.name.toLowerCase().includes('motorised')
    );
  };

  // Filter options based on conditions
  const getFilteredOptions = (options: WindowCoveringOption[]) => {
    return options.filter(option => {
      // If this is a "remote" option, only show it when motorised is selected
      if (option.name.toLowerCase().includes('remote')) {
        return isMotorisedSelected();
      }
      return true;
    });
  };

  return { isMotorisedSelected, getFilteredOptions };
};
