# InterioApp Website Design Kit

A complete component library and design system for building the interioapp.com marketing website. This kit captures the AttendFlow-inspired animated, interactive design style.

## Table of Contents
1. [Design Tokens](#design-tokens)
2. [Tailwind Configuration](#tailwind-configuration)
3. [Core Components](#core-components)
4. [Animation Utilities](#animation-utilities)
5. [Usage Instructions](#usage-instructions)

---

## Design Tokens

### Color Palette (HSL format for Tailwind)

```css
:root {
  /* Primary Brand Colors */
  --primary: 262 83% 58%;           /* Purple #8B5CF6 */
  --primary-foreground: 0 0% 100%;
  
  /* Background Colors */
  --background: 0 0% 6%;            /* Dark #0F0F0F */
  --foreground: 0 0% 98%;
  
  /* Card/Surface Colors */
  --card: 0 0% 10%;                 /* Elevated #1A1A1A */
  --card-foreground: 0 0% 98%;
  
  /* Muted/Secondary */
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 45%;     /* #737373 */
  
  /* Border */
  --border: 0 0% 15%;               /* #262626 */
  
  /* Accent Colors */
  --accent: 262 83% 58%;
  --accent-foreground: 0 0% 100%;
  
  /* Status Colors */
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  --destructive: 0 84% 60%;
}
```

### Typography

```css
/* Font Stack */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Cal Sans', 'Inter', sans-serif; /* For headings */

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### Spacing Scale

```css
/* Consistent spacing */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-24: 6rem;     /* 96px */
```

---

## Tailwind Configuration

Add these to your `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## Core Components

### 1. FeatureCard Component

A hover-interactive card for feature grids.

```tsx
// src/components/website-kit/FeatureCard.tsx
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  className 
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "group relative bg-card rounded-xl p-6 border border-border/50",
      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
      "transition-all duration-300 ease-out",
      className
    )}>
      {/* Icon container */}
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
        "bg-primary/10 text-primary",
        "group-hover:bg-primary group-hover:text-primary-foreground",
        "transition-colors duration-300"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};
```

### 2. TooltipPointer Component

Animated floating tooltip for highlighting UI elements.

```tsx
// src/components/website-kit/TooltipPointer.tsx
import { cn } from '@/lib/utils';

interface TooltipPointerProps {
  label: string;
  description?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right';
  highlight?: boolean;
  className?: string;
  number?: number;
}

export const TooltipPointer = ({ 
  label, 
  description,
  position, 
  highlight = false,
  className,
  number
}: TooltipPointerProps) => {
  const positionClasses = {
    'top-left': 'bottom-full left-0 mb-2',
    'top-right': 'bottom-full right-0 mb-2',
    'bottom-left': 'top-full left-0 mt-2',
    'bottom-right': 'top-full right-0 mt-2',
    'left': 'right-full top-1/2 -translate-y-1/2 mr-2',
    'right': 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    'top-left': 'top-full left-4 border-t-primary',
    'top-right': 'top-full right-4 border-t-primary',
    'bottom-left': 'bottom-full left-4 border-b-primary',
    'bottom-right': 'bottom-full right-4 border-b-primary',
    'left': 'left-full top-1/2 -translate-y-1/2 border-l-primary',
    'right': 'right-full top-1/2 -translate-y-1/2 border-r-primary',
  };

  return (
    <div className={cn(
      "absolute z-10",
      positionClasses[position],
      className
    )}>
      <div className={cn(
        "relative px-3 py-2 rounded-lg shadow-lg",
        "bg-primary text-primary-foreground",
        "animate-pulse-subtle",
        highlight && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
      )}>
        {/* Number badge */}
        {number && (
          <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
            {number}
          </span>
        )}
        
        <p className="text-sm font-medium whitespace-nowrap">{label}</p>
        {description && (
          <p className="text-xs opacity-90 mt-0.5 max-w-[200px]">{description}</p>
        )}
        
        {/* Arrow */}
        <div className={cn(
          "absolute w-0 h-0",
          "border-4 border-transparent",
          arrowClasses[position]
        )} />
      </div>
    </div>
  );
};
```

### 3. FlowDiagram Component

Animated step-by-step flow visualization.

```tsx
// src/components/website-kit/FlowDiagram.tsx
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FlowStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FlowDiagramProps {
  title?: string;
  steps: FlowStep[];
  className?: string;
}

const FlowStepItem = ({ 
  icon, 
  title, 
  description, 
  delay, 
  isLast 
}: FlowStep & { delay: number; isLast: boolean }) => (
  <div className="flex items-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 text-primary">
        {icon}
      </div>
      <h4 className="font-semibold text-foreground text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-[120px]">{description}</p>
    </motion.div>
    
    {!isLast && (
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: delay + 0.2 }}
        className="mx-4 flex-shrink-0"
      >
        <ArrowRight className="w-6 h-6 text-primary/50" />
      </motion.div>
    )}
  </div>
);

export const FlowDiagram = ({ title, steps, className }: FlowDiagramProps) => {
  return (
    <div className={cn("py-8", className)}>
      {title && (
        <motion.h3
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-lg font-semibold text-center mb-8 text-foreground"
        >
          {title}
        </motion.h3>
      )}
      
      <div className="flex flex-wrap justify-center items-start gap-2">
        {steps.map((step, index) => (
          <FlowStepItem
            key={step.title}
            {...step}
            delay={index * 0.15}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
      
      {/* Connection line (desktop) */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="hidden lg:block h-0.5 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 mx-auto mt-6 max-w-2xl"
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
};
```

### 4. InteractiveShowcase Component

Main showcase component with animated form fields and tooltips.

```tsx
// src/components/website-kit/InteractiveShowcase.tsx
import { motion } from 'framer-motion';
import { TooltipPointer } from './TooltipPointer';
import { cn } from '@/lib/utils';

interface ShowcaseField {
  icon: React.ReactNode;
  label: string;
  value: string;
  tooltip?: {
    label: string;
    description?: string;
    position: 'left' | 'right';
  };
}

interface InteractiveShowcaseProps {
  title?: string;
  fields: ShowcaseField[];
  className?: string;
}

export const InteractiveShowcase = ({ 
  title, 
  fields, 
  className 
}: InteractiveShowcaseProps) => {
  return (
    <div className={cn(
      "relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 overflow-hidden",
      className
    )}>
      {/* Window header */}
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-warning/50" />
          <div className="w-3 h-3 rounded-full bg-success/50" />
        </div>
        {title && (
          <span className="text-sm text-muted-foreground ml-2">{title}</span>
        )}
      </div>
      
      {/* Showcase fields */}
      <div className="space-y-4">
        {fields.map((field, index) => (
          <motion.div
            key={field.label}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative"
          >
            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                {field.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{field.label}</p>
                <p className="text-sm font-medium text-foreground truncate">{field.value}</p>
              </div>
            </div>
            
            {/* Tooltip */}
            {field.tooltip && (
              <TooltipPointer
                label={field.tooltip.label}
                description={field.tooltip.description}
                position={field.tooltip.position}
                className={field.tooltip.position === 'left' ? '-left-4' : '-right-4'}
              />
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Decorative gradient */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
```

---

## Animation Utilities

### Scroll-triggered animations

```tsx
// Hook for scroll-based animations
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  
  return { ref, isInView };
};

// Usage:
const { ref, isInView } = useScrollAnimation();

<div 
  ref={ref}
  className={cn(
    "transition-all duration-700",
    isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
  )}
>
  Content here
</div>
```

### Staggered children animation

```tsx
// Framer Motion variants for staggered children
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Usage:
<motion.div
  variants={containerVariants}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

---

## Usage Instructions

### For Your interioapp.com Project

1. **Add to Custom Knowledge**
   - Open your interioapp.com Lovable project
   - Go to Settings → Manage Knowledge
   - Paste this entire document as custom knowledge

2. **Request Components**
   ```
   "Using the Website Design Kit, create a hero section 
   with an interactive dashboard mockup"
   ```

3. **Reference Specific Components**
   ```
   "Create a FeatureCard grid showing 6 features using 
   the design kit pattern"
   ```

### Required Dependencies

Ensure these are installed in your website project:
- `framer-motion` - For animations
- `lucide-react` - For icons
- `tailwindcss-animate` - For CSS animations
- `clsx` and `tailwind-merge` - For className utilities

### File Structure

```
src/
├── components/
│   └── website/
│       ├── FeatureCard.tsx
│       ├── TooltipPointer.tsx
│       ├── FlowDiagram.tsx
│       ├── InteractiveShowcase.tsx
│       ├── mockups/
│       │   ├── DashboardMockup.tsx
│       │   ├── ClientsMockup.tsx
│       │   ├── JobsMockup.tsx
│       │   └── ...
│       └── sections/
│           ├── HeroSection.tsx
│           ├── FeatureShowcase.tsx
│           └── ...
├── pages/
│   ├── HomePage.tsx
│   ├── FeaturesPage.tsx
│   └── PricingPage.tsx
└── lib/
    └── utils.ts
```
