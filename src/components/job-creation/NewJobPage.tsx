
import { useState, useEffect } from "react";
import { formatJobNumber } from "@/lib/format-job-number";
import { useCreateProject, useProjects } from "@/hooks/useProjects";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useClients } from "@/hooks/useClients";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewJobPageProps {
  onBack: () => void;
}

export const NewJobPage = ({ onBack }: NewJobPageProps) => {
  const [activeTab, setActiveTab] = useState("jobs");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasAttemptedCreation, setHasAttemptedCreation] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [rooms, setRooms] = useState([{ id: 1, name: "Room 1", price: 0.00 }]);
  const [totalPrice, setTotalPrice] = useState(0.00);
  
  const { data: clients, isLoading: clientsLoading } = useClients();
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const createQuote = useCreateQuote();
  const { toast } = useToast();

  // Get client data for navigation indicator
  const client = clients?.find(c => c.id === currentProject?.client_id);

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Auth check error:", error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!user);
          console.log("Auth check result:", !!user, user?.id);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Create a default project when component mounts and user is authenticated
  useEffect(() => {
    const createDefaultProjectAndQuote = async () => {
      if (isCheckingAuth) return;
      
      if (!isAuthenticated) {
        console.error("User not authenticated, cannot create project");
        toast({
          title: "Authentication Required",
          description: "Please log in to create a project.",
          variant: "destructive"
        });
        onBack();
        return;
      }

      if (hasAttemptedCreation || currentProject || isCreating) return;
      
      setIsCreating(true);
      setHasAttemptedCreation(true);
      
      try {
        console.log("Creating new project without client...");
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        const { count } = await supabase
          .from("projects")
          .select("*", { count: 'exact', head: true })
          .eq("user_id", user.id);
        
        const jobNumber = String(10030 + (count || 0) + 1);
        
        const newProject = await createProject.mutateAsync({
          name: "New Project",
          description: "",
          status: "planning",
          priority: "medium",
          client_id: null,
          job_number: jobNumber
        });
        
        console.log("Project created successfully:", newProject);
        
        if (newProject) {
          console.log("Creating quote for project:", newProject.id);
          
          await createQuote.mutateAsync({
            project_id: newProject.id,
            client_id: null,
            status: "draft",
            subtotal: 0,
            tax_rate: 0,
            tax_amount: 0,
            total_amount: 0,
            notes: "New job created"
          });
          
          console.log("Quote created successfully for project:", newProject.id);
        }
        
        setCurrentProject(newProject);
        console.log("Created new project:", newProject.id);
      } catch (error) {
        console.error("Failed to create default project:", error);
        toast({
          title: "Error",
          description: "Failed to create project. Please try again.",
          variant: "destructive"
        });
        onBack();
      } finally {
        setIsCreating(false);
      }
    };

    createDefaultProjectAndQuote();
  }, [currentProject, createProject, createQuote, isCreating, hasAttemptedCreation, onBack, toast, isAuthenticated, isCheckingAuth]);

  const addRoom = () => {
    const newRoom = {
      id: rooms.length + 1,
      name: `Room ${rooms.length + 1}`,
      price: 0.00
    };
    setRooms([...rooms, newRoom]);
  };

  const updateRoomPrice = (roomId: number, price: number) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId ? { ...room, price } : room
    );
    setRooms(updatedRooms);
    setTotalPrice(updatedRooms.reduce((total, room) => total + room.price, 0));
  };

  // Show minimal loading state
  if (isCheckingAuth || isCreating || !currentProject) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">
            {isCheckingAuth ? "Authenticating..." : isCreating ? "Creating project..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "client", label: "Client", icon: "👤" },
    { id: "jobs", label: "Jobs", icon: "📋" },
    { id: "quote", label: "Quote", icon: "📄" },
    { id: "workshop", label: "Workshop", icon: "🔧" },
  ];

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header with Back button and Project info */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Jobs</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">New Project</h1>
              <p className="text-sm text-gray-500">#{formatJobNumber(currentProject?.job_number || '10030')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">DRAFT</span>
            </div>
            
            <Select defaultValue="draft">
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
              </SelectContent>
            </Select>
            
            <Select defaultValue="payment">
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="ghost" size="sm" className="text-gray-600">
              📅
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-600">
              👤
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-gray-50 px-6">
        <div className="flex space-x-0">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(item.id)}
              className={`px-6 py-3 rounded-none border-b-2 ${
                activeTab === item.id
                  ? "border-blue-600 bg-white text-blue-700 font-medium"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
              {item.id === "client" && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="w-full">
        {activeTab === "client" && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Client Selected</h3>
              <p className="text-gray-600 text-sm max-w-sm mx-auto mb-6">
                Select or create a client to get started with this job.
              </p>
              <div className="space-x-3">
                <Button variant="outline">
                  Select Existing Client
                </Button>
                <Button variant="brand">
                  Create New Client
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="w-full">
            {/* Job Configuration Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Job Configuration</h2>
                  <p className="text-gray-600 text-sm">Add rooms and configure window treatments</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Project Total</span>
                    <div className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</div>
                  </div>
                  <Button 
                    onClick={addRoom}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    ➕ Add Room
                  </Button>
                </div>
              </div>
            </div>

            {/* Rooms */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">{room.name}</h3>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-400 p-1">
                        📋
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 p-1">
                        ✏️
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="h-32 bg-gray-200 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Room layout placeholder</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">${room.price.toFixed(2)}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs"
                      >
                        Select product
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "quote" && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quote Section</h3>
              <p className="text-gray-600 text-sm max-w-sm mx-auto">
                Generate and manage quotes for this project.
              </p>
            </div>
          </div>
        )}

        {activeTab === "workshop" && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Workshop</h3>
              <p className="text-gray-600 text-sm max-w-sm mx-auto">
                Manage workshop tasks and production for this project.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
