import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { fetchWorkshopDataForProject, createViewerSession, getViewerSession } from '@/hooks/useWorkOrderSharing';
import { fetchShareLinkByToken, fetchProjectByShareLink, type ShareLink } from '@/hooks/useShareLinks';
import { PublicWorkOrderPage } from '@/components/public-workorder/PublicWorkOrderPage';
import { PINEntryDialog } from '@/components/public-workorder/PINEntryDialog';
import { ViewerIdentityDialog } from '@/components/public-workorder/ViewerIdentityDialog';
import { LoadingState } from '@/components/ui/loading-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileX } from 'lucide-react';
import type { WorkshopData } from '@/hooks/useWorkshopData';

type PermissionLevel = 'view' | 'edit' | 'admin';

interface ViewerInfo {
  name: string;
  email?: string;
  sessionToken: string;
}

const PublicWorkOrder: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [project, setProject] = useState<any>(null);
  const [workshopData, setWorkshopData] = useState<WorkshopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPIN, setRequiresPIN] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);
  const [viewerIdentified, setViewerIdentified] = useState(false);
  const [currentViewer, setCurrentViewer] = useState<ViewerInfo | null>(null);
  const [isSubmittingIdentity, setIsSubmittingIdentity] = useState(false);
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('edit');

  const loadWorkshopData = useCallback(async (projectData: any, link: ShareLink) => {
    // Use treatment filter from the share link
    const treatmentFilter = link.treatment_filter;
    const treatmentTypes = Array.isArray(treatmentFilter) && treatmentFilter.length > 0 
      ? treatmentFilter.filter((t: string) => t !== 'all')
      : undefined;
    
    const data = await fetchWorkshopDataForProject(
      projectData.id, 
      {
        name: projectData.name,
        job_number: projectData.job_number,
        order_number: projectData.order_number,
        due_date: projectData.due_date,
        created_at: projectData.created_at,
        clients: projectData.clients,
      },
      treatmentTypes && treatmentTypes.length > 0 ? { treatmentTypes } : undefined
    );
    setWorkshopData(data);
  }, []);

  // Check for existing viewer session on mount
  useEffect(() => {
    if (!token) return;
    
    const sessionToken = localStorage.getItem(`wo_viewer_${token}`);
    if (sessionToken) {
      getViewerSession(sessionToken).then(viewer => {
        if (viewer) {
          setCurrentViewer({
            name: viewer.recipient_name,
            email: viewer.recipient_email || undefined,
            sessionToken
          });
          setViewerIdentified(true);
        }
      });
    }
  }, [token]);

  const loadShareLink = useCallback(async () => {
    if (!token) {
      setError('Invalid link');
      setLoading(false);
      return;
    }

    try {
      // First, look up the share link by token
      const link = await fetchShareLinkByToken(token);
      
      if (!link) {
        setError('Work order not found or link has expired');
        setLoading(false);
        return;
      }

      setShareLink(link);

      // Then fetch the project data using the project_id from the share link
      const projectData = await fetchProjectByShareLink(link.project_id);
      
      if (!projectData) {
        setError('Project not found');
        setLoading(false);
        return;
      }

      setProject(projectData);

      // Check if PIN is required
      if (link.pin) {
        setRequiresPIN(true);
        setLoading(false);
        return;
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading work order:', err);
      setError('Failed to load work order');
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadShareLink();
  }, [loadShareLink]);

  // Load workshop data when viewer is identified
  useEffect(() => {
    if (viewerIdentified && project && shareLink && !workshopData) {
      loadWorkshopData(project, shareLink);
    }
  }, [viewerIdentified, project, shareLink, workshopData, loadWorkshopData]);

  const handlePINVerified = useCallback(() => {
    setPinVerified(true);
    setRequiresPIN(false);
  }, []);

  const verifyPIN = useCallback((enteredPIN: string): boolean => {
    return shareLink?.pin === enteredPIN;
  }, [shareLink]);

  const handleViewerIdentified = useCallback(async (viewer: { name: string; email?: string }) => {
    if (!project?.id || !token || !shareLink) return;
    
    setIsSubmittingIdentity(true);
    try {
      const session = await createViewerSession(project.id, viewer.name, viewer.email, shareLink.id);
      
      if (session) {
        // Store session token locally
        localStorage.setItem(`wo_viewer_${token}`, session.session_token);
        
        setCurrentViewer({
          name: viewer.name,
          email: viewer.email,
          sessionToken: session.session_token
        });
        setViewerIdentified(true);
      } else {
        // Fallback: allow access even if session creation failed
        setViewerIdentified(true);
      }
    } catch (err) {
      console.error('Error creating viewer session:', err);
      // Allow access anyway
      setViewerIdentified(true);
    } finally {
      setIsSubmittingIdentity(false);
    }
  }, [project?.id, token, shareLink]);

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

  // Step 1: PIN verification (if required)
  if (requiresPIN && !pinVerified) {
    return (
      <PINEntryDialog 
        open={true}
        onVerify={verifyPIN}
        onSuccess={handlePINVerified}
      />
    );
  }

  // Step 2: Viewer identification
  if (!viewerIdentified) {
    return (
      <ViewerIdentityDialog
        open={true}
        onIdentified={handleViewerIdentified}
        projectName={project?.name}
        isSubmitting={isSubmittingIdentity}
      />
    );
  }

  if (!project || !shareLink) {
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
      viewerName={currentViewer?.name}
      shareLink={shareLink}
      sessionToken={currentViewer?.sessionToken}
    />
  );
};

export default PublicWorkOrder;
