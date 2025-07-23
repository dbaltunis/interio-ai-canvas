
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useMeasurementUnits } from "@/hooks/useMeasurementUnits";

interface MotorizationSelectorProps {
  selectedMotorization: any;
  onSelectionChange: (selection: any) => void;
  treatmentType: string;
}

export const MotorizationSelector = ({
  selectedMotorization,
  onSelectionChange,
  treatmentType
}: MotorizationSelectorProps) => {
  const { formatCurrency } = useMeasurementUnits();

  const motorOptions = [
    {
      id: "none",
      name: "Manual Operation",
      description: "Traditional manual operation",
      price: 0,
      battery: false,
      remote: false
    },
    {
      id: "battery_motor",
      name: "Battery Motor",
      description: "Rechargeable battery-powered motor",
      price: 180,
      battery: true,
      remote: true,
      batteryLife: "6-12 months"
    },
    {
      id: "wired_motor",
      name: "Wired Motor",
      description: "Mains-powered motor system",
      price: 220,
      battery: false,
      remote: true,
      installation: "Professional required"
    },
    {
      id: "solar_motor",
      name: "Solar Motor",
      description: "Solar-powered with battery backup",
      price: 280,
      battery: true,
      remote: true,
      batteryLife: "Unlimited (solar)"
    }
  ];

  const remoteOptions = [
    {
      id: "basic",
      name: "Basic Remote",
      description: "Simple up/down/stop controls",
      price: 25,
      channels: 1
    },
    {
      id: "multi_channel",
      name: "Multi-Channel Remote",
      description: "Control multiple windows",
      price: 45,
      channels: 5
    },
    {
      id: "smart_hub",
      name: "Smart Hub + App",
      description: "Smartphone control and scheduling",
      price: 85,
      channels: 15,
      features: ["App Control", "Scheduling", "Voice Control"]
    }
  ];

  const batteryOptions = [
    {
      id: "standard",
      name: "Standard Battery Pack",
      description: "Lithium-ion rechargeable",
      price: 35,
      capacity: "2000mAh"
    },
    {
      id: "extended",
      name: "Extended Battery Pack",
      description: "Higher capacity for longer life",
      price: 55,
      capacity: "4000mAh"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Motorization Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {motorOptions.map((option) => (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMotorization?.id === option.id 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/30'
                }`}
                onClick={() => onSelectionChange(option)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm">{option.name}</div>
                    <Badge variant={option.id === "none" ? "secondary" : "default"} className="text-xs">
                      {option.price === 0 ? "Free" : formatCurrency(option.price)}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {option.description}
                  </div>
                  {option.batteryLife && (
                    <div className="text-xs text-green-600">
                      Battery life: {option.batteryLife}
                    </div>
                  )}
                  {option.installation && (
                    <div className="text-xs text-orange-600">
                      {option.installation}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedMotorization && selectedMotorization.id !== "none" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Remote Control Selection */}
          {selectedMotorization.remote && (
            <Card>
              <CardHeader>
                <CardTitle>Remote Control</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {remoteOptions.map((remote) => (
                    <Card
                      key={remote.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium text-sm">{remote.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {formatCurrency(remote.price)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {remote.description}
                        </div>
                        <div className="text-xs">
                          Channels: {remote.channels}
                        </div>
                        {remote.features && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {remote.features.map((feature) => (
                              <Badge key={feature} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Battery Options */}
          {selectedMotorization.battery && (
            <Card>
              <CardHeader>
                <CardTitle>Battery Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {batteryOptions.map((battery) => (
                    <Card
                      key={battery.id}
                      className="cursor-pointer hover:bg-muted/30 transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="font-medium text-sm">{battery.name}</div>
                          <Badge variant="outline" className="text-xs">
                            {formatCurrency(battery.price)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {battery.description}
                        </div>
                        <div className="text-xs">
                          Capacity: {battery.capacity}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
