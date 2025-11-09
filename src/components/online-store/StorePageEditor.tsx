import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Save, Eye, Layout, Type, Image, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StorePageEditorProps {
  storeId: string;
  onBack: () => void;
}

interface PageSection {
  type: 'hero' | 'features' | 'products' | 'testimonials' | 'cta' | 'text-image' | 'contact';
  content: Record<string, any>;
  order: number;
}

export const StorePageEditor = ({ storeId, onBack }: StorePageEditorProps) => {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState<string>('home');
  const [sections, setSections] = useState<PageSection[]>([
    { type: 'hero', content: { headline: '', subheadline: '' }, order: 0 },
  ]);
  const [pageSettings, setPageSettings] = useState({
    title: 'Home',
    slug: 'home',
    seoTitle: '',
    seoDescription: '',
    isActive: true,
  });

  const sectionTypes = [
    { value: 'hero', label: 'Hero Banner', icon: Image },
    { value: 'features', label: 'Features Grid', icon: Layout },
    { value: 'products', label: 'Product Showcase', icon: Layout },
    { value: 'testimonials', label: 'Testimonials', icon: Type },
    { value: 'cta', label: 'Call to Action', icon: Type },
    { value: 'text-image', label: 'Text + Image', icon: Image },
    { value: 'contact', label: 'Contact Form', icon: Type },
  ];

  const addSection = (type: PageSection['type']) => {
    const newSection: PageSection = {
      type,
      content: {},
      order: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < sections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      newSections.forEach((section, i) => section.order = i);
      setSections(newSections);
    }
  };

  const savePage = async () => {
    try {
      // Check if page exists
      const { data: existingPage } = await supabase
        .from('store_pages')
        .select('id')
        .eq('store_id', storeId)
        .eq('page_type', selectedPage)
        .maybeSingle();

      if (existingPage) {
        // Update existing page
        const { error } = await supabase
          .from('store_pages')
          .update({
            title: pageSettings.title,
            slug: pageSettings.slug,
            content: sections as any,
            seo_title: pageSettings.seoTitle,
            seo_description: pageSettings.seoDescription,
            is_active: pageSettings.isActive,
            sort_order: 0,
          })
          .eq('id', existingPage.id);

        if (error) throw error;
      } else {
        // Insert new page
        const { error } = await supabase
          .from('store_pages')
          .insert({
            store_id: storeId,
            page_type: selectedPage,
            title: pageSettings.title,
            slug: pageSettings.slug,
            content: sections as any,
            seo_title: pageSettings.seoTitle,
            seo_description: pageSettings.seoDescription,
            is_active: pageSettings.isActive,
            sort_order: 0,
          });

        if (error) throw error;
      }

      toast({
        title: "Page saved",
        description: "Your changes have been published.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save page",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Page Editor</h2>
            <p className="text-muted-foreground">Customize your store pages</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/store/${storeId}`, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button onClick={savePage}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={selectedPage} onValueChange={setSelectedPage}>
        <TabsList>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPage} className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Page Settings */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Page Settings</CardTitle>
                <CardDescription>Configure page details and SEO</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Page Title</Label>
                  <Input
                    value={pageSettings.title}
                    onChange={(e) => setPageSettings({ ...pageSettings, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input
                    value={pageSettings.slug}
                    onChange={(e) => setPageSettings({ ...pageSettings, slug: e.target.value })}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input
                    value={pageSettings.seoTitle}
                    onChange={(e) => setPageSettings({ ...pageSettings, seoTitle: e.target.value })}
                    placeholder="Optimized for search engines"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Textarea
                    value={pageSettings.seoDescription}
                    onChange={(e) => setPageSettings({ ...pageSettings, seoDescription: e.target.value })}
                    placeholder="Page description for search results"
                    rows={3}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <Label>Published</Label>
                  <Switch
                    checked={pageSettings.isActive}
                    onCheckedChange={(checked) => setPageSettings({ ...pageSettings, isActive: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Right Panel - Sections Editor */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Page Sections</CardTitle>
                  <CardDescription>Add and arrange content sections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select onValueChange={(value) => addSection(value as PageSection['type'])}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add a section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="space-y-3">
                    {sections.map((section, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Layout className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium capitalize">{section.type}</span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === sections.length - 1}
                            >
                              ↓
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSection(index)}
                            >
                              ×
                            </Button>
                          </div>
                        </div>

                        {/* Section-specific content editors would go here */}
                        <div className="text-sm text-muted-foreground">
                          Section content editor (customize based on section type)
                        </div>
                      </Card>
                    ))}

                    {sections.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No sections yet. Add your first section above.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
