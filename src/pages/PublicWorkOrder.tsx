import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProjectByToken, fetchWorkshopDataForProject } from '@/hooks/useWorkOrderSharing';
import { trackWorkOrderAccess } from '@/hooks/useWorkOrderRecipients';
import { PublicWorkOrderPage } from '@/components/public-workorder/PublicWorkOrderPage';
import { PINEntryDialog } from '@/components/public-workorder/PINEntryDialog';
import { LoadingState } from '@/components/ui/loading-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileX } from 'lucide-react';
import type { WorkshopData } from '@/hooks/useWorkshopData';

type PermissionLevel = 'view' | 'edit' | 'admin';

const PublicWorkOrder: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<any>(null);
  const [workshopData, setWorkshopData] = useState<WorkshopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPIN, setRequiresPIN] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('edit'); // Default to edit for shared work orders

  const loadWorkshopData = useCallback(async (projectData: any) => {
    // Fetch workshop data with project metadata for header
    const data = await fetchWorkshopDataForProject(projectData.id, {
      name: projectData.name,
      job_number: projectData.job_number,
      order_number: projectData.order_number,
      due_date: projectData.due_date,
      created_at: projectData.created_at,
      clients: projectData.clients,
    });
    setWorkshopData(data);
  }, []);

  const loadProject = useCallback(async () => {
    if (!token) {
      setError('Invalid link');
      setLoading(false);
      return;
    }

    try {
      const projectData = await fetchProjectByToken(token);
      
      if (!projectData) {
        setError('Work order not found or link has expired');
        setLoading(false);
        return;
      }

      setProject(projectData);

      // Check if PIN is required
      if (projectData.work_order_pin) {
        setRequiresPIN(true);
        setLoading(false);
        return;
      }

      // Load workshop data and track access
      await loadWorkshopData(projectData);
      
      // Track access (fire and forget)
      trackWorkOrderAccess(projectData.id);
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading work order:', err);
      setError('Failed to load work order');
      setLoading(false);
    }
  }, [token, loadWorkshopData]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handlePINVerified = useCallback(async () => {
    setPinVerified(true);
    setRequiresPIN(false);
    
    // Load workshop data after PIN verification
    if (project) {
      await loadWorkshopData(project);
      
      // Track access after PIN verification
      trackWorkOrderAccess(project.id);
    }
  }, [project, loadWorkshopData]);

  const verifyPIN = useCallback((enteredPIN: string): boolean => {
    return project?.work_order_pin === enteredPIN;
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LoadingState text="Loading work order..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <FileX className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-lg">Work Order Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>{error}</p>
            <p className="mt-2 text-sm">
              Please contact your supplier for a valid link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresPIN && !pinVerified) {
    return (
      <PINEntryDialog 
        open={true}
        onVerify={verifyPIN}
        onSuccess={handlePINVerified}
      />
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-warning" />
            </div>
            <CardTitle className="text-lg">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Unable to load work order details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PublicWorkOrderPage 
      project={project} 
      workshopData={workshopData}
      permissionLevel={permissionLevel}
    />
  );
};

export default PublicWorkOrder;
