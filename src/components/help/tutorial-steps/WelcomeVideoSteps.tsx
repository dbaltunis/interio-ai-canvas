/**
 * WelcomeVideoSteps - 6-Scene Cinematic Product Showcase
 * Scenes: Logo Intro, Dashboard, Theme Toggle, Jobs & Notes, Project Deep-Dive, Closing
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, Sun, Plus, ChevronRight, ChevronDown, Check, Edit, Trash2,
  Share2, FileText, Users, Home, Bed, ChefHat, Bath, MoreHorizontal,
  Clock, MessageSquare, Building2, Receipt, Layers, Eye, Tag, X,
  ShoppingBag, TrendingUp, Package, UserPlus, Copy, Link as LinkIcon, ExternalLink
} from "lucide-react";
import { inPhase, phaseProgress, typingProgress } from "@/lib/demoAnimations";
import { DemoCursor } from "@/components/help/DemoCursor";

interface StepProps {
  phase?: number;
}

// ===========================================
// SCENE 1: OPENING BRANDING (Logo + Tagline)
// Duration: 5 seconds
// ===========================================

export const Scene1IntroLogo = ({ phase = 0 }: StepProps) => {
  const showLogo = inPhase(phase, 0, 1);
  const showHeadline = inPhase(phase, 0.2, 1);
  const showSubtitle = inPhase(phase, 0.4, 1);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background relative overflow-hidden">
      {/* Subtle animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 30% 40%, hsl(var(--primary)/0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 70% 60%, hsl(var(--primary)/0.3) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 40%, hsl(var(--primary)/0.3) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Logo with AI-like pulse */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: showLogo ? 1 : 0, 
          scale: showLogo ? 1 : 0.8,
        }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className="relative mb-8"
      >
        {/* Pulsing ring effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ margin: "-20px" }}
        />
        <motion.div
          className="absolute inset-0 rounded-2xl bg-primary/10"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          style={{ margin: "-30px" }}
        />
        
        {/* Actual logo */}
        <img 
          src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
          alt="InterioApp" 
          className="h-20 w-auto relative z-10"
        />
      </motion.div>

      {/* Main Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ 
          opacity: showHeadline ? 1 : 0, 
          y: showHeadline ? 0 : 30 
        }}
        transition={{ duration: 0.5 }}
        className="text-2xl md:text-3xl font-bold mb-4 tracking-tight"
      >
        Sell <span className="text-primary">blinds</span> and <span className="text-primary">curtains</span>
        <br />
        online and in-store
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showSubtitle ? 1 : 0, 
          y: showSubtitle ? 0 : 20 
        }}
        transition={{ duration: 0.5 }}
        className="text-muted-foreground max-w-md leading-relaxed text-sm md:text-base"
      >
        InterioApp is an online store and quoting platform for made-to-measure blinds and curtains.
      </motion.p>
    </div>
  );
};

// ===========================================
// SCENE 2: DASHBOARD OVERVIEW
// Duration: 8 seconds
// ===========================================

export const Scene2Dashboard = ({ phase = 0 }: StepProps) => {
  const zoomIn = inPhase(phase, 0.5, 0.9);
  const showRevenue = phaseProgress(phase, 0.6, 0.75);
  const showOrders = phaseProgress(phase, 0.7, 0.85);
  const showCustomers = phaseProgress(phase, 0.75, 0.9);
  
  const revenueValue = Math.round(showRevenue * 5000);
  const ordersValue = Math.round(showOrders * 34);
  const customersValue = Math.round(showCustomers * 34);
  
  // Chart animation
  const chartProgress = phaseProgress(phase, 0.15, 0.45);
  const donutProgress = phaseProgress(phase, 0.25, 0.5);
  
  return (
    <motion.div 
      className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative"
      animate={{
        scale: zoomIn ? 1.3 : 1,
        x: zoomIn ? "15%" : "0%",
        y: zoomIn ? "10%" : "0%",
      }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Mini Header */}
      <div className="h-10 border-b border-border bg-card flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">IA</span>
          </div>
          <span className="text-xs font-medium">Dashboard</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
            <Users className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="w-6 h-6 rounded bg-muted flex items-center justify-center">
            <Sun className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-3 space-y-3">
        {/* Top Stats Row */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Active Jobs", value: "12", icon: FileText, color: "text-blue-500" },
            { label: "This Month", value: "£14,890", icon: TrendingUp, color: "text-green-500" },
            { label: "Pending", value: "8", icon: Clock, color: "text-amber-500" },
            { label: "Clients", value: "156", icon: Users, color: "text-purple-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: inPhase(phase, 0.1, 1) ? 1 : 0, y: 0 }}
              className="p-2 bg-card rounded-lg border border-border"
            >
              <stat.icon className={`h-3 w-3 ${stat.color} mb-1`} />
              <div className="text-xs font-bold">{stat.value}</div>
              <div className="text-[9px] text-muted-foreground truncate">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Revenue Trend Chart */}
          <motion.div 
            className="p-2 bg-card rounded-lg border border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: inPhase(phase, 0.1, 1) ? 1 : 0 }}
          >
            <div className="text-[9px] font-medium mb-2">Revenue Trend</div>
            <svg className="w-full h-16" viewBox="0 0 100 40">
              <motion.path
                d="M 0 35 Q 15 30, 25 25 T 50 20 T 75 15 T 100 8"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: chartProgress }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.path
                d="M 0 35 Q 15 30, 25 25 T 50 20 T 75 15 T 100 8 V 40 H 0 Z"
                fill="hsl(var(--primary)/0.1)"
                initial={{ opacity: 0 }}
                animate={{ opacity: chartProgress > 0.5 ? 0.5 : 0 }}
              />
            </svg>
          </motion.div>

          {/* Jobs by Status Donut */}
          <motion.div 
            className="p-2 bg-card rounded-lg border border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: inPhase(phase, 0.15, 1) ? 1 : 0 }}
          >
            <div className="text-[9px] font-medium mb-2">Jobs by Status</div>
            <div className="flex items-center gap-2">
              <svg className="w-12 h-12" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                <motion.circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="hsl(142.1 76.2% 36.3%)"
                  strokeWidth="4"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - (donutProgress * 35)}
                  transform="rotate(-90 18 18)"
                />
                <motion.circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="hsl(221.2 83.2% 53.3%)"
                  strokeWidth="4"
                  strokeDasharray="94.2"
                  strokeDashoffset={94.2 - (donutProgress * 25)}
                  transform="rotate(40 18 18)"
                />
              </svg>
              <div className="text-[8px] space-y-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span>Completed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted" />
                  <span>Draft</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Shopify Performance Section - zoomed area */}
        <motion.div 
          className="p-3 bg-gradient-to-r from-green-500/5 to-green-500/10 rounded-lg border border-green-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: inPhase(phase, 0.3, 1) ? 1 : 0 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="h-3.5 w-3.5 text-green-600" />
            <span className="text-[10px] font-semibold">Shopify Performance</span>
            <span className="text-[8px] text-muted-foreground ml-auto">Last 7 days</span>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Revenue */}
            <div className="text-center">
              <motion.div 
                className="text-lg font-bold text-green-600"
                key={revenueValue}
              >
                £{revenueValue.toLocaleString()}
              </motion.div>
              <div className="text-[9px] text-muted-foreground">Revenue</div>
            </div>
            {/* Orders */}
            <div className="text-center">
              <motion.div 
                className="text-lg font-bold text-foreground"
                key={ordersValue}
              >
                {ordersValue}
              </motion.div>
              <div className="text-[9px] text-muted-foreground">Orders</div>
            </div>
            {/* Customers */}
            <div className="text-center">
              <motion.div 
                className="text-lg font-bold text-foreground"
                key={customersValue}
              >
                {customersValue}
              </motion.div>
              <div className="text-[9px] text-muted-foreground">Customers</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ===========================================
