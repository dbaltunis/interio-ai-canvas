
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TransformedFabricOrder, TransformedTeamMember } from "./types";

interface WorkshopOverviewProps {
  projectWorkOrders: any[];
  transformedFabricOrders: TransformedFabricOrder[];
  transformedTeamMembers: TransformedTeamMember[];
}

export const WorkshopOverview = ({ 
  projectWorkOrders, 
  transformedFabricOrders, 
  transformedTeamMembers 
}: WorkshopOverviewProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Production Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Work Orders:</span>
              <span className="font-medium">{projectWorkOrders.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed:</span>
              <span className="font-medium text-green-600">{projectWorkOrders.filter(w => w.status === 'completed').length}</span>
            </div>
            <div className="flex justify-between">
              <span>In Progress:</span>
              <span className="font-medium text-blue-600">{projectWorkOrders.filter(w => w.status === 'in_progress').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="font-medium text-yellow-600">{projectWorkOrders.filter(w => w.status === 'pending').length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Material Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Items Needed:</span>
              <span className="font-medium">{transformedFabricOrders.filter(f => f.status === 'needed').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Orders Placed:</span>
              <span className="font-medium text-blue-600">{transformedFabricOrders.filter(f => f.status === 'ordered').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Received:</span>
              <span className="font-medium text-green-600">{transformedFabricOrders.filter(f => f.status === 'received').length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Value:</span>
              <span className="font-medium">${transformedFabricOrders.reduce((sum, f) => sum + (f.totalPrice || 0), 0).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Team Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transformedTeamMembers?.map(member => (
              <div key={member.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{member.name}</span>
                  <span>Available</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-1/3" />
                </div>
              </div>
            )) || (
              <p className="text-sm text-muted-foreground">No team members added yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
