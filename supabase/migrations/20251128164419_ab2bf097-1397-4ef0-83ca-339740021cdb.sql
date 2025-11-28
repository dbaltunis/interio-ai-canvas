-- Force PostgREST to reload schema cache after is_system_default removal
-- This resolves "column curtain_templates.is_system_default does not exist" errors

NOTIFY pgrst, 'reload schema';