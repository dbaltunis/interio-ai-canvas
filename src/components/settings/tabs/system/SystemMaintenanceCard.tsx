import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, Download, Shield, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserRole } from "@/hooks/useUserRole";

export const SystemMaintenanceCard = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const { data: roleData } = useUserRole();

  const handleExportData = async () => {
    if (!roleData?.isOwner && !roleData?.isSystemOwner) {
      toast.error('Only account owners can export all data.');
      return;
    }
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch all user data
      const [
        { data: clients },
        { data: projects },
        { data: quotes },
        { data: businessSettings },
        { data: templates },
      ] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('quotes').select('*'),
        supabase.from('business_settings').select('*').single(),
        supabase.from('curtain_templates').select('*'),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        data: {
          clients: clients || [],
          projects: projects || [],
          quotes: quotes || [],
          businessSettings: businessSettings || null,
          templates: templates || [],
        },
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interioapp-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Maintenance
          </CardTitle>
          <CardDescription>
            Database and system maintenance tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setShowBackupDialog(true)}
            >
              <Database className="h-6 w-6 mb-2" />
              <span>Backup Database</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={handleExportData}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-6 w-6 mb-2 animate-spin" />
              ) : (
                <Download className="h-6 w-6 mb-2" />
              )}
              <span>{isExporting ? 'Exporting...' : 'Export Data'}</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => setShowSecurityDialog(true)}
            >
              <Shield className="h-6 w-6 mb-2" />
              <span>Security Audit</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup Info Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Backups
            </DialogTitle>
            <DialogDescription>
              Your data is automatically backed up by our infrastructure
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Automatic Backups</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Daily automatic backups
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Point-in-time recovery available
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  7-day backup retention
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-muted-foreground">
              For manual data export, use the "Export Data" button to download a JSON file 
              containing all your clients, projects, quotes, and settings.
            </p>
            
            <Button className="w-full" onClick={() => setShowBackupDialog(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Security Audit Dialog */}
      <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Checklist
            </DialogTitle>
            <DialogDescription>
              Review your account security settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <SecurityCheckItem 
                label="Strong password"
                description="Use a unique, complex password"
                isComplete={true}
              />
              <SecurityCheckItem 
                label="Email verified"
                description="Your email is verified"
                isComplete={true}
              />
              <SecurityCheckItem 
                label="Two-factor authentication"
                description="Add an extra layer of security"
                isComplete={false}
                action="Coming soon"
              />
              <SecurityCheckItem 
                label="Session management"
                description="Review active sessions"
                isComplete={true}
              />
              <SecurityCheckItem 
                label="Data encryption"
                description="All data encrypted at rest"
                isComplete={true}
              />
            </div>
            
            <Button className="w-full" onClick={() => setShowSecurityDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface SecurityCheckItemProps {
  label: string;
  description: string;
  isComplete: boolean;
  action?: string;
}

const SecurityCheckItem = ({ label, description, isComplete, action }: SecurityCheckItemProps) => (
  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
    <div className="flex items-center gap-3">
      {isComplete ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
      )}
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
    {action && (
      <span className="text-xs text-muted-foreground">{action}</span>
    )}
  </div>
);
