import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Eye, Save } from "lucide-react";
import { WorkOrderPreviewModal } from "@/components/jobs/workorder/WorkOrderPreviewModal";
import { PrintableWorkOrder } from "@/components/jobs/workorder/PrintableWorkOrder";
import { generateQuotePDF } from "@/utils/generateQuotePDF";

export const WorkOrderTemplateSettingsTab = () => {
  const { toast } = useToast();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch active work order template
  const { data: activeTemplate, refetch } = useQuery({
    queryKey: ["work-order-template"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("work_order_templates")
        .select("*")
        .eq("active", true)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const [templateData, setTemplateData] = useState({
    orientation: 'portrait' as 'portrait' | 'landscape',
    marginTop: 8,
    marginRight: 8,
    marginBottom: 6,
    marginLeft: 8,
    imageSize: 80,
    imagePosition: 'above' as 'above' | 'center' | 'left',
    showRoomNames: true,
    showMaterials: true,
    showMeasurements: true,
    showCheckpoints: true,
    showAssignee: true,
    showDueDates: true,
    showProgressBars: true,
  });

  // Load template data when activeTemplate changes
  useEffect(() => {
    if (activeTemplate?.blocks) {
      const blocks = Array.isArray(activeTemplate.blocks) ? activeTemplate.blocks : [];
      const docSettings = blocks.find((b: any) => b.type === 'document-settings') as any;
      const displaySettings = blocks.find((b: any) => b.type === 'workorder-items') as any;

      setTemplateData({
        orientation: docSettings?.content?.orientation || 'portrait',
        marginTop: docSettings?.content?.marginTop || 8,
        marginRight: docSettings?.content?.marginRight || 8,
        marginBottom: docSettings?.content?.marginBottom || 6,
        marginLeft: docSettings?.content?.marginLeft || 8,
        imageSize: docSettings?.content?.imageSize || 80,
        imagePosition: docSettings?.content?.imagePosition || 'above',
        showRoomNames: displaySettings?.content?.showRoomNames !== false,
        showMaterials: displaySettings?.content?.showMaterials !== false,
        showMeasurements: displaySettings?.content?.showMeasurements !== false,
        showCheckpoints: displaySettings?.content?.showCheckpoints !== false,
        showAssignee: displaySettings?.content?.showAssignee !== false,
        showDueDates: displaySettings?.content?.showDueDates !== false,
        showProgressBars: displaySettings?.content?.showProgressBars !== false,
      });
    }
  }, [activeTemplate]);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const blocks = [
        {
          type: 'document-settings',
          content: {
            orientation: templateData.orientation,
            marginTop: templateData.marginTop,
            marginRight: templateData.marginRight,
            marginBottom: templateData.marginBottom,
            marginLeft: templateData.marginLeft,
            imageSize: templateData.imageSize,
            imagePosition: templateData.imagePosition,
          },
        },
        {
          type: 'workorder-header',
          content: {
            showOrderNumber: true,
            showClientName: true,
            showProjectName: true,
            showDates: true,
          },
        },
        {
          type: 'workorder-items',
          content: {
            showRoomNames: templateData.showRoomNames,
            showMaterials: templateData.showMaterials,
            showMeasurements: templateData.showMeasurements,
            showCheckpoints: templateData.showCheckpoints,
            showAssignee: templateData.showAssignee,
            showDueDates: templateData.showDueDates,
            showProgressBars: templateData.showProgressBars,
          },
        },
      ];

      if (activeTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("work_order_templates")
          .update({ blocks })
          .eq("id", activeTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from("work_order_templates")
          .insert({
            name: "Default Work Order Template",
            active: true,
            blocks,
          });

        if (error) throw error;
      }

      await refetch();
      toast({
        title: "Settings saved",
        description: "Work order template settings have been updated",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('workorder-preview-content');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      await generateQuotePDF(element, { filename: 'work-order-preview.pdf' });
      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Sample data for preview
  const sampleWorkOrderData = {
    header: {
      orderNumber: 'WO-2024-001',
      clientName: 'Sample Client',
      projectName: 'Window Treatment Project',
      createdDate: new Date().toLocaleDateString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      assignedTo: 'John Installer',
    },
    items: [
      {
        id: '1',
        name: 'Roman Blind Installation',
        description: 'Install roman blind in living room',
        room_name: 'Living Room',
        treatment_type: 'Roman Blind',
        specifications: ['Custom fabric', 'Motorized', 'Light filtering'],
        materials: ['Fabric: Linen blend', 'Motor: Somfy', 'Mounting brackets'],
        measurements: { width: 1500, height: 1800 },
      },
      {
        id: '2',
        name: 'Roller Blind Installation',
        description: 'Install roller blind in bedroom',
        room_name: 'Master Bedroom',
        treatment_type: 'Roller Blind',
        specifications: ['Blackout fabric', 'Manual operation'],
        materials: ['Fabric: Blackout polyester', 'Chain mechanism'],
        measurements: { width: 1200, height: 1600 },
      },
    ],
  };

  const previewBlocks = [
    {
      type: 'document-settings',
      content: {
        orientation: templateData.orientation,
        marginTop: templateData.marginTop,
        marginRight: templateData.marginRight,
        marginBottom: templateData.marginBottom,
        marginLeft: templateData.marginLeft,
        imageSize: templateData.imageSize,
        imagePosition: templateData.imagePosition,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Work Order Template Settings</h2>
        <p className="text-muted-foreground">
          Customize the layout and display options for work orders
        </p>
      </div>

      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="display">Display Options</TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Page Layout</CardTitle>
              <CardDescription>
                Configure page orientation and margins
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Orientation</Label>
                <Select
                  value={templateData.orientation}
                  onValueChange={(value: 'portrait' | 'landscape') =>
                    setTemplateData({ ...templateData, orientation: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Top Margin (mm): {templateData.marginTop}</Label>
                  <Slider
                    value={[templateData.marginTop]}
                    onValueChange={([value]) =>
                      setTemplateData({ ...templateData, marginTop: value })
                    }
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Right Margin (mm): {templateData.marginRight}</Label>
                  <Slider
                    value={[templateData.marginRight]}
                    onValueChange={([value]) =>
                      setTemplateData({ ...templateData, marginRight: value })
                    }
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bottom Margin (mm): {templateData.marginBottom}</Label>
                  <Slider
                    value={[templateData.marginBottom]}
                    onValueChange={([value]) =>
                      setTemplateData({ ...templateData, marginBottom: value })
                    }
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Left Margin (mm): {templateData.marginLeft}</Label>
                  <Slider
                    value={[templateData.marginLeft]}
                    onValueChange={([value]) =>
                      setTemplateData({ ...templateData, marginLeft: value })
                    }
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image Settings</CardTitle>
              <CardDescription>Configure image display</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Image Position</Label>
                <Select
                  value={templateData.imagePosition}
                  onValueChange={(value: 'above' | 'center' | 'left') =>
                    setTemplateData({ ...templateData, imagePosition: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above product</SelectItem>
                    <SelectItem value="center">Center of card</SelectItem>
                    <SelectItem value="left">Left of text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Image Size (px): {templateData.imageSize}</Label>
                <Slider
                  value={[templateData.imageSize]}
                  onValueChange={([value]) =>
                    setTemplateData({ ...templateData, imageSize: value })
                  }
                  min={40}
                  max={200}
                  step={10}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Display Options</CardTitle>
              <CardDescription>
                Choose what information to show on work orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showRoomNames">Show Room Names</Label>
                <Switch
                  id="showRoomNames"
                  checked={templateData.showRoomNames}
                  onCheckedChange={(checked) =>
                    setTemplateData({ ...templateData, showRoomNames: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showMaterials">Show Materials List</Label>
                <Switch
                  id="showMaterials"
                  checked={templateData.showMaterials}
                  onCheckedChange={(checked) =>
                    setTemplateData({ ...templateData, showMaterials: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showMeasurements">Show Measurements</Label>
                <Switch
                  id="showMeasurements"
                  checked={templateData.showMeasurements}
                  onCheckedChange={(checked) =>
                    setTemplateData({ ...templateData, showMeasurements: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showCheckpoints">Show Task Checkpoints</Label>
                <Switch
                  id="showCheckpoints"
                  checked={templateData.showCheckpoints}
                  onCheckedChange={(checked) =>
                    setTemplateData({ ...templateData, showCheckpoints: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showAssignee">Show Assignee</Label>
                <Switch
                  id="showAssignee"
                  checked={templateData.showAssignee}
                  onCheckedChange={(checked) =>
                    setTemplateData({ ...templateData, showAssignee: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showDueDates">Show Due Dates</Label>
                <Switch
                  id="showDueDates"
                  checked={templateData.showDueDates}
                  onCheckedChange={(checked) =>
                    setTemplateData({ ...templateData, showDueDates: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showProgressBars">Show Progress Bars</Label>
                <Switch
                  id="showProgressBars"
                  checked={templateData.showProgressBars}
                  onCheckedChange={(checked) =>
                    setTemplateData({ ...templateData, showProgressBars: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-3">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
        <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Document
        </Button>
      </div>

      <WorkOrderPreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onDownloadPDF={handleDownloadPDF}
        onPrint={handlePrint}
        isGenerating={isGeneratingPDF}
      >
        <div id="workorder-preview-content">
          <PrintableWorkOrder
            blocks={previewBlocks}
            workOrderData={sampleWorkOrderData}
            isPrintMode={false}
          />
        </div>
      </WorkOrderPreviewModal>
    </div>
  );
};
