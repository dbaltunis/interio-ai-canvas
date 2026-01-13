import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertCircle } from 'lucide-react';

interface PINEntryDialogProps {
  open: boolean;
  onVerify: (pin: string) => boolean;
  onSuccess: () => void;
}

export const PINEntryDialog: React.FC<PINEntryDialogProps> = ({
  open,
  onVerify,
  onSuccess
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onVerify(pin)) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setAttempts(prev => prev + 1);
      setPin('');
    }
  };

  const maxAttemptsReached = attempts >= 5;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Enter PIN</CardTitle>
          <CardDescription>
            This work order is protected. Enter the 4-digit PIN to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {maxAttemptsReached ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-destructive mb-4">
                <AlertCircle className="h-5 w-5" />
                <span>Too many attempts</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Please contact your supplier for assistance.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="• • • •"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setError(false);
                  }}
                  className={`text-center text-2xl tracking-[0.5em] ${error ? 'border-destructive' : ''}`}
                  autoFocus
                />
                {error && (
                  <p className="text-sm text-destructive text-center flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Incorrect PIN. {5 - attempts} attempts remaining.
                  </p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={pin.length !== 4}
              >
                Continue
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
