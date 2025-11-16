import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import QuoteItemBreakdown from "@/components/quotes/QuoteItemBreakdown";
import { QuoteItemImage } from "@/components/quotes/QuoteItemImage";

interface DetailedQuotationTableProps {
  quotationData: any;
  groupByRoom?: boolean;
  showDetailedView?: boolean;
  onToggleGroupByRoom?: () => void;
  onToggleDetailedView?: () => void;
  currency?: string;
  businessSettings?: any;
}

export const DetailedQuotationTable: React.FC<DetailedQuotationTableProps> = ({
  quotationData,
  groupByRoom = true,
  showDetailedView = true,
  onToggleGroupByRoom,
  onToggleDetailedView,
  currency = 'GBP',
  businessSettings
}) => {
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Debug logging
  console.log('🔍 DetailedQuotationTable Debug:', {
    quotationData,
    itemsCount: quotationData.items?.length,
    baseSubtotal: quotationData.baseSubtotal,
    subtotal: quotationData.subtotal,
    taxAmount: quotationData.taxAmount,
    total: quotationData.total,
    timestamp: new Date().toISOString()
  });
  
  console.log('🎨 UI Debug - Text colors applied:', {
    foreground: 'text-foreground',
    mutedForeground: 'text-muted-foreground', 
    cardBackground: 'bg-card'
  });

  const toggleRoom = (roomId: string) => {
    const newExpanded = new Set(expandedRooms);
    if (newExpanded.has(roomId)) {
      newExpanded.delete(roomId);
    } else {
      newExpanded.add(roomId);
    }
    setExpandedRooms(newExpanded);
  };

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const groupedItems = groupByRoom ? groupItemsByRoom(quotationData.items || []) : { 'All Items': quotationData.items || [] };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Quotation Items</CardTitle>
          <div className="flex items-center space-x-2">
            {onToggleGroupByRoom && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleGroupByRoom}
                className="flex items-center space-x-1"
              >
                {groupByRoom ? 'Show All' : 'Group by Room'}
              </Button>
            )}
            {onToggleDetailedView && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleDetailedView}
                className="flex items-center space-x-1"
              >
                {showDetailedView ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showDetailedView ? 'Simple' : 'Detailed'}</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(groupedItems).map(([roomName, items]) => {
          const roomId = roomName === 'All Items' ? 'all' : roomName;
          const isRoomExpanded = expandedRooms.has(roomId);
          const roomTotal = items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);

          if (groupByRoom && roomName !== 'All Items') {
            return (
              <Collapsible key={roomId} open={isRoomExpanded} onOpenChange={() => toggleRoom(roomId)}>
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 cursor-pointer">
                    <div className="flex items-center space-x-2">
                      {isRoomExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <h3 className="font-medium">{roomName}</h3>
                      <Badge variant="secondary">{items.length} item{items.length > 1 ? 's' : ''}</Badge>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(roomTotal, currency)}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2 ml-6">
                  {items.map((item: any) => (
                    <QuotationItemRow
                      key={item.id}
                      item={item}
                      showDetailedView={showDetailedView}
                      expandedItems={expandedItems}
                      onToggleItem={toggleItem}
                      currency={currency}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <div key={roomId} className="space-y-2">
              {items.map((item: any) => (
                <QuotationItemRow
                  key={item.id}
                  item={item}
                  showDetailedView={showDetailedView}
                  expandedItems={expandedItems}
                  onToggleItem={toggleItem}
                  currency={currency}
                />
              ))}
            </div>
          );
        })}

        {/* Financial Summary */}
        <div className="border-t mt-6 pt-4">
          <FinancialSummary quotationData={quotationData} currency={currency} businessSettings={businessSettings} />
        </div>
      </CardContent>
    </Card>
  );
};

