import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { WorkshopInformation } from '@/components/workroom/templates/WorkshopInformation';
import { ItemStatusToggle, type ItemStatus } from './ItemStatusToggle';
import { supabase } from '@/integrations/supabase/client';
import type { WorkshopData } from '@/hooks/useWorkshopData';

interface PublicWorkOrderPageProps {
  project: {
    id: string;
    name: string;
    job_number?: string;
    order_number?: string;
    due_date?: string;
    clients?: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  workshopData: WorkshopData | null;
  permissionLevel?: 'view' | 'edit' | 'admin';
}

export const PublicWorkOrderPage: React.FC<PublicWorkOrderPageProps> = ({ 
  project, 
  workshopData,
  permissionLevel = 'view'
}) => {
  const clientName = project.clients?.name || 'Client';
  const clientPhone = project.clients?.phone;
  const siteAddress = project.clients?.address;
  const installationDate = project.due_date;

  // Track status changes in state for real-time UI updates
  const [itemStatuses, setItemStatuses] = useState<Record<string, ItemStatus>>({});

  // Initialize statuses from workshop data
  useEffect(() => {
    if (workshopData) {
      const initialStatuses: Record<string, ItemStatus> = {};
      workshopData.rooms.forEach(room => {
        room.items.forEach(item => {
          initialStatuses[item.id] = (item as any).status || 'pending';
        });
      });
      setItemStatuses(initialStatuses);
    }
  }, [workshopData]);

  // Subscribe to real-time status updates
  useEffect(() => {
    if (!project.id) return;

    const channel = supabase
      .channel(`workshop-status-${project.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workshop_items',
          filter: `project_id=eq.${project.id}`
        },
        (payload) => {
          const { id, status } = payload.new as { id: string; status: ItemStatus };
          setItemStatuses(prev => ({ ...prev, [id]: status }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id]);

  const handleStatusChange = (itemId: string, newStatus: ItemStatus) => {
    setItemStatuses(prev => ({ ...prev, [itemId]: newStatus }));
  };

  // Format Google Maps URL
  const mapsUrl = siteAddress 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteAddress)}`
    : null;

  const totalItems = workshopData?.projectTotals?.itemsCount || 0;
  const canEdit = permissionLevel === 'edit' || permissionLevel === 'admin';

  // Count completed items
  const completedCount = Object.values(itemStatuses).filter(
    s => s === 'installed' || s === 'ready'
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-lg print:hidden">
        <div className="px-4 py-3 max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Work Order</p>
              <h1 className="font-bold text-lg">
                {project.job_number || project.order_number || project.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                  {completedCount} Done
                </Badge>
              )}
              <Badge variant="secondary" className="text-xs">
                {totalItems} Item{totalItems !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Client Info Card - Mobile friendly with clickable links */}
      <div className="px-4 py-4 max-w-4xl mx-auto space-y-4">
        <Card className="print:hidden">
          <CardContent className="p-4 space-y-3">
            {/* Client & Phone */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold text-base">{clientName}</p>
                {clientPhone && (
                  <a 
                    href={`tel:${clientPhone}`}
                    className="flex items-center gap-1 text-primary hover:underline text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    {clientPhone}
                  </a>
                )}
              </div>
              {installationDate && (
                <div className="text-right text-sm">
                  <p className="text-muted-foreground flex items-center gap-1 justify-end">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(installationDate), 'dd MMM yyyy')}
                  </p>
                </div>
              )}
            </div>

            {/* Address */}
            {siteAddress && (
              <a 
                href={mapsUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-2 -mx-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{siteAddress}</span>
              </a>
            )}
          </CardContent>
        </Card>

        {/* Progress Summary with Status Toggle Option */}
        {totalItems > 0 && canEdit && (
          <div className="flex items-center justify-between text-sm text-muted-foreground print:hidden bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span>
                {completedCount} of {totalItems} item{totalItems !== 1 ? 's' : ''} completed
              </span>
            </div>
            <span className="text-xs">Tap status buttons to update</span>
          </div>
        )}

        {/* Workshop Information with Status Controls */}
        {workshopData ? (
          <div className="space-y-4">
            {/* Custom rendering with status toggles for mobile */}
            {workshopData.rooms.map((room, roomIdx) => (
              <div key={roomIdx} className="space-y-2">
                <h3 className="text-base font-bold bg-muted px-3 py-2 rounded">
                  {room.roomName}
                </h3>
                
                {room.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-3 space-y-3">
                      {/* Item header with fabric image */}
                      <div className="flex gap-3">
                        {item.visualDetails?.thumbnailUrl && (
                          <img 
                            src={item.visualDetails.thumbnailUrl}
                            alt="Fabric"
                            className="w-16 h-16 object-cover rounded border flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.location || item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.treatmentType || 'Treatment'}
                          </div>
                          {item.fabricDetails && (
                            <div className="text-sm text-blue-700 mt-1 font-medium truncate">
                              {item.fabricDetails.name}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Measurements - compact */}
                      {item.measurements && (
                        <div className="flex gap-4 text-xs bg-muted/50 p-2 rounded">
                          {item.measurements.width && (
                            <div>
                              <span className="text-muted-foreground">W:</span>{' '}
                              <span className="font-mono font-medium">
                                {item.measurements.width}{item.measurements.unit}
                              </span>
                            </div>
                          )}
                          {item.measurements.drop && (
                            <div>
                              <span className="text-muted-foreground">D:</span>{' '}
                              <span className="font-mono font-medium">
                                {item.measurements.drop}{item.measurements.unit}
                              </span>
                            </div>
                          )}
                          {item.fabricUsage && (
                            <div>
                              <span className="text-muted-foreground">Fabric:</span>{' '}
                              <span className="font-mono font-medium">
                                {item.fabricUsage.linearMeters.toFixed(2)}m
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Specs row */}
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {item.fullness && (
                          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                            {item.fullness.headingType} • {item.fullness.ratio}x
                          </span>
                        )}
                        {item.fabricDetails?.fabricWidth && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            Width: {item.fabricDetails.fabricWidth}cm
                          </span>
                        )}
                        {item.liningDetails && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {item.liningDetails.name}
                          </span>
                        )}
                      </div>

                      {/* Notes if any */}
                      {item.notes && (
                        <div className="text-xs text-muted-foreground bg-yellow-50 p-2 rounded">
                          {item.notes}
                        </div>
                      )}

                      {/* Status toggle for field workers */}
                      <div className="pt-2 border-t">
                        <ItemStatusToggle
                          itemId={item.id}
                          currentStatus={itemStatuses[item.id] || 'pending'}
                          canEdit={canEdit}
                          onStatusChange={handleStatusChange}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in this work order</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-8 print:hidden">
          <p>Shared work order document</p>
        </footer>
      </div>
    </div>
  );
};
