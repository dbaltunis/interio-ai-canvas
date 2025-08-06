import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccountSettings, useUpdateAccountSettings } from "@/hooks/useAccountSettings";
import { Save, Building2 } from "lucide-react";

const accountSettingsSchema = z.object({
  account_name: z.string().min(1, "Account name is required"),
  industry: z.string().optional(),
  timezone: z.string().min(1, "Timezone is required"),
  default_currency: z.string().min(1, "Currency is required"),
  billing_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  max_child_accounts: z.number().min(0, "Must be 0 or greater"),
});

type AccountSettingsFormData = z.infer<typeof accountSettingsSchema>;

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "NZD", label: "New Zealand Dollar (NZD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
];

const industries = [
  { value: "interior_design", label: "Interior Design" },
  { value: "window_treatments", label: "Window Treatments" },
  { value: "home_improvement", label: "Home Improvement" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "consulting", label: "Consulting" },
  { value: "other", label: "Other" },
];

export const AccountSettingsForm = () => {
  const { data: accountSettings, isLoading } = useAccountSettings();
  const updateAccountSettings = useUpdateAccountSettings();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset
  } = useForm<AccountSettingsFormData>({
    resolver: zodResolver(accountSettingsSchema),
    defaultValues: {
      account_name: "",
      industry: "",
      timezone: "UTC",
      default_currency: "USD",
      billing_email: "",
      max_child_accounts: 5,
    }
  });

  useEffect(() => {
    if (accountSettings) {
      reset({
        account_name: accountSettings.account_name,
        industry: accountSettings.industry || "",
        timezone: accountSettings.timezone,
        default_currency: accountSettings.default_currency,
        billing_email: accountSettings.billing_email || "",
        max_child_accounts: accountSettings.max_child_accounts,
      });
    }
  }, [accountSettings, reset]);

  const onSubmit = async (data: AccountSettingsFormData) => {
    await updateAccountSettings.mutateAsync({
      ...data,
      billing_email: data.billing_email || null,
      industry: data.industry || null,
    });
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="account_name">Account Name *</Label>
          <Input
            id="account_name"
            {...register("account_name")}
            placeholder="Your organization name"
          />
          {errors.account_name && (
            <p className="text-sm text-destructive">{errors.account_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select value={watch("industry")} onValueChange={(value) => setValue("industry", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone *</Label>
          <Select value={watch("timezone")} onValueChange={(value) => setValue("timezone", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((timezone) => (
                <SelectItem key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.timezone && (
            <p className="text-sm text-destructive">{errors.timezone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="default_currency">Default Currency *</Label>
          <Select value={watch("default_currency")} onValueChange={(value) => setValue("default_currency", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.default_currency && (
            <p className="text-sm text-destructive">{errors.default_currency.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing_email">Billing Email</Label>
          <Input
            id="billing_email"
            type="email"
            {...register("billing_email")}
            placeholder="billing@company.com"
          />
          {errors.billing_email && (
            <p className="text-sm text-destructive">{errors.billing_email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_child_accounts">Max Child Accounts</Label>
          <Input
            id="max_child_accounts"
            type="number"
            {...register("max_child_accounts", { valueAsNumber: true })}
            min="0"
          />
          {errors.max_child_accounts && (
            <p className="text-sm text-destructive">{errors.max_child_accounts.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={!isDirty || updateAccountSettings.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {updateAccountSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
};