const QuotationItemRow: React.FC<{
  item: any;
  showDetailedView: boolean;
  expandedItems: Set<string>;
  onToggleItem: (id: string) => void;
  currency: string;
}> = ({ item, showDetailedView, expandedItems, onToggleItem, currency }) => {
  const isExpanded = expandedItems.has(item.id);
  const hasBreakdown = item.breakdown && Array.isArray(item.breakdown) && item.breakdown.length > 0;
  const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;

  if (item.isHeader) {
    return null; // Skip headers in detailed view
  }

  // If item has children (detailed breakdown), show parent + children
  if (hasChildren) {
    return (
      <div className="border rounded-lg overflow-hidden mb-3">
        {/* PARENT ROW - Main Product */}
        <div className="flex items-start gap-4 p-4 bg-card border-b">
          {item.image_url && (
            <QuoteItemImage 
              src={item.image_url} 
              alt={item.name} 
              size={60}
              className="flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-base text-foreground mb-1">{item.name}</div>
            {item.description && item.description !== '-' && (
              <div className="text-sm text-muted-foreground mb-2">{item.description}</div>
            )}
            
            {/* Breakdown items (Fabric, Manufacturing) */}
            {item.children.filter((c: any) => c.category !== 'option' && c.category !== 'options').length > 0 && (
              <div className="space-y-1.5 mt-3">
                {item.children
                  .filter((child: any) => child.category !== 'option' && child.category !== 'options')
                  .map((child: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      {child.image_url && (
                        <QuoteItemImage 
                          src={child.image_url} 
                          alt={child.name} 
                          size={28}
                          className="flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{child.name}</span>
                        {child.description && child.description !== '-' && (
                          <span className="text-muted-foreground ml-2">- {child.description}</span>
                        )}
                        {child.quantity > 0 && (
                          <span className="text-muted-foreground ml-2">
                            ({Number(child.quantity).toFixed(2)}{child.unit ? ` ${child.unit}` : ''})
                          </span>
                        )}
                      </div>
                      <div className="text-right text-sm whitespace-nowrap">
                        {child.unit_price > 0 && (
                          <div className="text-muted-foreground">
                            {formatCurrency(child.unit_price, currency)} × {Number(child.quantity).toFixed(2)}
                          </div>
                        )}
                        <div className="font-medium text-foreground">
                          {formatCurrency(child.total || 0, currency)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {/* Options section - clean bullet list */}
            {item.children.filter((c: any) => c.category === 'option' || c.category === 'options').length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-sm font-medium text-foreground mb-2">Options:</div>
                <ul className="space-y-1">
                  {item.children
                    .filter((opt: any) => opt.category === 'option' || opt.category === 'options')
                    .map((opt: any, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        {opt.image_url && (
                          <QuoteItemImage 
                            src={opt.image_url} 
                            alt={opt.name} 
                            size={20}
                            className="flex-shrink-0 mt-0.5"
                          />
                        )}
                        <div className="flex-1 flex items-start justify-between gap-3">
                          <span className="text-foreground">
                            <span className="font-medium">{opt.name}:</span>{' '}
                            <span className="text-muted-foreground">{opt.description || opt.value || '-'}</span>
                          </span>
                          {opt.total > 0 && (
                            <span className="font-medium text-foreground whitespace-nowrap">
                              {formatCurrency(opt.total, currency)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Total Price */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-semibold text-foreground">{formatCurrency(item.total || 0, currency)}</div>
          </div>
        </div>
      </div>
    );
  }

  // Regular item without children
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-card text-card-foreground">
        <div className="flex items-center space-x-2 flex-1">
          {hasBreakdown && showDetailedView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleItem(item.id)}
              className="p-1 h-6 w-6"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
          {item.image_url && (
            <QuoteItemImage 
              src={item.image_url} 
              alt={item.name} 
              size={40}
            />
          )}
          <div className="flex-1">
            <div className="font-medium text-sm text-foreground">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.description}</div>
            {item.quantity && item.unit_price && (
              <div className="text-xs text-muted-foreground">
                Qty: {item.quantity} × {formatCurrency(item.unit_price, currency)} each
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-medium text-foreground">{formatCurrency(item.total || 0, currency)}</div>
          {item.quantity && item.unit_price && (
            <div className="text-xs text-muted-foreground">
              {formatCurrency(item.unit_price, currency)} per unit
            </div>
          )}
        </div>
      </div>
      
      {/* Breakdown Details */}
      {hasBreakdown && showDetailedView && isExpanded && (
        <div className="border-t bg-muted/20 p-3">
          <QuoteItemBreakdown 
            breakdown={item.breakdown}
          />
        </div>
      )}
    </div>
  );
};

const FinancialSummary: React.FC<{ quotationData: any; currency: string; businessSettings?: any }> = ({ quotationData, currency, businessSettings }) => {
  const taxLabel = businessSettings?.tax_type === 'vat' ? 'VAT' : 
                   businessSettings?.tax_type === 'gst' ? 'GST' : 'Tax';
  const taxRate = businessSettings?.tax_rate || 0;
  const pricingSettings = businessSettings?.pricing_settings as any;
  const taxInclusive = pricingSettings?.tax_inclusive || false;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-foreground">
        <span>Subtotal ({taxInclusive ? 'excluding' : 'excluding'} {taxLabel}):</span>
        <span className="font-medium">{formatCurrency(quotationData.subtotal || 0, currency)}</span>
      </div>
      <div className="flex justify-between text-foreground">
        <span>{taxLabel} ({taxRate}%):</span>
        <span className="font-medium">{formatCurrency(quotationData.taxAmount || 0, currency)}</span>
      </div>
      <div className="border-t pt-2 flex justify-between text-lg font-bold text-foreground">
        <span>Total (including {taxLabel}):</span>
        <span>{formatCurrency(quotationData.total || 0, currency)}</span>
      </div>
    </div>
  );
};

const groupItemsByRoom = (items: any[]) => {
  const grouped: Record<string, any[]> = {};
  
  for (const item of items) {
    if (item.isHeader) continue;
    
    const roomName = item.room_name || 'Unassigned Room';
    if (!grouped[roomName]) {
      grouped[roomName] = [];
    }
    grouped[roomName].push(item);
  }
  
  return grouped;
};