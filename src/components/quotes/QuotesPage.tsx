import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, FileText, Users } from "lucide-react";
import { EnhancedQuotesList } from "./EnhancedQuotesList";
import { QuoteAnalytics } from "./QuoteAnalytics";
import { CreateQuoteFromTreatments } from "./CreateQuoteFromTreatments";

interface QuotesPageProps {
  initialTab?: string;
}

export const QuotesPage: React.FC<QuotesPageProps> = ({ initialTab = "all" }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleNewQuote = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quotes</h1>
          <p className="text-muted-foreground">Manage your project quotes and track performance</p>
        </div>
        <Button onClick={handleNewQuote} className="gap-2">
          <Plus className="h-4 w-4" />
          New Quote
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="gap-2">
            <FileText className="h-4 w-4" />
            All Quotes
          </TabsTrigger>
          <TabsTrigger value="draft" className="gap-2">
            <FileText className="h-4 w-4" />
            Drafts
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Users className="h-4 w-4" />
            Sent
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Quotes</CardTitle>
              <CardDescription>
                View and manage all quotes across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedQuotesList onNewQuote={handleNewQuote} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="draft" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Draft Quotes</CardTitle>
              <CardDescription>
                Quotes that are still being prepared
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedQuotesList 
                onNewQuote={handleNewQuote}
                // Pass filter for draft status
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sent Quotes</CardTitle>
              <CardDescription>
                Quotes that have been sent to clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedQuotesList 
                onNewQuote={handleNewQuote}
                // Pass filter for sent status
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <QuoteAnalytics />
        </TabsContent>
      </Tabs>

      {/* Create Quote Dialog */}
      {isCreateDialogOpen && (
        <CreateQuoteFromTreatments projectId="">
          <Button 
            variant="outline" 
            onClick={() => setIsCreateDialogOpen(false)}
            className="hidden"
          >
            Close
          </Button>
        </CreateQuoteFromTreatments>
      )}
    </div>
  );
};