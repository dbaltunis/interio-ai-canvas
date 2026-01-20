/**
 * WelcomeVideoSteps - 24-step story-driven platform overview
 * Covers: Setup, Theme, Markups, Team, Shopify, Projects, CRM, Campaigns
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Sun, Moon, Palette, User, Building2, Upload, Check, 
  Percent, DollarSign, Tag, Calculator, Users, Mail, UserPlus, Shield,
  MessageSquare, Store, Package, RefreshCw, QrCode, FolderOpen, Home,
  Bed, Layers, Ruler, FileText, Receipt, Send, Star, Phone, Calendar,
  Megaphone, Clock, BarChart3, Zap, ArrowRight, CheckCircle, Globe,
  ChefHat, Plus, Search, Filter, Eye, MousePointer, Settings, Blinds
} from "lucide-react";
import { inPhase, typingProgress, phaseProgress } from "@/lib/demoAnimations";

interface StepProps {
  phase?: number;
}

// Local typing progress helper
const localTypingProgress = (phase: number, startPhase: number, endPhase: number, text: string): string => {
  if (phase < startPhase) return "";
  if (phase >= endPhase) return text;
  const progress = (phase - startPhase) / (endPhase - startPhase);
  const charCount = Math.floor(progress * text.length);
  return text.slice(0, charCount);
};

// ===========================================
// CHAPTER 1: WELCOME & SETUP (Steps 1-4)
// ===========================================

// Step 1: Welcome Screen
export const WelcomeStep1 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: inPhase(phase, 0, 0.3) ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center mb-6 shadow-lg"
      >
        <Sparkles className="h-10 w-10 text-primary-foreground" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inPhase(phase, 0.2, 0.5) ? 1 : 0, y: inPhase(phase, 0.2, 0.5) ? 0 : 20 }}
        className="text-2xl font-bold mb-3"
      >
        Welcome to InterioApp
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inPhase(phase, 0.3, 0.6) ? 1 : 0, y: inPhase(phase, 0.3, 0.6) ? 0 : 20 }}
        className="text-muted-foreground max-w-md leading-relaxed"
      >
        Your complete online selling and quoting platform for made-to-measure blinds, curtains, and window treatments
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: inPhase(phase, 0.5, 1) ? 1 : 0 }}
        className="mt-8 grid grid-cols-3 gap-4"
      >
        {[
          { icon: FolderOpen, label: "Projects" },
          { icon: Users, label: "Clients" },
          { icon: Receipt, label: "Quotes" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: inPhase(phase, 0.5 + i * 0.1, 1) ? 1 : 0, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border"
          >
            <item.icon className="h-6 w-6 text-primary" />
            <span className="text-xs font-medium">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

// Step 2: Theme Selection (Dark/Light Mode)
export const WelcomeStep2 = ({ phase = 0 }: StepProps) => {
  const isDark = inPhase(phase, 0.4, 0.7);
  
  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Palette className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Appearance Settings</h4>
          <p className="text-xs text-muted-foreground">Customize your workspace</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Theme Toggle */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground">Theme Mode</label>
          <div className="flex gap-3">
            {[
              { icon: Sun, label: "Light", active: !isDark },
              { icon: Moon, label: "Dark", active: isDark },
            ].map((mode) => (
              <motion.div
                key={mode.label}
                animate={{ 
                  scale: mode.active ? 1.05 : 1,
                  borderColor: mode.active ? "hsl(var(--primary))" : "hsl(var(--border))"
                }}
                className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  mode.active ? "bg-primary/10" : "bg-card"
                }`}
              >
                <mode.icon className={`h-8 w-8 mx-auto mb-2 ${mode.active ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium text-center">{mode.label}</p>
                {mode.active && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 flex justify-center">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <motion.div
          animate={{ 
            backgroundColor: isDark ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)",
            color: isDark ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)"
          }}
          className="p-4 rounded-xl border border-border"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 rounded-lg ${isDark ? "bg-blue-600" : "bg-blue-500"} flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">IA</span>
            </div>
            <div>
              <p className="text-sm font-semibold">InterioApp Preview</p>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {isDark ? "Dark mode enabled" : "Light mode enabled"}
              </p>
            </div>
          </div>
          <div className={`h-12 rounded-lg ${isDark ? "bg-slate-800" : "bg-slate-100"}`} />
        </motion.div>
      </div>
    </div>
  );
};

