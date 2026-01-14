import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { WorkshopInformation } from '@/components/workroom/templates/WorkshopInformation';
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
}

export const PublicWorkOrderPage: React.FC<PublicWorkOrderPageProps> = ({ 
  project, 
  workshopData
}) => {
  const clientName = project.clients?.name || 'Client';
  const clientPhone = project.clients?.phone;
  const siteAddress = project.clients?.address;
  const installationDate = project.due_date;

  // Format Google Maps URL
  const mapsUrl = siteAddress 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteAddress)}`
    : null;

  const totalItems = workshopData?.projectTotals?.itemsCount || 0;

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
            <Badge variant="secondary" className="text-xs">
              {totalItems} Item{totalItems !== 1 ? 's' : ''}
            </Badge>
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

        {/* Progress Summary */}
        {totalItems > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground print:hidden">
            <Package className="h-4 w-4" />
            <span>{totalItems} item{totalItems !== 1 ? 's' : ''} in this work order</span>
          </div>
        )}

        {/* Workshop Information - Same as in-app view */}
        {workshopData ? (
          <WorkshopInformation 
            data={workshopData}
            orientation="portrait"
            projectId={project.id}
            isPrintMode={false}
            isReadOnly={true}
          />
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
