import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Search, Eye, CheckCircle2, Clock, Building2, 
  Mail, Phone, Globe, Calendar, Download, RefreshCw 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface OnboardingSubmission {
  user_id: string;
  wizard_completed: boolean;
  wizard_completed_at: string | null;
  created_at: string;
  updated_at: string;
  company_info: any;
  regional_settings: any;
  document_sequences: any;
  status_automations: any;
  window_coverings: any;
  manufacturing_settings: any;
  stock_management: any;
  email_templates: any;
  quotation_settings: any;
  integrations_config: any;
  users_permissions: any;
  inventory_data: any;
  pricing_grids: any;
}

const OnboardingSubmissions = () => {
  const [submissions, setSubmissions] = useState<OnboardingSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<OnboardingSubmission | null>(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      sub.company_info?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.company_info?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'completed' && sub.wizard_completed) ||
      (filter === 'pending' && !sub.wizard_completed);

    return matchesSearch && matchesFilter;
  });

  const completedCount = submissions.filter(s => s.wizard_completed).length;
  const pendingCount = submissions.filter(s => !s.wizard_completed).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Onboarding Submissions</h1>
            <p className="text-muted-foreground">Review and manage client setup requests</p>
          </div>
          <Button variant="outline" onClick={fetchSubmissions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{submissions.length}</div>
                  <div className="text-sm text-muted-foreground">Total Submissions</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingCount}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'completed' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
            <Button 
              variant={filter === 'pending' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('pending')}
            >
              In Progress
            </Button>
          </div>
        </div>

        {/* Submissions List */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions ({filteredSubmissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No submissions found</div>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((sub) => (
                  <div
                    key={sub.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {sub.company_info?.company_name || 'No Company Name'}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3">
                          {sub.company_info?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {sub.company_info.email}
                            </span>
                          )}
                          {sub.company_info?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {sub.company_info.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <div className="text-muted-foreground">
                          {format(new Date(sub.updated_at), 'MMM d, yyyy')}
                        </div>
                        {sub.wizard_completed_at && (
                          <div className="text-xs text-green-600">
                            Completed {format(new Date(sub.wizard_completed_at), 'HH:mm')}
                          </div>
                        )}
                      </div>
                      <Badge variant={sub.wizard_completed ? 'default' : 'secondary'}>
                        {sub.wizard_completed ? 'Completed' : 'In Progress'}
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSubmission(sub)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh]">
                          <DialogHeader>
                            <DialogTitle>
                              {sub.company_info?.company_name || 'Submission Details'}
                            </DialogTitle>
                          </DialogHeader>
                          <SubmissionDetails submission={sub} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SubmissionDetails = ({ submission }: { submission: OnboardingSubmission }) => {
  return (
    <ScrollArea className="h-[60vh]">
      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Company Name" value={submission.company_info?.company_name} />
            <DetailItem label="ABN/Tax ID" value={submission.company_info?.abn} />
            <DetailItem label="Contact Person" value={submission.company_info?.contact_person} />
            <DetailItem label="Email" value={submission.company_info?.email} />
            <DetailItem label="Phone" value={submission.company_info?.phone} />
            <DetailItem label="Website" value={submission.company_info?.website} />
            <DetailItem label="Address" value={submission.company_info?.address} />
            <DetailItem label="City" value={submission.company_info?.city} />
            <DetailItem label="State" value={submission.company_info?.state} />
            <DetailItem label="Country" value={submission.company_info?.country} />
          </div>
          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">Regional Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Currency" value={submission.regional_settings?.currency} />
              <DetailItem label="Units" value={submission.regional_settings?.measurement_units} />
              <DetailItem label="Date Format" value={submission.regional_settings?.date_format} />
              <DetailItem label="Timezone" value={submission.regional_settings?.timezone} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4 p-4">
          <h4 className="font-medium">Window Covering Types</h4>
          <div className="flex flex-wrap gap-2">
            {submission.window_coverings?.curtains && <Badge>Curtains</Badge>}
            {submission.window_coverings?.roman_blinds && <Badge>Roman Blinds</Badge>}
            {submission.window_coverings?.roller_blinds && <Badge>Roller Blinds</Badge>}
            {submission.window_coverings?.venetian_blinds && <Badge>Venetian Blinds</Badge>}
            {submission.window_coverings?.cellular_blinds && <Badge>Cellular Blinds</Badge>}
            {submission.window_coverings?.vertical_blinds && <Badge>Vertical Blinds</Badge>}
            {submission.window_coverings?.shutters && <Badge>Shutters</Badge>}
            {submission.window_coverings?.awnings && <Badge>Awnings</Badge>}
          </div>
          {submission.window_coverings?.pricing_methods && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Pricing Methods</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(submission.window_coverings.pricing_methods).map(([product, method]) => (
                  <div key={product} className="flex justify-between p-2 bg-muted rounded">
                    <span className="capitalize">{product.replace(/_/g, ' ')}</span>
                    <span className="text-muted-foreground">{String(method)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 p-4">
          <div>
            <h4 className="font-medium mb-3">Document Sequences</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <DetailItem label="Quote Prefix" value={submission.document_sequences?.quote_prefix} />
              <DetailItem label="Invoice Prefix" value={submission.document_sequences?.invoice_prefix} />
              <DetailItem label="Order Prefix" value={submission.document_sequences?.order_prefix} />
              <DetailItem label="Job Prefix" value={submission.document_sequences?.job_prefix} />
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Manufacturing</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <DetailItem label="Header (cm)" value={submission.manufacturing_settings?.header_cm} />
              <DetailItem label="Bottom Hem (cm)" value={submission.manufacturing_settings?.bottom_hem_cm} />
              <DetailItem label="Side Hems (cm)" value={submission.manufacturing_settings?.side_hems_cm} />
              <DetailItem label="Waste %" value={submission.manufacturing_settings?.waste_percentage} />
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Quotation</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <DetailItem label="Validity Days" value={submission.quotation_settings?.validity_days} />
              <DetailItem label="Quote Style" value={submission.quotation_settings?.quote_style} />
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Integrations</h4>
            <div className="flex flex-wrap gap-2">
              {submission.integrations_config?.suppliers?.map((s: string) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
              {submission.integrations_config?.sendgrid_enabled && <Badge variant="outline">SendGrid</Badge>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 p-4">
          <h4 className="font-medium">Team Members to Invite</h4>
          {submission.users_permissions?.users?.length > 0 ? (
            <div className="space-y-2">
              {submission.users_permissions.users.filter((u: any) => u.email).map((user: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{user.name || 'No name'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No team members added</div>
          )}
        </TabsContent>
      </Tabs>
    </ScrollArea>
  );
};

const DetailItem = ({ label, value }: { label: string; value: any }) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-medium">{value || '-'}</div>
  </div>
);

export default OnboardingSubmissions;
