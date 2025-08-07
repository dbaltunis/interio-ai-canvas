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

// Secure expression parser without code execution
class SecureExpressionParser {
  private variables: Map<string, number> = new Map();

  setVariable(name: string, value: number): void {
    // Validate variable name (alphanumeric + underscore only)
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error('Invalid variable name');
    }
    this.variables.set(name, value);
  }

  parse(expression: string): number {
    // Remove whitespace
    const cleaned = expression.replace(/\s+/g, '');
    
    // Validate expression contains only allowed characters
    if (!/^[a-zA-Z0-9_+\-*/.()]+$/.test(cleaned)) {
      throw new Error('Invalid characters in expression');
    }

    return this.parseExpression(cleaned);
  }

  private parseExpression(expr: string): number {
    return this.parseAddition(expr, { pos: 0 });
  }

  private parseAddition(expr: string, cursor: { pos: number }): number {
    let result = this.parseMultiplication(expr, cursor);

    while (cursor.pos < expr.length) {
      const op = expr[cursor.pos];
      if (op === '+' || op === '-') {
        cursor.pos++;
        const right = this.parseMultiplication(expr, cursor);
        result = op === '+' ? result + right : result - right;
      } else {
        break;
      }
    }

    return result;
  }

  private parseMultiplication(expr: string, cursor: { pos: number }): number {
    let result = this.parseFactor(expr, cursor);

    while (cursor.pos < expr.length) {
      const op = expr[cursor.pos];
      if (op === '*' || op === '/') {
        cursor.pos++;
        const right = this.parseFactor(expr, cursor);
        if (op === '/' && right === 0) {
          throw new Error('Division by zero');
        }
        result = op === '*' ? result * right : result / right;
      } else {
        break;
      }
    }

    return result;
  }

  private parseFactor(expr: string, cursor: { pos: number }): number {
    if (cursor.pos >= expr.length) {
      throw new Error('Unexpected end of expression');
    }

    // Handle parentheses
    if (expr[cursor.pos] === '(') {
      cursor.pos++;
      const result = this.parseAddition(expr, cursor);
      if (cursor.pos >= expr.length || expr[cursor.pos] !== ')') {
        throw new Error('Missing closing parenthesis');
      }
      cursor.pos++;
      return result;
    }

    // Handle negative numbers
    if (expr[cursor.pos] === '-') {
      cursor.pos++;
      return -this.parseFactor(expr, cursor);
    }

    // Parse number or variable
    const start = cursor.pos;
    while (cursor.pos < expr.length && /[a-zA-Z0-9_.]/.test(expr[cursor.pos])) {
      cursor.pos++;
    }

    const token = expr.slice(start, cursor.pos);
    
    // Check if it's a number
    if (/^\d*\.?\d+$/.test(token)) {
      return parseFloat(token);
    }

    // Check if it's a variable
    if (this.variables.has(token)) {
      return this.variables.get(token)!;
    }

    throw new Error(`Unknown variable or invalid token: ${token}`);
  }

  getVariables(): Map<string, number> {
    return new Map(this.variables);
  }
}

export class SecureFormulaEngine {
  private variables: Map<string, number | string> = new Map();

  setVariable(name: string, value: number | string): void {
    this.variables.set(name, value);
  }

  setVariables(vars: Record<string, number | string>): void {
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
          variables: Array.from(this.variables.entries())
            .filter(([_, value]) => typeof value === 'number')
            .map(([name, value]) => ({ name, value: value as number }))
        };
      }

      const parser = new SecureExpressionParser();
      
      // Set numeric variables in parser
      for (const [name, value] of this.variables.entries()) {
        if (typeof value === 'number') {
          parser.setVariable(name, value);
        }
      }

      // Replace variables in expression with their values for display
      let processedExpression = expression;
      const variableMatches = expression.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
      
      for (const variable of variableMatches) {
        if (this.variables.has(variable)) {
          const value = this.variables.get(variable)!;
          if (typeof value === 'number') {
            processedExpression = processedExpression.replace(
              new RegExp(`\\b${variable}\\b`, 'g'),
              value.toString()
            );
          }
        }
      }

      // Handle mathematical functions securely
      processedExpression = this.processMathFunctions(processedExpression, parser);
      
      // Parse and evaluate safely
      const result = parser.parse(processedExpression);
      
      return {
        value: result,
        breakdown: this.generateBreakdown(expression, result),
        variables: Array.from(this.variables.entries())
          .filter(([_, value]) => typeof value === 'number')
          .map(([name, value]) => ({ name, value: value as number }))
      };
    } catch (error) {
      return {
        value: 0,
        breakdown: "Formula evaluation failed",
        variables: Array.from(this.variables.entries())
          .filter(([_, value]) => typeof value === 'number')
          .map(([name, value]) => ({ name, value: value as number })),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private checkConditions(conditions: FormulaCondition[]): boolean {
    return conditions.every(condition => {
      const value = this.variables.get(condition.variable);
      if (value === undefined || typeof value !== 'number') return false;

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

  private processMathFunctions(expression: string, parser: SecureExpressionParser): string {
    // Handle mathematical functions by pre-calculating them
    let processed = expression;

    // Handle ceiling function
    processed = processed.replace(/ceiling\(([^)]+)\)/g, (_, inner) => {
      try {
        const value = parser.parse(inner);
        return Math.ceil(value).toString();
      } catch {
        throw new Error('Invalid expression in ceiling function');
      }
    });

    // Handle floor function
    processed = processed.replace(/floor\(([^)]+)\)/g, (_, inner) => {
      try {
        const value = parser.parse(inner);
        return Math.floor(value).toString();
      } catch {
        throw new Error('Invalid expression in floor function');
      }
    });

    // Handle max function (simple two-argument version)
    processed = processed.replace(/max\(([^,]+),([^)]+)\)/g, (_, arg1, arg2) => {
      try {
        const val1 = parser.parse(arg1.trim());
        const val2 = parser.parse(arg2.trim());
        return Math.max(val1, val2).toString();
      } catch {
        throw new Error('Invalid expression in max function');
      }
    });

    // Handle min function (simple two-argument version)
    processed = processed.replace(/min\(([^,]+),([^)]+)\)/g, (_, arg1, arg2) => {
      try {
        const val1 = parser.parse(arg1.trim());
        const val2 = parser.parse(arg2.trim());
        return Math.min(val1, val2).toString();
      } catch {
        throw new Error('Invalid expression in min function');
      }
    });

    return processed;
  }

  private generateBreakdown(expression: string, result: number): string {
    let breakdown = expression;
    
    // Replace variables with their values for display
    for (const [name, value] of this.variables.entries()) {
      if (typeof value === 'number') {
        breakdown = breakdown.replace(
          new RegExp(`\\b${name}\\b`, 'g'),
          value.toString()
        );
      }
    }

    return `${breakdown} = ${result.toFixed(2)}`;
  }
}

// Helper functions remain the same
export const getFormulasByCategory = (formulas: any[], category: string) => {
  return formulas.filter(formula => formula.category === category && formula.active);
};

export const findApplicableFormula = (formulas: any[], treatmentType: string, calculationType: string) => {
  return formulas.find(formula => 
    formula.category === calculationType &&
    formula.active &&
    (formula.applies_to?.includes(treatmentType) || formula.applies_to?.includes('all'))
  );
};
