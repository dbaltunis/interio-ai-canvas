import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, UserPlus, Mail, Shield, CreditCard, Search, Clock, 
  Check, X, Crown, Settings 
} from "lucide-react";
import {
  AnimatedMockButton,
  AnimatedMockInput,
  AnimatedSuccessToast,
  AnimatedMockCard,
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// TEAM SETTINGS TUTORIAL - 10 INTERACTIVE STEPS
// Multi-phase animations for engaging experience
// ===========================================

// Animated counter for stats
const AnimatedCounter = ({ 
  value, 
  phase, 
  startPhase = 0.3,
  color = "text-primary" 
}: { 
  value: number; 
  phase: number;
  startPhase?: number;
  color?: string;
}) => {
  const isAnimating = phase >= startPhase;
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    if (isAnimating) {
      let current = 0;
      const step = value / 20;
      const interval = setInterval(() => {
        current += step;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isAnimating, value]);

  return (
    <motion.span 
      className={`text-2xl font-bold ${color}`}
      animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {count}
    </motion.span>
  );
};

// Animated user row
const AnimatedUserRow = ({ 
  name, 
  email, 
  role, 
  status,
  phase,
  revealPhase = 0.3,
  highlighted = false
}: { 
  name: string; 
  email: string; 
  role: string; 
  status: "active" | "pending";
  phase: number;
  revealPhase?: number;
  highlighted?: boolean;
}) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  const isVisible = phase >= revealPhase;
  const isHighlighted = highlighted && phase >= revealPhase + 0.2;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        x: isVisible ? 0 : -10,
        borderColor: isHighlighted ? "hsl(var(--primary))" : "hsl(var(--border))"
      }}
      className={`border rounded-lg p-3 flex items-center gap-3 ${
        isHighlighted ? "border-primary bg-primary/5" : ""
      }`}
    >
      <motion.div 
        className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium"
        animate={isHighlighted ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.5, repeat: isHighlighted ? Infinity : 0 }}
      >
        {initials}
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{name}</p>
        <p className="text-xs text-muted-foreground truncate">{email}</p>
      </div>
      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
        status === "active" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
      }`}>
        {role}
      </span>
      {status === "pending" && (
        <span className="flex items-center gap-1 px-2 py-0.5 border rounded text-[10px]">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      )}
    </motion.div>
  );
};

// Step 1: Team Management overview
export const TeamStep1 = ({ phase = 0 }: StepProps) => {
  const showStats = phase > 0.3;

  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0, y: phase > 0.1 ? 0 : -10 }}
      >
        <motion.div 
          className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2"
          animate={phase > 0.15 ? { scale: [0.8, 1.1, 1] } : {}}
        >
          <Users className="h-6 w-6 text-primary" />
        </motion.div>
        <h4 className="font-semibold text-sm">Team Management</h4>
        <p className="text-xs text-muted-foreground">Manage team members and permissions</p>
      </motion.div>
      <AnimatePresence>
        {showStats && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { value: 5, label: "Active Members", color: "text-primary" },
              { value: 2, label: "Pending", color: "text-amber-500" },
              { value: 10, label: "Seat Limit", color: "text-muted-foreground" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-3 border rounded-lg bg-card"
              >
                <AnimatedCounter value={stat.value} phase={phase} startPhase={0.4 + i * 0.1} color={stat.color} />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Step 2: View your subscription
export const TeamStep2 = ({ phase = 0 }: StepProps) => {
  const showProgress = phase > 0.4;

  return (
    <div className="space-y-4">
      <AnimatedMockCard phase={phase} revealPhase={0.1} className="border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <motion.div animate={phase > 0.2 ? { rotate: [0, 360] } : {}}>
            <Crown className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium">Professional Plan</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Seats Used</span>
            <motion.span 
              className="font-medium"
              animate={showProgress ? { opacity: [0, 1] } : {}}
            >
              5 of 10
            </motion.span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-primary rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: showProgress ? "50%" : 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Cost</span>
            <span className="font-medium">$249/month</span>
          </div>
        </div>
      </AnimatedMockCard>
      <motion.p 
        className="text-xs text-muted-foreground text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.7 ? 1 : 0 }}
      >
        Each additional seat is $99/month
      </motion.p>
    </div>
  );
};

// Step 3: Manage billing
export const TeamStep3 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0 }}
      >
        <h4 className="font-semibold text-sm">Billing & Subscription</h4>
      </motion.div>
      <AnimatedMockCard phase={phase} revealPhase={0.2}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">•••• 4242</span>
            </div>
            <span className="px-2 py-0.5 border rounded text-[10px]">Visa</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next billing</span>
            <span>Feb 15, 2026</span>
          </div>
        </div>
      </AnimatedMockCard>
      <motion.div
        animate={phase > 0.5 ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 1, repeat: phase > 0.5 ? Infinity : 0 }}
      >
        <AnimatedMockButton phase={phase} variant="outline" icon={Settings} highlight={phase > 0.6}>
          Manage Subscription
        </AnimatedMockButton>
      </motion.div>
    </div>
  );
};

// Step 4: Invite a new member
export const TeamStep4 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <motion.h4 
          className="font-medium text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.1 ? 1 : 0 }}
        >
          Team Members
        </motion.h4>
        <AnimatedMockButton 
          phase={phase} 
          clickPhase={0.5}
          highlight={phase > 0.3 && phase < 0.7}
          icon={UserPlus}
          size="sm"
        >
          Invite Member
        </AnimatedMockButton>
      </div>
      <div className="space-y-2">
        <AnimatedUserRow name="John Smith" email="john@company.com" role="Admin" status="active" phase={phase} revealPhase={0.2} />
        <AnimatedUserRow name="Sarah Wilson" email="sarah@company.com" role="Manager" status="active" phase={phase} revealPhase={0.35} />
      </div>
    </div>
  );
};

// Step 5: Set member details
export const TeamStep5 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <AnimatedMockCard phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Invite Team Member</span>
        </div>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Email Address" 
            value="newmember@company.com" 
            icon={Mail}
            phase={phase}
            startPhase={0.15}
            endPhase={0.35}
          />
          <AnimatedMockInput 
            label="Full Name" 
            value="Alex Johnson" 
            phase={phase}
            startPhase={0.35}
            endPhase={0.55}
          />
          <motion.div 
            className="space-y-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase > 0.55 ? 1 : 0 }}
          >
            <label className="text-xs font-medium">Role</label>
            <motion.div 
              className="border rounded px-3 py-2 text-sm flex items-center justify-between"
              animate={phase > 0.6 && phase < 0.85 ? { 
                borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span>Sales Representative</span>
              <span className="text-muted-foreground">▾</span>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedMockCard>
    </div>
  );
};

// Step 6: Configure permissions
export const TeamStep6 = ({ phase = 0 }: StepProps) => {
  const permissions = [
    { perm: "View quotes", enabled: true },
    { perm: "Edit quotes", enabled: true },
    { perm: "View costs", enabled: false },
    { perm: "Manage clients", enabled: true },
    { perm: "Access reports", enabled: false },
  ];

  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0 }}
      >
        <motion.div animate={phase > 0.15 ? { scale: [0.8, 1.1, 1] } : {}}>
          <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
        </motion.div>
        <h4 className="font-semibold text-sm">Configure Permissions</h4>
      </motion.div>
      <div className="space-y-2">
        {permissions.map((item, i) => (
          <motion.div
            key={item.perm}
            className="border rounded-lg p-2 flex items-center justify-between"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: phase > 0.2 + i * 0.1 ? 1 : 0, x: phase > 0.2 + i * 0.1 ? 0 : -10 }}
          >
            <span className="text-sm">{item.perm}</span>
            <motion.div 
              className={`w-5 h-5 rounded flex items-center justify-center ${
                item.enabled ? "bg-primary text-primary-foreground" : "border-2"
              }`}
              animate={phase > 0.3 + i * 0.1 ? { scale: [0.8, 1.1, 1] } : {}}
            >
              {item.enabled && <Check className="h-3 w-3" />}
            </motion.div>
          </motion.div>
        ))}
      </div>
      <motion.p 
        className="text-xs text-muted-foreground text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.8 ? 1 : 0 }}
      >
        Permissions based on selected role
      </motion.p>
    </div>
  );
};

// Step 7: Review billing impact
export const TeamStep7 = ({ phase = 0 }: StepProps) => {
  const showBreakdown = phase > 0.4;

  return (
    <div className="space-y-4">
      <AnimatedMockCard phase={phase} revealPhase={0.1} className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
        <div className="flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <p className="font-medium text-sm text-amber-900 dark:text-amber-100">Billing Preview</p>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Adding 1 new member to your plan
            </p>
          </div>
        </div>
      </AnimatedMockCard>
      <AnimatePresence>
        {showBreakdown && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border rounded-lg p-3 space-y-2"
          >
            {[
              { label: "Current monthly", value: "$249.00" },
              { label: "+ New seat", value: "+$99.00", highlight: true },
              { label: "New total", value: "$348.00/month", bold: true },
            ].map((row, i) => (
              <motion.div 
                key={row.label}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex justify-between text-sm ${row.bold ? "border-t pt-2 font-medium" : ""}`}
              >
                <span className={row.bold ? "" : "text-muted-foreground"}>{row.label}</span>
                <span className={row.highlight ? "text-primary" : ""}>{row.value}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatedMockButton phase={phase} clickPhase={0.8} highlight={phase > 0.7}>
        Confirm & Send Invitation
      </AnimatedMockButton>
      <AnimatedSuccessToast message="Invitation sent to Alex!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 8: View pending invitations
