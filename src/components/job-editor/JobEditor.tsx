
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload, Calculator, Calendar, MapPin, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const JobEditor = () => {
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [rooms, setRooms] = useState([]);
  const { toast } = useToast();

  const addRoom = () => {
    const newRoom = {
      id: Date.now(),
      name: `Room ${rooms.length + 1}`,
      windows: [],
      treatments: []
    };
    setRooms([...rooms, newRoom]);
    toast({
      title: "Room Added",
      description: "New room has been added to the project",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Editor</h2>
          <p className="text-muted-foreground">
            Create and manage project details, rooms, and treatments
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Open Calculator
          </Button>
          <Button>
            Save Project
          </Button>
        </div>
      </div>

      {/* Project Info */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
          <CardDescription>Basic project details and client information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., Wilson Residence - Living Room"
              />
            </div>
            <div>
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g., Sarah Wilson"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rooms & Windows */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Rooms & Windows</CardTitle>
              <CardDescription>Add rooms and configure windows for each space</CardDescription>
            </div>
            <Button onClick={addRoom}>
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="mx-auto h-12 w-12 mb-4" />
              <p>No rooms added yet. Click "Add Room" to get started.</p>
            </div>
          ) : (
            <Tabs defaultValue="room-0" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {rooms.map((room, index) => (
                  <TabsTrigger key={room.id} value={`room-${index}`}>
                    {room.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {rooms.map((room, index) => (
                <TabsContent key={room.id} value={`room-${index}`} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Room Images */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Room Images</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Upload room images</p>
                            <Button variant="outline" size="sm">
                              <Upload className="mr-2 h-4 w-4" />
                              Choose Files
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Windows */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Windows</CardTitle>
                          <Button variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Window
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            No windows added yet
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Treatments */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Treatments</CardTitle>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Treatment
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        No treatments added yet
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Services & Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Add measuring, fitting, and other services</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calendar Events</CardTitle>
            <CardDescription>Schedule appointments and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Event
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