// Step 3: Profile Setup
export const WelcomeStep3 = ({ phase = 0 }: StepProps) => {
  const name = localTypingProgress(phase, 0.2, 0.4, "Designer Interiors");
  const email = localTypingProgress(phase, 0.4, 0.6, "hello@designerinteriors.com");
  const phone = localTypingProgress(phase, 0.6, 0.8, "+1 555 123 4567");

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Business Profile</h4>
          <p className="text-xs text-muted-foreground">Set up your company details</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {/* Logo Upload */}
        <div className="flex items-center gap-4">
          <motion.div
            animate={{ scale: inPhase(phase, 0, 0.2) ? [1, 1.05, 1] : 1 }}
            className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center"
          >
            {inPhase(phase, 0.1, 1) ? (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl font-bold text-primary">DI</motion.span>
            ) : (
              <Upload className="h-6 w-6 text-primary/50" />
            )}
          </motion.div>
          <div>
            <p className="text-sm font-medium">Company Logo</p>
            <p className="text-xs text-muted-foreground">Recommended: 200x200px</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <AnimatedInput label="Business Name" value={name} placeholder="Your company name" icon={Building2} isTyping={inPhase(phase, 0.2, 0.4)} />
          <AnimatedInput label="Email" value={email} placeholder="contact@example.com" icon={Mail} isTyping={inPhase(phase, 0.4, 0.6)} />
          <AnimatedInput label="Phone" value={phone} placeholder="+1 555 000 0000" icon={Phone} isTyping={inPhase(phase, 0.6, 0.8)} />
        </div>

        {/* Save Button */}
        <motion.button
          animate={{ scale: inPhase(phase, 0.85, 1) ? 1.02 : 1 }}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
        >
          {inPhase(phase, 0.9, 1) ? <Check className="h-4 w-4" /> : null}
          {inPhase(phase, 0.9, 1) ? "Saved!" : "Save Profile"}
        </motion.button>
      </div>
    </div>
  );
};

