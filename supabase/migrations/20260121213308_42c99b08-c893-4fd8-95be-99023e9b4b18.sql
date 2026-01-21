-- Enable unlimited seats for InterioApp_Australasia (Daniel's test account)
INSERT INTO account_feature_flags (user_id, feature_key, enabled, config)
VALUES (
  'b0c727dd-b9bf-4470-840d-1f630e8f2b26',
  'unlimited_seats',
  true,
  '{"reason": "Australasia market trial - unlimited team members"}'::jsonb
)
ON CONFLICT (user_id, feature_key) 
DO UPDATE SET 
  enabled = true, 
  config = '{"reason": "Australasia market trial - unlimited team members"}'::jsonb,
  updated_at = now();

-- Configure Greg's CCCO account - active subscription with 6 seats
UPDATE user_subscriptions
SET 
  status = 'active',
  subscription_type = 'invoice',
  total_users = 6,
  admin_notes = 'Greg - 6 user seats. Daniel (InterioApp) retained as support admin.',
  current_period_start = '2026-01-01',
  current_period_end = '2027-01-01',
  updated_at = now()
WHERE user_id = '1bbd8c29-f892-417e-ae5c-48d2147cb6fa';

-- Add dealer_portal feature for both accounts (they should have all features)
INSERT INTO account_feature_flags (user_id, feature_key, enabled, config)
VALUES 
  ('b0c727dd-b9bf-4470-840d-1f630e8f2b26', 'dealer_portal', true, '{"dealer_seat_price": 99, "unlimited_seats": true}'::jsonb),
  ('1bbd8c29-f892-417e-ae5c-48d2147cb6fa', 'dealer_portal', true, '{"dealer_seat_price": 99}'::jsonb)
ON CONFLICT (user_id, feature_key) 
DO UPDATE SET 
  enabled = true,
  updated_at = now();