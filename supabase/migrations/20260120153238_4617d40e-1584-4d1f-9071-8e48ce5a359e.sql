-- Fix all blocking foreign keys to use CASCADE or SET NULL for client deletion

-- 1. email_analytics -> emails (needs CASCADE so emails can cascade delete)
ALTER TABLE public.email_analytics DROP CONSTRAINT IF EXISTS email_analytics_email_id_fkey;
ALTER TABLE public.email_analytics ADD CONSTRAINT email_analytics_email_id_fkey 
  FOREIGN KEY (email_id) REFERENCES public.emails(id) ON DELETE CASCADE;

-- 2. projects -> clients (SET NULL to preserve projects)
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_client_id_fkey;
ALTER TABLE public.projects ADD CONSTRAINT projects_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- 3. quotes -> clients (SET NULL to preserve quotes)
ALTER TABLE public.quotes DROP CONSTRAINT IF EXISTS quotes_client_id_fkey;
ALTER TABLE public.quotes ADD CONSTRAINT quotes_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- 4. appointments -> clients (SET NULL to preserve appointments)
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_client_id_fkey;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- 5. material_order_queue -> clients (SET NULL)
ALTER TABLE public.material_order_queue DROP CONSTRAINT IF EXISTS material_order_queue_client_id_fkey;
ALTER TABLE public.material_order_queue ADD CONSTRAINT material_order_queue_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;