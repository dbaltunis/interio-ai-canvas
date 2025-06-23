
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Plus, Trash2, Copy, Edit, ChevronDown, ArrowLeft } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";

interface ProjectPageProps {
  projectId?: string;
  onBack?: () => void;
}

export const ProjectPage = ({ projectId, onBack }: ProjectPageProps) => {
  const [activeTab, setActiveTab] = useState("Jobs");
  const { data: quotes } = useQuotes();

  // Find the project/quote data
  const project = quotes?.find(q => q.id === projectId) || {
    id: "1",
    quote_number: "24-12-0001",
    client_id: "Christine Ogden",
    total_amount: 8145.27
  };

  const navItems = [
    { id: "Jobs", label: "Jobs" },
    { id: "Invoice", label: "Invoice" },
    { id: "Workshop", label: "Workshop" }
  ];

  // Mock room data matching your design
  const mockRooms = [
    {
      id: "1",
      name: "Dining Room",
      total: 3626.80,
      treatments: [
        {
          id: "1",
          type: "Curtains",
          image: "/lovable-uploads/1ac27f03-ddd5-4b5d-8d03-c48007a3ba62.png",
          details: {
            railWidth: "300 cm",
            curtainDrop: "200 cm",
            headingName: "Eyelet Curtain",
            lining: "Blackout",
            eyeletRing: "Gold rings 8mm",
            fabricArticle: "SAG/02 Monday Blues",
            fabricPrice: "$1,048.72",
            liningPrice: "$135.00",
            manufacturingPrice: "$1,422.00",
            totalPrice: "$2,657.72"
          }
        },
        {
          id: "2",
          type: "Above Kitchen Sink",
          image: "/lovable-uploads/1ac27f03-ddd5-4b5d-8d03-c48007a3ba62.png",
          details: {
            recess: "Inside mount (Recess Fit)",
            mechanismWidth: "200 cm",
            height: "150 cm",
            fabricArticle: "OSL/01 Pepper",
            fabricPrice: "$358.54"
          }
        }
      ]
    },
    {
      id: "2",
      name: "Bobby's Bedroom Window",
      total: 891.67,
      treatments: [
        {
          id: "3",
          type: "Curtains",
          image: "/lovable-uploads/1ac27f03-ddd5-4b5d-8d03-c48007a3ba62.png",
          details: {
            railWidth: "200 cm",
            curtainDrop: "250 cm",
            headingName: "Pencil Pleat",
            lining: "Blackout",
            fabricArticle: "Sky Gray 01",
            fabricPrice: "$76.67",
            liningPrice: "$41.00",
            manufacturingPrice: "$774.00",
            totalPrice: "$891.67"
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          {/* Top Header with Client Info */}
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
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  👤
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">{project.client_id}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select defaultValue="payment">
                <SelectTrigger className="w-32 bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="order">
                <SelectTrigger className="w-32 bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="bg-white border-gray-300">
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-0">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={`px-6 py-2 rounded-none border-b-2 ${
                  activeTab === item.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Total and Add Room Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-1">
              Total: ${project.total_amount?.toFixed(2) || '8145.27'} (before GST)
            </h2>
          </div>
          <Button className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2">
            <Plus className="h-4 w-4 mr-2" />
            Add room
          </Button>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {mockRooms.map((room) => (
            <div key={room.id} className="space-y-6">
              {/* Room Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{room.name}</h3>
                  <p className="text-3xl font-bold text-gray-900">${room.total}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="text-gray-500 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-500">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-500">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Treatments */}
              {room.treatments.map((treatment) => (
                <Card key={treatment.id} className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-6">
                      {/* Fabric Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={treatment.image}
                          alt="Fabric sample" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Treatment Details */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">{treatment.type}</h4>
                          <div className="flex items-center space-x-3">
                            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                              Full details
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-500 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-gray-500">
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Treatment Details Grid */}
                        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                          {treatment.details.railWidth && (
                            <>
                              <span className="text-gray-600">Rail width</span>
                              <span className="text-gray-900">{treatment.details.railWidth}</span>
                            </>
                          )}
                          {treatment.details.curtainDrop && (
                            <>
                              <span className="text-gray-600">Curtain drop</span>
                              <span className="text-gray-900">{treatment.details.curtainDrop}</span>
                            </>
                          )}
                          {treatment.details.headingName && (
                            <>
                              <span className="text-gray-600">Heading name</span>
                              <span className="text-gray-900">{treatment.details.headingName}</span>
                            </>
                          )}
                          {treatment.details.lining && (
                            <>
                              <span className="text-gray-600">Lining</span>
                              <span className="text-gray-900">{treatment.details.lining}</span>
                            </>
                          )}
                          {treatment.details.eyeletRing && (
                            <>
                              <span className="text-gray-600">Eyelet Ring</span>
                              <span className="text-gray-900">{treatment.details.eyeletRing}</span>
                            </>
                          )}
                          {treatment.details.fabricArticle && (
                            <>
                              <span className="text-gray-600">Fabric article</span>
                              <span className="text-gray-900">{treatment.details.fabricArticle}</span>
                            </>
                          )}
                          {treatment.details.fabricPrice && (
                            <>
                              <span className="text-gray-600">Fabric price</span>
                              <span className="text-gray-900 font-medium">{treatment.details.fabricPrice}</span>
                            </>
                          )}
                          {treatment.details.liningPrice && (
                            <>
                              <span className="text-gray-600">Lining price</span>
                              <span className="text-gray-900">{treatment.details.liningPrice}</span>
                            </>
                          )}
                          {treatment.details.manufacturingPrice && (
                            <>
                              <span className="text-gray-600">Manufacturing price</span>
                              <span className="text-gray-900">{treatment.details.manufacturingPrice}</span>
                            </>
                          )}
                          {treatment.details.totalPrice && (
                            <>
                              <span className="text-gray-600">Total price</span>
                              <span className="text-gray-900 font-semibold">{treatment.details.totalPrice}</span>
                            </>
                          )}
                          {treatment.details.recess && (
                            <>
                              <span className="text-gray-600">Recess</span>
                              <span className="text-gray-900">{treatment.details.recess}</span>
                            </>
                          )}
                          {treatment.details.mechanismWidth && (
                            <>
                              <span className="text-gray-600">Mechanism width</span>
                              <span className="text-gray-900">{treatment.details.mechanismWidth}</span>
                            </>
                          )}
                          {treatment.details.height && (
                            <>
                              <span className="text-gray-600">Height</span>
                              <span className="text-gray-900">{treatment.details.height}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Product Button */}
              <div className="flex justify-center">
                <Select>
                  <SelectTrigger className="w-64 bg-gray-50 border-gray-300 text-gray-600">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="curtains">Curtains</SelectItem>
                    <SelectItem value="blinds">Blinds</SelectItem>
                    <SelectItem value="shutters">Shutters</SelectItem>
                    <SelectItem value="valances">Valances</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
