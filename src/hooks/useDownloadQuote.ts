import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { formatCurrency } from "@/utils/currency";

interface DownloadQuoteData {
  quoteId: string;
  format?: 'pdf' | 'csv';
}

export const useDownloadQuote = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: DownloadQuoteData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Fetch quote with all related data
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .select(`
          *,
          quote_items(*),
          clients(name, email, address, phone),
          projects(name)
        `)
        .eq("id", data.quoteId)
        .single();

      if (quoteError) throw quoteError;

      // Fetch business settings for company info
      const { data: businessSettings } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data.format === 'csv') {
        return downloadAsCSV(quote);
      } else {
        return downloadAsPDF(quote, businessSettings);
      }
    },
    onSuccess: (result, variables) => {
      toast({
        title: "Success",
        description: `Quote downloaded as ${variables.format?.toUpperCase() || 'PDF'}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to download quote",
        variant: "destructive"
      });
    },
  });
};

const downloadAsPDF = (quote: any, businessSettings: any) => {
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.text(businessSettings?.company_name || 'Your Company', 20, 20);
  
  if (businessSettings?.address) {
    doc.setFontSize(10);
    doc.text(businessSettings.address, 20, 30);
  }
  
  // Add quote title
  doc.setFontSize(16);
  doc.text(`Quote ${quote.quote_number}`, 20, 50);
  
  // Add client info
  doc.setFontSize(12);
  doc.text('Client:', 20, 70);
  doc.text(quote.clients?.name || 'Unknown Client', 20, 80);
  if (quote.clients?.email) {
    doc.text(quote.clients.email, 20, 90);
  }
  
  // Add quote details
  doc.text(`Date: ${new Date(quote.created_at).toLocaleDateString()}`, 20, 110);
  doc.text(`Status: ${quote.status}`, 20, 120);
  if (quote.valid_until) {
    doc.text(`Valid Until: ${new Date(quote.valid_until).toLocaleDateString()}`, 20, 130);
  }
  
  // Add line items
  let yPos = 150;
  doc.text('Line Items:', 20, yPos);
  yPos += 10;
  
  quote.quote_items?.forEach((item: any, index: number) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(`${index + 1}. ${item.name}`, 20, yPos);
    doc.text(`Qty: ${item.quantity}`, 120, yPos);
    doc.text(`Price: ${formatCurrency(item.unit_price)}`, 160, yPos);
    yPos += 10;
    
    if (item.description) {
      doc.setFontSize(10);
      doc.text(item.description, 25, yPos);
      doc.setFontSize(12);
      yPos += 8;
    }
    yPos += 5;
  });
  
  // Add totals
  yPos += 10;
  doc.text(`Subtotal: ${formatCurrency(quote.subtotal || 0)}`, 120, yPos);
  yPos += 10;
  if (quote.tax_amount) {
    doc.text(`Tax: ${formatCurrency(quote.tax_amount)}`, 120, yPos);
    yPos += 10;
  }
  doc.setFontSize(14);
  doc.text(`Total: ${formatCurrency(quote.total_amount || 0)}`, 120, yPos);
  
  // Add notes if any
  if (quote.notes) {
    yPos += 20;
    doc.setFontSize(12);
    doc.text('Notes:', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    const splitNotes = doc.splitTextToSize(quote.notes, 170);
    doc.text(splitNotes, 20, yPos);
  }
  
  // Download the PDF
  doc.save(`quote-${quote.quote_number}.pdf`);
  
  return { format: 'pdf', filename: `quote-${quote.quote_number}.pdf` };
};

const downloadAsCSV = (quote: any) => {
  const csvData = [
    ['Quote Number', 'Client', 'Date', 'Status', 'Item', 'Description', 'Quantity', 'Unit Price', 'Total Price'],
    ...quote.quote_items?.map((item: any) => [
      quote.quote_number,
      quote.clients?.name || '',
      new Date(quote.created_at).toLocaleDateString(),
      quote.status,
      item.name,
      item.description || '',
      item.quantity,
      item.unit_price,
      item.total_price
    ]) || []
  ];
  
  const csvContent = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `quote-${quote.quote_number}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
  
  return { format: 'csv', filename: `quote-${quote.quote_number}.csv` };
};