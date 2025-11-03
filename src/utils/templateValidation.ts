/**
 * Template validation utilities to ensure complete configuration
 */

export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingConfigurations: string[];
}

/**
 * Validates that a treatment template is properly configured
 */
export const validateTreatmentTemplate = (template: any): TemplateValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingConfigurations: string[] = [];

  if (!template) {
    return {
      isValid: false,
      errors: ['No template provided'],
      warnings: [],
      missingConfigurations: ['template']
    };
  }

  // Check basic information
  if (!template.name || template.name.trim() === '') {
    errors.push('Template name is missing');
  }

  if (!template.category) {
    warnings.push('Template category is not set');
  }

  // Check pricing configuration
  if (!template.pricing_type) {
    errors.push('Pricing type is not configured');
    missingConfigurations.push('pricing_type');
  } else {
    // Validate based on pricing type
    switch (template.pricing_type) {
      case 'per_metre':
        if (!template.machine_price_per_metre || template.machine_price_per_metre <= 0) {
          errors.push('Machine price per metre is missing or zero');
          missingConfigurations.push('machine_price_per_metre');
        }
        if (template.offers_hand_finished && 
            (!template.hand_price_per_metre || template.hand_price_per_metre <= 0)) {
          warnings.push('Hand-finished price per metre is missing');
        }
        break;

      case 'per_drop':
        if (!template.machine_price_per_drop || template.machine_price_per_drop <= 0) {
          errors.push('Machine price per drop is missing or zero');
          missingConfigurations.push('machine_price_per_drop');
        }
        break;

      case 'per_panel':
        if (!template.machine_price_per_panel || template.machine_price_per_panel <= 0) {
          errors.push('Machine price per panel is missing or zero');
          missingConfigurations.push('machine_price_per_panel');
        }
        break;

      case 'complexity_based':
        // Check if complexity pricing is configured
        if (!template.complexity_factors || Object.keys(template.complexity_factors).length === 0) {
          warnings.push('Complexity factors are not configured');
          missingConfigurations.push('complexity_factors');
        }
        break;

      case 'pricing_grid':
        if (!template.pricing_grid_url && !template.pricing_grid_data) {
          errors.push('Pricing grid is not uploaded');
          missingConfigurations.push('pricing_grid');
        }
        break;
    }
  }

  // Check pricing methods if they exist
  if (template.pricing_methods && Array.isArray(template.pricing_methods)) {
    if (template.pricing_methods.length === 0) {
      warnings.push('No pricing methods configured');
    } else {
      template.pricing_methods.forEach((method: any, index: number) => {
        if (!method.name || method.name.trim() === '') {
          warnings.push(`Pricing method ${index + 1} has no name`);
        }
        
        // Check if method has at least one price set
        const hasPrices = 
          (method.machine_price_per_metre && method.machine_price_per_metre > 0) ||
          (method.machine_price_per_drop && method.machine_price_per_drop > 0) ||
          (method.machine_price_per_panel && method.machine_price_per_panel > 0);
        
        if (!hasPrices) {
          warnings.push(`Pricing method "${method.name}" has no prices configured`);
        }
      });
    }
  }

  // Check if template has heading options configured
  if (template.category === 'curtains') {
    if (!template.selected_heading_ids || template.selected_heading_ids.length === 0) {
      warnings.push('No heading types assigned to this template');
      missingConfigurations.push('heading_types');
    }
  }

  // Check for manufacturing options
  if (template.category === 'curtains' || template.category === 'blinds') {
    if (template.offers_hand_finished === undefined) {
      warnings.push('Hand-finished option preference not set');
    }
  }

  // Check waste percentage
  if (template.waste_percent === undefined || template.waste_percent === null) {
    warnings.push('Waste percentage not configured (using 0%)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingConfigurations
  };
};

/**
 * Get a human-readable summary of template issues
 */
export const getTemplateValidationSummary = (validation: TemplateValidationResult): string => {
  if (validation.isValid && validation.warnings.length === 0) {
    return 'Template is fully configured ✓';
  }

  const parts: string[] = [];
  
  if (validation.errors.length > 0) {
    parts.push(`${validation.errors.length} critical issue${validation.errors.length > 1 ? 's' : ''}`);
  }
  
  if (validation.warnings.length > 0) {
    parts.push(`${validation.warnings.length} warning${validation.warnings.length > 1 ? 's' : ''}`);
  }

  return parts.join(', ');
};
