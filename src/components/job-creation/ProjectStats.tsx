
import { Card, CardContent } from "@/components/ui/card";
import { Home, Package, Square, Users, DollarSign } from "lucide-react";

interface ProjectStatsProps {
  roomsCount: number;
  surfacesCount: number;
  treatmentsCount: number;
  projectTotal: number;
}

export const ProjectStats = ({ roomsCount, surfacesCount, treatmentsCount, projectTotal }: ProjectStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <Card className="bg-card border-border hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{roomsCount}</p>
              <p className="text-sm text-muted-foreground">Rooms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Home className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{surfacesCount}</p>
              <p className="text-sm text-muted-foreground">Surfaces</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{treatmentsCount}</p>
              <p className="text-sm text-muted-foreground">Treatments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">${projectTotal.toFixed(0)}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Square className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">${projectTotal.toFixed(2)}</p>
              <p className="text-sm text-white/80">Project Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
