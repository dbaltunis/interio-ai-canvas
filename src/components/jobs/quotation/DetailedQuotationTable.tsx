import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Eye, EyeOff, List, ListX } from "lucide-react";
import { formatCurrency } from "@/utils/currency";
import QuoteItemBreakdown from "@/components/quotes/QuoteItemBreakdown";
import { QuoteItemImage } from "@/components/quotes/QuoteItemImage";
import { LineItemProfitColumn } from "@/components/pricing/LineItemProfitColumn";
import { useUserRole } from "@/hooks/useUserRole";

interface DetailedQuotationTableProps {
  quotationData: any;
  groupByRoom?: boolean;
  showDetailedView?: boolean;
  showAllOptions?: boolean;
  onToggleGroupByRoom?: () => void;
  onToggleDetailedView?: () => void;
  onToggleShowOptions?: () => void;
  currency?: string;
  businessSettings?: any;
}

export const DetailedQuotationTable: React.FC<DetailedQuotationTableProps> = ({
  quotationData,
  groupByRoom = true,
  showDetailedView = true,
  showAllOptions = true,
  onToggleGroupByRoom,
  onToggleDetailedView,
  onToggleShowOptions,
  currency = 'GBP',
  businessSettings
}) => {
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg">Quotation Items</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleShowOptions && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleShowOptions}
                className="flex items-center gap-1"
              >
                {showAllOptions ? <ListX className="h-4 w-4" /> : <List className="h-4 w-4" />}
                <span>{showAllOptions ? 'Hide $0 Options' : 'Show All Options'}</span>
              </Button>
            )}
            {onToggleGroupByRoom && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleGroupByRoom}
                className="flex items-center gap-1"
              >
                {groupByRoom ? 'Show All' : 'Group by Room'}
              </Button>
            )}
            {onToggleDetailedView && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleDetailedView}
                className="flex items-center gap-1"
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
                      showAllOptions={showAllOptions}
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
                  showAllOptions={showAllOptions}
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
  showAllOptions: boolean;
  expandedItems: Set<string>;
  onToggleItem: (id: string) => void;
  currency: string;
}> = ({ item, showDetailedView, showAllOptions, expandedItems, onToggleItem, currency }) => {
  const { data: roleData } = useUserRole();
  const canViewMarkup = roleData?.canViewMarkup ?? false;
  const isExpanded = expandedItems.has(item.id);
  const hasBreakdown = item.breakdown && Array.isArray(item.breakdown) && item.breakdown.length > 0;
  const hasChildren = item.children && Array.isArray(item.children) && item.children.length > 0;

  if (item.isHeader) {
    return null;
  }

  // Filter options based on showAllOptions toggle
  const filterOptions = (children: any[]) => {
    if (showAllOptions) return children;
    return children.filter((c: any) => 
      (c.category !== 'option' && c.category !== 'options') || (c.total && c.total > 0)
    );
  };

  // If item has children (detailed breakdown), show parent + children
  if (hasChildren) {
    const filteredChildren = filterOptions(item.children);
    const nonOptionChildren = filteredChildren.filter((c: any) => c.category !== 'option' && c.category !== 'options');
    const optionChildren = filteredChildren.filter((c: any) => c.category === 'option' || c.category === 'options');
    
    return (
      <div className="border rounded-lg overflow-hidden mb-3">
        {/* PARENT ROW - Main Product with Window Name */}
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
            {/* Product Name + Window Badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-base text-foreground">{item.name}</span>
              {item.surface_name && (
                <Badge variant="outline" className="text-xs font-normal">
                  {item.surface_name}
                </Badge>
              )}
            </div>
            {item.description && item.description !== '-' && (
              <div className="text-sm text-muted-foreground mb-2">{item.description}</div>
            )}
            
            {/* Breakdown items (Fabric, Manufacturing, etc.) */}
            {nonOptionChildren.length > 0 && (
              <div className="space-y-1.5 mt-3">
                {nonOptionChildren.map((child: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    {/* Color swatch or image */}
                    {child.color && !child.image_url ? (
                      <div 
                        className="w-7 h-7 rounded border flex-shrink-0" 
                        style={{ backgroundColor: child.color }}
                        title={child.color}
                      />
                    ) : child.image_url ? (
                      <QuoteItemImage 
                        src={child.image_url} 
                        alt={child.name} 
                        size={28}
                        className="flex-shrink-0"
                      />
                    ) : null}
                    <div className="flex-1">
                      <span className="font-medium text-foreground">{child.name}</span>
                      {child.description && child.description !== '-' && (
                        <span className="text-muted-foreground ml-2">- {child.description}</span>
                      )}
                      {child.quantity > 0 && child.unit && (
                        <span className="text-muted-foreground ml-2">
                          ({Number(child.quantity).toFixed(2)} {child.unit})
                        </span>
                      )}
                    </div>
                    <div className="text-right text-sm whitespace-nowrap">
                      {child.unit_price > 0 && child.quantity > 0 && (
                        <div className="text-muted-foreground text-xs">
                          {formatCurrency(child.unit_price, currency)}/{child.unit || 'unit'} × {Number(child.quantity).toFixed(2)}
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
            
            {/* Options section */}
            {optionChildren.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-sm font-medium text-foreground mb-2">
                  Options {!showAllOptions && <span className="text-muted-foreground font-normal">(priced only)</span>}:
                </div>
                <ul className="space-y-1">
                  {optionChildren.map((opt: any, idx: number) => (
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
                        <span className="font-medium text-foreground whitespace-nowrap">
                          {opt.total > 0 ? formatCurrency(opt.total, currency) : 'Included'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Total Price + GP% Badge - already includes markup from source */}
          <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
            <div className="text-lg font-semibold text-foreground">{formatCurrency(item.total || 0, currency)}</div>
            {canViewMarkup && item.cost_price && item.total && (
              <LineItemProfitColumn
                costPrice={item.cost_price}
                sellingPrice={item.total}
                variant="badge-only"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular item without children
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 bg-card text-card-foreground">
        <div className="flex items-center gap-2 flex-1">
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm text-foreground">{item.name}</span>
              {item.surface_name && (
                <Badge variant="outline" className="text-xs font-normal">
                  {item.surface_name}
                </Badge>
              )}
            </div>
            {item.description && item.description !== '-' && (
              <div className="text-xs text-muted-foreground">{item.description}</div>
            )}
            {item.quantity && item.unit_price && (
              <div className="text-xs text-muted-foreground">
                Qty: {item.quantity} × {formatCurrency(item.unit_price, currency)} {item.unit && item.unit !== 'each' ? item.unit.replace('per-', 'per ') : 'each'}
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div className="font-medium text-foreground">{formatCurrency(item.total || 0, currency)}</div>
          {item.quantity && item.unit_price && (
            <div className="text-xs text-muted-foreground">
              {formatCurrency(item.unit_price, currency)} {item.unit && item.unit !== 'each' ? item.unit.replace('per-', 'per ') : 'per unit'}
            </div>
          )}
          {canViewMarkup && item.cost_price && item.total && (
            <LineItemProfitColumn
              costPrice={item.cost_price}
              sellingPrice={item.total}
              variant="badge-only"
            />
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