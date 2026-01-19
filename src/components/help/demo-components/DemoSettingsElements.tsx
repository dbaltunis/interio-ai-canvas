/**
 * DemoSettingsElements - Reusable animated mock components for Settings tutorials
 * These provide phase-based animations for a consistent, professional experience
 */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Info, ChevronDown, LucideIcon } from "lucide-react";

// Helper function for typing animation (same as MessagesSteps)
export const typingProgress = (
  phase: number,
  startPhase: number,
  endPhase: number,
  text: string
): string => {
  if (phase < startPhase) return "";
  if (phase >= endPhase) return text;
  const progress = (phase - startPhase) / (endPhase - startPhase);
  const charCount = Math.floor(progress * text.length);
  return text.slice(0, charCount);
};

interface AnimatedMockInputProps {
  label: string;
  value?: string;
  placeholder?: string;
  icon?: LucideIcon;
  phase: number;
  startPhase?: number;
  endPhase?: number;
  highlight?: boolean;
  tooltip?: string;
  disabled?: boolean;
  type?: "text" | "password";
}

export const AnimatedMockInput: React.FC<AnimatedMockInputProps> = ({
  label,
  value = "",
  placeholder,
  icon: Icon,
  phase,
  startPhase = 0,
  endPhase = 1,
  highlight = false,
  tooltip,
  disabled = false,
  type = "text",
}) => {
  const isTyping = phase >= startPhase && phase < endPhase;
  const isComplete = phase >= endPhase;
  const typedValue = typingProgress(phase, startPhase, endPhase, value);
  const showValue = isTyping || isComplete;
  const displayValue = type === "password" ? "•".repeat(typedValue.length || 8) : typedValue;

  return (
    <motion.div 
      className="space-y-1"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-1">
        <label className="text-xs text-muted-foreground">{label}</label>
        {tooltip && <Info className="h-3 w-3 text-muted-foreground" />}
      </div>
      <motion.div
        className={`flex items-center gap-2 bg-background border rounded px-2 py-1.5 text-xs transition-colors ${
          isTyping ? "ring-2 ring-primary border-primary" : 
          highlight ? "ring-2 ring-primary animate-pulse border-primary" : 
          "border-border"
        } ${disabled ? "opacity-60" : ""}`}
        animate={isTyping ? { scale: [1, 1.01, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        <span className={showValue && displayValue ? "text-foreground" : "text-muted-foreground"}>
          {showValue && displayValue ? displayValue : placeholder}
        </span>
        {isTyping && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="inline-block w-0.5 h-3 bg-primary ml-0.5"
          />
        )}
      </motion.div>
    </motion.div>
  );
};

interface AnimatedMockToggleProps {
  label: string;
  description?: string;
  checked?: boolean;
  phase: number;
  flipPhase?: number;
  highlight?: boolean;
}

export const AnimatedMockToggle: React.FC<AnimatedMockToggleProps> = ({
  label,
  description,
  checked = false,
  phase,
  flipPhase = 0.5,
  highlight = false,
}) => {
  const isFlipping = phase >= flipPhase && phase < flipPhase + 0.15;
  const isOn = phase >= flipPhase ? !checked : checked;

  return (
    <motion.div
      className={`flex items-center justify-between py-2 px-2 rounded transition-colors ${
        highlight || isFlipping ? "bg-primary/10" : ""
      }`}
      animate={isFlipping ? { scale: [1, 1.02, 1] } : {}}
    >
      <div>
        <span className="text-xs font-medium">{label}</span>
        {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
      </div>
      <motion.div
        className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${
          isOn ? "bg-primary" : "bg-muted"
        }`}
        animate={isFlipping ? { scale: [1, 1.1, 1] } : {}}
      >
        <motion.div
          className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm"
          animate={{ left: isOn ? "calc(100% - 14px)" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </motion.div>
  );
};

interface AnimatedMockButtonProps {
  children: React.ReactNode;
  phase: number;
  clickPhase?: number;
  variant?: "primary" | "secondary" | "outline";
  size?: "default" | "sm";
  highlight?: boolean;
  icon?: LucideIcon;
}

export const AnimatedMockButton: React.FC<AnimatedMockButtonProps> = ({
  children,
  phase,
  clickPhase = 0.8,
  variant = "primary",
  size = "default",
  highlight = false,
  icon: Icon,
}) => {
  const isClicking = phase >= clickPhase && phase < clickPhase + 0.1;
  const isGlowing = highlight && phase >= clickPhase - 0.2;

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 rounded text-xs font-medium cursor-pointer ${
        size === "sm" ? "px-2 py-1" : "px-3 py-1.5"
      } ${
        variant === "primary"
          ? "bg-primary text-primary-foreground"
          : variant === "outline"
          ? "border border-border bg-background text-foreground"
          : "bg-secondary text-secondary-foreground"
      } ${isGlowing ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
      animate={
        isClicking
          ? { scale: [1, 0.95, 1.05, 1] }
          : isGlowing
          ? { scale: [1, 1.03, 1] }
          : {}
      }
      transition={{
        duration: isClicking ? 0.3 : 0.6,
        repeat: isGlowing && !isClicking ? Infinity : 0,
      }}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </motion.div>
  );
};

interface AnimatedSuccessToastProps {
  message: string;
  phase: number;
  showPhase?: number;
}

export const AnimatedSuccessToast: React.FC<AnimatedSuccessToastProps> = ({
  message,
  phase,
  showPhase = 0.85,
}) => {
  const isVisible = phase >= showPhase;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, delay: 0.1 }}
            className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center"
          >
            <Check className="h-3 w-3 text-green-500" />
          </motion.div>
          <span className="text-xs text-green-600 dark:text-green-400">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface AnimatedFormSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  phase: number;
  revealPhase?: number;
  showEdit?: boolean;
}

export const AnimatedFormSection: React.FC<AnimatedFormSectionProps> = ({
  title,
  icon: Icon,
  children,
  phase,
  revealPhase = 0.1,
  showEdit = false,
}) => {
  const isVisible = phase >= revealPhase;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 10,
        scale: isVisible ? 1 : 0.98,
      }}
      transition={{ duration: 0.3 }}
      className="bg-card border border-border rounded-lg p-3"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={isVisible ? { scale: [0.8, 1.1, 1] } : {}}
            transition={{ duration: 0.4 }}
          >
            <Icon className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-muted-foreground"
          >
            Edit
          </motion.div>
        )}
      </div>
      {children}
    </motion.div>
  );
};

interface AnimatedMockSelectProps {
  label: string;
  value: string;
  options: string[];
  phase: number;
  openPhase?: number;
  selectPhase?: number;
  highlight?: boolean;
}

export const AnimatedMockSelect: React.FC<AnimatedMockSelectProps> = ({
  label,
  value,
  options,
  phase,
  openPhase = 0.3,
  selectPhase = 0.6,
  highlight = false,
}) => {
  const isOpening = phase >= openPhase && phase < selectPhase;
  const isSelected = phase >= selectPhase;

  return (
    <div className="space-y-1">
      {label && <label className="text-xs text-muted-foreground">{label}</label>}
      <motion.div
        className={`flex items-center justify-between bg-background border rounded px-2 py-1.5 text-xs cursor-pointer ${
          isOpening || highlight
            ? "ring-2 ring-primary border-primary"
            : "border-border"
        }`}
        animate={isOpening ? { scale: [1, 1.02, 1] } : {}}
      >
        <span className="text-foreground">{value}</span>
        <motion.div animate={{ rotate: isOpening ? 180 : 0 }}>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {isOpening && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            className="border border-border rounded mt-1 bg-popover text-xs overflow-hidden shadow-md"
          >
            {options.slice(0, 4).map((opt, i) => (
              <motion.div
                key={opt}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`px-2 py-1.5 transition-colors ${
                  opt === value ? "bg-accent" : "hover:bg-accent"
                }`}
              >
                {opt}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AnimatedMockAvatarProps {
  phase: number;
  highlightPhase?: number;
  uploadPhase?: number;
}

export const AnimatedMockAvatar: React.FC<AnimatedMockAvatarProps> = ({
  phase,
  highlightPhase = 0.3,
  uploadPhase = 0.7,
}) => {
  const isHighlighted = phase >= highlightPhase && phase < uploadPhase;
  const isUploading = phase >= uploadPhase && phase < uploadPhase + 0.15;
  const isComplete = phase >= uploadPhase + 0.15;

  return (
    <motion.div
      className="relative"
      animate={isHighlighted ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.5, repeat: isHighlighted ? Infinity : 0 }}
    >
      <motion.div
        className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${
          isHighlighted ? "ring-2 ring-primary" : ""
        } ${isComplete ? "bg-primary/20" : "bg-muted"}`}
        animate={isUploading ? { scale: [1, 0.95, 1.05, 1] } : {}}
      >
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-primary font-bold text-lg"
          >
            JS
          </motion.div>
        ) : isUploading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-muted-foreground/30" />
        )}
      </motion.div>
      <motion.div
        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
        animate={isHighlighted ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.4, repeat: isHighlighted ? Infinity : 0 }}
      >
        {isComplete ? (
          <Check className="h-3 w-3 text-primary-foreground" />
        ) : (
          <span className="text-primary-foreground text-[10px]">+</span>
        )}
      </motion.div>
    </motion.div>
  );
};

