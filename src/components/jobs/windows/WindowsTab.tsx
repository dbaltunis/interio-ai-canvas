import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Package2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { MeasurementWizard } from '@/components/measurement-wizard/MeasurementWizard';
import { WindowCard } from './WindowCard';
import { useToast } from '@/hooks/use-toast';

interface WindowsTabProps {
  projectId: string;
}

export const WindowsTab: React.FC<WindowsTabProps> = ({ projectId }) => {
  const [windows, setWindows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingWindowId, setEditingWindowId] = useState<string | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    fetchWindows();
  }, [projectId]);

  const fetchWindows = async () => {
    try {
      const { data, error } = await supabase
        .from('job_windows')
        .select(`
          *,
          product_templates (
            name
          )
        `)
        .eq('job_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const windowsWithTemplateNames = data?.map(window => ({
        ...window,
        template_name: window.product_templates?.name
      })) || [];
      
      setWindows(windowsWithTemplateNames);
    } catch (error) {
      console.error('Error fetching windows:', error);
      toast({
        title: "Error",
        description: "Failed to load windows",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWindow = () => {
    setEditingWindowId(undefined);
    setWizardOpen(true);
  };

  const handleEditWindow = (windowId: string) => {
    setEditingWindowId(windowId);
    setWizardOpen(true);
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
    setEditingWindowId(undefined);
    fetchWindows(); // Refresh the windows list
  };

  const handleAddToQuote = async (windowId: string) => {
    // TODO: Implement add to quote functionality
    toast({
      title: "Add to Quote",
      description: "This feature will be implemented soon",
    });
  };

  const handleWorkroomOrder = async (windowId: string) => {
    // TODO: Implement workroom order functionality
    toast({
      title: "Workroom Order",
      description: "This feature will be implemented soon",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Windows & Treatments</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage window treatments for this job
          </p>
        </div>
        <Button onClick={handleAddWindow} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Window
        </Button>
      </div>

      {windows.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-center mb-2">No windows added yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
              Add your first window treatment to get started with measurements and pricing.
            </p>
            <Button onClick={handleAddWindow} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add First Window
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {windows.map((window) => (
            <WindowCard
              key={window.id}
              window={window}
              onEdit={handleEditWindow}
              onAddToQuote={handleAddToQuote}
              onWorkroomOrder={handleWorkroomOrder}
            />
          ))}
        </div>
      )}

      <MeasurementWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        jobId={projectId}
        windowId={editingWindowId}
        onComplete={handleWizardClose}
      />
    </div>
  );
};