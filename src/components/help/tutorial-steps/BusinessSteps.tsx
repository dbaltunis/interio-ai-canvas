import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Upload, MapPin, Phone, Mail, Receipt, 
  CreditCard, FileText, Save, Globe, Landmark, Calendar, 
  AlertCircle, Shield, Info, Edit3, Check 
} from "lucide-react";
import {
  AnimatedFormSection,
  AnimatedMockInput,
  AnimatedMockButton,
  AnimatedMockToggle,
  AnimatedMockSelect,
  AnimatedSuccessToast,
  AnimatedMockCard,
  AnimatedLogoUpload,
  AnimatedPreviewBox,
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// BUSINESS SETTINGS TUTORIAL - 16 INTERACTIVE STEPS
// Multi-phase animations for engaging experience
// ===========================================

// Step 1: Enter Company Details
export const BusinessStep1 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Company Information" icon={Building2} phase={phase} revealPhase={0.1}>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Trading Name" 
            value="Elegant Interiors" 
            icon={Building2}
            phase={phase}
            startPhase={0.15}
            endPhase={0.4}
          />
          <AnimatedMockInput 
            label="Legal Name" 
            value="Elegant Interiors Pty Ltd" 
            phase={phase}
            startPhase={0.4}
            endPhase={0.7}
          />
          <motion.p 
            className="text-[10px] text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase > 0.7 ? 1 : 0 }}
          >
            Legal name appears on invoices and contracts
          </motion.p>
        </div>
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Company details saved!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 2: Select Organization Type
export const BusinessStep2 = ({ phase = 0 }: StepProps) => {
  const showInfo = phase > 0.7;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Company Information" icon={Building2} phase={phase} revealPhase={0.1}>
        <AnimatedMockSelect
          label="Organization Type"
          value="Pty Ltd (Private Company)"
          options={["Sole Trader", "Partnership", "Pty Ltd (Private Company)", "Corporation", "Non-Profit"]}
          phase={phase}
          openPhase={0.25}
          selectPhase={0.55}
        />
        <AnimatePresence>
          {showInfo && (
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-muted-foreground mt-2"
            >
              Affects tax and registration requirements
            </motion.p>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 3: Upload Company Logo
export const BusinessStep3 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Company Information" icon={Building2} phase={phase} revealPhase={0.1}>
        <AnimatedLogoUpload 
          phase={phase} 
          highlightPhase={0.25} 
          uploadPhase={0.55} 
        />
        <motion.p 
          className="text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.8 ? 1 : 0 }}
        >
          Recommended: 500×200px PNG with transparent background
        </motion.p>
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Logo uploaded successfully!" phase={phase} showPhase={0.85} />
    </div>
  );
};

// Step 4: Select Country First
export const BusinessStep4 = ({ phase = 0 }: StepProps) => {
  const showTip = phase > 0.7;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Registration Numbers" icon={Receipt} phase={phase} revealPhase={0.1}>
        <AnimatedMockSelect
          label="Country"
          value="🇦🇺 Australia"
          options={["🇦🇺 Australia", "🇺🇸 United States", "🇬🇧 United Kingdom", "🇮🇳 India", "🇳🇿 New Zealand"]}
          phase={phase}
          openPhase={0.25}
          selectPhase={0.55}
        />
        <AnimatePresence>
          {showTip && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs"
            >
              <p className="text-blue-600 dark:text-blue-400">
                💡 Registration labels change based on country selection
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 5: Enter Registration Numbers
export const BusinessStep5 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Registration Numbers" icon={Receipt} phase={phase} revealPhase={0.1}>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="ABN (Australian Business Number)" 
            value="12 345 678 901" 
            phase={phase}
            startPhase={0.2}
            endPhase={0.5}
            tooltip="Required for valid tax invoices"
          />
          <AnimatedMockInput 
            label="ACN (Australian Company Number)" 
            value="123 456 789" 
            phase={phase}
            startPhase={0.5}
            endPhase={0.75}
          />
          <motion.p 
            className="text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase > 0.8 ? 1 : 0 }}
          >
            Labels shown are for Australia. Other countries show different fields (VAT, EIN, GST, etc.)
          </motion.p>
        </div>
      </AnimatedFormSection>
    </div>
  );
};

// Step 6: Tax Identification
export const BusinessStep6 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Registration Numbers" icon={Receipt} phase={phase} revealPhase={0.1}>
        <AnimatedMockInput 
          label="Tax Number" 
          value="GST123456789" 
          phase={phase}
          startPhase={0.2}
          endPhase={0.6}
          tooltip="Your tax registration number"
        />
        <motion.p 
          className="text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.7 ? 1 : 0 }}
        >
          Required for valid tax invoices in most jurisdictions
        </motion.p>
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Tax details saved!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 7: Contact Details
export const BusinessStep7 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Contact Details" icon={Phone} phase={phase} revealPhase={0.1}>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Business Email" 
            value="info@elegantinteriors.com.au" 
            icon={Mail}
            phase={phase}
            startPhase={0.15}
            endPhase={0.4}
          />
          <AnimatedMockInput 
            label="Business Phone" 
            value="+61 2 9876 5432" 
            icon={Phone}
            phase={phase}
            startPhase={0.4}
            endPhase={0.65}
          />
          <AnimatedMockInput 
            label="Website" 
            value="www.elegantinteriors.com.au" 
            icon={Globe}
            phase={phase}
            startPhase={0.65}
            endPhase={0.9}
          />
        </div>
      </AnimatedFormSection>
    </div>
  );
};

