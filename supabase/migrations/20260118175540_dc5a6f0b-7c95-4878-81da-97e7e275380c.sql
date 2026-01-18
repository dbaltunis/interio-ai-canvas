-- Add total_selling column to windows_summary for storing pre-calculated selling prices
ALTER TABLE windows_summary 
ADD COLUMN IF NOT EXISTS total_selling NUMERIC DEFAULT 0;