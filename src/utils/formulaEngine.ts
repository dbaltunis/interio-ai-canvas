
interface FormulaVariable {
  name: string;
  value: number;
  unit?: string;
}

interface FormulaCondition {
  variable: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
}

export interface FormulaResult {
  value: number;
  breakdown: string;
  variables: FormulaVariable[];
  error?: string;
}

export class FormulaEngine {
  private variables: Map<string, number> = new Map();

  setVariable(name: string, value: number): void {
    this.variables.set(name, value);
  }

  setVariables(vars: Record<string, number>): void {
    Object.entries(vars).forEach(([name, value]) => {
      this.variables.set(name, value);
    });
  }

  evaluateFormula(expression: string, conditions?: FormulaCondition[]): FormulaResult {
    try {
      // Check conditions first
      if (conditions && !this.checkConditions(conditions)) {
        return {
          value: 0,
          breakdown: "Conditions not met",
          variables: Array.from(this.variables.entries()).map(([name, value]) => ({ name, value }))
        };
      }

      // Replace variables in expression with their values
      let processedExpression = expression;
      const variableMatches = expression.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
      
      for (const variable of variableMatches) {
        if (this.variables.has(variable)) {
          const value = this.variables.get(variable)!;
          processedExpression = processedExpression.replace(
            new RegExp(`\\b${variable}\\b`, 'g'),
            value.toString()
          );
        }
      }

      // Handle mathematical functions
      processedExpression = this.processMathFunctions(processedExpression);

      // Evaluate the expression safely
      const result = this.safeEvaluate(processedExpression);
      
      return {
        value: result,
        breakdown: this.generateBreakdown(expression, result),
        variables: Array.from(this.variables.entries()).map(([name, value]) => ({ name, value }))
      };
    } catch (error) {
      return {
        value: 0,
        breakdown: "Formula evaluation failed",
        variables: Array.from(this.variables.entries()).map(([name, value]) => ({ name, value })),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private checkConditions(conditions: FormulaCondition[]): boolean {
    return conditions.every(condition => {
      const value = this.variables.get(condition.variable);
      if (value === undefined) return false;

      switch (condition.operator) {
        case 'gt': return value > condition.value;
        case 'lt': return value < condition.value;
        case 'eq': return value === condition.value;
        case 'gte': return value >= condition.value;
        case 'lte': return value <= condition.value;
        default: return false;
      }
    });
  }

  private processMathFunctions(expression: string): string {
    // Handle ceiling function
    expression = expression.replace(/ceiling\(([^)]+)\)/g, (_, inner) => {
      return `Math.ceil(${inner})`;
    });

    // Handle floor function
    expression = expression.replace(/floor\(([^)]+)\)/g, (_, inner) => {
      return `Math.floor(${inner})`;
    });

    // Handle max function
    expression = expression.replace(/max\(([^)]+)\)/g, (_, inner) => {
      return `Math.max(${inner})`;
    });

    // Handle min function
    expression = expression.replace(/min\(([^)]+)\)/g, (_, inner) => {
      return `Math.min(${inner})`;
    });

    return expression;
  }

  private safeEvaluate(expression: string): number {
    // Remove any potentially dangerous characters
    const sanitized = expression.replace(/[^0-9+\-*/.() Math]/g, '');
    
    // Use Function constructor for safe evaluation
    try {
      const result = new Function('Math', `"use strict"; return (${sanitized})`)(Math);
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return 0;
    }
  }

  private generateBreakdown(expression: string, result: number): string {
    let breakdown = expression;
    
    // Replace variables with their values for display
    for (const [name, value] of this.variables.entries()) {
      breakdown = breakdown.replace(
        new RegExp(`\\b${name}\\b`, 'g'),
        value.toString()
      );
    }

    return `${breakdown} = ${result.toFixed(2)}`;
  }
}

// Helper function to get formulas by category
export const getFormulasByCategory = (formulas: any[], category: string) => {
  return formulas.filter(formula => formula.category === category && formula.active);
};

// Helper function to find applicable formula
export const findApplicableFormula = (formulas: any[], treatmentType: string, calculationType: string) => {
  return formulas.find(formula => 
    formula.category === calculationType &&
    formula.active &&
    (formula.applies_to?.includes(treatmentType) || formula.applies_to?.includes('all'))
  );
};