export const TeamStep8 = ({ phase = 0 }: StepProps) => {
  const invites = [
    { name: "Alex Johnson", email: "alex@company.com", sent: "2 days ago" },
    { name: "Maria Garcia", email: "maria@company.com", sent: "5 days ago" },
  ];

  return (
    <div className="space-y-4">
      <motion.div 
        className="flex items-center gap-2 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0 }}
      >
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium text-sm">Pending Invitations</h4>
        <motion.span 
          className="px-1.5 py-0.5 bg-secondary rounded text-[10px]"
          animate={phase > 0.2 ? { scale: [1, 1.2, 1] } : {}}
        >
          2
        </motion.span>
      </motion.div>
      <div className="space-y-2">
        {invites.map((invite, i) => (
          <motion.div 
            key={invite.email}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: phase > 0.25 + i * 0.15 ? 1 : 0, x: phase > 0.25 + i * 0.15 ? 0 : -10 }}
            className="border rounded-lg p-3 flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {invite.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{invite.name}</p>
              <p className="text-xs text-muted-foreground">Sent {invite.sent}</p>
            </div>
            <div className="flex gap-1">
              <motion.button 
                className="p-1.5 rounded hover:bg-muted"
                whileHover={{ scale: 1.1 }}
              >
                <Mail className="h-4 w-4" />
              </motion.button>
              <button className="p-1.5 rounded hover:bg-muted text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.p 
        className="text-xs text-muted-foreground text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.7 ? 1 : 0 }}
      >
        Click email icon to resend invitation
      </motion.p>
    </div>
  );
};

// Step 9: Edit existing members
export const TeamStep9 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-4">
      <motion.div 
        className="text-center mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.1 ? 1 : 0 }}
      >
        <h4 className="font-semibold text-sm">Edit Team Member</h4>
      </motion.div>
      <AnimatedUserRow 
        name="Sarah Wilson" 
        email="sarah@company.com" 
        role="Manager" 
        status="active" 
        phase={phase} 
        revealPhase={0.15}
        highlighted
      />
      <AnimatedMockCard phase={phase} revealPhase={0.35}>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Change Role</label>
            <motion.div 
              className="border rounded px-3 py-2 text-sm flex justify-between"
              animate={phase > 0.5 && phase < 0.75 ? { 
                borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"]
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span>Manager → Admin</span>
              <span className="text-muted-foreground">▾</span>
            </motion.div>
          </div>
          <div className="flex gap-2">
            <AnimatedMockButton phase={phase} clickPhase={0.8} highlight={phase > 0.7} size="sm">
              Save Changes
            </AnimatedMockButton>
            <AnimatedMockButton phase={phase} variant="outline" size="sm">
              Remove
            </AnimatedMockButton>
          </div>
        </div>
      </AnimatedMockCard>
      <AnimatedSuccessToast message="Role updated to Admin!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 10: Search and filter
export const TeamStep10 = ({ phase = 0 }: StepProps) => {
  const filters = [
    { label: "All (7)", active: false },
    { label: "Active (5)", active: true },
    { label: "Pending (2)", active: false },
  ];

  return (
    <div className="space-y-4">
      <motion.div
        className="border rounded-lg px-3 py-2 flex items-center gap-2"
        animate={phase > 0.2 && phase < 0.5 ? { 
          borderColor: ["hsl(var(--border))", "hsl(var(--primary))", "hsl(var(--border))"]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Search by name, email, or role...</span>
      </motion.div>
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.3 ? 1 : 0 }}
      >
        {filters.map((filter, i) => (
          <motion.span
            key={filter.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
              filter.active ? "bg-primary text-primary-foreground" : "border hover:bg-muted"
            }`}
          >
            {filter.label}
          </motion.span>
        ))}
      </motion.div>
      <div className="space-y-2">
        <AnimatedUserRow name="John Smith" email="john@company.com" role="Admin" status="active" phase={phase} revealPhase={0.5} />
        <AnimatedUserRow name="Sarah Wilson" email="sarah@company.com" role="Manager" status="active" phase={phase} revealPhase={0.6} />
        <AnimatedUserRow name="Mike Brown" email="mike@company.com" role="Sales" status="active" phase={phase} revealPhase={0.7} />
      </div>
    </div>
  );
};
