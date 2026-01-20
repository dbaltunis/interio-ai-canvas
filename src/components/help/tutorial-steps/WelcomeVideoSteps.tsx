/**
 * WelcomeVideoSteps - 6-Scene Cinematic Product Showcase
 * Scenes: Logo Intro, Dashboard, Theme Toggle, Jobs & Notes, Project Deep-Dive, Closing
 * 
 * Updated for ultra-high-fidelity matching actual app UI with:
 * - Professional Quote document with Payment flow
 * - Work Order with window diagrams
 * - Installation tab
 * - Share functionality demonstration
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Moon, Sun, Plus, ChevronRight, ChevronDown, Check, Edit, Trash2,
  Share2, FileText, Users, Home, Bed, ChefHat, Bath, MoreHorizontal,
  Clock, MessageSquare, Building2, Receipt, Layers, Eye, Tag, X,
  ShoppingBag, TrendingUp, Package, UserPlus, Copy, Link as LinkIcon, ExternalLink,
  DollarSign, Calendar, Lightbulb, Settings, Ruler, Scissors, Image, Mail, Percent,
  CreditCard, Download, Send, CheckCircle2, ArrowRight, Wrench, ClipboardList,
  CircleDot
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
// Duration: 8 seconds - Matches actual app UI exactly
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
// SCENE 3: THEME TOGGLE (Dark/Light) - SAME PAGE
// Duration: 6 seconds - Subtle zoom, stay on dashboard
// ===========================================

export const Scene3ThemeToggle = ({ phase = 0 }: StepProps) => {
  const zoomedToHeader = inPhase(phase, 0.15, 0.85);
  const isDarkMode = inPhase(phase, 0.4, 0.7);
  const cursorVisible = inPhase(phase, 0.2, 0.8);
  
  // Cursor position animation - targets the right-side icons
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

      {/* Full App Header - matches actual app - icons on RIGHT */}
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

      {/* Content area - showing dashboard in dark/light mode */}
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
// SCENE 5: PROJECT DEEP DIVE - EXPANDED
// Duration: 15 seconds - Quote, Payment, Email, Work Order, Installation, Share
// ===========================================

