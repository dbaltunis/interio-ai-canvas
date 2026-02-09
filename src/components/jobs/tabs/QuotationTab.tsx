import React, { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PixelDocumentIcon } from "@/components/icons/PixelArtIcons";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/useProjects";
import { useTreatments } from "@/hooks/useTreatments";
import { useRooms } from "@/hooks/useRooms";
import { useSurfaces } from "@/hooks/useSurfaces";
import { useProjectWindowSummaries } from "@/hooks/useProjectWindowSummaries";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useQuotes, useCreateQuote } from "@/hooks/useQuotes";
import { useToast } from "@/hooks/use-toast";
import { Download, Mail, MoreVertical, Percent, FileText, DollarSign, ImageIcon as ImageIconLucide, Printer, FileCheck, CreditCard, Sparkles, Package, FileSpreadsheet, Banknote, ChevronDown, Edit, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LivePreview } from "@/components/settings/templates/visual-editor/LivePreview";
import { useQuotationSync } from "@/hooks/useQuotationSync";
import { QuotationItemsModal } from "../quotation/QuotationItemsModal";
import { EmailQuoteModal } from "@/components/jobs/quotation/EmailQuoteModal";
import { QuotationSkeleton } from "@/components/jobs/quotation/QuotationSkeleton";
import { EmptyQuoteVersionState } from "@/components/jobs/EmptyQuoteVersionState";
import { useQuoteVersions } from "@/hooks/useQuoteVersions";
import { generateQuotePDF, generateQuotePDFBlob } from '@/utils/generateQuotePDF';
import { InlineDiscountPanel } from "@/components/jobs/quotation/InlineDiscountPanel";
import { InlineMarkupOverride } from "@/components/jobs/quotation/InlineMarkupOverride";
import { InlinePaymentConfig } from "@/components/jobs/quotation/InlinePaymentConfig";
import { RecordPaymentDialog } from "@/components/jobs/quotation/RecordPaymentDialog";
import { useQuoteDiscount } from "@/hooks/useQuoteDiscount";
import { TWCSubmitDialog } from "@/components/integrations/TWCSubmitDialog";
import { QuoteProfitSummary } from "@/components/pricing/QuoteProfitSummary";
import { useHasPermission } from "@/hooks/usePermissions";
import { useCanEditJob } from "@/hooks/useJobEditPermissions";
import { useAuth } from "@/components/auth/AuthProvider";
import { useCanSendEmails } from "@/hooks/useCanSendEmails";
import { exportInvoiceToCSV, exportInvoiceForXero, exportInvoiceForQuickBooks, prepareInvoiceExportData } from "@/utils/invoiceExport";
import { useQuotePayment } from "@/hooks/useQuotePayment";
import { useQuoteExclusions } from "@/hooks/useQuoteExclusions";
import QuoteTemplateHomekaara from "@/components/quotes/templates/QuoteTemplateHomekaara";
interface QuotationTabProps {
  projectId: string;
  quoteId?: string;
}
const removeDuplicateProductsBlocks = (blocks: any[] = []) => {
  let seen = false;
  return (blocks || []).filter(b => {
    if (b?.type !== 'products') return true;
    if (!seen) {
      seen = true;
      return true;
    }
    return false;
  });
};
export const QuotationTab = ({
  projectId,
  quoteId
}: QuotationTabProps) => {
  const {
    toast
  } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { verifyPayment } = useQuotePayment();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [showQuotationItems, setShowQuotationItems] = useState(false);
  // Persist template selection in URL params
  const urlTemplateId = searchParams.get('templateId');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(urlTemplateId || '');
  
  // Validate template exists in database before using (check quote_templates, not curtain_templates)
  const { data: templateExists } = useQuery({
    queryKey: ['validate-quote-template-exists', urlTemplateId],
    queryFn: async () => {
      if (!urlTemplateId) return null;
      const { data } = await supabase
        .from('quote_templates')
        .select('id, name')
        .eq('id', urlTemplateId)
        .maybeSingle();
      return data ? { exists: true, name: data.name } : { exists: false, name: null };
    },
    enabled: !!urlTemplateId,
    staleTime: 30000,
  });
  
  // Clear invalid template ID from URL with improved error message
  useEffect(() => {
    if (urlTemplateId && templateExists && templateExists.exists === false) {
      setSearchParams(prev => {
        prev.delete('templateId');
        prev.delete('windowId');
        return prev;
      }, { replace: true });
      setSelectedTemplateId('');
      
      toast({
        title: "Quote template not found",
        description: "The previously selected template may have been deleted or deactivated. Please select a different template from the dropdown.",
        variant: "destructive",
      });
    }
  }, [urlTemplateId, templateExists, setSearchParams, toast]);
  
  // Handle template change with URL persistence
  const handleTemplateChange = (newTemplateId: string) => {
    setSelectedTemplateId(newTemplateId);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('templateId', newTemplateId);
    setSearchParams(newParams, { replace: true });
  };
  const [isDiscountDialogOpen, setIsDiscountDialogOpen] = useState(false);
  const [isMarkupOverrideOpen, setIsMarkupOverrideOpen] = useState(false);
  const [isPaymentConfigOpen, setIsPaymentConfigOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [isTWCSubmitDialogOpen, setIsTWCSubmitDialogOpen] = useState(false);
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(quoteId || null);
  // TEMPORARILY DISABLED: Exclusion edit mode caused quote breaking issues
  const isExclusionEditMode = false; // useState(false) - revert when reimplemented

  // Edit mode for Homekaara template
  const [isHomekaaraEditable, setIsHomekaaraEditable] = useState(false);
  
  // Quote item exclusions hook
  const { excludedItems, toggleExclusion } = useQuoteExclusions(activeQuoteId || quoteId);
  const {
    data: projects
  } = useProjects();
  const {
    data: treatments
  } = useTreatments(projectId, quoteId);
  const {
    data: rooms
  } = useRooms(projectId, quoteId);
  const {
    data: surfaces
  } = useSurfaces(projectId);
  const {
    data: projectSummaries
  } = useProjectWindowSummaries(projectId);
  const {
    data: businessSettings
  } = useBusinessSettings();
  const {
    quoteVersions
  } = useQuoteVersions(projectId);
  const {
    data: quotes = [],
    isLoading: quotesLoading
  } = useQuotes(projectId);
  const createQuote = useCreateQuote();
  const project = projects?.find(p => p.id === projectId);
  const currentQuote = quoteVersions?.find(q => q.id === quoteId);
  const currentVersion = currentQuote?.version || 1;
  const isEmptyVersion = (rooms?.length || 0) === 0 && quoteId;
  // Use explicit permissions hook for edit checks
  const { canEditJob, isLoading: editPermissionsLoading } = useCanEditJob(project);
  const isReadOnly = !canEditJob || editPermissionsLoading;
  const { user } = useAuth();
  const { canSendEmails, isPermissionLoaded } = useCanSendEmails();

  // Sync activeQuoteId when prop or quoteVersions change
  useEffect(() => {
    if (quoteId && !activeQuoteId) {
      setActiveQuoteId(quoteId);
    } else if (!activeQuoteId && quoteVersions && quoteVersions.length > 0) {
      setActiveQuoteId(quoteVersions[0].id);
    }
  }, [quoteId, quoteVersions, activeQuoteId]);

  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const sessionId = searchParams.get('session_id');
    
    if (paymentStatus === 'success' && sessionId && quoteId) {
      verifyPayment.mutateAsync({ quoteId, sessionId })
        .then((data) => {
          toast({
            title: "Payment Confirmed!",
            description: `Payment has been verified and quote updated.`,
          });
          // Clean up URL params
          const newParams = new URLSearchParams(searchParams);
          newParams.delete('payment');
          newParams.delete('session_id');
          setSearchParams(newParams);
        })
        .catch((error) => {
          toast({
            title: "Payment Verification",
            description: "Could not auto-verify payment. Please check payment status manually.",
            variant: "destructive",
          });
        });
    }
  }, [quoteId, searchParams, setSearchParams, verifyPayment, toast]);

  // Fetch client data
  const {
    data: client
  } = useQuery({
    queryKey: ["project-client", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const project = projects?.find(p => p.id === projectId);
      if (!project?.client_id) return null;
      const {
        data,
        error
      } = await supabase.from("clients").select("*").eq("id", project.client_id).maybeSingle();
      if (error) {
        console.error('Error fetching client:', error);
        return null;
      }
      return data;
    },
    enabled: !!projectId && !!projects
  });

  // Fetch workshop items - include user.id for cache isolation
  const {
    data: workshopItems
  } = useQuery({
    queryKey: ["workshop-items", user?.id, projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const {
        data,
        error
      } = await supabase.from("workshop_items").select("*").eq("project_id", projectId);
      if (error) return [];
      return data || [];
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000
  });

  // Fetch active quote templates - ordered by primary first, then display_order
  const {
    data: activeTemplates,
    isLoading: templatesLoading,
    refetch: refetchTemplates
  } = useQuery({
    queryKey: ["quote-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quote_templates")
        .select("*")
        .eq("active", true)
        .order("is_primary", { ascending: false, nullsFirst: false })
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("updated_at", { ascending: false });
      
      if (error) throw error;

      // Filter out templates with invalid or missing blocks
      const validTemplates = (data || []).filter(template => {
        if (!template.blocks) return false;
        if (typeof template.blocks === 'string') return false;
        if (!Array.isArray(template.blocks)) return false;
        if (template.blocks.length === 0) return false;
        return true;
      });
      return validTemplates;
    },
    staleTime: 5 * 60 * 1000
  });

  // Set default template - prioritize URL param, then first template
  useEffect(() => {
    if (activeTemplates && activeTemplates.length > 0 && !selectedTemplateId) {
      // Check if URL has a valid template ID
      const urlId = urlTemplateId;
      const validUrlTemplate = urlId && activeTemplates.some(t => t.id.toString() === urlId);
      const defaultId = validUrlTemplate ? urlId : activeTemplates[0].id.toString();
      setSelectedTemplateId(defaultId);
    }
  }, [activeTemplates, selectedTemplateId, urlTemplateId]);
  const selectedTemplate = activeTemplates?.find(t => t.id.toString() === selectedTemplateId);
  
  // Check if current template is an invoice type
  const isInvoice = selectedTemplate?.template_style === 'invoice';
  const {
    buildQuotationItems
  } = useQuotationSync({
    projectId: projectId,
    clientId: project?.client_id || undefined,
    autoCreateQuote: false
  });

  // Calculate quotation data
  const quotationData = useMemo(() => {
    const data = buildQuotationItems();
    return data;
  }, [buildQuotationItems, projectSummaries?.windows, projectSummaries?.projectTotal, treatments?.length]);
  const hasQuotationItems = (quotationData.items || []).length > 0;
  const subtotal = quotationData.subtotal || 0;
  const taxAmount = quotationData.taxAmount || 0;
  const total = quotationData.total || 0;
  const taxRate = (businessSettings?.tax_rate || 0) / 100;
  const pricingSettings = businessSettings?.pricing_settings as any;
  const markupPercentage = pricingSettings?.default_markup_percentage ?? 0;

  // Use quotationData.items directly - they already have the correct children array with pricing!
  // DO NOT map/simplify the children array - it has the correct structure from useQuotationSync
  const sourceTreatments = (quotationData.items || []).filter(item => !item.isHeader);
  console.log('[QuotationTab] Items with children:', {
    itemsCount: sourceTreatments.length,
    sampleItem: sourceTreatments[0] ? {
      name: sourceTreatments[0].name,
      has_children: !!sourceTreatments[0].children,
      children_count: sourceTreatments[0].children?.length || 0,
      sample_child: sourceTreatments[0].children?.[0]
    } : null
  });

  // Get settings from template blocks safely - MUST be before early returns
  const templateSettings = useMemo(() => {
    const blocks = selectedTemplate?.blocks;
    if (!blocks || typeof blocks === 'string') return {
      showImages: true,
      showDetailedBreakdown: false,
      groupByRoom: false,
      layout: 'detailed' as 'simple' | 'detailed'
    };
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    // Match all product/items block types that LivePreview handles
    const productsBlock = blocksArray.find((b: any) => 
      b?.type === 'products' || b?.type === 'product' || b?.type === 'line-items' || b?.type === 'items'
    ) as any;

    // Get layout from content, defaulting to 'detailed'
    const layout = (productsBlock?.content?.layout || 'detailed') as 'simple' | 'detailed';
    return {
      showImages: productsBlock?.content?.showImages ?? true,
      showDetailedBreakdown: productsBlock?.content?.showDetailedBreakdown ?? true,
      groupByRoom: productsBlock?.content?.groupByRoom ?? false,
      layout
    };
  }, [selectedTemplate]);

  // Check if Homekaara template style should be used
  // When 'homekaara' is selected in business settings, it overrides the block-based template
  const quoteTemplateStyle = (businessSettings as any)?.quote_template || 'default';
  const useHomekaaraTemplate = quoteTemplateStyle === 'homekaara';

  // Function to update template settings
  const handleUpdateTemplateSettings = async (key: string, value: any) => {
    if (!selectedTemplate || isReadOnly) {
      if (isReadOnly) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to edit this job.",
          variant: "destructive",
        });
      }
      return;
    }
    try {
      const blocks = Array.isArray(selectedTemplate.blocks) ? selectedTemplate.blocks : [];
      const updatedBlocks = blocks.map((block: any) => {
        // Match all product/items block types that LivePreview handles
        if (block?.type === 'products' || block?.type === 'product' || block?.type === 'line-items' || block?.type === 'items') {
          return {
            ...block,
            content: {
              ...block.content,
              [key]: value
            }
          };
        }
        return block;
      });
      const {
        error
      } = await supabase.from('quote_templates').update({
        blocks: updatedBlocks
      }).eq('id', selectedTemplate.id);
      if (error) throw error;

      // Refresh templates to show updated settings
      await refetchTemplates();
      toast({
        title: "Settings updated",
        description: "Quote display settings have been updated"
      });
    } catch (error) {
      console.error('Error updating template settings:', error);
      toast({
        title: "Error",
        description: "Failed to update template settings",
        variant: "destructive"
      });
    }
  };

  // Get template blocks safely - MUST be before early returns
  const templateBlocks = useMemo(() => {
    const blocks = selectedTemplate?.blocks;
    if (!blocks) return [];
    if (typeof blocks === 'string') return [];
    const blocksArray = Array.isArray(blocks) ? blocks : [];
    return removeDuplicateProductsBlocks(blocksArray);
  }, [selectedTemplate]);

  // Project data for LivePreview - MUST be before early returns
  const projectData = useMemo(() => {
    // Get currency from business settings
    let currency = 'USD'; // Minimal fallback, should use settings
    try {
      const measurementUnits = businessSettings?.measurement_units ? JSON.parse(businessSettings.measurement_units) : null;
      currency = measurementUnits?.currency || 'USD';
    } catch {
      currency = 'USD';
    }

    // Get tax-inclusive setting from business settings
    const pricingSettings = businessSettings?.pricing_settings as any;
    const taxInclusive = pricingSettings?.tax_inclusive || false;

    // Calculate discount if applicable - check for discount_type, not just amount
    const hasDiscount = !!currentQuote?.discount_type;
    const discountAmount = currentQuote?.discount_amount || 0; // This is always pre-tax

    // Calculate discounted values respecting tax_inclusive setting
    let subtotalAfterDiscount: number;
    let taxAmountAfterDiscount: number;
    let totalAfterDiscount: number;

    if (hasDiscount && discountAmount > 0) {
      if (taxInclusive) {
        // Tax-inclusive mode: quotationData.subtotal is ALREADY NET (extracted in useQuotationSync)
        // discountAmount was also calculated on NET, so apply directly without double-extraction
        const discountedNetSubtotal = subtotal - discountAmount;
        subtotalAfterDiscount = discountedNetSubtotal;
        totalAfterDiscount = discountedNetSubtotal * (1 + taxRate);
        taxAmountAfterDiscount = totalAfterDiscount - discountedNetSubtotal;
      } else {
        // Tax-exclusive mode: discount applies directly to subtotal
        subtotalAfterDiscount = subtotal - discountAmount;
        taxAmountAfterDiscount = subtotalAfterDiscount * taxRate;
        totalAfterDiscount = subtotalAfterDiscount + taxAmountAfterDiscount;
      }
    } else {
      subtotalAfterDiscount = subtotal;
      taxAmountAfterDiscount = taxAmount;
      totalAfterDiscount = total;
    }

    console.log('📊 QuotationTab - projectData calculation:', {
      currentQuoteId: currentQuote?.id,
      taxInclusive,
      hasDiscount,
      discountType: currentQuote?.discount_type,
      discountValue: currentQuote?.discount_value,
      discountScope: currentQuote?.discount_scope,
      discountAmount,
      originalSubtotal: subtotal,
      subtotalAfterDiscount,
      originalTaxAmount: taxAmount,
      taxAmountAfterDiscount,
      originalTotal: total,
      totalAfterDiscount,
      willPassToLivePreview: {
        subtotal: subtotal,
        taxAmount: hasDiscount ? taxAmountAfterDiscount : taxAmount,
        total: hasDiscount ? totalAfterDiscount : total,
        hasDiscountObject: hasDiscount
      }
    });
    return {
      quoteId: currentQuote?.id,
      project: {
        ...project,
        client,
        // Add payment fields directly to project for token resolution
        payment_status: currentQuote?.payment_status || 'unpaid',
        amount_paid: currentQuote?.amount_paid || 0,
      },
      client,
      businessSettings,
      items: sourceTreatments,
      treatments: sourceTreatments,
      workshopItems: workshopItems || [],
      rooms: rooms || [],
      surfaces: surfaces || [],
      subtotal: hasDiscount ? subtotalAfterDiscount : subtotal,
      taxRate,
      taxAmount: hasDiscount ? taxAmountAfterDiscount : taxAmount,
      total: hasDiscount ? totalAfterDiscount : total,
      totalAfterDiscount, // GST-inclusive discounted total for payment calculations
      currency,
      markupPercentage,
      amountPaid: currentQuote?.amount_paid || 0,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      discount: hasDiscount ? {
        type: currentQuote.discount_type,
        value: currentQuote.discount_value,
        amount: discountAmount,
        scope: currentQuote.discount_scope
      } : undefined,
      payment: currentQuote ? {
        type: currentQuote.payment_type || 'full',
        percentage: currentQuote.payment_percentage,
        amount: currentQuote.payment_amount || total,
        status: currentQuote.payment_status
      } : undefined
    };
  }, [project, client, businessSettings, sourceTreatments, workshopItems, rooms, surfaces, subtotal, taxRate, taxAmount, total, markupPercentage, currentQuote]);

  // Prepare Homekaara template data - MUST be after projectData
  // Uses quotationData.items (already computed) instead of re-parsing projectSummaries
  const homekaaraTemplateData = useMemo(() => {
    if (!useHomekaaraTemplate) return null;
    
    // Use sourceTreatments which already have all the correct data from useQuotationSync
    const items = sourceTreatments.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || item.total,
      total: item.total || 0,
      prate: item.quantity || 1,
      image_url: item.image_url,
      // CRITICAL: Use display_formula for consistent formula rendering across all views
      // Priority: display_formula > description > total
      breakdown: item.children?.map((child: any) => ({
        label: child.name || child.category || '',
        value: child.display_formula || child.description || (child.total_cost ? `${child.total_cost.toFixed(2)}` : ''),
      })) || [],
      room_name: item.room_name,
      room_id: item.room_id,
      surface_name: item.surface_name,
      treatment_type: item.treatment_type,
    }));
    
    // Get currency from business settings
    let currency = 'USD';
    try {
      const measurementUnits = businessSettings?.measurement_units ? JSON.parse(businessSettings.measurement_units) : null;
      currency = measurementUnits?.currency || 'USD';
    } catch {
      currency = 'USD';
    }
    
    return {
      items,
      subtotal: subtotal,
      taxAmount: taxAmount,
      total: total,
      currency: currency,
      businessInfo: {
        name: businessSettings?.company_name || 'Your Business',
        logo_url: businessSettings?.company_logo_url,
        email: businessSettings?.business_email,
        phone: businessSettings?.business_phone,
        address: [businessSettings?.address, businessSettings?.city, businessSettings?.state, businessSettings?.zip_code].filter(Boolean).join(', '),
      },
      clientInfo: {
        name: (client as any)?.full_name || client?.name || 'Client',
        email: client?.email,
        phone: client?.phone,
        address: client?.address,
      },
      metadata: {
        quote_number: project?.job_number || currentQuote?.id?.slice(0, 8) || 'N/A',
        date: currentQuote?.created_at
          ? new Date(currentQuote.created_at).toLocaleDateString('en-GB')
          : project?.created_at
            ? new Date(project.created_at).toLocaleDateString('en-GB')
            : new Date().toLocaleDateString('en-GB'),
        status: currentQuote?.status || project?.status || 'Draft',
        validity_days: currentQuote?.valid_until
          ? Math.ceil((new Date(currentQuote.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : 14,
        services_required: (currentQuote as any)?.metadata?.services_required || (project as any)?.services_required,
        expected_purchase_date: (currentQuote as any)?.metadata?.expected_purchase_date || (project as any)?.expected_purchase_date,
        referral_source: (currentQuote as any)?.metadata?.referral_source || (project as any)?.referral_source,
      },
      paymentInfo: {
        advance_paid: currentQuote?.amount_paid || 0,
        deposit_percentage: currentQuote?.payment_percentage || 50,
      },
      // Discount info - pass to template for display
      discountInfo: currentQuote?.discount_type ? {
        type: currentQuote.discount_type as 'percentage' | 'fixed',
        value: currentQuote.discount_value || 0,
        amount: currentQuote.discount_amount || 0,
      } : undefined,
      introMessage: currentQuote?.notes || (project as any)?.intro_message,
    };
  }, [useHomekaaraTemplate, sourceTreatments, subtotal, taxAmount, total, businessSettings, client, project, currentQuote]);

  // Download PDF
  const handleDownloadPDF = async () => {
    const element = document.getElementById('quote-live-preview');
    if (!element) {
      toast({
        title: "Error",
        description: "Quote preview not ready. Please wait a moment.",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const filename = `quote-${project?.job_number || 'QT'}.pdf`;
      await generateQuotePDF(element, {
        filename
      });
      toast({
        title: "Success",
        description: "PDF downloaded successfully"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print (open PDF in new tab)
  const handlePrint = async () => {
    const element = document.getElementById('quote-live-preview');
    if (!element) {
      toast({
        title: "Error",
        description: "Quote preview not ready",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const blob = await generateQuotePDFBlob(element);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Print error:', error);
      toast({
        title: "Error",
        description: "Failed to open print preview",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Handle Homekaara template save
  const handleHomekaaraSave = async (data: { metadata: any; introMessage: string; items: any[] }) => {
    if (!currentQuote?.id) {
      toast({
        title: "Error",
        description: "No quote selected to save changes.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Save quote metadata changes to database
      const { error } = await supabase
        .from('quotes')
        .update({
          notes: data.introMessage,
          // Store metadata in JSON field if available
          metadata: {
            services_required: data.metadata.services_required,
            expected_purchase_date: data.metadata.expected_purchase_date,
            referral_source: data.metadata.referral_source,
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', currentQuote.id);

      if (error) throw error;

      toast({
        title: "Changes Saved",
        description: "Quote has been updated successfully."
      });
      setIsHomekaaraEditable(false);
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save changes.",
        variant: "destructive"
      });
    }
  };

  // Handle image upload for Homekaara template
  const handleHomekaaraImageUpload = async (itemId: string, file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/treatments/${itemId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('treatment-images')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload image');
    }

    const { data: { publicUrl } } = supabase.storage
      .from('treatment-images')
      .getPublicUrl(filePath);

    // Update treatment with new image URL
    await supabase
      .from('treatments')
      .update({ image_url: publicUrl })
      .eq('id', itemId);

    toast({
      title: "Image Uploaded",
      description: "Product image has been updated."
    });

    return publicUrl;
  };

  // Email quote
  const handleSendEmail = async (emailData: {
    to: string;
    subject: string;
    message: string;
  }) => {
    if (!isPermissionLoaded || !canSendEmails) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to send emails.",
        variant: "destructive",
      });
      return;
    }

    const element = document.getElementById('quote-live-preview');
    if (!element) {
      toast({
        title: "Error",
        description: "Quote preview not ready. Please try again.",
        variant: "destructive"
      });
      return;
    }
    setIsSendingEmail(true);
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your quote"
      });
      const pdfBlob = await generateQuotePDFBlob(element);
      const timestamp = Date.now();
      const fileName = `quote-${project?.job_number || 'QT'}-${timestamp}.pdf`;
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const filePath = `${user.id}/quotes/${fileName}`;
      toast({
        title: "Uploading PDF...",
        description: "Preparing attachment"
      });
      const {
        error: uploadError
      } = await supabase.storage.from('email-attachments').upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
        metadata: {
          user_id: user.id,
          client_id: project?.client_id || '',
          project_id: projectId
        }
      });
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload PDF: ${uploadError.message}`);
      }
      toast({
        title: "Sending Email...",
        description: "Delivering quote to recipient"
      });
      const {
        error: emailError
      } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.message,
          user_id: user.id,
          client_id: project?.client_id,
          attachmentPaths: [filePath]
        }
      });
      if (emailError) {
        console.error('Email error:', emailError);
        throw new Error(`Failed to send email: ${emailError.message}`);
      }
      toast({
        title: "Email Sent Successfully",
        description: `Quote sent to ${emailData.to}`
      });
      setIsEmailModalOpen(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };
  // Check if quote contains TWC products
  const hasTWCProducts = useMemo(() => {
    return quotationData.items?.some((item: any) => 
      item.metadata?.twc_item_number || 
      item.supplier === 'TWC'
    ) || false;
  }, [quotationData.items]);

  const getOrCreateQuoteId = async (): Promise<string | null> => {
    // If we already have an activeQuoteId, use it
    if (activeQuoteId) return activeQuoteId;
    
    // If we have a quoteId prop, use it
    if (quoteId) {
      setActiveQuoteId(quoteId);
      return quoteId;
    }

    // If there's an existing quote for this project, use the first one
    if (quoteVersions && quoteVersions.length > 0) {
      setActiveQuoteId(quoteVersions[0].id);
      return quoteVersions[0].id;
    }

    // Otherwise, create a new quote
    try {
      const newQuote = await createQuote.mutateAsync({
        project_id: projectId,
        client_id: project?.client_id,
        status: 'draft',
        version: 1
      });
      // Store the new quote ID so subsequent renders can use it
      setActiveQuoteId(newQuote.id);
      return newQuote.id;
    } catch (error) {
      console.error('Failed to create quote:', error);
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };
  const handleAddDiscount = async () => {
    if (isReadOnly) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this job.",
        variant: "destructive",
      });
      return;
    }
    const effectiveQuoteId = await getOrCreateQuoteId();
    if (!effectiveQuoteId) return;

    // Toggle the inline discount panel
    setIsDiscountDialogOpen(!isDiscountDialogOpen);

    // Force refetch of quote versions when opening discount panel
    await queryClient.invalidateQueries({
      queryKey: ["quote-versions", projectId]
    });
  };
  const handleAddTerms = () => {
    toast({
      title: "Add Terms & Conditions",
      description: "Terms & Conditions functionality would be implemented here"
    });
  };
  const handlePayment = async () => {
    if (isReadOnly) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this job.",
        variant: "destructive",
      });
      return;
    }
    const effectiveQuoteId = await getOrCreateQuoteId();
    if (!effectiveQuoteId) return;

    // Toggle the inline payment config panel
    setIsPaymentConfigOpen(!isPaymentConfigOpen);

    // Force refetch of quote versions when opening payment panel
    await queryClient.invalidateQueries({
      queryKey: ["quote-versions", projectId]
    });
  };
  if (!project) {
    return (
      <div className="space-y-4 py-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (templatesLoading || quotesLoading) {
    return <QuotationSkeleton />;
  }
  if (!activeTemplates || activeTemplates.length === 0) {
    return <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <PixelDocumentIcon className="mx-auto mb-4" size={56} />
        <h4 className="font-medium text-foreground mb-2">No active quote templates</h4>
        <p className="text-sm text-muted-foreground">
          Please create and activate quote templates in Settings → Document Templates
        </p>
      </div>
    </div>;
  }
  return <div className="space-y-2 sm:space-y-3 pb-4 overflow-x-hidden">
      {/* Header with Actions - Improved Organization */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-base sm:text-lg font-semibold">Quotation</h2>
              
              {/* Template Selector */}
              {activeTemplates && activeTemplates.length > 1 && <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-[200px] h-8">
                    <FileCheck className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map(template => <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>}
            </div>
            
          </div>

          {/* Action Buttons - Icon-only on mobile/tablet */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

            {/* Primary Action - Download PDF */}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF || !selectedTemplate || isReadOnly} 
              className="h-9 px-2 lg:px-4"
              title={isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            >
              <Download className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">
                {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
              </span>
            </Button>

            {/* Secondary Actions */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (!isPermissionLoaded || !canSendEmails) {
                  toast({
                    title: "Permission Denied",
                    description: "You don't have permission to send emails.",
                    variant: "destructive",
                  });
                  return;
                }
                setIsEmailModalOpen(true);
              }} 
              disabled={isGeneratingPDF || !selectedTemplate || isReadOnly || !isPermissionLoaded || !canSendEmails} 
              className="h-9 px-4"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            {/* Email action is available via Contact button in JobDetailPage header */}

            {/* Discount Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddDiscount}
              disabled={createQuote.isPending || isReadOnly}
              className="h-9 px-2 lg:px-4"
              title="Discount"
            >
              <Percent className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Discount</span>
            </Button>

            {/* Per-Job Markup Override Button */}
            <Button
              variant={((currentQuote as any)?.custom_markup_percentage != null) ? "default" : "outline"}
              size="sm"
              onClick={async () => {
                const effectiveQuoteId = await getOrCreateQuoteId();
                if (!effectiveQuoteId) return;
                setIsMarkupOverrideOpen(!isMarkupOverrideOpen);
              }}
              disabled={createQuote.isPending || isReadOnly}
              className="h-9 px-2 lg:px-4"
              title="Custom Markup"
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden lg:inline ml-2">Markup</span>
            </Button>

            {/* Edit Quote Button - Only for Homekaara Template */}
            {useHomekaaraTemplate && (
              <Button
                variant={isHomekaaraEditable ? "default" : "outline"}
                size="sm"
                onClick={() => setIsHomekaaraEditable(!isHomekaaraEditable)}
                disabled={isReadOnly}
                className="h-9 px-2 lg:px-4"
                title={isHomekaaraEditable ? "Done Editing" : "Edit Quote"}
              >
                {isHomekaaraEditable ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Done</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Edit Quote</span>
                  </>
                )}
              </Button>
            )}

            {/* Edit Items Toggle Button - TEMPORARILY HIDDEN
               Needs reimplementation to avoid breaking quotes
            <Button 
              variant={isExclusionEditMode ? "default" : "outline"}
              size="sm" 
              onClick={() => setIsExclusionEditMode(!isExclusionEditMode)}
              disabled={isReadOnly}
              className="h-9 px-2 lg:px-4"
              title={isExclusionEditMode ? "Done Editing" : "Edit Items"}
            >
              {isExclusionEditMode ? (
                <>
                  <Check className="h-4 w-4" />
                  <span className="hidden lg:inline ml-2">Done</span>
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  <span className="hidden lg:inline ml-2">Edit Items</span>
                </>
              )}
            </Button>
            */}

            {/* Payment Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={createQuote.isPending || isReadOnly} 
                  className="h-9 px-2 lg:px-4"
                  title="Payment"
                >
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden lg:inline ml-2">Payment</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handlePayment}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Configure Payment Terms
                </DropdownMenuItem>
                {isInvoice && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsRecordPaymentOpen(true)}>
                      <Banknote className="h-4 w-4 mr-2" />
                      Record Payment Received
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export - Invoice only - Enhanced styling */}
            {isInvoice && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 px-2 lg:px-3 bg-muted/50 hover:bg-muted border-border"
                    title="Export"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden lg:inline ml-2">Export</span>
                    <ChevronDown className="h-3 w-3 ml-1 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    if (!client) {
                      toast({ title: "Export Error", description: "Client information missing", variant: "destructive" });
                      return;
                    }
                    const items = quotationData.items || [];
                    if (items.length === 0) {
                      toast({ title: "Export Error", description: "No items to export", variant: "destructive" });
                      return;
                    }
                    const exportData = prepareInvoiceExportData(
                      currentQuote,
                      client,
                      items,
                      businessSettings,
                      project
                    );
                    console.log('[Export] CSV data:', exportData);
                    exportInvoiceToCSV(exportData);
                    toast({ title: "Exported", description: "CSV file downloaded" });
                  }}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => {
                    if (!client) {
                      toast({ title: "Export Error", description: "Client information missing", variant: "destructive" });
                      return;
                    }
                    const exportData = prepareInvoiceExportData(
                      currentQuote,
                      client,
                      quotationData.items || [],
                      businessSettings,
                      project
                    );
                    exportInvoiceForXero(exportData);
                    toast({ title: "Exported", description: "Xero-compatible CSV downloaded" });
                  }}>
                    Export for Xero
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    if (!client) {
                      toast({ title: "Export Error", description: "Client information missing", variant: "destructive" });
                      return;
                    }
                    const exportData = prepareInvoiceExportData(
                      currentQuote,
                      client,
                      quotationData.items || [],
                      businessSettings,
                      project
                    );
                    exportInvoiceForQuickBooks(exportData);
                    toast({ title: "Exported", description: "QuickBooks-compatible CSV downloaded" });
                  }}>
                    Export for QuickBooks
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* TWC Submit Button */}
            {hasTWCProducts && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsTWCSubmitDialogOpen(true)}
                disabled={isReadOnly}
                className="h-9 px-2 lg:px-4 border-blue-500 text-blue-600 hover:bg-blue-50"
                title="Submit to TWC"
              >
                <Package className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">Submit to TWC</span>
              </Button>
            )}

          </div>
        </div>

        {/* Quote Display Options - Toggle Controls */}
        <div className="flex items-center gap-3 mt-4 pt-3 border-t flex-wrap">
          <span className="text-xs font-medium text-muted-foreground">Display Options:</span>
          
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch checked={templateSettings.groupByRoom} onCheckedChange={checked => {
            handleUpdateTemplateSettings('groupByRoom', checked);
          }} disabled={isReadOnly} />
            <span className="text-sm">Group by room</span>
          </label>
          
          <Button variant="ghost" size="sm" onClick={() => {
          const newLayout = templateSettings.layout === 'detailed' ? 'simple' : 'detailed';
          handleUpdateTemplateSettings('layout', newLayout);
        }} className="h-8" disabled={isReadOnly}>
            {templateSettings.layout === 'detailed' ? 'Simple View' : 'Detailed View'}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => {
          handleUpdateTemplateSettings('showImages', !templateSettings.showImages);
        }} className="h-8" disabled={isReadOnly}>
            <ImageIconLucide className="h-4 w-4 mr-2" />
            {templateSettings.showImages ? 'Hide Images' : 'Show Images'}
          </Button>
        </div>
      </Card>

      {/* Inline Discount Panel - Pass sellingTotal (retail price with markup) for discount calculations */}
      <InlineDiscountPanel 
        isOpen={isDiscountDialogOpen} 
        onClose={() => setIsDiscountDialogOpen(false)} 
        quoteId={activeQuoteId || quoteId || quoteVersions?.[0]?.id || ''} 
        projectId={projectId} 
        items={quotationData.items || []} 
        subtotal={quotationData.sellingTotal || subtotal} 
        taxRate={taxRate * 100} 
        currency={projectData.currency}
        taxInclusive={(businessSettings?.pricing_settings as any)?.tax_inclusive || false}
        currentDiscount={currentQuote?.discount_type ? {
          type: currentQuote.discount_type as 'percentage' | 'fixed',
          value: currentQuote.discount_value || 0,
          scope: currentQuote.discount_scope as 'all' | 'fabrics_only' | 'selected_items',
          amount: currentQuote.discount_amount || 0,
          selectedItems: currentQuote.selected_discount_items as string[] || undefined
        } : undefined} 
      />

      {/* Inline Markup Override Panel - Per-job custom markup */}
      <InlineMarkupOverride
        isOpen={isMarkupOverrideOpen}
        onClose={() => setIsMarkupOverrideOpen(false)}
        quoteId={activeQuoteId || quoteId || quoteVersions?.[0]?.id || ''}
        projectId={projectId}
        currentMarkup={(currentQuote as any)?.custom_markup_percentage ?? null}
        defaultMarkup={(businessSettings?.pricing_settings as any)?.default_markup_percentage || 0}
      />

      {/* Inline Payment Config Panel - Pass GST-inclusive discounted total */}
      {isPaymentConfigOpen && (
        <InlinePaymentConfig
          quoteId={activeQuoteId || quoteId || quoteVersions?.[0]?.id || ''}
          total={currentQuote?.discount_type ? projectData.totalAfterDiscount : total}
          discountAmount={0}
          currency={projectData.currency}
          currentPayment={currentQuote ? {
            type: currentQuote.payment_type as 'full' | 'deposit' || 'full',
            percentage: currentQuote.payment_percentage || undefined,
            amount: currentQuote.payment_amount || (currentQuote?.discount_type ? projectData.totalAfterDiscount : total),
            status: currentQuote.payment_status as 'pending' | 'paid' | 'deposit_paid' | 'failed' || undefined
          } : undefined}
        />
      )}

      {/* Profit Summary for Authorized Users - Collapsible with per-treatment breakdown */}
      <QuoteProfitSummary 
        costTotal={quotationData.costTotal || 0} 
        sellingTotal={quotationData.sellingTotal || subtotal} 
        variant="card"
        showBreakdown={true}
        items={sourceTreatments}
        discount={currentQuote?.discount_type ? {
          type: currentQuote.discount_type as 'percentage' | 'fixed',
          value: currentQuote.discount_value || 0,
          amount: currentQuote.discount_amount || 0
        } : undefined}
      />

      {/* Quotation Items Modal */}
      <QuotationItemsModal 
        key={`quote-modal-${projectSummaries?.projectTotal}-${quotationData.items?.length}`} 
        isOpen={showQuotationItems} 
        onClose={() => setShowQuotationItems(false)} 
        quotationData={quotationData} 
        currency={(() => {
          if (!businessSettings?.measurement_units) return 'USD';
          const units = typeof businessSettings.measurement_units === 'string' 
            ? JSON.parse(businessSettings.measurement_units)
            : businessSettings.measurement_units;
          return units?.currency || 'USD';
        })()} 
        treatments={sourceTreatments} 
        rooms={rooms || []} 
        surfaces={surfaces || []} 
        markupPercentage={markupPercentage} 
      />

      {/* Quote Preview */}
      {isEmptyVersion ? (
        <EmptyQuoteVersionState currentVersion={currentVersion} onAddRoom={() => {
          const roomsTab = document.querySelector('[data-state="inactive"]') as HTMLElement;
          if (roomsTab) roomsTab.click();
        }} />
      ) : useHomekaaraTemplate && homekaaraTemplateData ? (
        <section className="mt-2 sm:mt-4">
          <div className="w-full flex justify-center items-start bg-gradient-to-br from-muted/30 to-muted/50 dark:from-background dark:to-card/20 px-4 py-2 rounded-lg border border-border/40">
            <div className="transform scale-[0.52] sm:scale-[0.72] md:scale-[0.85] lg:scale-[0.95] xl:scale-[1.0] origin-top shadow-2xl dark:shadow-xl mx-auto">
              <div id="quote-live-preview" className="quote-preview-container bg-document text-document-foreground" style={{
                width: '210mm',
                minHeight: '297mm',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '10pt',
                padding: '8mm',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                <QuoteTemplateHomekaara
                  items={homekaaraTemplateData.items}
                  subtotal={homekaaraTemplateData.subtotal}
                  taxAmount={homekaaraTemplateData.taxAmount}
                  total={homekaaraTemplateData.total}
                  currency={homekaaraTemplateData.currency}
                  businessInfo={homekaaraTemplateData.businessInfo}
                  clientInfo={homekaaraTemplateData.clientInfo}
                  metadata={homekaaraTemplateData.metadata}
                  paymentInfo={homekaaraTemplateData.paymentInfo}
                  discountInfo={homekaaraTemplateData.discountInfo}
                  introMessage={homekaaraTemplateData.introMessage}
                  isEditable={isHomekaaraEditable}
                  onSaveChanges={handleHomekaaraSave}
                  onImageUpload={handleHomekaaraImageUpload}
                />
              </div>
            </div>
          </div>
        </section>
      ) : !selectedTemplate || !templateBlocks || templateBlocks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Quote Template Found</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            You need to create a quote template before you can generate quotes. Go to Settings → Documents to create your first template.
          </p>
          <Button onClick={() => {
            window.location.href = '/?settings=documents';
          }}>
            <FileText className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      ) : (
        <section className="mt-2 sm:mt-4" key={`preview-${selectedTemplate?.id}-${templateSettings.layout}-${templateSettings.showImages}-${templateSettings.groupByRoom}-${projectSummaries?.projectTotal}`}>
          <div className="w-full flex justify-center items-start bg-gradient-to-br from-muted/30 to-muted/50 dark:from-background dark:to-card/20 px-4 py-2 rounded-lg border border-border/40">
            <div className="transform scale-[0.52] sm:scale-[0.72] md:scale-[0.85] lg:scale-[0.95] xl:scale-[1.0] origin-top shadow-2xl dark:shadow-xl mx-auto">
              <div id="quote-live-preview" className="quote-preview-container bg-document text-document-foreground" style={{
                width: '210mm',
                minHeight: '297mm',
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '10pt',
                padding: '8mm',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                <LivePreview 
                  key={`live-preview-${templateSettings.layout}-${templateSettings.showImages}-${templateSettings.groupByRoom}`} 
                  blocks={templateBlocks} 
                  projectData={projectData} 
                  isEditable={false} 
                  isPrintMode={!isExclusionEditMode} 
                  documentType={selectedTemplate?.template_style || 'quote'} 
                  layout={templateSettings.layout} 
                  showDetailedBreakdown={templateSettings.layout === 'detailed'} 
                  showImages={templateSettings.showImages} 
                  groupByRoom={templateSettings.groupByRoom} 
                  excludedItems={excludedItems} 
                  onToggleExclusion={toggleExclusion} 
                  isExclusionEditMode={isExclusionEditMode} 
                  quoteId={activeQuoteId || quoteId} 
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Email Modal */}
      <EmailQuoteModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} project={project} client={client} onSend={handleSendEmail} isSending={isSendingEmail} quotePreview={<LivePreview blocks={templateBlocks} projectData={projectData} isEditable={false} isPrintMode={true} documentType={selectedTemplate?.template_style || 'quote'} showDetailedBreakdown={templateSettings.showDetailedBreakdown} showImages={templateSettings.showImages} />} />

      {/* TWC Submit Dialog */}
      {hasTWCProducts && quoteId && (
        <TWCSubmitDialog
          open={isTWCSubmitDialogOpen}
          onOpenChange={setIsTWCSubmitDialogOpen}
          quoteId={quoteId}
          quotationData={quotationData}
          projectData={project}
          clientData={client}
        />
      )}

      {/* Record Payment Dialog - Invoice only */}
      {isInvoice && currentQuote && (
        <RecordPaymentDialog
          open={isRecordPaymentOpen}
          onOpenChange={setIsRecordPaymentOpen}
          quoteId={currentQuote.id}
          total={total}
          amountPaid={currentQuote.amount_paid || 0}
          currency={projectData.currency}
          paymentStatus={currentQuote.payment_status}
          dueDate={currentQuote.valid_until || null}
        />
      )}

    </div>;
};