interface AnimatedPasswordStrengthProps {
  phase: number;
  startPhase?: number;
}

export const AnimatedPasswordStrength: React.FC<AnimatedPasswordStrengthProps> = ({
  phase,
  startPhase = 0.3,
}) => {
  const progress = phase >= startPhase ? Math.min((phase - startPhase) / 0.4, 1) : 0;
  const bars = Math.ceil(progress * 4);
  const strength = bars <= 1 ? "Weak" : bars <= 2 ? "Fair" : bars <= 3 ? "Good" : "Strong";
  const color = bars <= 1 ? "bg-red-500" : bars <= 2 ? "bg-yellow-500" : bars <= 3 ? "bg-blue-500" : "bg-green-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: phase >= startPhase ? 1 : 0, y: phase >= startPhase ? 0 : 5 }}
      className="flex items-center gap-2"
    >
      {[1, 2, 3, 4].map((bar) => (
        <motion.div
          key={bar}
          className={`flex-1 h-1.5 rounded ${bar <= bars ? color : "bg-muted"}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: bar <= bars ? 1 : 0.3 }}
          transition={{ delay: bar * 0.1, duration: 0.2 }}
        />
      ))}
      <span
        className={`text-xs font-medium ${
          bars <= 1 ? "text-red-500" : bars <= 2 ? "text-yellow-500" : bars <= 3 ? "text-blue-500" : "text-green-500"
        }`}
      >
        {phase >= startPhase ? strength : ""}
      </span>
    </motion.div>
  );
};

interface AnimatedMockCardProps {
  children: React.ReactNode;
  phase?: number;
  revealPhase?: number;
  className?: string;
}

export const AnimatedMockCard: React.FC<AnimatedMockCardProps> = ({
  children,
  phase = 1,
  revealPhase = 0,
  className = "",
}) => {
  const isVisible = phase >= revealPhase;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 10 }}
      className={`bg-card border border-border rounded-lg p-3 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Preview box with animated values
interface AnimatedPreviewBoxProps {
  items: Array<{ label: string; value: string }>;
  phase: number;
  startPhase?: number;
}

export const AnimatedPreviewBox: React.FC<AnimatedPreviewBoxProps> = ({
  items,
  phase,
  startPhase = 0.5,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: phase >= startPhase ? 1 : 0, scale: phase >= startPhase ? 1 : 0.98 }}
      className="bg-muted rounded p-3 space-y-2 text-xs"
    >
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: phase >= startPhase + i * 0.05 ? 1 : 0, x: phase >= startPhase + i * 0.05 ? 0 : -10 }}
          className="flex justify-between"
        >
          <span className="text-muted-foreground">{item.label}:</span>
          <span className="font-medium">{item.value}</span>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Logo upload component with animation
interface AnimatedLogoUploadProps {
  phase: number;
  highlightPhase?: number;
  uploadPhase?: number;
}

export const AnimatedLogoUpload: React.FC<AnimatedLogoUploadProps> = ({
  phase,
  highlightPhase = 0.3,
  uploadPhase = 0.6,
}) => {
  const isHighlighted = phase >= highlightPhase && phase < uploadPhase;
  const isUploading = phase >= uploadPhase && phase < uploadPhase + 0.2;
  const isComplete = phase >= uploadPhase + 0.2;

  return (
    <motion.div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
        isHighlighted ? "border-primary bg-primary/5" : "border-border"
      } ${isComplete ? "border-green-500/50 bg-green-500/5" : ""}`}
      animate={isHighlighted ? { scale: [1, 1.01, 1] } : {}}
      transition={{ duration: 0.5, repeat: isHighlighted ? Infinity : 0 }}
    >
      <motion.div
        className="w-12 h-12 rounded bg-muted mx-auto mb-2 flex items-center justify-center overflow-hidden"
        animate={isUploading ? { scale: [1, 1.1, 1] } : {}}
      >
        {isComplete ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center"
          >
            <span className="text-primary font-bold text-sm">EI</span>
          </motion.div>
        ) : isUploading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
          />
        ) : (
          <div className="w-6 h-6 text-muted-foreground">□</div>
        )}
      </motion.div>
      <p className="text-xs text-muted-foreground mb-2">
        {isComplete ? "Logo uploaded!" : "Drop logo here or click to upload"}
      </p>
      {!isComplete && (
        <motion.div
          className={`inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded text-xs ${
            isHighlighted ? "ring-2 ring-primary/50" : ""
          }`}
          animate={isHighlighted ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.4, repeat: isHighlighted ? Infinity : 0 }}
        >
          Upload Logo
        </motion.div>
      )}
    </motion.div>
  );
};