export const Scene5ProjectDeepDive = ({ phase = 0 }: StepProps) => {
  // Phase breakdown for 15 seconds:
  // 0.00-0.10: Client tab
  // 0.10-0.20: Project tab with rooms
  // 0.20-0.40: Quote tab with professional document
  // 0.40-0.50: Click Payment → Show dropdown → Configure 50% deposit
  // 0.50-0.60: Email dialog → Type message → Send
  // 0.60-0.65: Email success → Client payment
  // 0.65-0.80: Work Order tab with window diagram
  // 0.80-0.90: Installation tab
  // 0.90-1.00: Share popover

  const showClientTab = inPhase(phase, 0, 0.10);
  const showProjectTab = inPhase(phase, 0.10, 0.20);
  const showQuoteTab = inPhase(phase, 0.20, 0.65);
  const showPaymentDropdown = inPhase(phase, 0.42, 0.48);
  const showPaymentConfig = inPhase(phase, 0.48, 0.52);
  const showEmailDialog = inPhase(phase, 0.52, 0.62);
  const showEmailSuccess = inPhase(phase, 0.60, 0.65);
  const showWorkroomTab = inPhase(phase, 0.65, 0.80);
  const showInstallationTab = inPhase(phase, 0.80, 0.90);
  const showSharePopover = inPhase(phase, 0.90, 1);
  
  const activeTab = showInstallationTab || showSharePopover ? "installation" : 
                    showWorkroomTab ? "workroom" : 
                    showQuoteTab ? "quote" : 
                    showProjectTab ? "project" : "client";
  
  const cursorVisible = inPhase(phase, 0.08, 0.98);
  let cursorX = 150;
  let cursorY = 55;
  let isClicking = false;
  
  // Cursor follows actions
  if (inPhase(phase, 0.08, 0.10)) {
    cursorX = 135; cursorY = 55;
    isClicking = inPhase(phase, 0.09, 0.10);
  } else if (inPhase(phase, 0.18, 0.20)) {
    cursorX = 200; cursorY = 55;
    isClicking = inPhase(phase, 0.19, 0.20);
  } else if (inPhase(phase, 0.40, 0.42)) {
    cursorX = 340; cursorY = 85; // Payment button
    isClicking = inPhase(phase, 0.41, 0.42);
  } else if (inPhase(phase, 0.46, 0.48)) {
    cursorX = 340; cursorY = 115; // Configure Payment Terms
    isClicking = inPhase(phase, 0.47, 0.48);
  } else if (inPhase(phase, 0.50, 0.52)) {
    cursorX = 200; cursorY = 220; // 50% deposit option
    isClicking = inPhase(phase, 0.51, 0.52);
  } else if (inPhase(phase, 0.58, 0.60)) {
    cursorX = 280; cursorY = 300; // Send Email button
    isClicking = inPhase(phase, 0.59, 0.60);
  } else if (inPhase(phase, 0.63, 0.65)) {
    cursorX = 270; cursorY = 55; // Workroom tab
    isClicking = inPhase(phase, 0.64, 0.65);
  } else if (inPhase(phase, 0.78, 0.80)) {
    cursorX = 340; cursorY = 55; // Installation tab
    isClicking = inPhase(phase, 0.79, 0.80);
  } else if (inPhase(phase, 0.88, 0.90)) {
    cursorX = 360; cursorY = 85; // Share button
    isClicking = inPhase(phase, 0.89, 0.90);
  }
  
  const tabs = [
    { id: "client", label: "Client", icon: Users },
    { id: "project", label: "Project", icon: Layers },
    { id: "quote", label: "Quote", icon: Receipt },
    { id: "workroom", label: "Workroom", icon: FileText },
    { id: "installation", label: "Installation", icon: Wrench },
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
            className={`flex items-center gap-1.5 px-3 py-2 text-[9px] font-medium border-b-2 transition-colors ${
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
                    <span className="text-sm font-bold text-primary">KM</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Katie</div>
                    <div className="text-[10px] text-muted-foreground">krichter@micelidrapery.com</div>
                  </div>
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
                { room: "Bedroom", amount: "£2,200.90", icon: Bed, windows: 1 },
                { room: "Room 2", amount: "£879.53", icon: Home, windows: 2 },
                { room: "Room 3", amount: "£412.00", icon: ChefHat, windows: 1 },
                { room: "Room 4", amount: "£1,173.75", icon: Bath, windows: 1 },
              ].map((item, i) => (
                <motion.div
                  key={item.room}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-lg border border-border p-2.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded bg-muted flex items-center justify-center">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium">{item.room}</span>
                      <div className="text-[8px] text-muted-foreground">{item.windows} window{item.windows > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-primary">{item.amount}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Quote Tab - Professional Document with Actions */}
          {showQuoteTab && (
            <motion.div
              key="quote"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full relative"
            >
              {/* Quote Action Bar - matches screenshot */}
              <div className="flex items-center justify-between mb-2 p-2 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium">Quotation</span>
                  <select className="text-[9px] px-1.5 py-0.5 border border-border rounded bg-muted/50">
                    <option>Default Quote...</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <button className="flex items-center gap-1 px-2 py-1 text-[8px] bg-muted hover:bg-muted/80 rounded border border-border">
                    <Download className="h-2.5 w-2.5" />
                    PDF
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-[8px] bg-muted hover:bg-muted/80 rounded border border-border">
                    <Mail className="h-2.5 w-2.5" />
                    Email
                  </button>
                  <button className="flex items-center gap-1 px-2 py-1 text-[8px] bg-muted hover:bg-muted/80 rounded border border-border">
                    <Percent className="h-2.5 w-2.5" />
                  </button>
                  <div className="relative">
                    <motion.button 
                      className="flex items-center gap-1 px-2 py-1 text-[8px] bg-muted hover:bg-muted/80 rounded border border-border"
                      animate={{ 
                        backgroundColor: (showPaymentDropdown || showPaymentConfig) ? "hsl(var(--primary)/0.1)" : "hsl(var(--muted))",
                        borderColor: (showPaymentDropdown || showPaymentConfig) ? "hsl(var(--primary))" : "hsl(var(--border))"
                      }}
                    >
                      <CreditCard className="h-2.5 w-2.5" />
                      Payment
                      <ChevronDown className="h-2 w-2" />
                    </motion.button>
                    
                    {/* Payment Dropdown */}
                    <AnimatePresence>
                      {showPaymentDropdown && !showPaymentConfig && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-lg shadow-xl z-30 py-1"
                        >
                          <div className="px-3 py-2 text-[9px] hover:bg-primary/10 cursor-pointer flex items-center gap-2">
                            <Settings className="h-3 w-3" />
                            <span className="font-medium">Configure Payment Terms</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Display options bar */}
              <div className="flex items-center gap-3 mb-2 px-2 py-1.5 bg-muted/30 rounded-lg text-[8px]">
                <span className="text-muted-foreground">Display:</span>
                <label className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                  <span>Group by room</span>
                </label>
                <span className="text-muted-foreground">Simple View</span>
                <span className="text-muted-foreground">📷 Images</span>
              </div>

              {/* Profit Summary bar */}
              <div className="flex items-center justify-between mb-2 px-2 py-1.5 bg-muted/30 rounded-lg">
                <span className="text-[8px] flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Profit Summary
                </span>
                <span className="text-[8px] font-medium">70% MU | -8.0% GP | £0.00</span>
              </div>

              {/* Professional Quote Document */}
              <div className="bg-white dark:bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                {/* Document Header */}
                <div className="p-2 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <img 
                        src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
                        alt="InterioApp" 
                        className="h-5 w-auto mb-1"
                      />
                      <div className="text-[7px] text-muted-foreground">
                        UAB Curtains Calculator<br />
                        Liepu 21, Klaipeda 91210
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-primary">Order</div>
                      <div className="text-[8px] text-muted-foreground"># QUOTE-021</div>
                      <div className="text-[7px] text-muted-foreground">📅 08-Jan-2026</div>
                    </div>
                  </div>
                </div>
                
                {/* Client Info */}
                <div className="p-2 border-b border-border bg-muted/30">
                  <div className="text-[7px] font-medium text-muted-foreground uppercase mb-1">👤 Bill To</div>
                  <div className="text-[9px] font-medium">Katie</div>
                  <div className="text-[7px] text-muted-foreground">Miceli Drapery Company</div>
                  <div className="text-[7px] text-muted-foreground">krichter@micelidrapery.com</div>
                </div>
                
                {/* Line Items with Images */}
                <div className="divide-y divide-border">
                  <div className="p-2 flex items-start gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/20 flex items-center justify-center flex-shrink-0 border border-indigo-200">
                      <Scissors className="h-3 w-3 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[9px] font-medium">Bedroom Curtains</div>
                      <div className="text-[7px] text-muted-foreground">Velvet Midnight • 2400×1800mm</div>
                    </div>
                    <div className="text-[9px] font-semibold">£1,245.00</div>
                  </div>
                  <div className="p-2 flex items-start gap-2">
                    <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 border border-gray-200">
                      <Ruler className="h-3 w-3 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[9px] font-medium">Ceiling Track System</div>
                      <div className="text-[7px] text-muted-foreground">White • 3000mm</div>
                    </div>
                    <div className="text-[9px] font-semibold">£189.00</div>
                  </div>
                </div>
                
                {/* Totals */}
                <div className="p-2 bg-muted/30 border-t border-border">
                  <div className="flex justify-between text-[8px]">
                    <span>Subtotal</span>
                    <span>£1,434.00</span>
                  </div>
                  <div className="flex justify-between text-[8px]">
                    <span>VAT (20%)</span>
                    <span>£286.80</span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between text-[10px] font-bold">
                    <span>Total</span>
                    <span className="text-primary">£1,720.80</span>
                  </div>
                </div>
              </div>

              {/* Payment Configuration Dialog Overlay */}
              <AnimatePresence>
                {showPaymentConfig && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 10 }}
                      className="bg-background rounded-xl border border-border shadow-xl w-full max-w-[280px]"
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold">Configure Payment Terms</span>
                        </div>
                        <X className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
                      </div>
                      
                      <div className="p-3 space-y-3">
                        {/* Payment Type Selection */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 p-2 rounded-lg border border-border cursor-pointer">
                            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
                            <div>
                              <div className="text-[10px] font-medium">Full Payment</div>
                              <div className="text-[8px] text-muted-foreground">Require full payment upfront</div>
                            </div>
                          </label>
                          <motion.label 
                            className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer"
                            animate={{ 
                              borderColor: "hsl(var(--primary))",
                              backgroundColor: "hsl(var(--primary)/0.05)"
                            }}
                          >
                            <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div>
                              <div className="text-[10px] font-medium text-primary">Deposit Payment</div>
                              <div className="text-[8px] text-muted-foreground">Partial payment now, rest later</div>
                            </div>
                          </motion.label>
                        </div>
                        
                        {/* Deposit Percentage Input */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-medium">Deposit Percentage</label>
                          <div className="flex items-center gap-2">
                            <motion.input 
                              type="text" 
                              value="50"
                              readOnly
                              className="flex-1 px-2 py-1.5 text-sm font-bold text-center border-2 border-primary rounded-lg bg-primary/5"
                              animate={{ scale: [1, 1.02, 1] }}
                              transition={{ duration: 0.3 }}
                            />
                            <span className="text-sm font-bold text-primary">%</span>
                          </div>
                          <div className="text-[8px] text-muted-foreground">
                            Deposit: £860.40 • Remaining: £860.40
                          </div>
                        </div>
                        
                        <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-[10px] font-medium flex items-center justify-center gap-1">
                          <Check className="h-3 w-3" />
                          Save Payment Terms
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Quote Dialog Overlay */}
              <AnimatePresence>
                {showEmailDialog && !showPaymentConfig && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center z-40 p-3"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 10 }}
                      className="bg-background rounded-xl border border-border shadow-xl w-full max-w-[300px]"
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          <span className="text-xs font-semibold">Email Quote</span>
                        </div>
                        <X className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
                      </div>
                      
                      <div className="p-3 space-y-2">
                        <div>
                          <label className="text-[8px] font-medium text-muted-foreground">To</label>
                          <input 
                            type="text" 
                            value="krichter@micelidrapery.com"
                            readOnly
                            className="w-full px-2 py-1 text-[9px] border border-border rounded bg-muted/50"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-medium text-muted-foreground">Subject</label>
                          <input 
                            type="text" 
                            value="Quote for New Job 1/8/2026"
                            readOnly
                            className="w-full px-2 py-1 text-[9px] border border-border rounded bg-muted/50"
                          />
                        </div>
                        <div>
                          <label className="text-[8px] font-medium text-muted-foreground">Message</label>
                          <div className="w-full px-2 py-1.5 text-[8px] border border-border rounded bg-muted/50 min-h-[50px]">
                            Dear Katie,<br /><br />
                            Please find attached the quote for your project.<br /><br />
                            Best regards
                          </div>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-[8px] text-blue-600 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>Quote PDF will be attached automatically</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 pt-1">
                          <button className="flex-1 py-1.5 rounded-lg border border-border text-[9px] font-medium">
                            Cancel
                          </button>
                          <motion.button 
                            className="flex-1 py-1.5 rounded-lg text-[9px] font-medium flex items-center justify-center gap-1"
                            animate={{ 
                              backgroundColor: showEmailSuccess ? "hsl(142.1 76.2% 36.3%)" : "hsl(var(--primary))",
                              color: "white"
                            }}
                          >
                            {showEmailSuccess ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                Sent!
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3" />
                                Send Email
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
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
                {/* Document Header */}
                <div className="p-2 border-b border-border bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-bold text-orange-700 dark:text-orange-400">WORK ORDER</span>
                    </div>
                    <span className="text-[8px] text-muted-foreground">WO-2024-065</span>
                  </div>
                  <div className="text-[9px] font-medium mt-1">Bedroom Curtains</div>
                </div>
                
                {/* Window Diagram */}
                <div className="p-3 border-b border-border">
                  <div className="text-[8px] font-medium text-muted-foreground uppercase mb-2">Window Diagram</div>
                  <div className="relative bg-muted/30 rounded-lg p-4 flex items-center justify-center">
                    {/* Simplified window diagram */}
                    <div className="relative">
                      <div className="w-32 h-24 border-2 border-primary rounded relative">
                        {/* Window frame */}
                        <div className="absolute inset-2 border border-dashed border-primary/50 rounded" />
                        {/* Center cross */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-px h-full bg-primary/30" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-px bg-primary/30" />
                        </div>
                      </div>
                      {/* Measurement labels */}
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-medium bg-primary text-primary-foreground px-1 rounded">
                        W: 2400mm
                      </div>
                      <div className="absolute -right-10 top-1/2 -translate-y-1/2 text-[7px] font-medium bg-primary text-primary-foreground px-1 rounded">
                        H: 1800mm
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] text-muted-foreground">
                        Stack: Left
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Materials List */}
                <div className="p-2 border-b border-border">
                  <div className="text-[8px] font-medium text-muted-foreground uppercase mb-2">Materials Required</div>
                  <div className="space-y-1">
                    {[
                      { name: "Velvet Midnight Blue", qty: "8.5m", icon: Scissors },
                      { name: "Blackout Lining", qty: "8.5m", icon: Layers },
                      { name: "Wave Tape", qty: "3m", icon: Ruler },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-[9px] p-1.5 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <item.icon className="h-3 w-3 text-muted-foreground" />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-medium">{item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="p-2">
                  <div className="text-[8px] font-medium text-muted-foreground uppercase mb-2">Manufacturing Instructions</div>
                  <div className="space-y-1">
                    {[
                      "Double pinch pleat heading",
                      "Weighted corners",
                      "Contrast leading edge",
                    ].map((instruction, i) => (
                      <div key={i} className="flex items-center gap-2 text-[9px]">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>{instruction}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Installation Tab */}
          {(showInstallationTab || showSharePopover) && (
            <motion.div
              key="installation"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="h-full relative"
            >
              {/* Installation Header with Share Button */}
              <div className="flex items-center justify-between mb-2 p-2 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Wrench className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-medium">Installation Instructions</span>
                </div>
                <div className="relative">
                  <motion.button 
                    className="flex items-center gap-1 px-2 py-1 text-[8px] bg-muted hover:bg-muted/80 rounded border border-border"
                    animate={{ 
                      backgroundColor: showSharePopover ? "hsl(var(--primary)/0.1)" : "hsl(var(--muted))",
                      borderColor: showSharePopover ? "hsl(var(--primary))" : "hsl(var(--border))"
                    }}
                  >
                    <Share2 className="h-2.5 w-2.5" />
                    Share
                  </motion.button>

                  {/* Share Popover */}
                  <AnimatePresence>
                    {showSharePopover && (
                      <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                        className="absolute right-0 top-full mt-1 w-56 bg-popover border border-border rounded-lg shadow-xl z-30 p-2"
                      >
                        <div className="text-[9px] font-medium mb-2">Share with Team</div>
                        
                        {/* Existing share */}
                        <div className="p-2 bg-muted/50 rounded-lg mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-medium">Curtain Maker</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[7px] px-1 py-0.5 bg-primary/10 text-primary rounded">Work Order</span>
                            <span className="text-[7px] px-1 py-0.5 bg-green-100 text-green-700 rounded">Full Details</span>
                          </div>
                        </div>
                        
                        {/* Add new link */}
                        <button className="w-full flex items-center justify-center gap-1 py-1.5 border border-dashed border-border rounded-lg text-[9px] text-muted-foreground hover:text-foreground hover:border-primary">
                          <Plus className="h-3 w-3" />
                          New Share Link
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Installation Document */}
              <div className="bg-white dark:bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="p-2 border-b border-border bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-bold text-green-700 dark:text-green-400">INSTALLATION GUIDE</span>
                  </div>
                </div>
                
                {/* Pre-Installation Checklist */}
                <div className="p-2 border-b border-border">
                  <div className="text-[8px] font-medium text-muted-foreground uppercase mb-2">Pre-Installation Checklist</div>
                  <div className="space-y-1">
                    {[
                      "Confirm site access with client",
                      "All materials received and checked",
                      "Tools and ladders prepared",
                      "Installer assigned: John Smith",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-[9px]">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Room Schedule */}
                <div className="p-2">
                  <div className="text-[8px] font-medium text-muted-foreground uppercase mb-2">Room Schedule</div>
                  <div className="space-y-1">
                    {[
                      { room: "Bedroom", time: "9:00 AM", status: "Ready" },
                      { room: "Living Room", time: "11:00 AM", status: "Ready" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[9px] p-1.5 bg-muted/30 rounded">
                        <span className="font-medium">{item.room}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.time}</span>
                          <span className="text-[7px] px-1 py-0.5 bg-green-100 text-green-700 rounded">{item.status}</span>
                        </div>
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
  const showMessage = inPhase(phase, 0.3, 1);
  const showCTA = inPhase(phase, 0.5, 1);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-background relative overflow-hidden">
      {/* Background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.2) 0%, transparent 60%)",
            "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.3) 0%, transparent 60%)",
            "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.2) 0%, transparent 60%)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: showLogo ? 1 : 0, scale: showLogo ? 1 : 0.9 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <img 
          src="/lovable-uploads/b4044156-cf14-4da2-92bf-8996d9998f72.png" 
          alt="InterioApp" 
          className="h-16 w-auto"
        />
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showMessage ? 1 : 0, y: showMessage ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-xl font-bold mb-2">Ready to get started?</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your complete platform for made-to-measure window treatments
        </p>
      </motion.div>

      {/* Features recap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showCTA ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap justify-center gap-2 max-w-xs"
      >
        {["Quote Builder", "Team Notes", "Work Orders", "Payments", "Installation"].map((feature, i) => (
          <motion.span
            key={feature}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i }}
            className="px-2 py-1 text-[10px] bg-primary/10 text-primary rounded-full font-medium"
          >
            {feature}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
};
