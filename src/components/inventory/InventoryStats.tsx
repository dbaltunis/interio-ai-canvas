import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Palette,
  Wrench,
  DollarSign,
  BarChart3,
  Layers
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  unit_price?: number;
  cost_price?: number;
}

interface InventoryStatsProps {
  inventory: InventoryItem[];
  lowStockItems: InventoryItem[];
}

export const InventoryStats = ({ inventory, lowStockItems }: InventoryStatsProps) => {
  const totalValue = inventory.reduce((sum, item) => {
    return sum + ((item.unit_price || item.cost_price || 0) * item.quantity);
  }, 0);

  const fabricItems = inventory.filter(item => 
    item.category?.toLowerCase().includes("fabric") || 
    item.category?.toLowerCase().includes("textile")
  );

  const hardwareItems = inventory.filter(item => 
    item.category?.toLowerCase().includes("hardware") || 
    item.category?.toLowerCase().includes("track") || 
    item.category?.toLowerCase().includes("rod")
  );

  const accessoryItems = inventory.filter(item => 
    item.category?.toLowerCase().includes("accessories") ||
    item.category?.toLowerCase().includes("trim")
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const stats = [
    {
      title: "Total Inventory Value",
      value: formatCurrency(totalValue),
      icon: DollarSign,
      description: "Current stock value",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Fabric Items",
      value: fabricItems.length.toString(),
      icon: Palette,
      description: "Curtain & blind fabrics",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Hardware Items",
      value: hardwareItems.length.toString(),
      icon: Wrench,
      description: "Tracks, rods & fittings",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Low Stock Alerts",
      value: lowStockItems.length.toString(),
      icon: AlertTriangle,
      description: "Need restocking",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.borderColor} transition-all duration-200 hover:shadow-md`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};