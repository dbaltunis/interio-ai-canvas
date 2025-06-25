
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectInfoCardProps {
  project: any;
  client: any;
}

export const ProjectInfoCard = ({ project, client }: ProjectInfoCardProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p><span className="font-medium">Job #:</span> {project.job_number || project.quote_number || 'N/A'}</p>
            <p><span className="font-medium">Project:</span> {project.name || 'Unnamed Project'}</p>
            <p><span className="font-medium">Status:</span> {project.status}</p>
          </div>
          <div>
            <p><span className="font-medium">Client:</span> {client?.name}</p>
            {client?.client_type === 'B2B' && <p><span className="font-medium">Company:</span> {client.company_name}</p>}
            <p><span className="font-medium">Phone:</span> {client?.phone}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
