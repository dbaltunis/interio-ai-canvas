import { Settings, Package, Briefcase, Trophy, Ruler, Calculator, Users, LayoutDashboard, LucideIcon } from 'lucide-react';
import { allTeachingPoints } from './teachingPoints';

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  requiredTipPatterns: string[]; // Patterns to match tip IDs (supports * wildcard)
  color: string; // Tailwind color class
  gradient: string; // Gradient for unlocked state
}

export const achievementBadges: AchievementBadge[] = [
  {
    id: 'quick-start',
    name: 'Quick Start',
    description: 'Completed 5 essential tips to get started',
    icon: LayoutDashboard,
    category: 'getting-started',
    requiredTipPatterns: ['settings-personal-timezone', 'settings-business-logo', 'app-dashboard-*', 'app-projects-*', 'app-clients-*'],
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'settings-master',
    name: 'Settings Master',
    description: 'Configured all your personal and business settings',
    icon: Settings,
    category: 'settings',
    requiredTipPatterns: ['settings-*'],
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'product-pro',
    name: 'Product Pro',
    description: 'Mastered the product library and pricing',
    icon: Package,
    category: 'products',
    requiredTipPatterns: ['app-inventory-*', 'settings-products-*', 'settings-pricing-*'],
    color: 'text-emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'measurement-expert',
    name: 'Measurement Expert',
    description: 'Learned all measurement and unit settings',
    icon: Ruler,
    category: 'measurements',
    requiredTipPatterns: ['settings-units-*'],
    color: 'text-orange-500',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    id: 'workflow-wizard',
    name: 'Workflow Wizard',
    description: 'Discovered all job and project management features',
    icon: Briefcase,
    category: 'app',
    requiredTipPatterns: ['app-projects-*', 'app-jobs-*', 'app-calendar-*'],
    color: 'text-sky-500',
    gradient: 'from-sky-500 to-blue-500',
  },
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Set up team collaboration features',
    icon: Users,
    category: 'team',
    requiredTipPatterns: ['settings-team-*'],
    color: 'text-indigo-500',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'pricing-guru',
    name: 'Pricing Guru',
    description: 'Mastered all pricing and calculation settings',
    icon: Calculator,
    category: 'pricing',
    requiredTipPatterns: ['settings-pricing-*', 'settings-tax-*'],
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'power-user',
    name: 'Power User',
    description: 'Completed 100% of all tips - you\'re an expert!',
    icon: Trophy,
    category: 'all',
    requiredTipPatterns: ['*'], // All tips
    color: 'text-yellow-500',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

/**
 * Check if a tip ID matches a pattern (supports * wildcard)
 */
function matchesPattern(tipId: string, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern.endsWith('*')) {
    return tipId.startsWith(pattern.slice(0, -1));
  }
  return tipId === pattern;
}

/**
 * Get all tip IDs that match the required patterns for a badge
 */
export function getRequiredTipsForBadge(badge: AchievementBadge): string[] {
  if (badge.requiredTipPatterns.includes('*')) {
    return allTeachingPoints.map(tp => tp.id);
  }
  
  return allTeachingPoints
    .filter(tp => badge.requiredTipPatterns.some(pattern => matchesPattern(tp.id, pattern)))
    .map(tp => tp.id);
}

/**
 * Calculate badge progress
 */
export function getBadgeProgress(badge: AchievementBadge, completedTips: string[]): { completed: number; total: number; percent: number } {
  const requiredTips = getRequiredTipsForBadge(badge);
  const completed = requiredTips.filter(tipId => completedTips.includes(tipId)).length;
  const total = requiredTips.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return { completed, total, percent };
}

/**
 * Check if a badge is unlocked
 */
export function isBadgeUnlocked(badge: AchievementBadge, completedTips: string[]): boolean {
  const { percent } = getBadgeProgress(badge, completedTips);
  return percent === 100;
}

/**
 * Get all unlocked badges
 */
export function getUnlockedBadges(completedTips: string[]): AchievementBadge[] {
  return achievementBadges.filter(badge => isBadgeUnlocked(badge, completedTips));
}

/**
 * Check if completing a tip would unlock a new badge
 */
export function checkForNewBadge(tipId: string, previouslyCompleted: string[]): AchievementBadge | null {
  const newCompleted = [...previouslyCompleted, tipId];
  
  for (const badge of achievementBadges) {
    const wasUnlocked = isBadgeUnlocked(badge, previouslyCompleted);
    const isNowUnlocked = isBadgeUnlocked(badge, newCompleted);
    
    if (!wasUnlocked && isNowUnlocked) {
      return badge;
    }
  }
  
  return null;
}
