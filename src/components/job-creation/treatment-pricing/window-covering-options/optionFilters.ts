
export const createOptionFilter = (selectedOptions: string[], hierarchicalSelections: Record<string, string>) => {
  // Check if motorised option is selected
  const isMotorisedSelected = (options: any[]) => {
    return options.some(option => 
      selectedOptions.includes(option.id) && 
      option.name.toLowerCase().includes('motorised')
    ) || Object.values(hierarchicalSelections).some(selection => 
      selection.toLowerCase().includes('motorised')
    );
  };

  // Filter options based on conditions
  const getFilteredOptions = (typeOptions: any[]) => {
    return typeOptions.filter(option => {
      // If this is a "remote" option, only show it when motorised is selected
      if (option.name.toLowerCase().includes('remote')) {
        return isMotorisedSelected(typeOptions);
      }
      return true;
    });
  };

  return { isMotorisedSelected, getFilteredOptions };
};