// Step 4: First Steps Overview
export const WelcomeStep4 = ({ phase = 0 }: StepProps) => {
  const steps = [
    { icon: Percent, label: "Configure Pricing", desc: "Set markups & margins", done: inPhase(phase, 0.3, 1) },
    { icon: Users, label: "Invite Team", desc: "Add staff members", done: inPhase(phase, 0.5, 1) },
    { icon: Store, label: "Connect Shopify", desc: "Sync your products", done: inPhase(phase, 0.7, 1) },
    { icon: FolderOpen, label: "Create Project", desc: "Start quoting", done: false },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card text-center">
        <h4 className="text-sm font-semibold">Getting Started</h4>
        <p className="text-xs text-muted-foreground">Complete these steps to set up your workspace</p>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: inPhase(phase, 0.1 + i * 0.1, 1) ? 1 : 0, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
              step.done ? "bg-primary/5 border-primary/30" : "bg-card border-border"
            }`}
          >
            <div className={`p-2 rounded-lg ${step.done ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {step.done ? <Check className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
            {step.done && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle className="h-5 w-5 text-primary" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===========================================
// CHAPTER 2: PRICING & MARKUPS (Steps 5-7)
// ===========================================

// Step 5: Global Markups
export const WelcomeStep5 = ({ phase = 0 }: StepProps) => {
  const materialMarkup = Math.round(phaseProgress(phase, 0.2, 0.5) * 30);
  const laborMarkup = Math.round(phaseProgress(phase, 0.4, 0.7) * 45);

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
          <Percent className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Global Markups</h4>
          <p className="text-xs text-muted-foreground">Set your profit margins</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Material Markup */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Material Markup</label>
            <motion.span 
              key={materialMarkup}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold text-green-600"
            >
              {materialMarkup}%
            </motion.span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
              animate={{ width: `${materialMarkup}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Applied to all fabric and material costs</p>
        </div>

        {/* Labor Markup */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Labor Markup</label>
            <motion.span 
              key={laborMarkup}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-lg font-bold text-blue-600"
            >
              {laborMarkup}%
            </motion.span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              animate={{ width: `${laborMarkup}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Applied to installation and labor fees</p>
        </div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: inPhase(phase, 0.7, 1) ? 1 : 0, y: 0 }}
          className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Estimated Margin</span>
          </div>
          <p className="text-2xl font-bold text-green-600">~35% avg</p>
        </motion.div>
      </div>
    </div>
  );
};

// Step 6: Category Pricing
export const WelcomeStep6 = ({ phase = 0 }: StepProps) => {
  const categories = [
    { name: "Premium Fabrics", margin: "40%", color: "bg-purple-500" },
    { name: "Standard Fabrics", margin: "30%", color: "bg-blue-500" },
    { name: "Budget Range", margin: "25%", color: "bg-green-500" },
    { name: "Hardware", margin: "35%", color: "bg-orange-500" },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Tag className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Category Pricing</h4>
          <p className="text-xs text-muted-foreground">Set margins per category</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: inPhase(phase, 0.1 + i * 0.15, 1) ? 1 : 0, x: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
          >
            <div className={`w-3 h-3 rounded-full ${cat.color}`} />
            <span className="text-sm font-medium flex-1">{cat.name}</span>
            <motion.span
              animate={{ scale: inPhase(phase, 0.2 + i * 0.15, 0.5 + i * 0.15) ? [1, 1.2, 1] : 1 }}
              className="text-sm font-bold text-primary"
            >
              {cat.margin}
            </motion.span>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: inPhase(phase, 0.7, 1) ? 1 : 0 }}
          className="mt-4 p-3 rounded-xl bg-muted/50 text-center"
        >
          <p className="text-xs text-muted-foreground">
            <Zap className="h-3 w-3 inline mr-1 text-amber-500" />
            Prices update automatically in all quotes
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Step 7: Price Preview
export const WelcomeStep7 = ({ phase = 0 }: StepProps) => {
  const showCalc = inPhase(phase, 0.3, 1);
  const cost = 150;
  const markup = 30;
  const price = cost * (1 + markup / 100);
  const profit = price - cost;

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <DollarSign className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Price Preview</h4>
          <p className="text-xs text-muted-foreground">See how markups affect quotes</p>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="max-w-sm mx-auto w-full space-y-4">
          {/* Cost */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: inPhase(phase, 0.1, 1) ? 1 : 0 }}
            className="flex justify-between items-center p-3 rounded-lg bg-muted/50"
          >
            <span className="text-sm">Fabric Cost</span>
            <span className="font-mono">${cost.toFixed(2)}</span>
          </motion.div>

          {/* Markup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: inPhase(phase, 0.3, 1) ? 1 : 0 }}
            className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <span className="text-sm text-green-700 dark:text-green-400">+ Markup ({markup}%)</span>
            <span className="font-mono text-green-600">+${(price - cost).toFixed(2)}</span>
          </motion.div>

          {/* Result */}
          <AnimatePresence>
            {showCalc && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Selling Price</span>
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-xl font-bold text-primary"
                  >
                    ${price.toFixed(2)}
                  </motion.span>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Your Profit</span>
                  <span className="text-green-600 font-medium">${profit.toFixed(2)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ===========================================
// CHAPTER 3: TEAM COLLABORATION (Steps 8-10)
// ===========================================

// Step 8: Invite Team
export const WelcomeStep8 = ({ phase = 0 }: StepProps) => {
  const email = localTypingProgress(phase, 0.2, 0.5, "sarah@designerinteriors.com");
  const showSuccess = inPhase(phase, 0.7, 1);

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <UserPlus className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Invite Team Members</h4>
          <p className="text-xs text-muted-foreground">Collaborate with your staff</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {/* Email Input */}
        <AnimatedInput 
          label="Email Address" 
          value={email} 
          placeholder="team@example.com" 
          icon={Mail} 
          isTyping={inPhase(phase, 0.2, 0.5)} 
        />

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Role</label>
          <div className="grid grid-cols-3 gap-2">
            {["Admin", "Editor", "Viewer"].map((role, i) => (
              <motion.div
                key={role}
                animate={{ 
                  scale: i === 1 && inPhase(phase, 0.5, 0.7) ? 1.05 : 1,
                  borderColor: i === 1 ? "hsl(var(--primary))" : "hsl(var(--border))"
                }}
                className={`p-2 rounded-lg border text-center cursor-pointer text-xs font-medium ${
                  i === 1 ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                {role}
                {i === 1 && <Check className="h-3 w-3 mx-auto mt-1 text-primary" />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Send Button */}
        <motion.button
          animate={{ scale: inPhase(phase, 0.65, 0.7) ? 0.95 : 1 }}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" /> Send Invitation
        </motion.button>

        {/* Success Toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-400">Invitation sent to Sarah!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Step 9: Team Chat
export const WelcomeStep9 = ({ phase = 0 }: StepProps) => {
  const messages = [
    { from: "John", text: "Hey Sarah, can you check the Wilson quote?", time: "10:32 AM", self: true },
    { from: "Sarah", text: "Sure! Looking at it now", time: "10:33 AM", self: false },
    { from: "Sarah", text: "Updated the fabric selection 👍", time: "10:35 AM", self: false },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Team Messaging</h4>
          <p className="text-xs text-muted-foreground">Chat with your team in-app</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.self ? 20 : -20 }}
            animate={{ opacity: inPhase(phase, 0.2 + i * 0.2, 1) ? 1 : 0, x: 0 }}
            className={`flex ${msg.self ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] p-3 rounded-2xl ${
              msg.self 
                ? "bg-primary text-primary-foreground rounded-br-sm" 
                : "bg-muted rounded-bl-sm"
            }`}>
              {!msg.self && <p className="text-xs font-medium mb-1 text-primary">{msg.from}</p>}
              <p className="text-sm">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.self ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2 p-2 rounded-lg border border-input bg-background">
          <span className="text-sm text-muted-foreground flex-1">Type a message...</span>
          <Send className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
};

// Step 10: Permissions
export const WelcomeStep10 = ({ phase = 0 }: StepProps) => {
  const permissions = [
    { label: "View All Projects", enabled: true },
    { label: "Edit Quotes", enabled: inPhase(phase, 0.4, 1) },
    { label: "Manage Clients", enabled: inPhase(phase, 0.6, 1) },
    { label: "Access Reports", enabled: false },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <Shield className="h-4 w-4 text-orange-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Custom Permissions</h4>
          <p className="text-xs text-muted-foreground">Control access for Sarah (Editor)</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {permissions.map((perm, i) => (
          <motion.div
            key={perm.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: inPhase(phase, 0.1 + i * 0.1, 1) ? 1 : 0 }}
            className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
          >
            <span className="text-sm">{perm.label}</span>
            <motion.div
              animate={{ 
                backgroundColor: perm.enabled ? "hsl(var(--primary))" : "hsl(var(--muted))"
              }}
              className="w-10 h-5 rounded-full relative"
            >
              <motion.div
                animate={{ x: perm.enabled ? 20 : 2 }}
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===========================================
// CHAPTER 4: SHOPIFY INTEGRATION (Steps 11-14)
// ===========================================

// Step 11: Connect Shopify
export const WelcomeStep11 = ({ phase = 0 }: StepProps) => {
  const isConnecting = inPhase(phase, 0.4, 0.7);
  const isConnected = inPhase(phase, 0.7, 1);

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
          <Store className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Connect Shopify</h4>
          <p className="text-xs text-muted-foreground">Sync your product catalog</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ 
              scale: isConnecting ? [1, 1.1, 1] : 1,
              rotate: isConnecting ? 360 : 0
            }}
            transition={{ duration: isConnecting ? 1 : 0, repeat: isConnecting ? Infinity : 0 }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center"
          >
            {isConnected ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle className="h-10 w-10 text-white" />
              </motion.div>
            ) : (
              <Store className="h-10 w-10 text-white" />
            )}
          </motion.div>

          <div>
            <h4 className="font-semibold">
              {isConnected ? "Connected!" : isConnecting ? "Connecting..." : "Shopify Store"}
            </h4>
            <p className="text-sm text-muted-foreground">
              {isConnected ? "designer-interiors.myshopify.com" : "Import fabrics and sync products"}
            </p>
          </div>

          {!isConnected && (
            <motion.button
              animate={{ scale: inPhase(phase, 0.35, 0.4) ? 0.95 : 1 }}
              className="px-6 py-2.5 rounded-lg bg-[#96bf48] text-white text-sm font-medium"
            >
              {isConnecting ? "Connecting..." : "Connect Store"}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

// Step 12: Import Fabrics
export const WelcomeStep12 = ({ phase = 0 }: StepProps) => {
  const imported = Math.round(phaseProgress(phase, 0.2, 0.8) * 156);

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Package className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Import Fabrics</h4>
          <p className="text-xs text-muted-foreground">Syncing from Shopify...</p>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        {/* Progress */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span>Importing products...</span>
            <span className="font-mono">{imported} / 156</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              animate={{ width: `${(imported / 156) * 100}%` }}
            />
          </div>
        </div>

        {/* Preview Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: inPhase(phase, 0.3 + i * 0.05, 1) ? 1 : 0.3, 
                scale: inPhase(phase, 0.3 + i * 0.05, 1) ? 1 : 0.8 
              }}
              className="aspect-square rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800"
            />
          ))}
        </div>

        {inPhase(phase, 0.85, 1) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center"
          >
            <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <span className="text-sm text-green-700 dark:text-green-400">156 fabrics imported successfully!</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Step 13: Two-way Sync
export const WelcomeStep13 = ({ phase = 0 }: StepProps) => {
  const syncPhase = Math.floor(phase * 3) % 2;

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <RefreshCw className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Two-Way Sync</h4>
          <p className="text-xs text-muted-foreground">Keep inventory in sync</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="flex items-center gap-6">
          {/* InterioApp */}
          <motion.div 
            animate={{ scale: syncPhase === 0 ? 1.05 : 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-2 mx-auto">
              <span className="text-primary-foreground font-bold">IA</span>
            </div>
            <span className="text-xs font-medium">InterioApp</span>
          </motion.div>

          {/* Arrows */}
          <div className="flex flex-col gap-2">
            <motion.div
              animate={{ x: syncPhase === 0 ? [0, 10, 0] : 0, opacity: syncPhase === 0 ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <ArrowRight className="h-5 w-5 text-primary" />
            </motion.div>
            <motion.div
              animate={{ x: syncPhase === 1 ? [0, -10, 0] : 0, opacity: syncPhase === 1 ? 1 : 0.3 }}
              transition={{ duration: 0.5 }}
              className="rotate-180"
            >
              <ArrowRight className="h-5 w-5 text-green-500" />
            </motion.div>
          </div>

          {/* Shopify */}
          <motion.div 
            animate={{ scale: syncPhase === 1 ? 1.05 : 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-2 mx-auto">
              <Store className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs font-medium">Shopify</span>
          </motion.div>
        </div>
      </div>

      <div className="p-4 border-t border-border bg-muted/30 text-center">
        <p className="text-xs text-muted-foreground">
          Stock levels, prices, and products sync automatically
        </p>
      </div>
    </div>
  );
};

// Step 14: Inventory Management
export const WelcomeStep14 = ({ phase = 0 }: StepProps) => {
  const items = [
    { name: "Linen Blend - Natural", stock: 45, status: "In Stock" },
    { name: "Velvet - Navy", stock: 12, status: "Low Stock" },
    { name: "Sheer Voile - White", stock: 0, status: "Out of Stock" },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <Package className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Inventory Library</h4>
          <p className="text-xs text-muted-foreground">Track stock & generate QR codes</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: inPhase(phase, 0.1 + i * 0.2, 1) ? 1 : 0, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800" />
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className={`text-xs ${
                item.stock > 20 ? "text-green-600" : 
                item.stock > 0 ? "text-amber-600" : "text-red-600"
              }`}>
                {item.status} ({item.stock} units)
              </p>
            </div>
            <motion.div
              animate={{ scale: inPhase(phase, 0.6 + i * 0.1, 0.7 + i * 0.1) ? 1.1 : 1 }}
            >
              <QrCode className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ===========================================
// CHAPTER 5: WINDOW COVERING PROJECTS (Steps 15-19)
// ===========================================

// Step 15: Create New Project
export const WelcomeStep15 = ({ phase = 0 }: StepProps) => {
  const clientName = localTypingProgress(phase, 0.2, 0.4, "Johnson Residence");
  const address = localTypingProgress(phase, 0.4, 0.6, "42 Oak Street, Melbourne");

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Plus className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">New Project</h4>
          <p className="text-xs text-muted-foreground">Create a window covering job</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        <AnimatedInput label="Client Name" value={clientName} placeholder="Client or business name" icon={User} isTyping={inPhase(phase, 0.2, 0.4)} />
        <AnimatedInput label="Address" value={address} placeholder="Installation address" icon={Home} isTyping={inPhase(phase, 0.4, 0.6)} />

        <motion.button
          animate={{ scale: inPhase(phase, 0.75, 0.8) ? 0.95 : 1 }}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          Create Project
        </motion.button>

        {inPhase(phase, 0.85, 1) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-center"
          >
            <p className="text-sm font-medium">Project #P-1237 Created!</p>
            <p className="text-xs text-muted-foreground">Now let's add some rooms...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Step 16: Add Rooms
export const WelcomeStep16 = ({ phase = 0 }: StepProps) => {
  const rooms = [
    { icon: Home, name: "Living Room", windows: 4 },
    { icon: Bed, name: "Master Bedroom", windows: 2 },
    { icon: ChefHat, name: "Kitchen", windows: 3 },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Home className="h-4 w-4 text-purple-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Add Rooms</h4>
          <p className="text-xs text-muted-foreground">Select room templates</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {rooms.map((room, i) => (
          <motion.div
            key={room.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: inPhase(phase, 0.1 + i * 0.2, 1) ? 1 : 0, 
              x: 0,
              scale: inPhase(phase, 0.2 + i * 0.2, 0.3 + i * 0.2) ? 1.02 : 1
            }}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/50 cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <room.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{room.name}</p>
              <p className="text-xs text-muted-foreground">{room.windows} windows</p>
            </div>
            {inPhase(phase, 0.3 + i * 0.2, 1) && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <CheckCircle className="h-5 w-5 text-primary" />
              </motion.div>
            )}
          </motion.div>
        ))}

        <motion.button
          animate={{ opacity: inPhase(phase, 0.8, 1) ? 1 : 0.5 }}
          className="w-full py-2 rounded-lg border border-dashed border-primary/50 text-primary text-sm flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Custom Room
        </motion.button>
      </div>
    </div>
  );
};

// Step 17: Treatment Selection
export const WelcomeStep17 = ({ phase = 0 }: StepProps) => {
  const treatments = [
    { icon: Layers, name: "Sheer Curtains", color: "bg-pink-100 text-pink-600" },
    { icon: Layers, name: "Blockout", color: "bg-purple-100 text-purple-600" },
    { icon: Blinds, name: "Roller Blinds", color: "bg-blue-100 text-blue-600" },
    { icon: Layers, name: "Roman Blinds", color: "bg-orange-100 text-orange-600" },
  ];

  const selectedIdx = inPhase(phase, 0.5, 1) ? 2 : -1;

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card">
        <h4 className="text-sm font-semibold">Select Treatment</h4>
        <p className="text-xs text-muted-foreground">Living Room · Bay Window</p>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-3">
          {treatments.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ 
                opacity: inPhase(phase, 0.1 + i * 0.1, 1) ? 1 : 0,
                scale: i === selectedIdx ? 1.05 : 1
              }}
              className={`p-4 rounded-xl border-2 text-center cursor-pointer ${
                i === selectedIdx 
                  ? "border-primary bg-primary/5" 
                  : "border-border bg-card"
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-xl ${t.color} flex items-center justify-center mb-2`}>
                <t.icon className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium">{t.name}</p>
              {i === selectedIdx && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2">
                  <CheckCircle className="h-5 w-5 text-primary mx-auto" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <motion.button
          animate={{ scale: inPhase(phase, 0.85, 0.9) ? 0.95 : 1 }}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          Continue <ArrowRight className="h-4 w-4 inline ml-1" />
        </motion.button>
      </div>
    </div>
  );
};

// Step 18: Measurements
export const WelcomeStep18 = ({ phase = 0 }: StepProps) => {
  const width = Math.round(phaseProgress(phase, 0.2, 0.5) * 180);
  const height = Math.round(phaseProgress(phase, 0.4, 0.7) * 240);

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
          <Ruler className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Enter Measurements</h4>
          <p className="text-xs text-muted-foreground">Living Room · Bay Window</p>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-4">
        {/* Visual Diagram */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            <div className="w-36 h-44 border-4 border-primary/40 rounded bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-900/20 dark:to-sky-800/10">
              {/* Width */}
              <motion.div 
                className="absolute -top-8 left-0 right-0 flex justify-center"
                animate={{ opacity: width > 0 ? 1 : 0.3 }}
              >
                <div className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                  {width > 0 ? `${width} cm` : "Width"}
                </div>
              </motion.div>
              {/* Height */}
              <motion.div 
                className="absolute -right-16 top-1/2 -translate-y-1/2"
                animate={{ opacity: height > 0 ? 1 : 0.3 }}
              >
                <div className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  {height > 0 ? `${height} cm` : "Height"}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Width (cm)</label>
            <div className={`p-2 rounded-lg border text-center font-mono ${
              inPhase(phase, 0.2, 0.5) ? "border-green-500 ring-2 ring-green-500/20" : "border-border"
            }`}>
              {width || "---"}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Height (cm)</label>
            <div className={`p-2 rounded-lg border text-center font-mono ${
              inPhase(phase, 0.4, 0.7) ? "border-blue-500 ring-2 ring-blue-500/20" : "border-border"
            }`}>
              {height || "---"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 19: Generate Quote
export const WelcomeStep19 = ({ phase = 0 }: StepProps) => {
  const showTotal = inPhase(phase, 0.6, 1);

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <Receipt className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Quote Summary</h4>
          <p className="text-xs text-muted-foreground">Johnson Residence #P-1237</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3">
        {/* Room Totals */}
        {[
          { room: "Living Room", items: 4, total: "$2,450" },
          { room: "Master Bedroom", items: 2, total: "$1,800" },
          { room: "Kitchen", items: 3, total: "$980" },
        ].map((room, i) => (
          <motion.div
            key={room.room}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: inPhase(phase, 0.1 + i * 0.15, 1) ? 1 : 0, x: 0 }}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
          >
            <div>
              <p className="text-sm font-medium">{room.room}</p>
              <p className="text-xs text-muted-foreground">{room.items} treatments</p>
            </div>
            <span className="font-semibold text-primary">{room.total}</span>
          </motion.div>
        ))}

        {/* Total */}
        <AnimatePresence>
          {showTotal && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">Grand Total</span>
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-primary"
                >
                  $5,230
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-border bg-card">
        <motion.button
          animate={{ scale: inPhase(phase, 0.85, 0.9) ? 0.95 : 1 }}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" /> Send Quote
        </motion.button>
      </div>
    </div>
  );
};

// ===========================================
// CHAPTER 6: CLIENT MANAGEMENT (Steps 20-22)
// ===========================================

// Step 20: Client CRM
export const WelcomeStep20 = ({ phase = 0 }: StepProps) => {
  const clients = [
    { name: "Sarah Johnson", stage: "Approved", color: "bg-green-500", hot: false },
    { name: "Chen Industries", stage: "Quote Sent", color: "bg-blue-500", hot: true },
    { name: "Wilson Home", stage: "Lead", color: "bg-gray-400", hot: false },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">Client CRM</h4>
            <p className="text-xs text-muted-foreground">48 total clients</p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="p-1.5 rounded bg-muted"><Search className="h-3.5 w-3.5" /></div>
          <div className="p-1.5 rounded bg-muted"><Filter className="h-3.5 w-3.5" /></div>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {clients.map((client, i) => (
          <motion.div
            key={client.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: inPhase(phase, 0.1 + i * 0.2, 1) ? 1 : 0, 
              y: 0,
              scale: inPhase(phase, 0.3 + i * 0.2, 0.5 + i * 0.2) ? 1.02 : 1
            }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">
              {client.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{client.name}</p>
                {client.hot && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] rounded-full flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-current" /> Hot
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-2 h-2 rounded-full ${client.color}`} />
                <span className="text-xs text-muted-foreground">{client.stage}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Step 21: Client Details
export const WelcomeStep21 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold text-primary">SJ</div>
        <div>
          <h4 className="text-sm font-semibold">Sarah Johnson</h4>
          <p className="text-xs text-muted-foreground">Approved · 3 projects</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Projects", value: "3" },
            { label: "Total Spent", value: "$12.5k" },
            { label: "Avg Order", value: "$4.2k" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: inPhase(phase, 0.1 + i * 0.1, 1) ? 1 : 0, scale: 1 }}
              className="p-2 rounded-lg bg-muted/50 text-center"
            >
              <p className="text-lg font-bold text-primary">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: inPhase(phase, 0.4, 1) ? 1 : 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">sarah@email.com</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">+1 555 123 4567</span>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: inPhase(phase, 0.6, 1) ? 1 : 0 }}
          className="space-y-2"
        >
          <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs">
            <Check className="h-3 w-3 inline mr-1 text-green-600" />
            Quote approved for Living Room blinds
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Step 22: Pipeline View
export const WelcomeStep22 = ({ phase = 0 }: StepProps) => {
  const stages = [
    { name: "Lead", count: 8, color: "bg-gray-400" },
    { name: "Quoted", count: 5, color: "bg-blue-500" },
    { name: "Approved", count: 3, color: "bg-green-500" },
    { name: "Completed", count: 12, color: "bg-purple-500" },
  ];

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <BarChart3 className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Sales Pipeline</h4>
          <p className="text-xs text-muted-foreground">Drag clients between stages</p>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-2 h-full">
          {stages.map((stage, i) => (
            <motion.div
              key={stage.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: inPhase(phase, 0.1 + i * 0.15, 1) ? 1 : 0, y: 0 }}
              className="flex flex-col bg-muted/30 rounded-lg p-2"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                <span className="text-[10px] font-medium">{stage.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{stage.count}</span>
              </div>
              <div className="flex-1 space-y-1.5">
                {[...Array(Math.min(stage.count, 3))].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: inPhase(phase, 0.3 + i * 0.1 + j * 0.05, 1) ? 1 : 0 }}
                    className="h-6 bg-card rounded border border-border"
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===========================================
// CHAPTER 7: MARKETING CAMPAIGNS (Steps 23-24)
// ===========================================

// Step 23: Email Campaigns
export const WelcomeStep23 = ({ phase = 0 }: StepProps) => {
  const subject = localTypingProgress(phase, 0.3, 0.6, "Summer Sale - 20% Off All Blinds!");

  return (
    <div className="h-full flex flex-col bg-background rounded-xl overflow-hidden border border-border">
      <div className="px-4 py-3 border-b border-border bg-card flex items-center gap-3">
        <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
          <Megaphone className="h-4 w-4 text-pink-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold">Email Campaign</h4>
          <p className="text-xs text-muted-foreground">Create and schedule campaigns</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        <AnimatedInput label="Subject Line" value={subject} placeholder="Enter email subject" icon={Mail} isTyping={inPhase(phase, 0.3, 0.6)} />

        {/* Recipients */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Send To</label>
          <div className="flex gap-2">
            {["All Leads", "Active Clients", "Past Clients"].map((group, i) => (
              <motion.div
                key={group}
                animate={{ 
                  borderColor: i === 0 ? "hsl(var(--primary))" : "hsl(var(--border))",
                  scale: i === 0 && inPhase(phase, 0.65, 0.7) ? 1.05 : 1
                }}
                className={`flex-1 p-2 rounded-lg border text-center text-xs ${
                  i === 0 ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                {group}
                {i === 0 && <Check className="h-3 w-3 mx-auto mt-1 text-primary" />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Schedule */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: inPhase(phase, 0.7, 1) ? 1 : 0 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
        >
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium">Schedule for Monday 9:00 AM</p>
            <p className="text-xs text-muted-foreground">124 recipients</p>
          </div>
          <Calendar className="h-4 w-4 text-primary" />
        </motion.div>

        <motion.button
          animate={{ scale: inPhase(phase, 0.85, 0.9) ? 0.95 : 1 }}
          className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
        >
          Schedule Campaign
        </motion.button>
      </div>
    </div>
  );
};

// Step 24: Final CTA
export const WelcomeStep24 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: inPhase(phase, 0, 0.3) ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-lg"
      >
        <CheckCircle className="h-10 w-10 text-white" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inPhase(phase, 0.2, 0.5) ? 1 : 0, y: 0 }}
        className="text-2xl font-bold mb-3"
      >
        You're All Set!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inPhase(phase, 0.3, 0.6) ? 1 : 0, y: 0 }}
        className="text-muted-foreground max-w-md mb-8"
      >
        Start creating projects, managing clients, and growing your window covering business with InterioApp
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: inPhase(phase, 0.5, 1) ? 1 : 0, y: 0 }}
        className="grid grid-cols-2 gap-4 w-full max-w-sm"
      >
        <button className="py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" /> New Project
        </button>
        <button className="py-3 rounded-xl border border-border bg-card font-medium flex items-center justify-center gap-2">
          <Settings className="h-4 w-4" /> Settings
        </button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: inPhase(phase, 0.7, 1) ? 1 : 0 }}
        className="mt-8 text-xs text-muted-foreground"
      >
        <Globe className="h-3 w-3 inline mr-1" />
        Connect Shopify, WhatsApp, and more in Settings → Integrations
      </motion.p>
    </div>
  );
};

// ===========================================
// HELPER COMPONENTS
// ===========================================

const AnimatedInput = ({ 
  label, 
  value, 
  placeholder, 
  icon: Icon, 
  isTyping 
}: { 
  label: string; 
  value: string; 
  placeholder: string; 
  icon: React.ElementType; 
  isTyping: boolean;
}) => (
  <div className="space-y-1">
    <label className="text-xs text-muted-foreground">{label}</label>
    <motion.div
      animate={{ borderColor: isTyping ? "hsl(var(--primary))" : "hsl(var(--border))" }}
      className={`flex items-center gap-2 p-2.5 rounded-lg border bg-background ${
        isTyping ? "ring-2 ring-primary/20" : ""
      }`}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className={value ? "text-foreground" : "text-muted-foreground"}>
        {value || placeholder}
      </span>
      {isTyping && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="w-0.5 h-4 bg-primary ml-auto"
        />
      )}
    </motion.div>
  </div>
);