// Step 8: Business Address
export const BusinessStep8 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Business Address" icon={MapPin} phase={phase} revealPhase={0.1}>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Street Address" 
            value="123 Design Street" 
            icon={MapPin}
            phase={phase}
            startPhase={0.15}
            endPhase={0.35}
          />
          <div className="grid grid-cols-2 gap-2">
            <AnimatedMockInput 
              label="City" 
              value="Sydney" 
              phase={phase}
              startPhase={0.35}
              endPhase={0.5}
            />
            <AnimatedMockInput 
              label="State" 
              value="NSW" 
              phase={phase}
              startPhase={0.5}
              endPhase={0.65}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <AnimatedMockInput 
              label="Post Code" 
              value="2000" 
              phase={phase}
              startPhase={0.65}
              endPhase={0.8}
            />
            <AnimatedMockInput 
              label="Country" 
              value="Australia" 
              phase={phase}
              startPhase={0}
              endPhase={0}
              disabled
            />
          </div>
        </div>
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Address saved!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 9: Payment Terms
export const BusinessStep9 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Financial Settings" icon={Calendar} phase={phase} revealPhase={0.1}>
        <AnimatedMockSelect
          label="Default Payment Terms"
          value="14 days"
          options={["7 days", "14 days", "21 days", "30 days", "45 days", "60 days"]}
          phase={phase}
          openPhase={0.25}
          selectPhase={0.6}
        />
        <motion.p 
          className="text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.7 ? 1 : 0 }}
        >
          Applied to new quotes and invoices by default
        </motion.p>
      </AnimatedFormSection>
    </div>
  );
};

// Step 10: Financial Year End
export const BusinessStep10 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Financial Settings" icon={Calendar} phase={phase} revealPhase={0.1}>
        <div className="grid grid-cols-2 gap-3">
          <AnimatedMockSelect
            label="Month"
            value="June"
            options={["June", "December", "March"]}
            phase={phase}
            openPhase={0.2}
            selectPhase={0.45}
          />
          <AnimatedMockSelect
            label="Day"
            value="30"
            options={["30", "31", "28"]}
            phase={phase}
            openPhase={0.5}
            selectPhase={0.75}
          />
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.8 ? 1 : 0 }}
        >
          For reporting and tax calculations
        </motion.p>
      </AnimatedFormSection>
    </div>
  );
};

// Step 11: Bank Details Header
export const BusinessStep11 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Payment Details" icon={Landmark} phase={phase} revealPhase={0.1}>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Bank Name" 
            value="Commonwealth Bank" 
            icon={Landmark}
            phase={phase}
            startPhase={0.2}
            endPhase={0.5}
          />
          <AnimatedMockInput 
            label="Account Name" 
            value="Elegant Interiors Pty Ltd" 
            phase={phase}
            startPhase={0.5}
            endPhase={0.8}
          />
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.85 ? 1 : 0 }}
        >
          Displayed on invoices for client payments
        </motion.p>
      </AnimatedFormSection>
    </div>
  );
};

