-- ============================================
-- Automated Sequence Corruption Fix for ALL Users
-- ============================================
-- This migration detects and fixes corrupted number sequences
-- where next_number has abnormally high values (> 100000)
-- causing truncation issues with document numbers.
-- 
-- It only considers document numbers with ≤ 6 digit numeric parts
-- to exclude timestamp-based job numbers.

-- Fix corrupted JOB sequences
UPDATE number_sequences ns
SET 
  next_number = COALESCE(
    (SELECT MAX(extracted_num) + 1
     FROM (
       SELECT NULLIF(REGEXP_REPLACE(p.job_number, '[^0-9]', '', 'g'), '')::BIGINT as extracted_num
       FROM projects p 
       WHERE p.user_id = ns.user_id
       AND p.job_number ~ '^[A-Z]+-[0-9]+$'
       AND LENGTH(REGEXP_REPLACE(p.job_number, '[^0-9]', '', 'g')) <= 6
     ) sub
     WHERE extracted_num IS NOT NULL),
    1
  ),
  padding = GREATEST(ns.padding, 4)
WHERE ns.next_number > 100000
  AND ns.entity_type = 'job';

-- Fix corrupted INVOICE sequences  
UPDATE number_sequences ns
SET 
  next_number = COALESCE(
    (SELECT MAX(extracted_num) + 1
     FROM (
       SELECT NULLIF(REGEXP_REPLACE(q.invoice_number, '[^0-9]', '', 'g'), '')::BIGINT as extracted_num
       FROM quotes q 
       WHERE q.user_id = ns.user_id
       AND q.invoice_number ~ '^[A-Z]+-[0-9]+$'
       AND LENGTH(REGEXP_REPLACE(q.invoice_number, '[^0-9]', '', 'g')) <= 6
     ) sub
     WHERE extracted_num IS NOT NULL),
    1
  ),
  padding = GREATEST(ns.padding, 4)
WHERE ns.next_number > 100000
  AND ns.entity_type = 'invoice';

-- Fix corrupted QUOTE sequences
UPDATE number_sequences ns
SET 
  next_number = COALESCE(
    (SELECT MAX(extracted_num) + 1
     FROM (
       SELECT NULLIF(REGEXP_REPLACE(q.quote_number, '[^0-9]', '', 'g'), '')::BIGINT as extracted_num
       FROM quotes q 
       WHERE q.user_id = ns.user_id
       AND q.status = 'quote'
       AND q.quote_number ~ '^[A-Z]+-[0-9]+$'
       AND LENGTH(REGEXP_REPLACE(q.quote_number, '[^0-9]', '', 'g')) <= 6
     ) sub
     WHERE extracted_num IS NOT NULL),
    1
  ),
  padding = GREATEST(ns.padding, 4)
WHERE ns.next_number > 100000
  AND ns.entity_type = 'quote';

-- Fix corrupted DRAFT sequences
UPDATE number_sequences ns
SET 
  next_number = COALESCE(
    (SELECT MAX(extracted_num) + 1
     FROM (
       SELECT NULLIF(REGEXP_REPLACE(q.quote_number, '[^0-9]', '', 'g'), '')::BIGINT as extracted_num
       FROM quotes q 
       WHERE q.user_id = ns.user_id
       AND q.status = 'draft'
       AND q.quote_number ~ '^[A-Z]+-[0-9]+$'
       AND LENGTH(REGEXP_REPLACE(q.quote_number, '[^0-9]', '', 'g')) <= 6
     ) sub
     WHERE extracted_num IS NOT NULL),
    1
  ),
  padding = GREATEST(ns.padding, 4)
WHERE ns.next_number > 100000
  AND ns.entity_type = 'draft';

-- Fix corrupted ORDER sequences
UPDATE number_sequences ns
SET 
  next_number = COALESCE(
    (SELECT MAX(extracted_num) + 1
     FROM (
       SELECT NULLIF(REGEXP_REPLACE(q.order_number, '[^0-9]', '', 'g'), '')::BIGINT as extracted_num
       FROM quotes q 
       WHERE q.user_id = ns.user_id
       AND q.order_number ~ '^[A-Z]+-[0-9]+$'
       AND LENGTH(REGEXP_REPLACE(q.order_number, '[^0-9]', '', 'g')) <= 6
     ) sub
     WHERE extracted_num IS NOT NULL),
    1
  ),
  padding = GREATEST(ns.padding, 4)
WHERE ns.next_number > 100000
  AND ns.entity_type = 'order';