// Utility to convert hardcoded colors to semantic tokens
export const getSemanticBadgeColor = (type: string, variant: 'primary' | 'secondary' | 'accent' | 'muted' = 'secondary') => {
  const baseStyles = "border";
  
  switch (variant) {
    case 'primary':
      return `${baseStyles} bg-primary/10 text-primary border-primary/20`;
    case 'accent':
      return `${baseStyles} bg-accent/10 text-accent border-accent/20`;
    case 'muted':
      return `${baseStyles} bg-muted text-muted-foreground border-border`;
    default:
      return `${baseStyles} bg-secondary/10 text-secondary-foreground border-secondary/20`;
  }
};

export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'active':
    case 'success':
      return 'bg-success/10 text-success border-success/20';
    case 'in_progress':
    case 'processing':
      return 'bg-primary/10 text-primary border-primary/20';
    case 'planning':
    case 'draft':
      return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
    case 'on_hold':
    case 'inactive':
      return 'bg-muted text-muted-foreground border-border';
    case 'cancelled':
    case 'failed':
    case 'error':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'warning':
      return 'bg-warning/10 text-warning border-warning/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    case 'medium':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'low':
      return 'bg-success/10 text-success border-success/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

// Replace hardcoded text colors with semantic ones
export const getTextColor = (type: 'primary' | 'secondary' | 'muted' | 'default' = 'default') => {
  switch (type) {
    case 'primary':
      return 'text-primary';
    case 'secondary':
      return 'text-secondary-foreground';
    case 'muted':
      return 'text-muted-foreground';
    default:
      return 'text-foreground';
  }
};

// Replace hardcoded background colors with semantic ones
export const getBackgroundColor = (type: 'primary' | 'secondary' | 'muted' | 'card' | 'background' = 'background') => {
  switch (type) {
    case 'primary':
      return 'bg-primary/10';
    case 'secondary':
      return 'bg-secondary/10';
    case 'muted':
      return 'bg-muted';
    case 'card':
      return 'bg-card';
    default:
      return 'bg-background';
  }
};