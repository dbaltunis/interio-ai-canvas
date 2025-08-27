import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Shield, 
  Bell, 
  Mail, 
  Smartphone, 
  Globe,
  Save,
  RefreshCw,
  Check,
  X
} from 'lucide-react';

interface SettingsCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  status?: 'enabled' | 'disabled' | 'pending';
}

export const SettingsCard = ({ 
  title, 
  description, 
  icon, 
  children, 
  className,
  status 
}: SettingsCardProps) => {
  return (
    <Card className={cn("hover-lift transition-all duration-300", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 bg-primary/10 rounded-lg">
                {icon}
              </div>
            )}
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">{title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
          </div>
          {status && (
            <StatusIndicator 
              status={status === 'enabled' ? 'success' : status === 'disabled' ? 'error' : 'warning'}
              size="sm"
            >
              {status}
            </StatusIndicator>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const SettingsSection = ({ 
  title, 
  description, 
  children, 
  className 
}: SettingsSectionProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const SettingsToggle = ({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  icon
}: SettingsToggleProps) => {
  return (
    <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-border transition-colors">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-1.5 bg-muted rounded">
            {icon}
          </div>
        )}
        <div>
          <Label htmlFor={label} className="text-sm font-medium text-foreground cursor-pointer">
            {label}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <Switch
        id={label}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
};

interface SettingsInputProps {
  label: string;
  description?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
}

export const SettingsInput = ({
  label,
  description,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  required
}: SettingsInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      <Input
        id={label}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
};

interface SettingsActionProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  variant?: 'default' | 'destructive' | 'success';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const SettingsAction = ({
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
  loading,
  icon
}: SettingsActionProps) => {
  const variantClasses = {
    default: 'text-foreground',
    destructive: 'text-red-600',
    success: 'text-green-600'
  };

  const buttonVariant = variant === 'destructive' ? 'destructive' : 'default';

  return (
    <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-border transition-colors">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={cn(
            "p-2 rounded-lg",
            variant === 'destructive' && "bg-red-500/10",
            variant === 'success' && "bg-green-500/10",
            variant === 'default' && "bg-primary/10"
          )}>
            {icon}
          </div>
        )}
        <div>
          <h4 className={cn("text-sm font-medium", variantClasses[variant])}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {description}
          </p>
        </div>
      </div>
      <Button
        onClick={onAction}
        variant={buttonVariant}
        size="sm"
        disabled={loading}
        className="hover-lift interactive-bounce"
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          actionLabel
        )}
      </Button>
    </div>
  );
};