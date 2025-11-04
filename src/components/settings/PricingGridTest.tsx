import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Play, Trash2 } from "lucide-react";
import { runAllTests, cleanupTestData } from "@/utils/pricing/__tests__/gridResolver.test";

export const PricingGridTest = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults({ status: 'idle', message: 'Running tests...' });
    
    try {
      const success = await runAllTests();
      
      if (success) {
        setTestResults({
          status: 'success',
          message: 'All tests passed! Check browser console for detailed results.'
        });
      } else {
        setTestResults({
          status: 'error',
          message: 'Some tests failed. Check browser console for details.'
        });
      }
    } catch (error) {
      setTestResults({
        status: 'error',
        message: `Test error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCleanup = async () => {
    setIsRunning(true);
    try {
      await cleanupTestData();
      setTestResults({
        status: 'success',
        message: 'Test data cleaned up successfully'
      });
    } catch (error) {
      setTestResults({
        status: 'error',
        message: `Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid Resolution System Test</CardTitle>
        <CardDescription>
          Test the pricing grid resolution logic before integrating into production
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Test Scenarios:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Roller Blind - Open System - Group A</li>
            <li>• Roller Blind - Cassette System - Group B</li>
            <li>• Venetian Blind - Standard - Group A</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRunTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run All Tests
          </Button>

          <Button
            onClick={handleCleanup}
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clean Up Test Data
          </Button>
        </div>

        {testResults.status !== 'idle' && (
          <Alert variant={testResults.status === 'error' ? 'destructive' : 'default'}>
            {testResults.status === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>{testResults.message}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p className="font-medium mb-1">What this tests:</p>
          <ul className="space-y-1 ml-4">
            <li>✓ Creating pricing grids with matrix data</li>
            <li>✓ Creating routing rules (product + system + price group)</li>
            <li>✓ Grid resolution logic finds correct grid</li>
            <li>✓ RLS policies work correctly</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p className="font-semibold">Note:</p>
          <p>Open browser console (F12) to see detailed test results and logs.</p>
        </div>
      </CardContent>
    </Card>
  );
};
