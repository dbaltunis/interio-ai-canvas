import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProjectByToken, fetchTreatmentsForProject } from '@/hooks/useWorkOrderSharing';
import { PublicWorkOrderPage } from '@/components/public-workorder/PublicWorkOrderPage';
import { PINEntryDialog } from '@/components/public-workorder/PINEntryDialog';
import { LoadingState } from '@/components/ui/loading-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileX } from 'lucide-react';

const PublicWorkOrder: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPIN, setRequiresPIN] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

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

      // Load treatments
      const treatmentsData = await fetchTreatmentsForProject(projectData.id);
      setTreatments(treatmentsData);
      setLoading(false);
    } catch (err) {
      console.error('Error loading work order:', err);
      setError('Failed to load work order');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handlePINVerified = useCallback(async () => {
    setPinVerified(true);
    setRequiresPIN(false);
    
    // Load treatments after PIN verification
    if (project) {
      const treatmentsData = await fetchTreatmentsForProject(project.id);
      setTreatments(treatmentsData);
    }
  }, [project]);

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
      treatments={treatments} 
    />
  );
};

export default PublicWorkOrder;
