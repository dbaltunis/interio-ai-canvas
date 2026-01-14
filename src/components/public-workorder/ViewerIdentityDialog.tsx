import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail } from 'lucide-react';

interface ViewerIdentityDialogProps {
  open: boolean;
  onIdentified: (viewer: { name: string; email?: string }) => void;
  projectName?: string;
  isSubmitting?: boolean;
}

export const ViewerIdentityDialog: React.FC<ViewerIdentityDialogProps> = ({
  open,
  onIdentified,
  projectName,
  isSubmitting = false
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onIdentified({
      name: name.trim(),
      email: email.trim() || undefined
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-sm w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-lg">Access Work Order</CardTitle>
          <CardDescription>
            {projectName 
              ? `Please identify yourself to view "${projectName}"`
              : 'Please identify yourself to continue'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="viewer-name" className="text-sm font-medium">
                Your Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="viewer-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  autoFocus
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="viewer-email" className="text-sm font-medium">
                Email <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="viewer-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Accessing...' : 'Access Document'}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Your access will be recorded for tracking purposes.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
