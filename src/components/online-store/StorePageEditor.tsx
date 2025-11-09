import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PageEditorHeader } from "./page-editor/PageEditorHeader";
import { SEOPanel } from "./page-editor/SEOPanel";
import { BlockLibrary } from "./page-editor/BlockLibrary";
import { BlockEditor } from "./page-editor/BlockEditor";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ImageIcon } from "lucide-react";

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
  const [isSaving, setIsSaving] = useState(false);
  const [sections, setSections] = useState<PageSection[]>([
    { 
      type: 'hero', 
      content: { 
        headline: 'Welcome to Our Store',
        subheadline: 'Discover quality products and exceptional service',
        ctaText: 'Shop Now',
        imageUrl: '',
        imageAlt: ''
      }, 
      order: 0 
    },
  ]);
  const [pageSettings, setPageSettings] = useState({
    title: 'Home',
    slug: 'home',
    seoTitle: 'Premium Window Treatments | Custom Blinds & Shades',
    seoDescription: 'Transform your space with our custom window treatments. Expert installation, quality materials, and personalized service. Get your free quote today!',
    isActive: true,
  });

  const addBlock = (type: string) => {
    const defaultContent: Record<string, any> = {
      hero: { headline: '', subheadline: '', ctaText: '', imageUrl: '', imageAlt: '' },
      features: { heading: '', features: '' },
      products: { heading: 'Our Products', displayType: 'featured' },
      testimonials: { heading: 'What Our Customers Say', testimonials: '' },
      cta: { headline: '', text: '', buttonText: '' },
      text: { heading: '', text: '' },
      faq: { heading: 'Frequently Asked Questions', items: '' },
      contact: { heading: 'Get in Touch', fields: 'name,email,phone,message' },
    };

    const newSection: PageSection = {
      type: type as any,
      content: defaultContent[type] || {},
      order: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const updateBlock = (index: number, content: any) => {
    const newSections = [...sections];
    newSections[index].content = content;
    setSections(newSections);
  };

  const removeBlock = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
    newSections.forEach((section, i) => section.order = i);
    setSections(newSections);
  };

  const moveBlockDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    newSections.forEach((section, i) => section.order = i);
    setSections(newSections);
  };

  const handleSave = async () => {
    setIsSaving(true);
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
        title: "Page saved & published!",
        description: "Your SEO-optimized page is now live.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to save page",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab (will need store slug)
    toast({
      title: "Preview coming soon",
      description: "Live preview feature will be available shortly.",
    });
  };

  const handleOptimizeSEO = () => {
    toast({
      title: "AI SEO Optimization",
      description: "This feature will analyze and suggest improvements to your page content and structure for better search rankings.",
    });
  };

  return (
    <div className="flex flex-col h-screen">
      <PageEditorHeader
        onBack={onBack}
        onSave={handleSave}
        onPreview={handlePreview}
        onOptimizeSEO={handleOptimizeSEO}
        isSaving={isSaving}
      />

      <Tabs value={selectedPage} onValueChange={setSelectedPage} className="flex-1 flex flex-col">
        <div className="border-b px-6 py-3">
          <TabsList>
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedPage} className="flex-1 m-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 h-full">
            {/* Left Sidebar - SEO & Settings */}
            <div className="lg:col-span-3 border-r">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-6">
                  <SEOPanel
                    seoTitle={pageSettings.seoTitle}
                    seoDescription={pageSettings.seoDescription}
                    slug={pageSettings.slug}
                    onSEOTitleChange={(value) => setPageSettings({ ...pageSettings, seoTitle: value })}
                    onSEODescriptionChange={(value) => setPageSettings({ ...pageSettings, seoDescription: value })}
                    onSlugChange={(value) => setPageSettings({ ...pageSettings, slug: value })}
                  />

                  <BlockLibrary onAddBlock={addBlock} />
                </div>
              </ScrollArea>
            </div>

            {/* Center - Canvas/Editor */}
            <div className="lg:col-span-9">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  {sections.length === 0 ? (
                    <Card className="p-12">
                      <div className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Start Building Your Page</h3>
                          <p className="text-muted-foreground mb-4">
                            Add blocks from the library to create your SEO-optimized page.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pro tip: Start with a Hero section, add content blocks, and finish with a CTA.
                          </p>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    sections.map((section, index) => (
                      <BlockEditor
                        key={index}
                        block={section}
                        index={index}
                        onUpdate={updateBlock}
                        onRemove={removeBlock}
                        onMoveUp={moveBlockUp}
                        onMoveDown={moveBlockDown}
                        isFirst={index === 0}
                        isLast={index === sections.length - 1}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
