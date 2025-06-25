
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wrench, Package, Users, ClipboardList } from "lucide-react";
import { WorkOrdersByTreatment } from "../workshop/WorkOrdersByTreatment";
import { SupplierOrderManager } from "../workshop/SupplierOrderManager";
import { TaskDelegationBoard } from "../workshop/TaskDelegationBoard";
import { useWorkshopData } from "./workshop/useWorkshopData";
import { useWorkshopActions } from "./workshop/useWorkshopActions";
import { ProjectInfoCard } from "./workshop/ProjectInfoCard";
import { WorkshopOverview } from "./workshop/WorkshopOverview";

interface ProjectWorkshopTabProps {
  project: any;
}

export const ProjectWorkshopTab = ({ project }: ProjectWorkshopTabProps) => {
  console.log("Workshop tab - project object:", project);
  
  const {
    actualProjectId,
    client,
    projectTreatments,
    projectWorkOrders,
    transformedFabricOrders,
    transformedTeamMembers,
    transformedWorkOrders,
    mockTaskAssignments,
    rooms,
    surfaces
  } = useWorkshopData(project);

  const {
    generateWorkOrders,
    handleUpdateWorkOrder,
    handleToggleCheckpoint,
    handleUpdateFabricOrder,
    handleBulkOrder,
    handleReassignTask,
    handleUpdateTaskStatus,
    isGenerating
  } = useWorkshopActions();

  console.log("Workshop tab - using project ID:", actualProjectId);

  const handleGenerateWorkOrders = () => {
    generateWorkOrders(projectTreatments, actualProjectId, surfaces, rooms);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold">Workshop Management</h3>
          <p className="text-muted-foreground">
            Organize treatments, manage suppliers, and delegate tasks for {project.name || "Project"}
          </p>
        </div>
        <Button onClick={handleGenerateWorkOrders} disabled={isGenerating}>
          <Wrench className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Work Orders'}
        </Button>
      </div>

      {/* Project Info */}
      <ProjectInfoCard project={project} client={client} />

      {/* Tabs for different workshop views */}
      <Tabs defaultValue="work-orders" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="work-orders" className="flex items-center space-x-2">
            <ClipboardList className="h-4 w-4" />
            <span>Work Orders</span>
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Suppliers</span>
          </TabsTrigger>
          <TabsTrigger value="delegation" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Team</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Wrench className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="work-orders">
          <WorkOrdersByTreatment 
            workOrders={transformedWorkOrders}
            onUpdateWorkOrder={handleUpdateWorkOrder}
            onToggleCheckpoint={handleToggleCheckpoint}
          />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierOrderManager 
            fabricOrders={transformedFabricOrders}
            onUpdateOrder={handleUpdateFabricOrder}
            onBulkOrder={handleBulkOrder}
          />
        </TabsContent>

        <TabsContent value="delegation">
          <TaskDelegationBoard 
            teamMembers={transformedTeamMembers}
            taskAssignments={mockTaskAssignments}
            onReassignTask={handleReassignTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        </TabsContent>

        <TabsContent value="overview">
          <WorkshopOverview 
            projectWorkOrders={projectWorkOrders}
            transformedFabricOrders={transformedFabricOrders}
            transformedTeamMembers={transformedTeamMembers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
