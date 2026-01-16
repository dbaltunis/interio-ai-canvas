import React from "react";
import { User, Mail, Phone, Globe, Bell, Lock, Save, Camera, Eye, EyeOff, Calendar, Clock, Languages } from "lucide-react";

const MockCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${className}`}>{children}</div>
);

const MockInput = ({ label, value, placeholder, icon: Icon, highlight = false, disabled = false }: { label: string; value?: string; placeholder?: string; icon?: React.ElementType; highlight?: boolean; disabled?: boolean }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className={`flex items-center gap-2 bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse border-primary" : "border-border"} ${disabled ? "opacity-60" : ""}`}>
      {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
      <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder}</span>
    </div>
  </div>
);

const MockButton = ({ children, highlight = false, variant = "primary", size = "default" }: { children: React.ReactNode; highlight?: boolean; variant?: "primary" | "secondary" | "outline"; size?: "default" | "sm" }) => (
  <div className={`inline-flex items-center gap-1.5 rounded text-xs font-medium ${
    size === "sm" ? "px-2 py-1" : "px-3 py-1.5"
  } ${
    variant === "primary" ? "bg-primary text-primary-foreground" : 
    variant === "outline" ? "border border-border bg-background text-foreground" :
    "bg-secondary text-secondary-foreground"
  } ${highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse" : ""}`}>
    {children}
  </div>
);

const MockToggle = ({ label, description, checked = false, highlight = false }: { label: string; description?: string; checked?: boolean; highlight?: boolean }) => (
  <div className={`flex items-center justify-between py-2 ${highlight ? "bg-primary/10 rounded px-2 animate-pulse" : ""}`}>
    <div>
      <span className="text-xs font-medium">{label}</span>
      {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
    </div>
    <div className={`w-8 h-4 rounded-full ${checked ? "bg-primary" : "bg-muted"} relative`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? "right-0.5" : "left-0.5"}`} />
    </div>
  </div>
);

const MockAvatar = ({ highlight = false }: { highlight?: boolean }) => (
  <div className={`relative ${highlight ? "animate-pulse" : ""}`}>
    <div className={`w-16 h-16 rounded-full bg-muted flex items-center justify-center ${highlight ? "ring-2 ring-primary" : ""}`}>
      <User className="h-8 w-8 text-muted-foreground" />
    </div>
    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center ${highlight ? "ring-2 ring-primary ring-offset-2" : ""}`}>
      <Camera className="h-3 w-3 text-primary-foreground" />
    </div>
  </div>
);

const MockSelect = ({ label, value, options, highlight = false }: { label: string; value: string; options: string[]; highlight?: boolean }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className={`bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse border-primary" : "border-border"}`}>
      {value}
    </div>
    {highlight && (
      <div className="border border-border rounded mt-1 bg-popover text-xs max-h-24 overflow-hidden">
        {options.slice(0, 4).map((opt) => (
          <div key={opt} className={`px-2 py-1 ${opt === value ? "bg-accent" : "hover:bg-accent"}`}>{opt}</div>
        ))}
      </div>
    )}
  </div>
);

const MockFormSection = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <MockCard>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm font-medium">{title}</span>
    </div>
    {children}
  </MockCard>
);

// Step 1: Upload Profile Picture
export const PersonalStep1 = () => (
  <div className="space-y-3">
    <MockFormSection title="Profile Information" icon={User}>
      <div className="flex items-center gap-4">
        <MockAvatar highlight />
        <div className="space-y-2">
          <MockButton highlight>
            <Camera className="h-3 w-3" />
            Upload Photo
          </MockButton>
          <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
        </div>
      </div>
    </MockFormSection>
    <p className="text-xs text-muted-foreground">Your profile picture appears on documents and team views</p>
  </div>
);

// Step 2: Enter Profile Details
export const PersonalStep2 = () => (
  <div className="space-y-3">
    <MockFormSection title="Profile Information" icon={User}>
      <div className="grid grid-cols-2 gap-3">
        <MockInput label="First Name" value="John" icon={User} highlight />
        <MockInput label="Last Name" value="Smith" highlight />
      </div>
      <div className="mt-3">
        <MockInput label="Display Name" value="John Smith" highlight />
        <p className="text-[10px] text-muted-foreground mt-1">Shown on documents and communications</p>
      </div>
      <div className="mt-3">
        <MockInput label="Phone Number" value="+61 400 123 456" icon={Phone} highlight />
      </div>
    </MockFormSection>
  </div>
);

// Step 3: Change Email Address
export const PersonalStep3 = () => (
  <div className="space-y-3">
    <MockFormSection title="Profile Information" icon={User}>
      <div className="space-y-3">
        <MockInput label="Current Email" value="john@company.com" icon={Mail} disabled />
        <div className="flex items-center gap-2">
          <MockButton highlight variant="outline">
            Change Email
          </MockButton>
        </div>
      </div>
      <div className="mt-3 p-2 bg-muted/50 rounded border border-dashed border-muted-foreground/30">
        <p className="text-[10px] text-muted-foreground">A verification email will be sent to confirm the new address</p>
      </div>
    </MockFormSection>
  </div>
);

