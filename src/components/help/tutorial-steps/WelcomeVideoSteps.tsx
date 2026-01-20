/**
 * WelcomeVideoSteps - 6-Scene Cinematic Product Showcase
 * Scenes: Logo Intro, Dashboard, Theme Toggle, Jobs & Notes, Project Deep-Dive, Closing
 * 
 * Updated for high-fidelity matching actual app UI
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, Sun, Plus, ChevronRight, ChevronDown, Check, Edit, Trash2,
  Share2, FileText, Users, Home, Bed, ChefHat, Bath, MoreHorizontal,
  Clock, MessageSquare, Building2, Receipt, Layers, Eye, Tag, X,
  ShoppingBag, TrendingUp, Package, UserPlus, Copy, Link as LinkIcon, ExternalLink,
  DollarSign, Calendar, Lightbulb, Settings, Ruler, Scissors, Image
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
// Duration: 8 seconds - Matches actual app UI
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
        scale: zoomIn ? 1.12 : 1,
        x: zoomIn ? "10%" : "0%",
        y: zoomIn ? "15%" : "0%",
      }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Header - matches actual app */}
      <div className="h-11 border-b border-border bg-card flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
            alt="IA" 
            className="h-5 w-auto"
          />
          <div className="flex items-center gap-4">
            {["Home", "Clients", "Jobs", "Messages", "Calendar", "Library"].map((nav, i) => (
              <span 
                key={nav} 
                className={`text-[10px] ${i === 0 ? "font-semibold text-primary" : "text-muted-foreground"}`}
              >
                {nav}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
            <Users className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
            <Lightbulb className="h-3 w-3 text-amber-500" />
          </div>
          <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
            <Sun className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center">
            <Settings className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </div>

      {/* Welcome Header - matches actual app */}
      <div className="px-3 py-2 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <motion.h2 
              className="text-sm font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: inPhase(phase, 0.05, 1) ? 1 : 0 }}
            >
              Good afternoon, Darius B.
            </motion.h2>
            <motion.p 
              className="text-[9px] text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: inPhase(phase, 0.08, 1) ? 1 : 0 }}
            >
              219 pending quotes • 458 clients
            </motion.p>
          </div>
          <motion.div 
            className="text-[9px] text-muted-foreground px-2 py-1 bg-muted rounded"
            initial={{ opacity: 0 }}
            animate={{ opacity: inPhase(phase, 0.1, 1) ? 1 : 0 }}
          >
            Last 90 days
          </motion.div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-2 space-y-2">
        {/* Top Stats Row - matches actual app with icons */}
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Revenue", value: "£59,872", icon: DollarSign, color: "text-primary", bg: "bg-primary/5" },
            { label: "Active Projects", value: "138", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Pending Quotes", value: "177", icon: Receipt, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: "Clients", value: "19", icon: Users, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: inPhase(phase, 0.1 + i * 0.02, 1) ? 1 : 0, y: 0 }}
              className={`p-2 ${stat.bg} rounded-lg border border-border`}
            >
              <div className="flex items-center gap-1 mb-1">
                <stat.icon className={`h-3 w-3 ${stat.color}`} />
              </div>
              <div className="text-sm font-bold">{stat.value}</div>
              <div className="text-[8px] text-muted-foreground truncate">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row - matches actual app layout */}
        <div className="grid grid-cols-2 gap-1.5">
          {/* Revenue Trend Chart */}
          <motion.div 
            className="p-2 bg-card rounded-lg border border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: inPhase(phase, 0.1, 1) ? 1 : 0 }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-medium">Revenue Trend</span>
              <span className="text-[8px] px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600">
                -54.9%
              </span>
            </div>
            <svg className="w-full h-12" viewBox="0 0 100 32">
              {/* Y-axis labels */}
              <text x="0" y="6" className="fill-muted-foreground" style={{ fontSize: '4px' }}>26k</text>
              <text x="0" y="16" className="fill-muted-foreground" style={{ fontSize: '4px' }}>13k</text>
              <text x="0" y="28" className="fill-muted-foreground" style={{ fontSize: '4px' }}>0k</text>
              
              {/* Previous period line (gray) */}
              <motion.path
                d="M 12 20 Q 25 18, 40 22 T 65 16 T 88 10 T 100 8"
                fill="none"
                stroke="hsl(var(--muted-foreground)/0.3)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="3 2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: chartProgress * 0.8 }}
              />
              
              {/* Current period line (primary) */}
              <motion.path
                d="M 12 8 Q 25 12, 40 18 T 65 22 T 88 25 T 100 28"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: chartProgress }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-0.5 bg-primary rounded" />
                <span className="text-[7px] text-muted-foreground">Current</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-0.5 bg-muted-foreground/30 rounded" />
                <span className="text-[7px] text-muted-foreground">Previous</span>
              </div>
            </div>
          </motion.div>

          {/* Jobs by Status Donut - matches actual app */}
          <motion.div 
            className="p-2 bg-card rounded-lg border border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: inPhase(phase, 0.15, 1) ? 1 : 0 }}
          >
            <div className="text-[9px] font-medium mb-1">Jobs by Status</div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg className="w-14 h-14" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <circle cx="18" cy="18" r="12" fill="none" stroke="hsl(var(--muted)/0.3)" strokeWidth="3" />
                  
                  {/* Draft segment (gray) - largest */}
                  <motion.circle
                    cx="18" cy="18" r="12"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="3"
                    strokeDasharray={`${donutProgress * 45} 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                  {/* Order Confirmed (orange) */}
                  <motion.circle
                    cx="18" cy="18" r="12"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeDasharray={`${donutProgress * 12} 100`}
                    strokeLinecap="round"
                    transform="rotate(70 18 18)"
                  />
                  {/* Quote Sent (blue) */}
                  <motion.circle
                    cx="18" cy="18" r="12"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray={`${donutProgress * 5} 100`}
                    strokeLinecap="round"
                    transform="rotate(115 18 18)"
                  />
                  {/* Approved (green) */}
                  <motion.circle
                    cx="18" cy="18" r="12"
                    fill="none"
                    stroke="#22C55E"
                    strokeWidth="3"
                    strokeDasharray={`${donutProgress * 3} 100`}
                    strokeLinecap="round"
                    transform="rotate(135 18 18)"
                  />
                </svg>
                {/* Center number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold">147</span>
                </div>
              </div>
              <div className="text-[7px] space-y-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                  <span>Draft (97)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span>Order Conf. (23)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  <span>Quote Sent (8)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                  <span>Approved (5)</span>
                </div>
                <span className="text-muted-foreground">+7 more</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Shopify Performance Section - zoomed area */}
        <motion.div 
          className="grid grid-cols-3 gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: inPhase(phase, 0.3, 1) ? 1 : 0 }}
        >
          {/* Shopify Store Analytics */}
          <div className="p-2 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-1 mb-2">
              <ShoppingBag className="h-3 w-3 text-green-600" />
              <span className="text-[8px] font-medium">Store Analytics</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[8px]">
                <span className="text-muted-foreground">Sessions</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between text-[8px]">
                <span className="text-muted-foreground">Conv. Rate</span>
                <span className="font-medium text-green-600">3.2%</span>
              </div>
            </div>
          </div>
          
          {/* Shopify Performance - main widget */}
          <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-1 mb-2">
              <ShoppingBag className="h-3 w-3 text-green-600" />
              <span className="text-[8px] font-semibold text-green-700 dark:text-green-400">Performance</span>
              <span className="ml-auto text-[7px] px-1 py-0.5 bg-green-500 text-white rounded animate-pulse">Live</span>
            </div>
            <div className="text-center">
              <motion.div 
                className="text-base font-bold text-green-600"
                key={revenueValue}
              >
                £{revenueValue.toLocaleString()}
              </motion.div>
              <div className="text-[7px] text-green-600/70">Revenue (7 days)</div>
            </div>
            <div className="flex justify-around mt-2 pt-2 border-t border-green-200 dark:border-green-700">
              <div className="text-center">
                <motion.div className="text-[10px] font-bold">{ordersValue}</motion.div>
                <div className="text-[6px] text-muted-foreground">Orders</div>
              </div>
              <div className="text-center">
                <motion.div className="text-[10px] font-bold">{customersValue}</motion.div>
                <div className="text-[6px] text-muted-foreground">Customers</div>
              </div>
            </div>
          </div>
          
          {/* Product Sync */}
          <div className="p-2 bg-card rounded-lg border border-border">
            <div className="flex items-center gap-1 mb-2">
              <Package className="h-3 w-3 text-blue-500" />
              <span className="text-[8px] font-medium">Product Sync</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[8px]">
                <span className="text-muted-foreground">Synced</span>
                <span className="font-medium text-green-600">✓ 42</span>
              </div>
              <div className="flex justify-between text-[8px]">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-amber-500">3</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ===========================================
// SCENE 3: THEME TOGGLE (Dark/Light)
// Duration: 6 seconds - Subtle zoom
// ===========================================

export const Scene3ThemeToggle = ({ phase = 0 }: StepProps) => {
  const zoomedToHeader = inPhase(phase, 0.15, 0.85);
  const isDarkMode = inPhase(phase, 0.4, 0.7);
  const cursorVisible = inPhase(phase, 0.2, 0.8);
  
  // Cursor position animation - more subtle
  const cursorX = zoomedToHeader ? 320 : 200;
  const cursorY = zoomedToHeader ? 55 : 40;
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

      {/* Full App Header - matches actual app */}
      <motion.div 
        className="h-11 border-b flex items-center justify-between px-3"
        animate={{
          borderColor: isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)",
          backgroundColor: isDarkMode ? "hsl(222.2 47.4% 11.2%)" : "hsl(0 0% 100%)",
        }}
        transition={{ duration: 0.4 }}
      >
        {/* Left side - logo + nav */}
        <div className="flex items-center gap-4">
          <img 
            src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
            alt="IA" 
            className="h-5 w-auto"
          />
          <div className="flex items-center gap-3">
            {["Home", "Clients", "Jobs", "Messages", "Calendar", "Library"].map((nav, i) => (
              <motion.span 
                key={nav}
                className={`text-[10px] ${i === 0 ? "font-semibold" : ""}`}
                animate={{ 
                  color: i === 0 
                    ? "hsl(var(--primary))" 
                    : isDarkMode ? "hsl(215 20.2% 65.1%)" : "hsl(215.4 16.3% 46.9%)"
                }}
              >
                {nav}
              </motion.span>
            ))}
          </div>
        </div>
        
        {/* Right side - Header icons (zoomed target area) */}
        <motion.div 
          className="flex items-center gap-1.5"
          animate={{
            scale: zoomedToHeader ? 1.3 : 1,
            x: zoomedToHeader ? -20 : 0,
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
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
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
          
          <motion.div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            animate={{ backgroundColor: isDarkMode ? "hsl(217.2 32.6% 17.5%)" : "hsl(210 40% 96.1%)" }}
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content area - theme preview */}
      <motion.div 
        className="p-3"
        animate={{ 
          backgroundColor: isDarkMode ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)" 
        }}
      >
        {/* Welcome header preview */}
        <motion.div 
          className="mb-3 p-2 rounded-lg"
          animate={{ backgroundColor: isDarkMode ? "hsl(222.2 47.4% 11.2%)" : "hsl(210 40% 98%)" }}
        >
          <motion.div 
            className="text-sm font-semibold mb-0.5"
            animate={{ color: isDarkMode ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)" }}
          >
            Good afternoon, Darius B.
          </motion.div>
          <motion.div 
            className="text-[9px]"
            animate={{ color: isDarkMode ? "hsl(215 20.2% 65.1%)" : "hsl(215.4 16.3% 46.9%)" }}
          >
            219 pending quotes • 458 clients
          </motion.div>
        </motion.div>
        
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-14 rounded-lg"
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
    cursorX = 360;
    cursorY = 95;
    isClicking = inPhase(phase, 0.3, 0.35);
  } else if (inPhase(phase, 0.35, 0.5)) {
    cursorX = 330;
    cursorY = 145;
    isClicking = inPhase(phase, 0.45, 0.5);
  } else if (inPhase(phase, 0.5, 0.85)) {
    cursorX = 200;
    cursorY = 200;
  } else if (inPhase(phase, 0.85, 0.9)) {
    cursorX = 280;
    cursorY = 280;
    isClicking = inPhase(phase, 0.86, 0.88);
  }
  
  const jobs = [
    { id: "JOB-065", client: "Sarah Johnson", status: "In Progress", amount: "£4,666", color: "bg-blue-500", date: "Jan 20" },
    { id: "JOB-064", client: "Mike Peters", status: "Quote Sent", amount: "£2,890", color: "bg-amber-500", date: "Jan 19" },
    { id: "JOB-063", client: "Emma Wilson", status: "Completed", amount: "£3,450", color: "bg-green-500", date: "Jan 18" },
  ];
  
  return (
    <div className="h-full w-full bg-background rounded-xl overflow-hidden border border-border relative">
      {/* Cursor */}
      {cursorVisible && (
        <DemoCursor x={cursorX} y={cursorY} isClicking={isClicking} visible={true} />
      )}

      {/* Header - matches actual app */}
      <div className="h-11 border-b border-border bg-card flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
            alt="IA" 
            className="h-5 w-auto"
          />
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground">Home</span>
            <span className="text-[10px] text-muted-foreground">Clients</span>
            <span className="text-[10px] font-semibold text-primary">Jobs</span>
            <span className="text-[10px] text-muted-foreground">Messages</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-[9px] font-medium">
            <Plus className="h-3 w-3" />
            New Job
          </button>
        </div>
      </div>

      {/* Page header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Jobs
          </h2>
          <p className="text-[9px] text-muted-foreground">3 active jobs</p>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            placeholder="Search jobs..." 
            className="w-28 px-2 py-1 text-[9px] border border-border rounded bg-muted/50"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="p-2">
        <div className="border border-border rounded-lg overflow-hidden bg-card">
          {/* Table header */}
          <div className="grid grid-cols-6 gap-2 px-3 py-2 bg-muted/50 text-[8px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>Job #</span>
            <span>Client</span>
            <span>Status</span>
            <span>Amount</span>
            <span>Date</span>
            <span></span>
          </div>
          
          {/* Table rows */}
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: showJobsList ? 1 : 0, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`grid grid-cols-6 gap-2 px-3 py-2.5 border-t border-border items-center relative ${i === 0 ? "bg-primary/5" : "hover:bg-muted/30"}`}
            >
              <span className="text-[10px] font-medium text-primary">{job.id}</span>
              <span className="text-[10px] truncate">{job.client}</span>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${job.color}`} />
                <span className="text-[9px]">{job.status}</span>
              </div>
              <span className="text-[10px] font-semibold">{job.amount}</span>
              <span className="text-[9px] text-muted-foreground">{job.date}</span>
              
              {/* Action button for first row */}
              {i === 0 && (
                <div className="relative justify-self-end">
                  <motion.div 
                    className="w-6 h-6 rounded flex items-center justify-center bg-muted cursor-pointer"
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
                        className="absolute right-0 top-7 w-36 bg-popover border border-border rounded-lg shadow-lg z-20 py-1"
                      >
                        {[
                          { label: "View Job", icon: Eye },
                          { label: "Write Note", icon: MessageSquare, highlight: true },
                          { label: "Duplicate", icon: Copy },
                          { label: "Archive", icon: Trash2, danger: true },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className={`flex items-center gap-2 px-3 py-1.5 text-[10px] cursor-pointer ${
                              item.highlight ? "bg-primary/10 text-primary font-medium" : 
                              item.danger ? "text-destructive hover:bg-destructive/10" : "hover:bg-muted"
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
                <X className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" />
              </div>
              
              <div className="p-4 space-y-3">
                <div className="text-[10px] text-muted-foreground">JOB-065 • Sarah Johnson</div>
                
                {/* Note textarea */}
                <div className="min-h-[60px] p-2 bg-muted/50 rounded-lg border border-border text-[11px] leading-relaxed">
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
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                  >
                    <UserPlus className="h-3 w-3 text-blue-500" />
                    <span className="text-[9px] text-blue-600 dark:text-blue-400">Mentioning: John (Team Member)</span>
                  </motion.div>
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
// Duration: 12 seconds - Professional documents
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
  let cursorY = 55;
  let isClicking = false;
  
  // Cursor follows tabs
  if (inPhase(phase, 0.2, 0.25)) {
    cursorX = 135; cursorY = 55;
    isClicking = inPhase(phase, 0.23, 0.25);
  } else if (inPhase(phase, 0.45, 0.5)) {
    cursorX = 200; cursorY = 55;
    isClicking = inPhase(phase, 0.48, 0.5);
  } else if (inPhase(phase, 0.65, 0.7)) {
    cursorX = 270; cursorY = 55;
    isClicking = inPhase(phase, 0.68, 0.7);
  } else if (inPhase(phase, 0.8, 0.85)) {
    cursorX = 340; cursorY = 110;
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

      {/* Header with job info - matches actual app */}
      <div className="h-10 border-b border-border bg-card flex items-center px-3 gap-2">
        <span className="text-[10px] text-muted-foreground">Jobs</span>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs font-semibold">JOB-065</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">Jan 20, 2026</span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[9px] font-medium text-blue-700 dark:text-blue-300">In Progress</span>
          </div>
        </div>
      </div>

      {/* Tabs - matches actual app */}
      <div className="flex border-b border-border bg-muted/20">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
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
      <div className="p-2 relative overflow-y-auto" style={{ height: 'calc(100% - 82px)' }}>
        <AnimatePresence mode="wait">
          {/* Client Tab */}
          {showClientTab && (
            <motion.div
              key="client"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-2"
            >
              <div className="p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">SJ</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Sarah Johnson</div>
                    <div className="text-[10px] text-muted-foreground">sarah@email.com • +44 7700 900123</div>
                  </div>
                  <button className="px-2 py-1 text-[9px] bg-primary/10 text-primary rounded font-medium">
                    View Profile
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-card rounded-lg border border-border text-center">
                  <div className="text-xl font-bold">4</div>
                  <div className="text-[9px] text-muted-foreground">Rooms</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                  <div className="text-xl font-bold text-green-600">£4,666.18</div>
                  <div className="text-[9px] text-green-600">Quote Total</div>
                </div>
              </div>
              
              <div className="p-2 bg-muted/30 rounded-lg">
                <div className="text-[9px] font-medium mb-1">Timeline</div>
                <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                  <span>Created: Jan 15</span>
                  <span>•</span>
                  <span>Last updated: Today</span>
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
                { room: "Bedroom", amount: "£2,200.90", icon: Bed, expanded: true, windows: 1 },
                { room: "Room 2", amount: "£879.53", icon: Home, windows: 2 },
                { room: "Room 3", amount: "£412.00", icon: ChefHat, windows: 1 },
                { room: "Room 4", amount: "£1,173.75", icon: Bath, windows: 1 },
              ].map((item, i) => (
                <motion.div
                  key={item.room}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-lg border border-border overflow-hidden"
                >
                  <div className="flex items-center justify-between p-2.5">
                    <div className="flex items-center gap-2">
                      <motion.div 
                        className="w-5 h-5 rounded flex items-center justify-center"
                        animate={{ rotate: item.expanded ? 90 : 0 }}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </motion.div>
                      <div className="w-7 h-7 rounded bg-muted flex items-center justify-center">
                        <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="text-[11px] font-medium">{item.room}</span>
                        <div className="text-[8px] text-muted-foreground">{item.windows} window{item.windows > 1 ? 's' : ''}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-primary">{item.amount}</span>
                      <Edit className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                  
                  {/* Expanded content for first room */}
                  {item.expanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="border-t border-border p-2 bg-muted/20"
                    >
                      <div className="flex items-start gap-2 p-2 bg-background rounded-lg border border-border">
                        {/* Fabric thumbnail */}
                        <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                          <Image className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[10px] font-medium">Curtain testing</div>
                          <div className="text-[8px] text-muted-foreground">Velvet Midnight Blue</div>
                          <div className="flex items-center gap-2 mt-1 text-[8px]">
                            <span className="text-muted-foreground">W: 1000mm</span>
                            <span className="text-muted-foreground">×</span>
                            <span className="text-muted-foreground">H: 1000mm</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold">£273.54</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Quote Tab - Professional Document */}
          {showQuoteTab && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full"
            >
              {/* Professional Quote Document */}
              <div className="bg-white dark:bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                {/* Document Header */}
                <div className="p-3 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <img 
                        src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
                        alt="InterioApp" 
                        className="h-6 w-auto mb-2"
                      />
                      <div className="text-[8px] text-muted-foreground">
                        123 Design Street, London
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">QUOTATION</div>
                      <div className="text-[9px] text-muted-foreground">#QT-2024-065</div>
                      <div className="text-[8px] text-muted-foreground">Jan 20, 2026</div>
                    </div>
                  </div>
                </div>
                
                {/* Client Info */}
                <div className="p-2 border-b border-border bg-muted/30">
                  <div className="text-[8px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Bill To</div>
                  <div className="text-[10px] font-medium">Sarah Johnson</div>
                  <div className="text-[8px] text-muted-foreground">123 High Street, London</div>
                </div>
                
                {/* Line Items with Images */}
                <div className="divide-y divide-border">
                  {/* Item 1 - with fabric image */}
                  <div className="p-2 flex items-start gap-2">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/20 flex items-center justify-center flex-shrink-0 border border-indigo-200 dark:border-indigo-800">
                      <Scissors className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium">Bedroom Curtains</div>
                      <div className="text-[8px] text-muted-foreground">Velvet Midnight Blue • 2400mm × 1800mm</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-semibold">£1,245.00</div>
                      <div className="text-[7px] text-muted-foreground">Qty: 1</div>
                    </div>
                  </div>
                  
                  {/* Item 2 - with track image */}
                  <div className="p-2 flex items-start gap-2">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-gray-600">
                      <Ruler className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium">Ceiling Track System</div>
                      <div className="text-[8px] text-muted-foreground">White Powder Coat • 3000mm</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-semibold">£189.00</div>
                      <div className="text-[7px] text-muted-foreground">Qty: 1</div>
                    </div>
                  </div>
                  
                  {/* Item 3 */}
                  <div className="p-2 flex items-start gap-2">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20 flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-800">
                      <Package className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-medium">Installation & Fitting</div>
                      <div className="text-[8px] text-muted-foreground">Professional installation included</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-[10px] font-semibold">£286.80</div>
                      <div className="text-[7px] text-muted-foreground">Qty: 1</div>
                    </div>
                  </div>
                </div>
                
                {/* Totals */}
                <div className="p-2 bg-muted/30 border-t border-border space-y-1">
                  <div className="flex justify-between text-[9px]">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">£1,434.00</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span className="text-muted-foreground">VAT (20%)</span>
                    <span className="font-medium">£286.80</span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary">£1,720.80</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Workroom Tab - Professional Work Order */}
          {showWorkroomTab && (
            <motion.div
              key="workroom"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full"
            >
              {/* Work Order Document */}
              <div className="bg-white dark:bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                {/* Document Header with Share Button */}
                <div className="p-2 border-b border-border flex items-center justify-between bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-[11px] font-semibold">Work Order</div>
                      <div className="text-[8px] text-muted-foreground">WO-2024-065 • Bedroom Curtains</div>
                    </div>
                  </div>
                  
                  {/* Share Button */}
                  <motion.div 
                    className="relative"
                    animate={{ scale: showSharePopover ? 1.08 : 1 }}
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
                                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[7px] rounded font-medium">Work Order</span>
                                <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[7px] rounded font-medium">Full Details</span>
                              </div>
                            </div>
                            
                            <button className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-border rounded-lg text-[9px] text-muted-foreground hover:bg-muted/50 transition-colors">
                              <Plus className="h-2.5 w-2.5" />
                              New Link
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                
                {/* Window Diagram Section */}
                <div className="p-2 border-b border-border">
                  <div className="flex items-start gap-3">
                    {/* Window Diagram */}
                    <div className="w-24 h-20 bg-muted/30 rounded-lg border-2 border-dashed border-muted flex items-center justify-center relative">
                      <div className="w-14 h-12 border-2 border-primary/50 rounded bg-primary/5 flex items-center justify-center">
                        <span className="text-[8px] text-primary font-medium">Window 1</span>
                      </div>
                      {/* Stack indicator */}
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary/30 rounded" />
                    </div>
                    
                    {/* Measurements */}
                    <div className="flex-1 space-y-1">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Width:</span>
                          <span className="font-medium">2400mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Drop:</span>
                          <span className="font-medium">1800mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stack:</span>
                          <span className="font-medium">Left</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Heading:</span>
                          <span className="font-medium">Wave</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Materials Section */}
                <div className="p-2 border-b border-border">
                  <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Materials</div>
                  <div className="space-y-1.5">
                    {[
                      { name: "Velvet Midnight Blue", qty: "8.5m", color: "bg-indigo-500" },
                      { name: "Blackout Lining", qty: "8.5m", color: "bg-gray-500" },
                      { name: "Wave Tape", qty: "3m", color: "bg-amber-500" },
                    ].map((material) => (
                      <div key={material.name} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${material.color}`} />
                        <span className="text-[9px] flex-1">{material.name}</span>
                        <span className="text-[9px] font-medium">{material.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Instructions Section */}
                <div className="p-2">
                  <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Instructions</div>
                  <div className="space-y-1">
                    {[
                      "Double pinch pleat heading",
                      "Weighted corners",
                      "Contrast leading edge",
                    ].map((instruction, i) => (
                      <div key={i} className="flex items-center gap-2 text-[9px]">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
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
