import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ClientDetails } from './ClientDetails';
import { ClientProjects } from './ClientProjects';
import { ClientMeasurements } from './ClientMeasurements';
import { QuickMeasurementAccess } from './QuickMeasurementAccess';
import { useClient } from '@/hooks/useClients';
import { useProjects } from '@/hooks/useProjects';
import { useMeasurements } from '@/hooks/useMeasurements';
import { useToast } from "@/components/ui/use-toast"

interface ClientProfilePageProps {
  clientId: string;
}

export const ClientProfilePage = ({ clientId }: ClientProfilePageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast()
  const { data: client, isLoading: isClientLoading, isError: isClientError } = useClient(clientId);
  const { data: projects, isLoading: isProjectsLoading, isError: isProjectsError } = useProjects(clientId);
  const { data: measurements, isLoading: isMeasurementsLoading, isError: isMeasurementsError } = useMeasurements(clientId);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isClientError) {
      toast({
        title: "Error",
        description: "Failed to load client data.",
        variant: "destructive",
      })
      navigate("/clients");
    }
  }, [isClientError, navigate, toast]);

  const handleSaveMeasurement = (newMeasurement: any) => {
    toast({
      title: "Success",
      description: "Measurement saved successfully.",
    })
  };

  if (isClientLoading) {
    return <div className="text-center py-12">Loading client data...</div>;
  }

  if (!client) {
    return <div className="text-center py-12">Client not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <p className="text-gray-500">{client.email}</p>
          </div>
          <Button onClick={() => navigate("/clients/edit/" + client.id)}>Edit Client</Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="measurements">Measurements</TabsTrigger>
            <TabsTrigger value="quick-measurement">Quick Measure</TabsTrigger>
            <TabsTrigger value="emails">Emails</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <ClientDetails client={client} />
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <ClientProjects client={client} projects={projects || []} />
          </TabsContent>

          <TabsContent value="measurements" className="space-y-6">
            <ClientMeasurements client={client} measurements={measurements || []} />
          </TabsContent>

          <TabsContent value="quick-measurement" className="space-y-6">
            <QuickMeasurementAccess 
              client={client}
              onSave={handleSaveMeasurement}
            />
          </TabsContent>

          <TabsContent value="emails">
            <div>Email History and Composer</div>
          </TabsContent>

          <TabsContent value="notes">
            <div>Client Notes and History</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
