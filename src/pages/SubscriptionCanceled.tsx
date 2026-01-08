import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function SubscriptionCanceled() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 mx-auto text-muted-foreground" />
          <CardTitle className="mt-4">Checkout Canceled</CardTitle>
          <CardDescription>
            Your subscription checkout was canceled. No charges have been made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            If you have any questions about our plans or need assistance, please don't hesitate to contact us.
          </p>
          <Button asChild className="w-full">
            <Link to="/pricing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Pricing
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
