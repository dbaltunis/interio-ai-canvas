import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Star, Plus, Copy, Trash2, Eye, GripVertical, Type, User, Table, Calculator, PenTool, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const MockTemplateRow = ({ name, category, isPrimary, isActive }: { name: string; category: string; isPrimary?: boolean; isActive?: boolean }) => (
  <div className="border rounded-lg p-3 flex items-center gap-3 bg-background">
    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium truncate">{name}</p>
        {isPrimary && (
          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
        )}
      </div>
      <p className="text-xs text-muted-foreground">{category}</p>
    </div>
    <div className={`w-10 h-5 rounded-full ${isActive ? "bg-primary" : "bg-muted"} relative`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow ${
        isActive ? "right-0.5" : "left-0.5"
      }`} />
    </div>
  </div>
);

// Step 1: Document template types
export const DocumentsStep1 = () => (
  <div className="space-y-4">
    <div className="text-center mb-4">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
        <FileText className="h-6 w-6 text-primary" />
      </div>
      <h4 className="font-semibold text-sm">Document Templates</h4>
      <p className="text-xs text-muted-foreground">Customize your business documents</p>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { type: "Quote", count: 3 },
        { type: "Invoice", count: 2 },
        { type: "Estimate", count: 1 },
        { type: "Proposal", count: 2 },
        { type: "Work Order", count: 1 },
        { type: "Receipt", count: 1 },
      ].map((doc, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-3 text-center hover:border-primary/50 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <p className="text-sm font-medium">{doc.type}</p>
          <p className="text-xs text-muted-foreground">{doc.count} templates</p>
        </motion.div>
      ))}
    </div>
  </div>
);

// Step 2: Browse your templates
export const DocumentsStep2 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">Quote Templates</h4>
      <Button size="sm" variant="outline" className="gap-1">
        <Plus className="h-4 w-4" />
        New Template
      </Button>
    </div>
    <div className="space-y-2">
      <MockTemplateRow name="Standard Quote" category="Default" isPrimary isActive />
      <MockTemplateRow name="Detailed Quote" category="Custom" isActive />
      <MockTemplateRow name="Simple Quote" category="Custom" isActive={false} />
    </div>
    <div className="flex items-center gap-2 text-xs text-muted-foreground p-2 bg-muted/50 rounded">
      <Star className="h-3 w-3 text-amber-500" />
      <span>Star indicates primary template used by default</span>
    </div>
  </div>
);

// Step 3: Set primary template
export const DocumentsStep3 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Set Primary Template</h4>
      <p className="text-xs text-muted-foreground">Click star to make it the default</p>
    </div>
    <div className="space-y-2">
      <div className="border rounded-lg p-3 flex items-center gap-3">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Standard Quote</p>
          <p className="text-xs text-muted-foreground">Quote</p>
        </div>
        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
      </div>
      <motion.div
        className="border rounded-lg p-3 flex items-center gap-3"
        animate={{ borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Detailed Quote</p>
          <p className="text-xs text-muted-foreground">Quote</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Star className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-amber-500" />
        </motion.div>
      </motion.div>
    </div>
    <p className="text-xs text-muted-foreground text-center">
      Click empty star to make Detailed Quote primary
    </p>
  </div>
);

// Step 4: Create new template
export const DocumentsStep4 = () => (
  <div className="space-y-4">
    <motion.div
      className="flex items-center justify-center"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        New Template
      </Button>
    </motion.div>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Create Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Template Name</label>
          <div className="border rounded px-3 py-2 text-sm">Premium Quote</div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Document Type</label>
          <div className="border rounded px-3 py-2 text-sm flex justify-between">
            <span>Quote</span>
            <span className="text-muted-foreground">▾</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 gap-1">
            <Copy className="h-3 w-3" />
            Copy Existing
          </Button>
          <Button size="sm" className="flex-1">Start Blank</Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Step 5: Edit template blocks
export const DocumentsStep5 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Block-Based Editor</h4>
      <p className="text-xs text-muted-foreground">Drag and drop to arrange content</p>
    </div>
    <div className="border rounded-lg p-2 space-y-2 bg-muted/30">
      {[
        { icon: Type, label: "Header Block" },
        { icon: User, label: "Client Info" },
        { icon: Table, label: "Line Items" },
      ].map((block, i) => (
        <motion.div
          key={i}
          className="border rounded p-2 flex items-center gap-2 bg-background cursor-grab"
          whileHover={{ scale: 1.01 }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <block.icon className="h-4 w-4 text-primary" />
          <span className="text-sm">{block.label}</span>
        </motion.div>
      ))}
      <motion.div
        className="border-2 border-dashed border-primary/50 rounded p-3 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Plus className="h-4 w-4 mx-auto text-primary mb-1" />
        <p className="text-xs text-primary">Drop block here</p>
      </motion.div>
    </div>
  </div>
);

// Step 6: Available block types
export const DocumentsStep6 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Available Blocks</h4>
    </div>
    <div className="grid grid-cols-2 gap-2">
      {[
        { icon: Type, label: "Header", desc: "Logo & title" },
        { icon: User, label: "Client Info", desc: "Name & address" },
        { icon: Table, label: "Line Items", desc: "Products table" },
        { icon: Calculator, label: "Totals", desc: "Subtotal & tax" },
        { icon: PenTool, label: "Signature", desc: "Sign field" },
        { icon: CreditCard, label: "Payment", desc: "Bank details" },
      ].map((block, i) => (
        <motion.div
          key={i}
          className="border rounded-lg p-3 text-center cursor-pointer hover:border-primary/50"
          whileHover={{ scale: 1.02 }}
        >
          <block.icon className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs font-medium">{block.label}</p>
          <p className="text-[10px] text-muted-foreground">{block.desc}</p>
        </motion.div>
      ))}
    </div>
    <p className="text-xs text-muted-foreground text-center">
      Click any block to add to template
    </p>
  </div>
);

// Step 7: Preview with sample data
export const DocumentsStep7 = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="font-medium text-sm">Live Preview</h4>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Button size="sm" variant="outline" className="gap-1">
          <Eye className="h-4 w-4" />
          Preview
        </Button>
      </motion.div>
    </div>
    <Card className="overflow-hidden">
      <div className="h-48 bg-white p-3 border-b">
        <div className="flex items-start justify-between mb-4">
          <div className="w-16 h-8 bg-primary/20 rounded flex items-center justify-center text-xs">
            Logo
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">QUOTE</p>
            <p className="text-xs text-muted-foreground">#QT-0042</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="font-medium mb-1">To:</p>
            <p>John Smith</p>
            <p className="text-muted-foreground">123 Main St</p>
          </div>
          <div className="text-right">
            <p className="font-medium mb-1">Date:</p>
            <p>Jan 16, 2026</p>
          </div>
        </div>
      </div>
      <CardContent className="pt-3">
        <Badge variant="secondary" className="text-[10px]">Sample data preview</Badge>
      </CardContent>
    </Card>
  </div>
);

// Step 8: Duplicate or delete
export const DocumentsStep8 = () => (
  <div className="space-y-4">
    <div className="text-center mb-2">
      <h4 className="font-semibold text-sm">Template Actions</h4>
    </div>
    <div className="border rounded-lg p-3 flex items-center gap-3">
      <FileText className="h-5 w-5 text-primary" />
      <div className="flex-1">
        <p className="text-sm font-medium">Standard Quote</p>
        <p className="text-xs text-muted-foreground">Primary template</p>
      </div>
      <Button size="sm" variant="ghost" className="h-8 px-2">
        •••
      </Button>
    </div>
    <motion.div
      className="border rounded-lg overflow-hidden shadow-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-1 bg-background">
        <motion.div
          className="px-3 py-2 hover:bg-muted rounded cursor-pointer flex items-center gap-2"
          whileHover={{ backgroundColor: "hsl(var(--muted))" }}
        >
          <Copy className="h-4 w-4" />
          <span className="text-sm">Duplicate</span>
        </motion.div>
        <div className="px-3 py-2 hover:bg-destructive/10 rounded cursor-pointer flex items-center gap-2 text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="text-sm">Delete</span>
        </div>
      </div>
    </motion.div>
    <p className="text-xs text-muted-foreground text-center">
      Primary templates cannot be deleted
    </p>
  </div>
);
