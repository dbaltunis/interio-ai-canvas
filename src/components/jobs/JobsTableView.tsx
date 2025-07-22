
import { useState } from "react";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Search } from "lucide-react";
import { ThreeDotMenu } from "@/components/ui/three-dot-menu";
import type { MenuItem } from "@/components/ui/three-dot-menu";

interface JobsTableViewProps {
  onJobSelect: (jobId: string) => void;
}

export const JobsTableView = ({ onJobSelect }: JobsTableViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: projects = [], isLoading } = useProjects();

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMenuItems = (projectId: string): MenuItem[] => [
    {
      label: "View Job",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => onJobSelect(projectId)
    },
    {
      label: "Copy Job",
      onClick: () => console.log('Copy job:', projectId)
    },
    {
      label: "Delete Job",
      onClick: () => console.log('Delete job:', projectId),
      variant: "destructive"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="border rounded-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">All Jobs ({filteredProjects.length})</h3>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Job Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-20 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {searchTerm ? "No jobs found matching your search" : "No jobs created yet"}
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        project.status === 'active' ? 'default' :
                        project.status === 'completed' ? 'secondary' :
                        'outline'
                      }
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(project.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <ThreeDotMenu items={getMenuItems(project.id)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
