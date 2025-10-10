-- Fix search_path security warnings for the two new functions
ALTER FUNCTION seed_system_option_types() SET search_path = public;
ALTER FUNCTION seed_roller_blind_defaults() SET search_path = public;