// Step 12: Country-Specific Banking
export const BusinessStep12 = ({ phase = 0 }: StepProps) => {
  const showAustralia = phase > 0.3;
  const showOthers = phase > 0.7;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Payment Details" icon={Landmark} phase={phase} revealPhase={0.1}>
        <motion.div 
          className="p-2 bg-muted/50 rounded mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.15 ? 1 : 0 }}
        >
          <p className="text-[10px] text-muted-foreground font-medium">Fields shown based on country:</p>
        </motion.div>
        <div className="space-y-2">
          <AnimatePresence>
            {showAustralia && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-2 border border-primary rounded bg-primary/5"
              >
                <p className="text-xs font-medium mb-2">🇦🇺 Australia:</p>
                <div className="grid grid-cols-2 gap-2">
                  <AnimatedMockInput 
                    label="BSB" 
                    value="062-000" 
                    phase={phase}
                    startPhase={0.35}
                    endPhase={0.5}
                  />
                  <AnimatedMockInput 
                    label="Account Number" 
                    value="1234 5678" 
                    phase={phase}
                    startPhase={0.5}
                    endPhase={0.65}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {showOthers && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                className="p-2 border border-border rounded"
              >
                <p className="text-xs font-medium mb-1">🇬🇧 UK: Sort Code + Account</p>
                <p className="text-xs font-medium">🇪🇺 EU: IBAN + SWIFT/BIC</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatedFormSection>
    </div>
  );
};

// Step 13: Invoice Settings - Reference Prefix
export const BusinessStep13 = ({ phase = 0 }: StepProps) => {
  const showPreview = phase > 0.6;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Invoice Settings" icon={FileText} phase={phase} revealPhase={0.1}>
        <AnimatedMockInput 
          label="Payment Reference Prefix" 
          value="INV" 
          phase={phase}
          startPhase={0.2}
          endPhase={0.5}
        />
        <AnimatePresence>
          {showPreview && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-muted rounded text-xs"
            >
              <span className="text-muted-foreground">Preview: </span>
              <motion.span 
                className="font-medium"
                animate={{ opacity: [0.5, 1] }}
                transition={{ duration: 0.5 }}
              >
                INV-2026-0001
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 14: Late Payment Policies
export const BusinessStep14 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Invoice Settings" icon={FileText} phase={phase} revealPhase={0.1}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <AnimatedMockInput 
              label="Interest Rate (%)" 
              value="2.0" 
              phase={phase}
              startPhase={0.15}
              endPhase={0.35}
            />
            <AnimatedMockInput 
              label="Late Fee ($)" 
              value="25.00" 
              phase={phase}
              startPhase={0.35}
              endPhase={0.55}
            />
          </div>
          <motion.div 
            className="space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase > 0.55 ? 1 : 0 }}
          >
            <label className="text-xs text-muted-foreground">Late Payment Terms</label>
            <motion.div 
              className="bg-background border rounded px-2 py-2 text-xs"
              animate={phase > 0.6 && phase < 0.85 ? { 
                borderColor: "hsl(var(--primary))",
                boxShadow: "0 0 0 2px hsl(var(--primary) / 0.2)"
              } : {}}
            >
              <p className="text-foreground">Payment due within terms. 2% monthly interest applies to overdue amounts.</p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedFormSection>
    </div>
  );
};

// Step 15: Advanced Settings (Admin Only)
export const BusinessStep15 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Advanced Settings" icon={Shield} phase={phase} revealPhase={0.1}>
        <motion.div 
          className="flex items-center gap-2 mb-2 text-xs text-amber-600 dark:text-amber-400"
          animate={phase > 0.2 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Shield className="h-3 w-3" />
          <span className="font-medium">Admin Only</span>
        </motion.div>
        <AnimatedMockToggle
          label="Allow in-app template editing"
          description="Let users modify document templates within the app"
          checked={false}
          phase={phase}
          flipPhase={0.5}
        />
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Advanced settings updated!" phase={phase} showPhase={0.85} />
    </div>
  );
};

// Step 16: Save Pattern
export const BusinessStep16 = ({ phase = 0 }: StepProps) => {
  const showFlow = phase > 0.3;
  const showSuccess = phase > 0.8;

  return (
    <div className="space-y-3">
      <AnimatedMockCard phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-3">
          <motion.div
            animate={phase > 0.15 ? { rotate: [0, 360] } : {}}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium">Section-Based Saving</span>
        </div>
        <motion.p 
          className="text-xs text-muted-foreground mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.2 ? 1 : 0 }}
        >
          Each section saves independently. Click Edit to modify, then Save or Cancel.
        </motion.p>
        <AnimatePresence>
          {showFlow && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 flex-wrap"
            >
              <AnimatedMockButton 
                phase={phase} 
                variant="outline" 
                size="sm"
                icon={Edit3}
              >
                Edit
              </AnimatedMockButton>
              <motion.span 
                className="text-xs text-muted-foreground"
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: 3, duration: 0.5 }}
              >
                →
              </motion.span>
              <AnimatedMockButton 
                phase={phase} 
                size="sm"
                clickPhase={0.7}
                highlight={phase > 0.5 && phase < 0.8}
                icon={Save}
              >
                Save
              </AnimatedMockButton>
              <AnimatedMockButton 
                phase={phase} 
                variant="outline" 
                size="sm"
              >
                Cancel
              </AnimatedMockButton>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedMockCard>
      <AnimatedSuccessToast message="Settings saved successfully" phase={phase} showPhase={0.85} />
    </div>
  );
};
