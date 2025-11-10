-- Create demo stores for InterioApp templates using first available user
DO $$
DECLARE
  v_system_user_id uuid;
  v_modern_id uuid := gen_random_uuid();
  v_classic_id uuid := gen_random_uuid();
  v_bold_id uuid := gen_random_uuid();
  v_professional_id uuid := gen_random_uuid();
  v_portfolio_id uuid := gen_random_uuid();
BEGIN
  -- Get first available user from auth.users
  SELECT id INTO v_system_user_id FROM auth.users LIMIT 1;
  
  -- Only proceed if we have a user
  IF v_system_user_id IS NOT NULL THEN
    -- Insert demo stores
    INSERT INTO public.online_stores (
      id, user_id, store_name, store_slug, primary_color, secondary_color, accent_color,
      font_family, template_id, domain_verified, is_published, payment_provider,
      seo_title, seo_description
    ) VALUES
      (v_modern_id, v_system_user_id, 'Modern Minimalist Demo', 
       'modern-minimalist-demo', '#2563eb', '#1e40af', '#3b82f6', 'Inter', 
       'modern-minimalist', false, true, 'stripe',
       'Modern Minimalist Store - InterioApp Demo',
       'Experience our clean, modern template with minimalist design perfect for contemporary businesses.'),
      
      (v_classic_id, v_system_user_id, 'Classic Elegance Demo',
       'classic-elegance-demo', '#92400e', '#78350f', '#b45309', 'Playfair Display',
       'classic-elegance', false, true, 'stripe',
       'Classic Elegance Store - InterioApp Demo',
       'Discover our timeless, elegant template with sophisticated styling for premium brands.'),
      
      (v_bold_id, v_system_user_id, 'Bold Showcase Demo',
       'bold-showcase-demo', '#dc2626', '#b91c1c', '#ef4444', 'Montserrat',
       'bold-showcase', false, true, 'stripe',
       'Bold Showcase Store - InterioApp Demo',
       'Explore our vibrant, bold template designed to make your products stand out.'),
      
      (v_professional_id, v_system_user_id, 'Professional Business Demo',
       'professional-business-demo', '#1e40af', '#1e3a8a', '#2563eb', 'Open Sans',
       'professional-business', false, true, 'stripe',
       'Professional Business Store - InterioApp Demo',
       'Browse our professional template perfect for B2B and corporate services.'),
      
      (v_portfolio_id, v_system_user_id, 'Portfolio Style Demo',
       'portfolio-style-demo', '#7c3aed', '#6d28d9', '#8b5cf6', 'Lato',
       'portfolio-style', false, true, 'stripe',
       'Portfolio Style Store - InterioApp Demo',
       'View our creative portfolio template ideal for showcasing your work beautifully.')
    ON CONFLICT (store_slug) DO NOTHING;

    -- Insert sample home pages for each demo store
    INSERT INTO public.store_pages (store_id, page_type, title, slug, content, is_active, sort_order, seo_title, seo_description)
    VALUES
      (v_modern_id, 'home', 'Home', 'home',
        '[{"type":"hero","content":{"heading":"Modern Design, Simplified","subheading":"Discover our curated collection of contemporary furniture and decor","ctaText":"Shop Now","ctaLink":"/products"}},{"type":"features","content":{"heading":"Why Choose Us","features":[{"title":"Quality Craftsmanship","description":"Every piece is carefully selected for quality and durability"},{"title":"Fast Delivery","description":"Get your items delivered within 5-7 business days"},{"title":"Easy Returns","description":"30-day hassle-free return policy"}]}}]'::jsonb,
        true, 1, 'Home - Modern Minimalist Demo', 'Experience modern minimalist design with our demo store'),

      (v_classic_id, 'home', 'Home', 'home',
        '[{"type":"hero","content":{"heading":"Timeless Elegance","subheading":"Luxury furniture and decor for discerning homeowners","ctaText":"Explore Collection","ctaLink":"/products"}},{"type":"features","content":{"heading":"Our Values","features":[{"title":"Heritage Craftsmanship","description":"Traditional techniques meet modern quality standards"},{"title":"Exclusive Designs","description":"Unique pieces you won''t find anywhere else"},{"title":"White Glove Service","description":"Premium delivery and installation included"}]}}]'::jsonb,
        true, 1, 'Home - Classic Elegance Demo', 'Timeless elegance meets modern convenience'),

      (v_bold_id, 'home', 'Home', 'home',
        '[{"type":"hero","content":{"heading":"Make a Statement","subheading":"Bold designs that transform your space","ctaText":"See Products","ctaLink":"/products"}},{"type":"features","content":{"heading":"What Sets Us Apart","features":[{"title":"Unique Styles","description":"Stand out with furniture that makes an impression"},{"title":"Custom Options","description":"Personalize colors and finishes to match your vision"},{"title":"Expert Design Help","description":"Free consultation with our interior design team"}]}}]'::jsonb,
        true, 1, 'Home - Bold Showcase Demo', 'Bold designs for bold personalities'),

      (v_professional_id, 'home', 'Home', 'home',
        '[{"type":"hero","content":{"heading":"Professional Solutions","subheading":"Office furniture and commercial interiors for modern businesses","ctaText":"View Catalog","ctaLink":"/products"}},{"type":"features","content":{"heading":"Business Benefits","features":[{"title":"Volume Discounts","description":"Special pricing for bulk orders and corporate accounts"},{"title":"B2B Portal","description":"Streamlined ordering and invoicing for businesses"},{"title":"Project Management","description":"Dedicated support for large installations"}]}}]'::jsonb,
        true, 1, 'Home - Professional Business Demo', 'Professional furniture solutions for modern workspaces'),

      (v_portfolio_id, 'home', 'Home', 'home',
        '[{"type":"hero","content":{"heading":"Your Style, Your Story","subheading":"Curated pieces that reflect your unique aesthetic","ctaText":"Browse Portfolio","ctaLink":"/products"}},{"type":"features","content":{"heading":"Our Approach","features":[{"title":"Curated Selection","description":"Hand-picked items that tell a story"},{"title":"Style Guides","description":"Expert advice on creating cohesive looks"},{"title":"Inspiration Gallery","description":"Real homes featuring our products"}]}}]'::jsonb,
        true, 1, 'Home - Portfolio Style Demo', 'Showcase your unique style with our curated collection');
    
    RAISE NOTICE 'Demo stores created successfully for user %', v_system_user_id;
  ELSE
    RAISE NOTICE 'No users found - demo stores not created';
  END IF;
END $$;