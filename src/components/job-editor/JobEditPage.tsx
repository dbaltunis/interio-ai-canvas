
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Copy, Edit, Calendar } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";
import { RoomManager } from "./RoomManager";

interface JobEditPageProps {
  jobId: string;
  onBack: () => void;
}

export const JobEditPage = ({ jobId, onBack }: JobEditPageProps) => {
  const [activeTab, setActiveTab] = useState("Jobs");
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { data: quotes } = useQuotes();

  const job = quotes?.find(q => q.id === jobId);

  if (!job) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Job not found</h2>
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "Jobs", label: "Jobs" },
    { id: "Quote", label: "Quote" },
    { id: "Workshop", label: "Workshop" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-6 py-4">
          {/* Top row with client info and actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📍</span>
                  </div>
                  <span className="text-lg font-medium text-gray-900">Client</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select defaultValue="payment">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="quote">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                </SelectContent>
              </Select>
              
              <Button size="sm" variant="outline">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation tabs */}
          <div className="flex space-x-0">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-2 rounded-none border-b-2 ${
                  activeTab === item.id
                    ? "border-gray-400 bg-gray-100 text-gray-900"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Total and Add room button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Total: ${job.total_amount?.toFixed(2) || '0.00'}
            </h1>
            <Button className="bg-slate-600 hover:bg-slate-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add room
            </Button>
          </div>

          {/* Room management and details */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left sidebar - Room list */}
            <div className="col-span-3">
              <RoomManager 
                projectId={jobId}
                activeRoomId={activeRoomId}
                onRoomSelect={setActiveRoomId}
              />
            </div>

            {/* Main content area */}
            <div className="col-span-9">
              {activeRoomId ? (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Room Details</h2>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Room 1</h3>
                    <p className="text-gray-600 mb-4">$0.00</p>
                    
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curtains">Curtains</SelectItem>
                        <SelectItem value="blinds">Blinds</SelectItem>
                        <SelectItem value="shutters">Shutters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No room selected</h3>
                    <p className="text-gray-600 mb-4">Select a room from the sidebar or create a new one</p>
                    <Button className="bg-slate-600 hover:bg-slate-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add room
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
