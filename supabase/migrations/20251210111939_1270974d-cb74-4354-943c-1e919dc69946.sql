-- Fix orphaned window summary referencing wrong user's template
-- Update windows with old template to use Rachel's own Curtains template
UPDATE windows_summary 
SET template_id = '7afc68f9-5a21-4679-882f-7a8490a390da'
WHERE template_id = 'd31311e0-537b-47f0-8558-8ef00476c090';