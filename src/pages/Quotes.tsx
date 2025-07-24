
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Quotes = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quotes</h1>
        <p className="text-muted-foreground">
          Manage your quotes here
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Quotes Yet</CardTitle>
          <CardDescription>
            Create your first quote to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Quotes will appear here once you create them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quotes;
