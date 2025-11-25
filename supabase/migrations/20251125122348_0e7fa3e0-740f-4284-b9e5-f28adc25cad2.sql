
-- Phase 2: Clean cross-account data pollution
-- Delete option_values where account_id doesn't match parent treatment_option account_id
-- (excluding system defaults which can have different accounts)
DELETE FROM option_values
WHERE id IN (
  SELECT ov.id
  FROM option_values ov
  JOIN treatment_options to_opt ON ov.option_id = to_opt.id
  WHERE ov.account_id != to_opt.account_id
    AND to_opt.is_system_default = false
    AND ov.is_system_default = false
);
