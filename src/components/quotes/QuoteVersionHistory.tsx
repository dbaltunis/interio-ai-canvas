import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateQuoteVersion } from "@/hooks/useQuoteVersioning";
import { formatCurrency } from "@/utils/currency";
import { GitBranch, Plus, Copy, Edit, FileText } from "lucide-react";

interface QuoteVersionHistoryProps {
  quoteId: string;
  children?: React.ReactNode;
}

export const QuoteVersionHistory: React.FC<QuoteVersionHistoryProps> = ({ quoteId, children }) => {
  const createVersion = useCreateQuoteVersion();

  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["quote-versions", quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      
      // Get original quote info first
      const { data: originalQuote } = await supabase
        .from("quotes")
        .select("project_id, client_id")
        .eq("id", quoteId)
        .single();

      if (!originalQuote) return [];

      // Find all quotes for the same project/client combination
      const { data: versions, error } = await supabase
        .from("quotes")
        .select(`
          *,
          clients(name, email),
          projects(name)
        `)
        .eq("project_id", originalQuote.project_id)
        .eq("client_id", originalQuote.client_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return versions || [];
    },
    enabled: !!quoteId,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVersionType = (quoteNumber: string) => {
    if (quoteNumber.includes('-R')) return { type: 'Revision', color: 'bg-orange-100 text-orange-800' };
    if (quoteNumber.includes('-A')) return { type: 'Alternative', color: 'bg-purple-100 text-purple-800' };
    if (quoteNumber.includes('-U')) return { type: 'Update', color: 'bg-blue-100 text-blue-800' };
    return { type: 'Original', color: 'bg-green-100 text-green-800' };
  };

  const handleCreateVersion = (type: "revision" | "alternative" | "update") => {
    createVersion.mutate({
      originalQuoteId: quoteId,
      versionType: type,
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <GitBranch className="h-4 w-4 mr-2" />
            Version History
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Quote Version History
            </DialogTitle>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCreateVersion("revision")}
                disabled={createVersion.isPending}
              >
                <Edit className="h-4 w-4 mr-2" />
                Create Revision
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCreateVersion("alternative")}
                disabled={createVersion.isPending}
              >
                <Copy className="h-4 w-4 mr-2" />
                Alternative Quote
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleCreateVersion("update")}
                disabled={createVersion.isPending}
              >
                <Plus className="h-4 w-4 mr-2" />
                Updated Version
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading ? (
            <p className="text-muted-foreground">Loading version history...</p>
          ) : versions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No versions found</h3>
                <p className="text-muted-foreground">This quote doesn't have any version history yet.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Version Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote Number</TableHead>
                      <TableHead>Version Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {versions.map((version) => {
                      const versionInfo = getVersionType(version.quote_number || '');
                      return (
                        <TableRow key={version.id} className={version.id === quoteId ? "bg-muted/50" : ""}>
                          <TableCell className="font-medium">
                            {version.quote_number}
                            {version.id === quoteId && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Current
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={versionInfo.color}>
                              {versionInfo.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(version.status || 'draft')}>
                              {version.status || 'draft'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(version.total_amount || 0)}
                          </TableCell>
                          <TableCell>
                            {new Date(version.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {version.notes || 'No notes'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Version Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Edit className="h-4 w-4 text-orange-500" />
                    <h4 className="font-semibold">Revision</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Updates to existing quote based on client feedback or changes
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Copy className="h-4 w-4 text-purple-500" />
                    <h4 className="font-semibold">Alternative</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Different approach or options for the same project
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-4 w-4 text-blue-500" />
                    <h4 className="font-semibold">Update</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Price or specification updates due to external changes
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};