import React from "react";
import { User, Mail, Phone, Globe, Bell, Lock, Save, Camera } from "lucide-react";

const MockCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-card border border-border rounded-lg p-3 ${className}`}>{children}</div>
);

const MockInput = ({ label, value, placeholder, icon: Icon, highlight = false }: { label: string; value?: string; placeholder?: string; icon?: React.ElementType; highlight?: boolean }) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <div className={`flex items-center gap-2 bg-background border rounded px-2 py-1.5 text-xs ${highlight ? "ring-2 ring-primary animate-pulse" : "border-border"}`}>
      {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
      <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder}</span>
    </div>
  </div>
);

const MockButton = ({ children, highlight = false, variant = "primary" }: { children: React.ReactNode; highlight?: boolean; variant?: "primary" | "secondary" }) => (
  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium ${
    variant === "primary" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
  } ${highlight ? "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse" : ""}`}>
    {children}
  </div>
);

const MockToggle = ({ label, checked = false, highlight = false }: { label: string; checked?: boolean; highlight?: boolean }) => (
  <div className={`flex items-center justify-between py-1 ${highlight ? "bg-primary/10 rounded px-2 animate-pulse" : ""}`}>
    <span className="text-xs">{label}</span>
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

export const PersonalStep1 = () => (
  <div className="space-y-3">
    <div className="flex items-center gap-4">
      <MockAvatar highlight />
      <div className="space-y-1">
        <MockButton highlight>
          <Camera className="h-3 w-3" />
          Upload Photo
        </MockButton>
        <p className="text-xs text-muted-foreground">JPG, PNG up to 2MB</p>
      </div>
    </div>
    <MockCard>
      <p className="text-xs text-muted-foreground">Your profile picture appears on documents and team views</p>
    </MockCard>
  </div>
);

export const PersonalStep2 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="space-y-3">
        <MockInput label="Full Name" value="John Smith" icon={User} highlight />
        <MockInput label="Email Address" value="john@company.com" icon={Mail} highlight />
        <MockInput label="Phone Number" value="+61 400 123 456" icon={Phone} highlight />
      </div>
    </MockCard>
    <p className="text-xs text-muted-foreground">These details appear on quotes and communications</p>
  </div>
);

export const PersonalStep3 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground flex items-center gap-1">
          <Globe className="h-3 w-3" /> Timezone
        </label>
        <div className="bg-background border border-primary rounded px-2 py-1.5 text-xs animate-pulse ring-2 ring-primary">
          <span>Asia/Kolkata (GMT+5:30)</span>
        </div>
        <div className="border border-border rounded mt-1 bg-popover text-xs">
          <div className="px-2 py-1 hover:bg-accent">Australia/Sydney (GMT+11)</div>
          <div className="px-2 py-1 bg-accent">Asia/Kolkata (GMT+5:30)</div>
          <div className="px-2 py-1 hover:bg-accent">America/New_York (GMT-5)</div>
        </div>
      </div>
    </MockCard>
    <p className="text-xs text-muted-foreground">Affects appointment times and date displays</p>
  </div>
);

export const PersonalStep4 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Bell className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Notification Preferences</span>
      </div>
      <div className="space-y-2">
        <MockToggle label="Email notifications" checked highlight />
        <MockToggle label="SMS alerts" checked={false} highlight />
        <MockToggle label="Push notifications" checked highlight />
        <MockToggle label="Quote reminders" checked />
      </div>
    </MockCard>
  </div>
);

export const PersonalStep5 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center gap-2 mb-3">
        <Lock className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Change Password</span>
      </div>
      <div className="space-y-2">
        <MockInput label="Current Password" placeholder="••••••••" />
        <MockInput label="New Password" placeholder="••••••••" highlight />
        <MockInput label="Confirm Password" placeholder="••••••••" highlight />
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-1 bg-primary rounded" />
          <div className="flex-1 h-1 bg-primary rounded" />
          <div className="flex-1 h-1 bg-primary rounded" />
          <div className="flex-1 h-1 bg-muted rounded" />
          <span className="text-xs text-green-500">Strong</span>
        </div>
      </div>
    </MockCard>
    <p className="text-xs text-muted-foreground">Optional - only if you want to change your password</p>
  </div>
);

export const PersonalStep6 = () => (
  <div className="space-y-3">
    <MockCard>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Profile updated</p>
          <p className="text-xs text-muted-foreground">Your changes have been saved</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
          <Save className="h-4 w-4 text-green-500" />
        </div>
      </div>
    </MockCard>
    <div className="flex justify-end">
      <MockButton highlight>
        <Save className="h-3 w-3" />
        Save Profile
      </MockButton>
    </div>
  </div>
);
