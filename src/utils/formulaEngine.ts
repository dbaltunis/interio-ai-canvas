// DEPRECATED: This file has been replaced with secureFormulaEngine.ts for security reasons
// Please use SecureFormulaEngine instead of FormulaEngine

export { SecureFormulaEngine as FormulaEngine, getFormulasByCategory, findApplicableFormula } from './secureFormulaEngine';
export type { FormulaResult } from './secureFormulaEngine';

// Re-export centralized calculation formulas
export { 
  BLIND_FORMULA, 
  CURTAIN_VERTICAL_FORMULA, 
  CURTAIN_HORIZONTAL_FORMULA,
  PRICING_FORMULAS,
  BLIND_DEFAULTS,
  CURTAIN_DEFAULTS,
  getFormulasByCategory as getCalculationFormulasByCategory,
  findApplicableFormula as findApplicableCalculationFormula
} from './calculationFormulas';

export type { 
  BlindFormulaInputs, 
  BlindFormulaResult,
  CurtainFormulaInputs, 
  CurtainFormulaResult 
} from './calculationFormulas';