// Step 4: Configure Notifications
export const PersonalStep4 = () => (
  <div className="space-y-3">
    <MockFormSection title="Notification Preferences" icon={Bell}>
      <div className="space-y-2">
        <MockToggle label="Email notifications" description="Receive updates via email" checked highlight />
        <MockToggle label="SMS notifications" description="Get text alerts" checked={false} highlight />
      </div>
      <div className="flex gap-2 mt-3">
        <MockButton variant="outline" size="sm" highlight>Test Email</MockButton>
        <MockButton variant="outline" size="sm">Test SMS</MockButton>
      </div>
    </MockFormSection>
    <p className="text-xs text-muted-foreground">Use the test buttons to verify your notification settings</p>
  </div>
);

// Step 5: Update Password
export const PersonalStep5 = () => (
  <div className="space-y-3">
    <MockFormSection title="Password & Security" icon={Lock}>
      <div className="space-y-2">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Current Password</label>
          <div className="flex items-center gap-2 bg-background border border-border rounded px-2 py-1.5 text-xs">
            <span className="text-muted-foreground">••••••••</span>
            <Eye className="h-3 w-3 text-muted-foreground ml-auto" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">New Password</label>
          <div className="flex items-center gap-2 bg-background border border-primary rounded px-2 py-1.5 text-xs ring-2 ring-primary animate-pulse">
            <span className="text-muted-foreground">••••••••</span>
            <EyeOff className="h-3 w-3 text-muted-foreground ml-auto" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Confirm Password</label>
          <div className="flex items-center gap-2 bg-background border border-primary rounded px-2 py-1.5 text-xs ring-2 ring-primary animate-pulse">
            <span className="text-muted-foreground">••••••••</span>
            <EyeOff className="h-3 w-3 text-muted-foreground ml-auto" />
          </div>
        </div>
      </div>
    </MockFormSection>
  </div>
);

// Step 6: Password Requirements
export const PersonalStep6 = () => (
  <div className="space-y-3">
    <MockFormSection title="Password & Security" icon={Lock}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-primary rounded" />
          <div className="flex-1 h-1.5 bg-primary rounded" />
          <div className="flex-1 h-1.5 bg-primary rounded" />
          <div className="flex-1 h-1.5 bg-muted rounded" />
          <span className="text-xs text-green-500 font-medium">Strong</span>
        </div>
        <div className="p-2 bg-muted/50 rounded text-xs space-y-1">
          <p className="font-medium">Password requirements:</p>
          <p className="text-muted-foreground">• Minimum 6 characters</p>
          <p className="text-muted-foreground">• Mix of letters and numbers recommended</p>
        </div>
      </div>
    </MockFormSection>
  </div>
);

// Step 7: Select Date Format
export const PersonalStep7 = () => (
  <div className="space-y-3">
    <MockFormSection title="Language & Localization" icon={Globe}>
      <div className="flex items-center gap-2 mb-2">
        <Calendar className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-medium">Date Format</span>
      </div>
      <MockSelect
        label=""
        value="DD/MM/YYYY"
        options={["MM/DD/YYYY (US)", "DD/MM/YYYY (UK/AU)", "YYYY-MM-DD (ISO)", "DD-MMM-YYYY"]}
        highlight
      />
      <div className="mt-2 p-2 bg-muted rounded text-xs">
        <span className="text-muted-foreground">Preview: </span>
        <span className="font-medium">16/01/2026</span>
      </div>
    </MockFormSection>
  </div>
);

// Step 8: Set Timezone
export const PersonalStep8 = () => (
  <div className="space-y-3">
    <MockFormSection title="Language & Localization" icon={Globe}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-medium">Timezone</span>
      </div>
      <MockSelect
        label=""
        value="Australia/Sydney (GMT+11)"
        options={["Australia/Sydney (GMT+11)", "Asia/Kolkata (GMT+5:30)", "America/New_York (GMT-5)", "Europe/London (GMT+0)"]}
        highlight
      />
      <p className="text-xs text-muted-foreground mt-2">Affects appointment times and scheduled notifications</p>
    </MockFormSection>
  </div>
);

// Step 9: Language Settings
export const PersonalStep9 = () => (
  <div className="space-y-3">
    <MockFormSection title="Language & Localization" icon={Globe}>
      <div className="flex items-center gap-2 mb-2">
        <Languages className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-medium">Language</span>
      </div>
      <div className="bg-background border border-border rounded px-2 py-1.5 text-xs opacity-60">
        English (Default)
      </div>
      <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
        <p className="text-blue-600 dark:text-blue-400">Additional languages coming soon. Contact support for custom language requirements.</p>
      </div>
    </MockFormSection>
  </div>
);

// Step 10: Save and Preview
export const PersonalStep10 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium">Settings Preview</p>
          <p className="text-xs text-muted-foreground">Review before saving</p>
        </div>
      </div>
      <div className="bg-muted rounded p-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date Format:</span>
          <span className="font-medium">16/01/2026</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Time:</span>
          <span className="font-medium">2:30 PM AEST</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Timezone:</span>
          <span className="font-medium">Australia/Sydney</span>
        </div>
      </div>
    </MockCard>
    <div className="flex justify-end gap-2">
      <MockButton variant="outline">Cancel</MockButton>
      <MockButton highlight>
        <Save className="h-3 w-3" />
        Save Profile
      </MockButton>
    </div>
  </div>
);
