import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ManualQuoteItemsTable } from '@/components/quotes/ManualQuoteItemsTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus } from 'lucide-react';

export const ManualQuoteTest = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['test-quotes'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('quotes')
        .select('id, quote_number, client:clients(name), created_at, total_amount')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const createTestQuote = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get or create a test client
      let clientId: string;
      const { data: existingClients } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            user_id: user.id,
            name: 'Test Client',
            email: 'test@example.com',
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Create test quote
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          client_id: clientId,
          quote_number: `TEST-${Date.now()}`,
          status: 'draft',
          valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['test-quotes'] });
      setSelectedQuoteId(data.id);
      toast({
        title: 'Test quote created',
        description: `Quote ${data.quote_number} has been created`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating quote',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Manual Quotation System Test</h1>
        <p className="text-muted-foreground">
          Test the spreadsheet-like manual quote items system
        </p>
      </div>

      {/* Quote Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Quote to Test</CardTitle>
          <CardDescription>
            Choose an existing quote or create a new test quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={() => createTestQuote.mutate()}
              disabled={createTestQuote.isPending}
              className="w-full sm:w-auto"
            >
              {createTestQuote.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Test Quote
                </>
              )}
            </Button>

            {quotes && quotes.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium">Existing quotes:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {quotes.map((quote) => (
                    <Button
                      key={quote.id}
                      variant={selectedQuoteId === quote.id ? 'default' : 'outline'}
                      onClick={() => setSelectedQuoteId(quote.id)}
                      className="justify-start"
                    >
                      <div className="text-left">
                        <div className="font-semibold">{quote.quote_number}</div>
                        <div className="text-xs opacity-70">
                          {quote.client?.name} - ${quote.total_amount || 0}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No quotes found. Create a test quote to get started.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Quote Items Table */}
      {selectedQuoteId && (
        <div>
          <ManualQuoteItemsTable quoteId={selectedQuoteId} />
        </div>
      )}

      {!selectedQuoteId && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Select or create a quote above to start adding manual items
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test Manual Quotes</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ol className="space-y-2">
            <li>Click "Create Test Quote" or select an existing quote</li>
            <li>Use the spreadsheet-like table to add custom line items:
              <ul className="mt-2 space-y-1">
                <li>Enter item name, description, category</li>
                <li>Set quantity and unit (unit, hour, sqm, meter, etc.)</li>
                <li>Enter unit price - total calculates automatically</li>
                <li>Set tax rate if needed</li>
                <li>Click "Add" to insert the item</li>
              </ul>
            </li>
            <li>Edit existing items by clicking in any field</li>
            <li>Drag items using the grip icon to reorder</li>
            <li>Delete items with the trash icon</li>
            <li>Watch the totals update automatically (Subtotal, Tax, Grand Total)</li>
          </ol>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900 font-medium mb-2">💡 Use Cases:</p>
            <ul className="text-blue-800 space-y-1">
              <li>Interior designers quoting furniture, decor, and services</li>
              <li>Generic product quotations like spreadsheets</li>
              <li>Custom service packages (consulting, labor, etc.)</li>
              <li>Mix of inventory items and custom line items</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
