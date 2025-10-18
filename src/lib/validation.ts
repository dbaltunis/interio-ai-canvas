import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(255, "Email must be less than 255 characters")
  .email("Invalid email address")
  .refine((email) => {
    // Additional validation: no consecutive dots
    return !/\.\./.test(email);
  }, "Email cannot contain consecutive dots")
  .refine((email) => {
    // No leading/trailing dots
    return !/^\./.test(email) && !/\.$/.test(email);
  }, "Email cannot start or end with a dot");

// Phone number schema
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .max(20, "Phone number must be less than 20 characters")
  .refine((phone) => {
    // Allow only numbers, spaces, dashes, parentheses, and + at the start
    return /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/.test(phone);
  }, "Invalid phone number format");

// Name validation schema
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .refine((name) => {
    // No special characters except spaces, hyphens, apostrophes
    return /^[a-zA-Z\s'-]+$/.test(name);
  }, "Name can only contain letters, spaces, hyphens, and apostrophes");

// Company name schema
export const companyNameSchema = z
  .string()
  .trim()
  .max(200, "Company name must be less than 200 characters")
  .optional()
  .refine((name) => {
    if (!name) return true;
    // Allow alphanumeric and common business characters
    return /^[a-zA-Z0-9\s&.,'-]+$/.test(name);
  }, "Company name contains invalid characters");

// Address schema
export const addressSchema = z
  .string()
  .trim()
  .max(500, "Address must be less than 500 characters")
  .optional()
  .refine((addr) => {
    if (!addr) return true;
    // Basic validation - no HTML tags
    return !/<[^>]*>/g.test(addr);
  }, "Address contains invalid characters");

// Notes/Description schema
export const notesSchema = z
  .string()
  .trim()
  .max(5000, "Notes must be less than 5000 characters")
  .optional()
  .refine((notes) => {
    if (!notes) return true;
    // No HTML tags, no script tags
    return !/<script[^>]*>.*?<\/script>/gi.test(notes) && !/<[^>]*>/g.test(notes);
  }, "Notes contain invalid characters");

// URL schema
export const urlSchema = z
  .string()
  .trim()
  .max(2000, "URL must be less than 2000 characters")
  .optional()
  .refine((url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, "Invalid URL format");

// Client form schema
export const clientFormSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().or(z.literal("")),
  phone: phoneSchema.optional().or(z.literal("")),
  company_name: companyNameSchema,
  contact_person: nameSchema.optional().or(z.literal("")),
  address: addressSchema,
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(100).optional().or(z.literal("")),
  zip_code: z.string().trim().max(20).optional().or(z.literal("")),
  country: z.string().trim().max(100).optional().or(z.literal("")),
  notes: notesSchema,
  client_type: z.enum(["B2C", "B2B"]).default("B2C"),
  funnel_stage: z.enum([
    "lead",
    "contacted", 
    "qualified",
    "measuring_scheduled",
    "quoted",
    "approved",
    "lost"
  ]).default("lead"),
});

// Project form schema
export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(200),
  client_id: z.string().uuid("Invalid client selected"),
  job_number: z.string().trim().max(50).optional().or(z.literal("")),
  status: z.enum(["planning", "in_progress", "completed", "cancelled"]).default("planning"),
  project_type: z.string().trim().max(100).optional().or(z.literal("")),
  notes: notesSchema,
});

// Email template schema
export const emailTemplateSchema = z.object({
  name: z.string().trim().min(1, "Template name is required").max(200),
  subject: z.string().trim().min(1, "Subject is required").max(500),
  content: z.string().trim().min(1, "Content is required").max(50000),
  category: z.string().trim().max(50).optional().or(z.literal("")),
});

// Sanitize function for user input
export const sanitizeInput = (input: string, maxLength: number = 10000): string => {
  if (!input) return "";
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
};

// Sanitize phone number
export const sanitizePhoneNumber = (phone: string): string => {
  if (!phone) return "";
  
  // Remove all non-numeric characters except + at start
  let sanitized = phone.replace(/[^0-9+]/g, "");
  
  // Ensure + is only at start
  const hasPlus = sanitized.startsWith("+");
  sanitized = sanitized.replace(/\+/g, "");
  if (hasPlus) sanitized = "+" + sanitized;
  
  return sanitized;
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
};
