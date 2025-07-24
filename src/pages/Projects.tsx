
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Projects = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          Manage your projects here
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>No Projects Yet</CardTitle>
          <CardDescription>
            Create your first project to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Projects will appear here once you create them.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Projects;
