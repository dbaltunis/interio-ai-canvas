import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, MapPin, Calendar, Hash, User, Save, Pencil, RotateCcw, CheckCircle, ExternalLink } from "lucide-react";

interface CompactHeaderProps {
  title: string;
  orderNumber?: string;
  clientName?: string;
  clientPhone?: string;
  siteAddress?: string;
  scheduledDate: string;
  assignedPerson?: string;
  personLabel: string; // "Fitter" or "Installer"
  dateLabel: string; // "Fitting Date" or "Installation Date"
  editing: boolean;
  onEditingChange: (editing: boolean) => void;
  onDateChange: (date: string) => void;
  onPersonChange: (person: string) => void;
  onAddressChange: (address: string) => void;
  hasOverrides: boolean;
  onReset: () => void;
  onSave: () => void;
  isSaving: boolean;
  canSave: boolean;
  lastSaved?: Date | null;
  isPrintMode?: boolean;
  isReadOnly?: boolean;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  title,
  orderNumber,
  clientName,
  clientPhone,
  siteAddress,
  scheduledDate,
  assignedPerson,
  personLabel,
  dateLabel,
  editing,
  onEditingChange,
  onDateChange,
  onPersonChange,
  onAddressChange,
  hasOverrides,
  onReset,
  onSave,
  isSaving,
  canSave,
  lastSaved,
  isPrintMode = false,
  isReadOnly = false
}) => {
  const googleMapsUrl = siteAddress 
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteAddress)}`
    : null;

  return (
    <Card>
      <CardContent className="p-4">
        {/* Title Row with Actions */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">{title}</h1>
          {!isPrintMode && (
            <div className="flex items-center gap-2 no-print">
              {lastSaved && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {lastSaved.toLocaleTimeString()}
                </div>
              )}
              {hasOverrides && (
                <Button variant="ghost" size="sm" onClick={onReset} className="h-7">
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={onSave}
                disabled={isSaving || !canSave || isReadOnly}
                className="h-7"
              >
                <Save className="h-3 w-3 mr-1" />
                {isSaving ? "..." : "Save"}
              </Button>
              <Button
                variant={editing ? "default" : "outline"}
                size="sm"
                onClick={() => onEditingChange(!editing)}
                className="h-7"
                disabled={isReadOnly}
              >
                <Pencil className="h-3 w-3 mr-1" />
                {editing ? "Done" : "Edit"}
              </Button>
            </div>
          )}
        </div>

        {/* Compact Info Grid */}
        <div className="space-y-3">
          {/* Row 1: Order, Client, Date */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{orderNumber || "—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{clientName || "—"}</span>
              {clientPhone && (
                <a 
                  href={`tel:${clientPhone}`} 
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  {clientPhone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {editing && !isReadOnly ? (
                <Input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="h-7 w-36"
                />
              ) : (
                <span>{scheduledDate || dateLabel + ": —"}</span>
              )}
            </div>
          </div>

          {/* Row 2: Address */}
          <div className="flex items-start gap-1.5 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            {editing && !isReadOnly ? (
              <Input
                value={siteAddress || ""}
                onChange={(e) => onAddressChange(e.target.value)}
                placeholder="Site address"
                className="h-7 flex-1"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span>{siteAddress || "No address"}</span>
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-0.5 text-xs"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Map
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Row 3: Assigned Person */}
          <div className="flex items-center gap-1.5 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{personLabel}:</span>
            {editing && !isReadOnly ? (
              <Input
                value={assignedPerson || ""}
                onChange={(e) => onPersonChange(e.target.value)}
                placeholder={`${personLabel} name`}
                className="h-7 w-40"
              />
            ) : (
              <span className="font-medium">{assignedPerson || "—"}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
