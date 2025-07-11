import { Card, CardContent } from "@/components/ui/card";
import { Home, Package, Square, Users } from "lucide-react";

interface ProjectStatsProps {
  roomsCount: number;
  surfacesCount: number;
  treatmentsCount: number;
  projectTotal: number;
}

export const ProjectStats = ({ roomsCount, surfacesCount, treatmentsCount, projectTotal }: ProjectStatsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{roomsCount}</p>
              <p className="text-sm text-muted-foreground">Rooms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Home className="h-4 w-4 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{surfacesCount}</p>
              <p className="text-sm text-muted-foreground">Surfaces</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Package className="h-4 w-4 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{treatmentsCount}</p>
              <p className="text-sm text-muted-foreground">Treatments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Square className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${projectTotal.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Value</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};