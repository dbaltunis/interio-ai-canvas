
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Copy, Edit, ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuotes } from "@/hooks/useQuotes";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface ProjectPageProps {
  projectId?: string;
  onBack?: () => void;
}

export const ProjectPage = ({ projectId, onBack }: ProjectPageProps) => {
  const [activeTab, setActiveTab] = useState("Jobs");
  const { data: quotes = [] } = useQuotes();
  const { units } = useMeasurementUnits();

  // Find the project/quote data
  const project = quotes.find(q => q.id === projectId) || {
    id: "1",
    quote_number: "QT-0048",
    client_id: "c54b7a3c-0565-4443-8498-4d137b10f39f",
    total_amount: 0
  };

  // Format currency properly
  const formatCurrency = (amount: number) => {
    const currencySymbols: Record<string, string> = {
      'NZD': 'NZ$',
      'AUD': 'A$',
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'ZAR': 'R'
    };
    const symbol = currencySymbols[units.currency] || units.currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  const navItems = [
    { id: "Jobs", label: "Jobs" },
    { id: "Invoice", label: "Invoice" },
    { id: "Workshop", label: "Workshop" }
  ];

  // Mock room data matching your exact design
  const mockRooms = [
    {
      id: "1",
      name: "Dining Room",
      total: 3626.8,
      treatments: [
        {
          id: "1",
          type: "Curtains",
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
          details: {
            fabricArticle: "OSL/01 Pepper"
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
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  C
                </div>
                <h1 className="text-lg font-medium text-gray-900">{project.quote_number}</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Select defaultValue="payment">
                <SelectTrigger className="w-32 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="quote">
                <SelectTrigger className="w-32 text-sm">
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

          {/* Navigation Tabs */}
          <div className="flex space-x-0">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "px-4 py-2 rounded-lg border-b-2 text-sm transition-all duration-200",
                  activeTab === item.id
                    ? "border-primary shadow-sm"
                    : "border-transparent hover:border-primary/30"
                )}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {/* Total and Add Room Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Total: {formatCurrency(project.total_amount || 0)} (before GST)
            </h2>
          </div>
          <Button variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add room
          </Button>
        </div>

        {/* Rooms Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockRooms.map((room) => (
            <div key={room.id} className="space-y-6">
              {/* Room Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{room.name}</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(room.total)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Treatments */}
              {room.treatments.map((treatment) => (
                <div key={treatment.id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    {/* Fabric Image */}
                    <div className="w-20 h-20 bg-gray-100 rounded border flex-shrink-0">
                      <img 
                        src="/lovable-uploads/1ac27f03-ddd5-4b5d-8d03-c48007a3ba62.png"
                        alt="Fabric sample" 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    
                    {/* Treatment Details */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">{treatment.type}</h4>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Full details
                            <ChevronDown className="h-3 w-3 ml-1" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Treatment Details Grid */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Product Button */}
              <div className="flex justify-center">
                <Select>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
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
