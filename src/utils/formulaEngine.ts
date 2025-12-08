// DEPRECATED: This file has been replaced with secureFormulaEngine.ts for security reasons
// Please use SecureFormulaEngine instead of FormulaEngine

export { SecureFormulaEngine as FormulaEngine } from './secureFormulaEngine';
export type { FormulaResult } from './secureFormulaEngine';

// Re-export centralized calculation formulas (THE source of truth)
// NOTE: No defaults exported - all values must come from templates
export { 
  BLIND_FORMULA, 
  CURTAIN_VERTICAL_FORMULA, 
  CURTAIN_HORIZONTAL_FORMULA,
  PRICING_FORMULAS,
  getFormulasByCategory,
  findApplicableFormula
} from './calculationFormulas';

export type { 
  BlindFormulaInputs, 
  BlindFormulaResult,
  CurtainFormulaInputs, 
  CurtainFormulaResult 
} from './calculationFormulas';
