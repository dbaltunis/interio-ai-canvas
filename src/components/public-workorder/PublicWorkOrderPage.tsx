import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Calendar, Package, CheckCircle2 } from 'lucide-react';
import { PublicItemCard } from './PublicItemCard';
import { format } from 'date-fns';

interface PublicWorkOrderPageProps {
  project: {
    id: string;
    name: string;
    order_number?: string;
    site_address?: string;
    installation_date?: string;
    clients?: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  treatments: Array<{
    id: string;
    treatment_type: string;
    treatment_name?: string;
    product_name?: string;
    mounting_type?: string;
    measurements?: {
      width?: number;
      height?: number;
      [key: string]: any;
    };
    notes?: string;
    status?: string;
    rooms?: {
      id: string;
      name: string;
    };
  }>;
}

// Local storage key for checklist progress
const getStorageKey = (projectId: string) => `work-order-progress-${projectId}`;

export const PublicWorkOrderPage: React.FC<PublicWorkOrderPageProps> = ({ 
  project, 
  treatments 
}) => {
  const [completedItems, setCompletedItems] = useState<Record<string, string[]>>({});

  // Load saved progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(getStorageKey(project.id));
    if (savedProgress) {
      try {
        setCompletedItems(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Error loading saved progress:', e);
      }
    }
  }, [project.id]);

  // Save progress to localStorage
  const saveProgress = (itemId: string, completed: string[]) => {
    const updated = { ...completedItems, [itemId]: completed };
    setCompletedItems(updated);
    localStorage.setItem(getStorageKey(project.id), JSON.stringify(updated));
  };

  // Group treatments by room
  const groupedTreatments = useMemo(() => {
    const groups: Record<string, typeof treatments> = {};
    treatments.forEach(treatment => {
      const roomName = treatment.rooms?.name || 'Unassigned';
      if (!groups[roomName]) {
        groups[roomName] = [];
      }
      groups[roomName].push(treatment);
    });
    return groups;
  }, [treatments]);

  // Calculate overall progress
  const totalItems = treatments.length;
  const completedCount = Object.values(completedItems).filter(
    steps => steps.length > 0
  ).length;

  const clientName = project.clients?.name || 'Client';
  const clientPhone = project.clients?.phone;
  const siteAddress = project.site_address || project.clients?.address;

  // Format Google Maps URL
  const mapsUrl = siteAddress 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteAddress)}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-primary text-primary-foreground shadow-lg">
        <div className="px-4 py-3 max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-80">Work Order</p>
              <h1 className="font-bold text-lg">
                {project.order_number || project.name}
              </h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              {completedCount}/{totalItems} Items
            </Badge>
          </div>
        </div>
      </header>

      {/* Client Info Card */}
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <Card>
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
              {project.installation_date && (
                <div className="text-right text-sm">
                  <p className="text-muted-foreground flex items-center gap-1 justify-end">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(project.installation_date), 'dd MMM yyyy')}
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

        {/* Progress Summary */}
        {totalItems > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{totalItems} item{totalItems !== 1 ? 's' : ''} to complete</span>
            {completedCount > 0 && (
              <>
                <span>•</span>
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {completedCount} started
                </span>
              </>
            )}
          </div>
        )}

        {/* Treatments by Room */}
        {Object.entries(groupedTreatments).map(([roomName, roomTreatments]) => (
          <div key={roomName} className="space-y-3">
            <h2 className="font-semibold text-base flex items-center gap-2 pt-2">
              {roomName}
              <Badge variant="outline" className="text-xs font-normal">
                {roomTreatments.length}
              </Badge>
            </h2>
            
            {roomTreatments.map((treatment) => (
              <PublicItemCard
                key={treatment.id}
                treatment={treatment}
                completedSteps={completedItems[treatment.id] || []}
                onStepsChange={(steps) => saveProgress(treatment.id, steps)}
              />
            ))}
          </div>
        ))}

        {/* Empty state */}
        {treatments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No items in this work order</p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground py-8">
          <p>Progress is saved locally on this device</p>
        </footer>
      </div>
    </div>
  );
};
