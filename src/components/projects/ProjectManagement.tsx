
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Eye, Calendar } from "lucide-react";

const mockProjects = [
  {
    id: "PRJ-2024-001",
    name: "Wilson Residence - Living Room",
    client: "Sarah Wilson",
    status: "in-progress",
    progress: 65,
    value: "$2,450",
    margin: "35%",
    dueDate: "2024-02-15",
    treatments: ["Velvet Curtains", "Roman Blinds"]
  },
  {
    id: "PRJ-2024-002", 
    name: "Office Complex - Floor 3",
    client: "Design Co Ltd",
    status: "planning",
    progress: 20,
    value: "$8,900",
    margin: "28%", 
    dueDate: "2024-03-01",
    treatments: ["Vertical Blinds", "Blackout Curtains"]
  },
  {
    id: "PRJ-2024-003",
    name: "Chen Home - Bedroom Suite",
    client: "Michael Chen", 
    status: "completed",
    progress: 100,
    value: "$3,200",
    margin: "42%",
    dueDate: "2024-01-20",
    treatments: ["Silk Curtains", "Motorized Blinds"]
  }
];

export const ProjectManagement = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "planning": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">
            Track project progress, margins, and deliverables
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 due this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">35%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,690</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">87%</div>
            <p className="text-xs text-muted-foreground">Projects on time</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <Card key={project.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.client}</CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Value</span>
                  <div className="font-medium">{project.value}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Margin</span>
                  <div className="font-medium text-green-600">{project.margin}</div>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Treatments</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.treatments.map((treatment) => (
                    <Badge key={treatment} variant="outline" className="text-xs">
                      {treatment}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  Due {project.dueDate}
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
