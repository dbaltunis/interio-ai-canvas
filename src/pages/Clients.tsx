
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Clients = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-muted-foreground">
          Manage your clients here
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Clients Yet</CardTitle>
          <CardDescription>
            Add your first client to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Clients will appear here once you add them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clients;
