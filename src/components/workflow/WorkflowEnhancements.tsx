import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, AlertCircle, Plus, ArrowRight } from "lucide-react";

interface WorkflowEnhancementsProps {
  projectId: string;
  rooms: any[];
  surfaces: any[];
  treatments: any[];
  onCreateRoom: () => void;
  onCreateSurface: (roomId: string) => void;
  onCreateTreatment: (surfaceId: string) => void;
}

export const WorkflowEnhancements = ({
  projectId,
  rooms,
  surfaces,
  treatments,
  onCreateRoom,
  onCreateSurface,
  onCreateTreatment
}: WorkflowEnhancementsProps) => {
  
  const getTotalSurfaces = () => surfaces?.length || 0;
  const getTotalTreatments = () => treatments?.length || 0;
  const getCompletionPercentage = () => {
    if (!rooms || rooms.length === 0) return 0;
    
    const totalSteps = rooms.length * 3; // Each room should have: surfaces, treatments, configured
    let completedSteps = 0;
    
    rooms.forEach(room => {
      const roomSurfaces = surfaces?.filter(s => s.room_id === room.id) || [];
      const roomTreatments = treatments?.filter(t => t.room_id === room.id) || [];
      
      if (roomSurfaces.length > 0) completedSteps++;
      if (roomTreatments.length > 0) completedSteps++;
      if (roomTreatments.length > 0 && roomTreatments.every(t => t.total_price > 0)) completedSteps++;
    });
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const getNextAction = () => {
    if (!rooms || rooms.length === 0) {
      return {
        title: "Add Your First Room",
        description: "Start by creating a room where treatments will be installed",
        action: onCreateRoom,
        actionText: "Add Room",
        priority: "high"
      };
    }

    const roomsWithoutSurfaces = rooms.filter(room => 
      !surfaces?.some(s => s.room_id === room.id)
    );

    if (roomsWithoutSurfaces.length > 0) {
      return {
        title: "Add Windows & Surfaces",
        description: `Add windows or walls to ${roomsWithoutSurfaces[0].name}`,
        action: () => onCreateSurface(roomsWithoutSurfaces[0].id),
        actionText: "Add Surface",
        priority: "high"
      };
    }

    const surfacesWithoutTreatments = surfaces?.filter(surface => 
      !treatments?.some(t => t.window_id === surface.id)
    ) || [];

    if (surfacesWithoutTreatments.length > 0) {
      return {
        title: "Select Window Treatments",
        description: `Choose treatments for ${surfacesWithoutTreatments[0].name}`,
        action: () => onCreateTreatment(surfacesWithoutTreatments[0].id),
        actionText: "Add Treatment",
        priority: "medium"
      };
    }

    const incompleteTreatments = treatments?.filter(t => !t.total_price || t.total_price <= 0) || [];

    if (incompleteTreatments.length > 0) {
      return {
        title: "Configure Treatment Pricing",
        description: "Complete pricing for treatments without cost calculations",
        action: () => onCreateTreatment(incompleteTreatments[0].window_id),
        actionText: "Configure Pricing",
        priority: "low"
      };
    }

    return {
      title: "Project Complete!",
      description: "All rooms have surfaces and treatments configured",
      action: null,
      actionText: "Generate Quote",
      priority: "complete"
    };
  };

  const nextAction = getNextAction();
  const completionPercentage = getCompletionPercentage();

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-blue-900">Project Progress</CardTitle>
            <CardDescription className="text-blue-700">
              Track your project setup and completion status
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{completionPercentage}%</div>
            <div className="text-xs text-blue-500">Complete</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Overall Progress</span>
            <span className="text-gray-600">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-blue-600">{rooms?.length || 0}</div>
            <div className="text-xs text-gray-600">Rooms</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-green-600">{getTotalSurfaces()}</div>
            <div className="text-xs text-gray-600">Surfaces</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
            <div className="text-lg font-bold text-purple-600">{getTotalTreatments()}</div>
            <div className="text-xs text-gray-600">Treatments</div>
          </div>
        </div>

        {/* Next Action */}
        <div className="p-4 bg-white rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                nextAction.priority === 'high' ? 'bg-red-100 text-red-600' :
                nextAction.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                nextAction.priority === 'complete' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {nextAction.priority === 'complete' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : nextAction.priority === 'high' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{nextAction.title}</h4>
                <p className="text-sm text-gray-600">{nextAction.description}</p>
              </div>
            </div>
            {nextAction.action && (
              <Button
                size="sm"
                onClick={nextAction.action}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>{nextAction.actionText}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Workflow Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg border ${
            rooms && rooms.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              {rooms && rooms.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm font-medium">Rooms Created</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Define project spaces</p>
          </div>

          <div className={`p-3 rounded-lg border ${
            surfaces && surfaces.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              {surfaces && surfaces.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm font-medium">Surfaces Added</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Windows & walls defined</p>
          </div>

          <div className={`p-3 rounded-lg border ${
            treatments && treatments.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              {treatments && treatments.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
              )}
              <span className="text-sm font-medium">Treatments Configured</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">Products & pricing set</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};