import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface ProductTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  product_type: string;
  calculation_method: string;
  pricing_unit: string;
  measurement_requirements: any;
  components: any;
  calculation_rules: any;
  making_cost_required: boolean;
  pricing_grid_required: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useProductTemplates = () => {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    console.log("=== FETCHING PRODUCT TEMPLATES ===");
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('product_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching product templates:', error);
        throw error;
      }

      console.log('Fetched product templates:', data);
      setTemplates(data || []);
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch product templates",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTemplate = async (templateData: any) => {
    console.log("=== CREATING PRODUCT TEMPLATE ===", templateData);
    
    try {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Add user_id to the template data
      const templateWithUser = {
        ...templateData,
        user_id: user.id
      };

      console.log("Template data with user_id:", templateWithUser);

      const { data, error } = await supabase
        .from('product_templates')
        .insert([templateWithUser])
        .select()
        .single();

      if (error) {
        console.error('Error creating product template:', error);
        throw error;
      }

      console.log('Created product template:', data);
      setTemplates(prev => [data, ...prev]);
      
      toast({
        title: "Success",
        description: "Product template created successfully"
      });

      return data;
    } catch (error) {
      console.error('Error in createTemplate:', error);
      toast({
        title: "Error",
        description: "Failed to create product template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, templateData: Partial<ProductTemplate>) => {
    console.log("=== UPDATING PRODUCT TEMPLATE ===", id, templateData);
    
    try {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('product_templates')
        .update(templateData)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user can only update their own templates
        .select()
        .single();

      if (error) {
        console.error('Error updating product template:', error);
        throw error;
      }

      console.log('Updated product template:', data);
      setTemplates(prev => prev.map(template => 
        template.id === id ? data : template
      ));
      
      toast({
        title: "Success",
        description: "Product template updated successfully"
      });

      return data;
    } catch (error) {
      console.error('Error in updateTemplate:', error);
      toast({
        title: "Error",
        description: "Failed to update product template",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    console.log("=== DELETING PRODUCT TEMPLATE ===", id);
    
    try {
      // Get the current user ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('product_templates')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure user can only delete their own templates

      if (error) {
        console.error('Error deleting product template:', error);
        throw error;
      }

      console.log('Deleted product template:', id);
      setTemplates(prev => prev.filter(template => template.id !== id));
      
      toast({
        title: "Success",
        description: "Product template deleted successfully"
      });
    } catch (error) {
      console.error('Error in deleteTemplate:', error);
      toast({
        title: "Error",
        description: "Failed to delete product template",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    console.log("useProductTemplates - Initial fetch");
    fetchTemplates();
  }, []);

  // Also run when auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          fetchTemplates();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  console.log("useProductTemplates hook state:", { 
    templatesCount: templates?.length || 0, 
    isLoading,
    activeCount: templates?.filter(t => t.active)?.length || 0
  });

  return {
    templates,
    isLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates
  };
};