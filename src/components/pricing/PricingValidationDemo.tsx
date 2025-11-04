// Pricing Validation Demo - Verify all pricing methods work correctly

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { calculatePrice, calculateLabor, type PricingMethod } from '@/utils/pricing';
import { CheckCircle2, XCircle } from 'lucide-react';

export const PricingValidationDemo = () => {
  const [results, setResults] = useState<Array<{ method: string; passed: boolean; message: string }>>([]);

  const runValidation = () => {
    const validationResults = [];

    // Test context
    const context = {
      baseCost: 50,
      railWidth: 200,
      drop: 220,
      quantity: 1,
      fullness: 2.5,
      fabricWidth: 137,
      fabricCost: 30,
      fabricUsage: 10
    };

    // Test 1: Fixed pricing
    try {
      const result = calculatePrice('fixed', context);
      validationResults.push({
        method: 'Fixed',
        passed: result.cost === 50,
        message: `Cost: £${result.cost} (expected £50)`
      });
    } catch (error) {
      validationResults.push({
        method: 'Fixed',
        passed: false,
        message: `Error: ${error}`
      });
    }

    // Test 2: Per-panel pricing
    try {
      const result = calculatePrice('per-panel', context);
      const expectedPanels = Math.ceil((200 * 2.5) / 137); // 4 panels
      validationResults.push({
        method: 'Per-Panel',
        passed: result.cost === 200,
        message: `Cost: £${result.cost} (${expectedPanels} panels × £50)`
      });
    } catch (error) {
      validationResults.push({
        method: 'Per-Panel',
        passed: false,
        message: `Error: ${error}`
      });
    }

    // Test 3: Per-meter pricing
    try {
      const result = calculatePrice('per-meter', context);
      validationResults.push({
        method: 'Per-Meter',
        passed: result.cost === 100,
        message: `Cost: £${result.cost} (2m × £50)`
      });
    } catch (error) {
      validationResults.push({
        method: 'Per-Meter',
        passed: false,
        message: `Error: ${error}`
      });
    }

    // Test 4: Per-sqm pricing
    try {
      const result = calculatePrice('per-sqm', context);
      validationResults.push({
        method: 'Per-Sqm',
        passed: result.cost === 220,
        message: `Cost: £${result.cost} (4.4m² × £50)`
      });
    } catch (error) {
      validationResults.push({
        method: 'Per-Sqm',
        passed: false,
        message: `Error: ${error}`
      });
    }

    // Test 5: Percentage pricing
    try {
      const result = calculatePrice('percentage', context);
      validationResults.push({
        method: 'Percentage',
        passed: result.cost === 150,
        message: `Cost: £${result.cost} (50% of £300)`
      });
    } catch (error) {
      validationResults.push({
        method: 'Percentage',
        passed: false,
        message: `Error: ${error}`
      });
    }

    // Test 6: Labor calculation
    try {
      const laborResult = calculateLabor({
        railWidth: 200,
        drop: 220,
        fullness: 2.5,
        laborRate: 25,
        treatmentComplexity: 'moderate'
      });
      validationResults.push({
        method: 'Labor Calculation',
        passed: laborResult.hours >= 3 && laborResult.cost > 0,
        message: `${laborResult.hours.toFixed(2)} hours × £25 = £${laborResult.cost.toFixed(2)}`
      });
    } catch (error) {
      validationResults.push({
        method: 'Labor Calculation',
        passed: false,
        message: `Error: ${error}`
      });
    }

    // Test 7: Inherit pricing
    try {
      const result = calculatePrice('inherit', {
        ...context,
        windowCoveringPricingMethod: 'per-panel' as PricingMethod
      });
      validationResults.push({
        method: 'Inherit (from per-panel)',
        passed: result.cost === 200,
        message: `Cost: £${result.cost} (inherited per-panel)`
      });
    } catch (error) {
      validationResults.push({
        method: 'Inherit',
        passed: false,
        message: `Error: ${error}`
      });
    }

    setResults(validationResults);
  };

  const allPassed = results.length > 0 && results.every(r => r.passed);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Pricing Architecture Validation</span>
          {results.length > 0 && (
            <Badge variant={allPassed ? "default" : "destructive"}>
              {allPassed ? "All Tests Passed" : "Some Tests Failed"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runValidation} className="w-full">
          Run Validation Tests
        </Button>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                {result.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{result.method}</div>
                  <div className="text-sm text-muted-foreground">{result.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            Click the button above to validate all pricing calculations
          </div>
        )}
      </CardContent>
    </Card>
  );
};
