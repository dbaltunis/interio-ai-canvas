import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMeasurementWizardStore } from '@/stores/measurementWizardStore';

export const FabricStep: React.FC = () => {
  const { 
    selectedFabric, 
    selectedLining, 
    selectedInterlining,
    setFabric, 
    setLining, 
    setInterlining 
  } = useMeasurementWizardStore();
  
  const [fabrics, setFabrics] = useState<any[]>([]);
  const [linings, setLinings] = useState<any[]>([]);
  const [interlinings, setInterlinings] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFabrics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const orgId = session?.user?.user_metadata?.org_id;
        
        if (!orgId) return;

        const [fabricsRes, liningsRes, interliningRes] = await Promise.all([
          supabase
            .from('inventory_items')
            .select('*')
            .eq('org_id', orgId)
            .eq('type', 'fabric')
            .eq('is_active', true),
          supabase
            .from('inventory_items')
            .select('*')
            .eq('org_id', orgId)
            .eq('type', 'lining')
            .eq('is_active', true),
          supabase
            .from('inventory_items')
            .select('*')
            .eq('org_id', orgId)
            .eq('type', 'interlining')
            .eq('is_active', true)
        ]);

        if (fabricsRes.data) setFabrics(fabricsRes.data);
        if (liningsRes.data) setLinings(liningsRes.data);
        if (interliningRes.data) setInterlinings(interliningRes.data);
      } catch (error) {
        console.error('Error fetching fabrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFabrics();
  }, []);

  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(item.attributes).toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const FabricGrid = ({ 
    title, 
    items, 
    selectedItem, 
    onSelect, 
    description 
  }: {
    title: string;
    items: any[];
    selectedItem: any;
    onSelect: (item: any) => void;
    description: string;
  }) => (
    <div className="space-y-4">
      <div>
        <h4 className="text-md font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filterItems(items).map((item) => (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSelect(item)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{item.name}</CardTitle>
                {selectedItem?.id === item.id && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {item.sku && <Badge variant="outline">{item.sku}</Badge>}
                <Badge variant="secondary">${item.price || 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {item.attributes && Object.keys(item.attributes).length > 0 && (
                <div className="space-y-1">
                  {item.attributes.width_mm && (
                    <p className="text-xs text-muted-foreground">
                      Width: {item.attributes.width_mm}mm
                    </p>
                  )}
                  {item.attributes.repeat_mm && (
                    <p className="text-xs text-muted-foreground">
                      Repeat: {item.attributes.repeat_mm}mm
                    </p>
                  )}
                  {item.attributes.colour && (
                    <p className="text-xs text-muted-foreground">
                      Colour: {item.attributes.colour}
                    </p>
                  )}
                  {item.attributes.composition && (
                    <p className="text-xs text-muted-foreground">
                      Composition: {item.attributes.composition}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filterItems(items).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No {title.toLowerCase()} found matching your search.
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Fabrics & Linings</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select the main fabric and any linings or interlinings for your window treatment.
        </p>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fabrics, linings, or interlinings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <FabricGrid
        title="Main Fabric"
        items={fabrics}
        selectedItem={selectedFabric}
        onSelect={setFabric}
        description="Choose the primary fabric for your window treatment"
      />

      <FabricGrid
        title="Lining"
        items={linings}
        selectedItem={selectedLining}
        onSelect={setLining}
        description="Optional lining for light control and insulation"
      />

      <FabricGrid
        title="Interlining"
        items={interlinings}
        selectedItem={selectedInterlining}
        onSelect={setInterlining}
        description="Optional interlining for additional insulation and body"
      />

      {/* Selected items summary */}
      {(selectedFabric || selectedLining || selectedInterlining) && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFabric && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">Fabric: {selectedFabric.name}</span>
                  {selectedFabric.attributes?.width_mm && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({selectedFabric.attributes.width_mm}mm wide)
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFabric(undefined)}
                >
                  Remove
                </Button>
              </div>
            )}
            
            {selectedLining && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">Lining: {selectedLining.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLining(undefined)}
                >
                  Remove
                </Button>
              </div>
            )}
            
            {selectedInterlining && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <span className="font-medium">Interlining: {selectedInterlining.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setInterlining(undefined)}
                >
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};