// SCENE 3: THEME TOGGLE (Dark/Light)
// Duration: 6 seconds
// ===========================================

export const Scene3ThemeToggle = ({ phase = 0 }: StepProps) => {
  const zoomedToHeader = inPhase(phase, 0.15, 0.85);
  const isDarkMode = inPhase(phase, 0.4, 0.7);
  const cursorVisible = inPhase(phase, 0.2, 0.8);
  
  // Cursor position animation
  const cursorX = zoomedToHeader ? 280 : 150;
  const cursorY = zoomedToHeader ? 80 : 50;
  const isClicking = inPhase(phase, 0.38, 0.42) || inPhase(phase, 0.68, 0.72);
  
  return (
    <motion.div 
      className="h-full w-full rounded-xl overflow-hidden border border-border relative"
      animate={{
        backgroundColor: isDarkMode ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)",
      }}
      transition={{ duration: 0.4 }}
    >
      {/* Animated Cursor */}
      <AnimatePresence>
        {cursorVisible && (
          <DemoCursor
            x={cursorX}
            y={cursorY}
            isClicking={isClicking}
            visible={true}
          />
        )}
      </AnimatePresence>

      {/* Header with icons */}
      <motion.div 
        className="h-12 border-b flex items-center justify-between px-4"
        animate={{
          borderColor: isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)",
          backgroundColor: isDarkMode ? "hsl(222.2 47.4% 11.2%)" : "hsl(0 0% 100%)",
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary">IA</span>
          </div>
          <motion.span 
            className="text-sm font-medium"
            animate={{ color: isDarkMode ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)" }}
          >
            InterioApp
          </motion.span>
        </div>
        
        {/* Header icons - zoomed target area */}
        <motion.div 
          className="flex items-center gap-2"
          animate={{
            scale: zoomedToHeader ? 1.8 : 1,
            x: zoomedToHeader ? -40 : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            animate={{ backgroundColor: isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(210 40% 96.1%)" }}
          >
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
          <motion.div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            animate={{ backgroundColor: isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(210 40% 96.1%)" }}
          >
            <Tag className="h-3.5 w-3.5 text-amber-500" />
          </motion.div>
          
          {/* Theme toggle button - animated target */}
          <motion.div 
            className="w-7 h-7 rounded-lg flex items-center justify-center relative"
            animate={{ 
              backgroundColor: isClicking 
                ? "hsl(var(--primary)/0.2)" 
                : isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(210 40% 96.1%)",
              scale: isClicking ? 0.9 : 1,
            }}
          >
            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-3.5 w-3.5 text-blue-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Click ripple */}
            {isClicking && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-primary/30"
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            )}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content area - theme preview */}
      <motion.div 
        className="p-4"
        animate={{ 
          backgroundColor: isDarkMode ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)" 
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-16 rounded-lg"
              animate={{
                backgroundColor: isDarkMode ? "hsl(222.2 47.4% 11.2%)" : "hsl(210 40% 98%)",
                borderColor: isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)",
              }}
              style={{ border: "1px solid" }}
            />
          ))}
        </div>
        
        {/* Mode indicator */}
        <motion.div 
          className="mt-4 text-center text-xs font-medium"
          animate={{ color: isDarkMode ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)" }}
        >
          {isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ===========================================
// SCENE 4: JOBS & NOTES COLLABORATION
// Duration: 8 seconds
// ===========================================

export const Scene4JobsNotes = ({ phase = 0 }: StepProps) => {
  const showJobsList = inPhase(phase, 0.1, 1);
  const showActionMenu = inPhase(phase, 0.35, 0.55);
  const showNoteDialog = inPhase(phase, 0.5, 0.95);
  const noteText = typingProgress(phase, 0.55, 0.8, "Measurements confirmed ✓ @John please order fabrics from TWC");
  const showSuccess = inPhase(phase, 0.88, 1);
  
  const cursorVisible = inPhase(phase, 0.15, 0.9);
  
  // Cursor positions
  let cursorX = 300;
  let cursorY = 120;
  let isClicking = false;
  
  if (inPhase(phase, 0.15, 0.35)) {
    // Move to action button
    cursorX = 340;
    cursorY = 90;
    isClicking = inPhase(phase, 0.3, 0.35);
  } else if (inPhase(phase, 0.35, 0.5)) {
    // Click Write Note
    cursorX = 320;
    cursorY = 140;
    isClicking = inPhase(phase, 0.45, 0.5);
  } else if (inPhase(phase, 0.5, 0.85)) {
    // In note dialog - typing
    cursorX = 200;
    cursorY = 200;
  } else if (inPhase(phase, 0.85, 0.9)) {
    // Click save
    cursorX = 280;
    cursorY = 280;
    isClicking = inPhase(phase, 0.86, 0.88);
  }
  
  const jobs = [
    { id: "JOB-065", client: "Sarah Johnson", status: "In Progress", amount: "£4,666", color: "bg-blue-500" },
    { id: "JOB-064", client: "Mike Peters", status: "Quote Sent", amount: "£2,890", color: "bg-amber-500" },
    { id: "JOB-063", client: "Emma Wilson", status: "Completed", amount: "£3,450", color: "bg-green-500" },
  ];
  
  return (
    <div className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative">
      {/* Cursor */}
      {cursorVisible && (
        <DemoCursor x={cursorX} y={cursorY} isClicking={isClicking} visible={true} />
      )}

      {/* Header */}
      <div className="h-10 border-b border-border bg-card flex items-center px-3 gap-2">
        <FileText className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Jobs</span>
        <span className="ml-auto text-xs text-muted-foreground">3 active</span>
      </div>

      {/* Jobs Table */}
      <div className="p-2">
        <div className="border border-border rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-muted/50 text-[9px] font-medium text-muted-foreground">
            <span>Job #</span>
            <span>Client</span>
            <span>Status</span>
            <span>Amount</span>
            <span></span>
          </div>
          
          {/* Table rows */}
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: showJobsList ? 1 : 0, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`grid grid-cols-5 gap-2 px-3 py-2.5 border-t border-border items-center relative ${i === 0 ? "bg-primary/5" : ""}`}
            >
              <span className="text-[10px] font-medium">{job.id}</span>
              <span className="text-[10px]">{job.client}</span>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${job.color}`} />
                <span className="text-[9px]">{job.status}</span>
              </div>
              <span className="text-[10px] font-semibold">{job.amount}</span>
              
              {/* Action button for first row */}
              {i === 0 && (
                <div className="relative">
                  <motion.div 
                    className="w-6 h-6 rounded flex items-center justify-center bg-muted hover:bg-muted/80"
                    animate={{ 
                      backgroundColor: showActionMenu ? "hsl(var(--primary)/0.1)" : "hsl(var(--muted))"
                    }}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </motion.div>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {showActionMenu && !showNoteDialog && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-7 w-32 bg-popover border border-border rounded-lg shadow-lg z-20 py-1"
                      >
                        {[
                          { label: "View Job", icon: Eye },
                          { label: "Write Note", icon: MessageSquare, highlight: true },
                          { label: "Duplicate", icon: Copy },
                          { label: "Archive", icon: Trash2, danger: true },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] ${
                              item.highlight ? "bg-primary/10 text-primary font-medium" : 
                              item.danger ? "text-destructive" : "hover:bg-muted"
                            }`}
                          >
                            <item.icon className="h-3 w-3" />
                            <span>{item.label}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Note Dialog Overlay */}
      <AnimatePresence>
        {showNoteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center z-30 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background rounded-xl border border-border shadow-xl w-full max-w-xs"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Write Note</span>
                </div>
                <X className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="p-4 space-y-3">
                <div className="text-[10px] text-muted-foreground">JOB-065 • Sarah Johnson</div>
                
                {/* Note textarea */}
                <div className="min-h-[60px] p-2 bg-muted/50 rounded-lg text-[11px] leading-relaxed">
                  {noteText}
                  {inPhase(phase, 0.55, 0.8) && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-0.5 h-3 bg-primary ml-0.5"
                    />
                  )}
                </div>
                
                {/* @mention highlight */}
                {noteText.includes("@John") && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <UserPlus className="h-3 w-3 text-blue-500" />
                    <span className="text-[9px] text-blue-600">Mentioning: John (Team Member)</span>
                  </div>
                )}
                
                {/* Save Button */}
                <motion.button
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-2"
                  animate={{ 
                    scale: showSuccess ? 1.02 : 1,
                    backgroundColor: showSuccess ? "hsl(142.1 76.2% 36.3%)" : "hsl(var(--primary))"
                  }}
                >
                  {showSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Note Saved!
                    </>
                  ) : (
                    "Save Note"
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ===========================================
// SCENE 5: PROJECT DEEP DIVE
// Duration: 12 seconds
// ===========================================

export const Scene5ProjectDeepDive = ({ phase = 0 }: StepProps) => {
  // Tab navigation phases
  const showClientTab = inPhase(phase, 0, 0.25);
  const showProjectTab = inPhase(phase, 0.25, 0.5);
  const showQuoteTab = inPhase(phase, 0.5, 0.7);
  const showWorkroomTab = inPhase(phase, 0.7, 1);
  const showSharePopover = inPhase(phase, 0.85, 1);
  
  const activeTab = showWorkroomTab ? "workroom" : showQuoteTab ? "quote" : showProjectTab ? "project" : "client";
  
  const cursorVisible = inPhase(phase, 0.15, 0.95);
  let cursorX = 150;
  let cursorY = 60;
  let isClicking = false;
  
  // Cursor follows tabs
  if (inPhase(phase, 0.2, 0.25)) {
    cursorX = 130; cursorY = 52;
    isClicking = inPhase(phase, 0.23, 0.25);
  } else if (inPhase(phase, 0.45, 0.5)) {
    cursorX = 190; cursorY = 52;
    isClicking = inPhase(phase, 0.48, 0.5);
  } else if (inPhase(phase, 0.65, 0.7)) {
    cursorX = 260; cursorY = 52;
    isClicking = inPhase(phase, 0.68, 0.7);
  } else if (inPhase(phase, 0.8, 0.85)) {
    // Move to share button
    cursorX = 320; cursorY = 140;
    isClicking = inPhase(phase, 0.83, 0.85);
  }
  
  const tabs = [
    { id: "client", label: "Client", icon: Users },
    { id: "project", label: "Project", icon: Layers },
    { id: "quote", label: "Quote", icon: Receipt },
    { id: "workroom", label: "Workroom", icon: FileText },
  ];
  
  return (
    <div className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative">
      {/* Cursor */}
      {cursorVisible && (
        <DemoCursor x={cursorX} y={cursorY} isClicking={isClicking} visible={true} />
      )}

      {/* Header with job info */}
      <div className="h-10 border-b border-border bg-card flex items-center px-3 gap-2">
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Jobs</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-sm font-semibold">JOB-065</span>
        <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[9px] font-medium text-blue-700 dark:text-blue-300">In Progress</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-muted/30">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground"
            }`}
            animate={{
              backgroundColor: activeTab === tab.id ? "hsl(var(--primary)/0.05)" : "transparent"
            }}
          >
            <tab.icon className="h-3 w-3" />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-3 relative">
        <AnimatePresence mode="wait">
          {/* Client Tab */}
          {showClientTab && (
            <motion.div
              key="client"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <div className="p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">SJ</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Sarah Johnson</div>
                    <div className="text-[10px] text-muted-foreground">sarah@email.com</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <div className="text-lg font-bold">4</div>
                  <div className="text-[9px] text-muted-foreground">Rooms</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                  <div className="text-lg font-bold text-green-600">£4,666.18</div>
                  <div className="text-[9px] text-green-600">Quote Total</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Project Tab */}
          {showProjectTab && (
            <motion.div
              key="project"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              {[
                { room: "Bedroom", amount: "£2,200.90", icon: Bed },
                { room: "Room 2", amount: "£879.53", icon: Home },
                { room: "Room 3", amount: "£412.00", icon: ChefHat },
                { room: "Room 4", amount: "£1,173.75", icon: Bath },
              ].map((item, i) => (
                <motion.div
                  key={item.room}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between p-2.5 bg-card rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-muted flex items-center justify-center">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-[11px] font-medium">{item.room}</span>
                  </div>
                  <span className="text-[11px] font-bold text-primary">{item.amount}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Quote Tab */}
          {showQuoteTab && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted/50 text-[8px] font-medium text-muted-foreground">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Unit</span>
                  <span className="text-right">Total</span>
                </div>
                {[
                  { item: "Curtain Fabric", qty: "8.5m", unit: "£45.00/m", total: "£382.50" },
                  { item: "Lining", qty: "8.5m", unit: "£12.00/m", total: "£102.00" },
                  { item: "Manufacturing", qty: "1", unit: "£150.00", total: "£150.00" },
                  { item: "Tracks & Hardware", qty: "2", unit: "£89.00", total: "£178.00" },
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-border text-[9px]">
                    <span className="font-medium">{row.item}</span>
                    <span className="text-muted-foreground">{row.qty}</span>
                    <span className="text-muted-foreground">{row.unit}</span>
                    <span className="text-right font-semibold">{row.total}</span>
                  </div>
                ))}
                <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-primary/5 border-t border-primary/20 text-[10px]">
                  <span className="col-span-3 font-bold">Subtotal</span>
                  <span className="text-right font-bold text-primary">£812.50</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Workroom Tab */}
          {showWorkroomTab && (
            <motion.div
              key="workroom"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {/* Work Order Preview */}
              <div className="p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-semibold">Work Order</span>
                  </div>
                  
                  {/* Share Button */}
                  <motion.div 
                    className="relative"
                    animate={{ scale: showSharePopover ? 1.05 : 1 }}
                  >
                    <motion.button
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium"
                      animate={{
                        backgroundColor: showSharePopover ? "hsl(var(--primary)/0.2)" : "hsl(var(--primary)/0.1)"
                      }}
                    >
                      <Share2 className="h-3 w-3" />
                      Shared
                    </motion.button>
                    
                    {/* Share Popover */}
                    <AnimatePresence>
                      {showSharePopover && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          className="absolute right-0 top-9 w-48 bg-popover border border-border rounded-xl shadow-xl z-20 p-3"
                        >
                          <div className="text-[10px] font-semibold mb-2">Shared Links</div>
                          
                          <div className="space-y-2">
                            <div className="p-2 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-medium">curtain maker</span>
                                <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                              </div>
                              <div className="flex gap-1">
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[7px] rounded">Work Order</span>
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[7px] rounded">Full Details</span>
                              </div>
                            </div>
                            
                            <button className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-border rounded-lg text-[9px] text-muted-foreground hover:bg-muted/50">
                              <Plus className="h-2.5 w-2.5" />
                              New Link
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                
                {/* Mini work order preview */}
                <div className="h-24 bg-muted/30 rounded border border-border p-2">
                  <div className="h-2 w-20 bg-muted rounded mb-2" />
                  <div className="h-1.5 w-full bg-muted/50 rounded mb-1" />
                  <div className="h-1.5 w-3/4 bg-muted/50 rounded mb-1" />
                  <div className="h-1.5 w-5/6 bg-muted/50 rounded" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ===========================================
// SCENE 6: CLOSING BRANDING
// Duration: 5 seconds
// ===========================================

export const Scene6Closing = ({ phase = 0 }: StepProps) => {
  const showLogo = inPhase(phase, 0.1, 1);
  const showTagline = inPhase(phase, 0.3, 1);
  const showFeatures = inPhase(phase, 0.5, 1);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background relative overflow-hidden">
      {/* Subtle gradient */}
      <motion.div
        className="absolute inset-0 opacity-10"
        animate={{
          background: [
            "radial-gradient(ellipse at 50% 50%, hsl(var(--primary)/0.4) 0%, transparent 60%)",
          ],
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: showLogo ? 1 : 0, 
          scale: showLogo ? 1 : 0.9,
        }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <img 
          src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
          alt="InterioApp" 
          className="h-16 w-auto"
        />
      </motion.div>

      {/* Tagline */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showTagline ? 1 : 0, 
          y: showTagline ? 0 : 20 
        }}
        transition={{ duration: 0.5 }}
        className="text-xl md:text-2xl font-bold mb-2"
      >
        Made-to-measure
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: showTagline ? 1 : 0, 
          y: showTagline ? 0 : 20 
        }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-lg text-primary font-medium mb-8"
      >
        blinds and curtains
      </motion.p>

      {/* Feature icons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showFeatures ? 1 : 0 }}
        className="flex items-center justify-center gap-6"
      >
        {[
          { icon: Users, label: "CRM" },
          { icon: Receipt, label: "Quotes" },
          { icon: ShoppingBag, label: "Shopify" },
          { icon: MessageSquare, label: "Team" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: showFeatures ? 1 : 0, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[9px] text-muted-foreground">{item.label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
