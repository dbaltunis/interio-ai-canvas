-- Refresh PostgREST schema cache after rfms_customer_id column addition
NOTIFY pgrst, 'reload schema';