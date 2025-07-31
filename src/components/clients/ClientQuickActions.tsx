import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail, FileText, Briefcase, Phone } from 'lucide-react';
import { QuickEmailDialog } from './QuickEmailDialog';
import { QuickInvoiceDialog } from './QuickInvoiceDialog';
import { QuickJobDialog } from './QuickJobDialog';

interface ClientQuickActionsProps {
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export const ClientQuickActions = ({ client }: ClientQuickActionsProps) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);

  const actions = [
    {
      icon: Mail,
      label: 'Send Email',
      action: () => setEmailDialogOpen(true),
      disabled: !client.email,
      color: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
    },
    {
      icon: FileText,
      label: 'Create Invoice',
      action: () => setInvoiceDialogOpen(true),
      disabled: false,
      color: 'text-green-600 hover:text-green-700 hover:bg-green-50',
    },
    {
      icon: Briefcase,
      label: 'Start Job',
      action: () => setJobDialogOpen(true),
      disabled: false,
      color: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
    },
    {
      icon: Phone,
      label: 'Call Client',
      action: () => client.phone && window.open(`tel:${client.phone}`),
      disabled: !client.phone,
      color: 'text-orange-600 hover:text-orange-700 hover:bg-orange-50',
    },
  ];

  return (
    <>
      <Card className="p-3 bg-gradient-to-r from-background to-muted/20 border-border/40">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Quick Actions</h3>
          <div className="flex gap-2">
            {actions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  disabled={action.disabled}
                  onClick={action.action}
                  className={`h-9 px-3 ${action.color} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={action.disabled ? `${action.label} (${action.icon === Mail ? 'No email' : 'No phone'})` : action.label}
                >
                  <IconComponent className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline text-xs">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      <QuickEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        client={client}
      />
      
      <QuickInvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        client={client}
      />
      
      <QuickJobDialog
        open={jobDialogOpen}
        onOpenChange={setJobDialogOpen}
        client={client}
      />
    </>
  );
};