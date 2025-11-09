-- Create online_stores table
CREATE TABLE IF NOT EXISTS public.online_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  store_slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e293b',
  secondary_color TEXT DEFAULT '#3b82f6',
  accent_color TEXT DEFAULT '#f59e0b',
  font_family TEXT DEFAULT 'Inter, sans-serif',
  template_id TEXT NOT NULL,
  custom_domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  google_analytics_id TEXT,
  payment_provider TEXT DEFAULT 'stripe',
  stripe_account_id TEXT,
  paypal_account_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create store_templates table
CREATE TABLE IF NOT EXISTS public.store_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  preview_image_url TEXT,
  template_config JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create store_pages table
CREATE TABLE IF NOT EXISTS public.store_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.online_stores(id) ON DELETE CASCADE,
  page_type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(store_id, slug)
);

-- Create store_page_sections table
CREATE TABLE IF NOT EXISTS public.store_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.store_pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL,
  content JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create store_inquiries table
CREATE TABLE IF NOT EXISTS public.store_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.online_stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  inquiry_type TEXT NOT NULL DEFAULT 'quote_request',
  product_id UUID REFERENCES public.enhanced_inventory_items(id) ON DELETE SET NULL,
  message TEXT,
  configuration_data JSONB DEFAULT '{}',
  quote_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'new',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create store_product_visibility table
CREATE TABLE IF NOT EXISTS public.store_product_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.online_stores(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.enhanced_inventory_items(id) ON DELETE CASCADE,
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  custom_description TEXT,
  custom_images JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(store_id, inventory_item_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_online_stores_user_id ON public.online_stores(user_id);
CREATE INDEX IF NOT EXISTS idx_online_stores_slug ON public.online_stores(store_slug);
CREATE INDEX IF NOT EXISTS idx_store_pages_store_id ON public.store_pages(store_id);
CREATE INDEX IF NOT EXISTS idx_store_page_sections_page_id ON public.store_page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_store_inquiries_store_id ON public.store_inquiries(store_id);
CREATE INDEX IF NOT EXISTS idx_store_inquiries_status ON public.store_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_store_product_visibility_store_id ON public.store_product_visibility(store_id);

-- Enable RLS
ALTER TABLE public.online_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_product_visibility ENABLE ROW LEVEL SECURITY;

-- RLS Policies for online_stores
CREATE POLICY "Users can view their own stores"
  ON public.online_stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stores"
  ON public.online_stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stores"
  ON public.online_stores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stores"
  ON public.online_stores FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for store_templates (public read)
CREATE POLICY "Anyone can view store templates"
  ON public.store_templates FOR SELECT
  USING (true);

-- RLS Policies for store_pages
CREATE POLICY "Users can manage their store pages"
  ON public.store_pages FOR ALL
  USING (store_id IN (SELECT id FROM public.online_stores WHERE user_id = auth.uid()));

CREATE POLICY "Public can view published store pages"
  ON public.store_pages FOR SELECT
  USING (store_id IN (SELECT id FROM public.online_stores WHERE is_published = true));

-- RLS Policies for store_page_sections
CREATE POLICY "Users can manage their store sections"
  ON public.store_page_sections FOR ALL
  USING (page_id IN (
    SELECT p.id FROM public.store_pages p
    JOIN public.online_stores s ON p.store_id = s.id
    WHERE s.user_id = auth.uid()
  ));

CREATE POLICY "Public can view published store sections"
  ON public.store_page_sections FOR SELECT
  USING (page_id IN (
    SELECT p.id FROM public.store_pages p
    JOIN public.online_stores s ON p.store_id = s.id
    WHERE s.is_published = true
  ));

-- RLS Policies for store_inquiries
CREATE POLICY "Store owners can view their inquiries"
  ON public.store_inquiries FOR SELECT
  USING (store_id IN (SELECT id FROM public.online_stores WHERE user_id = auth.uid()));

CREATE POLICY "Store owners can update their inquiries"
  ON public.store_inquiries FOR UPDATE
  USING (store_id IN (SELECT id FROM public.online_stores WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can create inquiries"
  ON public.store_inquiries FOR INSERT
  WITH CHECK (true);

-- RLS Policies for store_product_visibility
CREATE POLICY "Users can manage their store products"
  ON public.store_product_visibility FOR ALL
  USING (store_id IN (SELECT id FROM public.online_stores WHERE user_id = auth.uid()));

CREATE POLICY "Public can view visible store products"
  ON public.store_product_visibility FOR SELECT
  USING (
    is_visible = true AND
    store_id IN (SELECT id FROM public.online_stores WHERE is_published = true)
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_online_stores_updated_at
  BEFORE UPDATE ON public.online_stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_pages_updated_at
  BEFORE UPDATE ON public.store_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_product_visibility_updated_at
  BEFORE UPDATE ON public.store_product_visibility
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed 5 templates
INSERT INTO public.store_templates (id, name, description, category, preview_image_url, template_config, is_default) VALUES
(
  'modern-minimalist',
  'Modern Minimalist',
  'Clean design with lots of whitespace, perfect for showcasing elegant window treatments',
  'modern',
  '/templates/modern-minimalist.jpg',
  '{
    "colors": {
      "primary": "#1e293b",
      "secondary": "#3b82f6",
      "accent": "#f59e0b",
      "background": "#ffffff",
      "text": "#0f172a"
    },
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif"
    },
    "defaultPages": [
      {
        "type": "home",
        "title": "Home",
        "slug": "home",
        "sections": [
          {"type": "hero", "content": {"headline": "Transform Your Space", "subheadline": "Custom window treatments designed for you", "ctaText": "Get Started"}},
          {"type": "featured-products", "content": {"title": "Featured Products", "limit": 6}},
          {"type": "features", "content": {"title": "Why Choose Us"}},
          {"type": "cta", "content": {"headline": "Ready to Get Started?", "buttonText": "Contact Us"}}
        ]
      },
      {
        "type": "products",
        "title": "Products",
        "slug": "products",
        "sections": [
          {"type": "product-grid", "content": {"showFilters": true, "showSearch": true}}
        ]
      },
      {
        "type": "about",
        "title": "About Us",
        "slug": "about",
        "sections": [
          {"type": "text-image", "content": {"headline": "About Us", "text": "We are passionate about creating beautiful spaces"}}
        ]
      },
      {
        "type": "contact",
        "title": "Contact",
        "slug": "contact",
        "sections": [
          {"type": "contact-form", "content": {"title": "Get in Touch"}}
        ]
      }
    ]
  }',
  true
),
(
  'classic-elegance',
  'Classic Elegance',
  'Timeless design with sophisticated typography and refined aesthetics',
  'classic',
  '/templates/classic-elegance.jpg',
  '{
    "colors": {
      "primary": "#1e3a5f",
      "secondary": "#c9a961",
      "accent": "#8b4513",
      "background": "#fdfbf7",
      "text": "#2c2c2c"
    },
    "fonts": {
      "heading": "Playfair Display, serif",
      "body": "Lato, sans-serif"
    },
    "defaultPages": [
      {
        "type": "home",
        "title": "Home",
        "slug": "home",
        "sections": [
          {"type": "hero", "content": {"headline": "Timeless Elegance", "subheadline": "Luxury window treatments for discerning clients"}},
          {"type": "featured-products", "content": {"title": "Our Collection", "limit": 6}},
          {"type": "testimonials", "content": {"title": "What Our Clients Say"}},
          {"type": "cta", "content": {"headline": "Schedule a Consultation"}}
        ]
      },
      {
        "type": "products",
        "title": "Our Products",
        "slug": "products",
        "sections": [
          {"type": "product-grid", "content": {}}
        ]
      },
      {
        "type": "about",
        "title": "Our Story",
        "slug": "about",
        "sections": [
          {"type": "text-image", "content": {}}
        ]
      },
      {
        "type": "contact",
        "title": "Contact Us",
        "slug": "contact",
        "sections": [
          {"type": "contact-form", "content": {}}
        ]
      }
    ]
  }',
  false
),
(
  'bold-showcase',
  'Bold Showcase',
  'Vibrant and eye-catching design to make your products stand out',
  'bold',
  '/templates/bold-showcase.jpg',
  '{
    "colors": {
      "primary": "#dc2626",
      "secondary": "#f59e0b",
      "accent": "#8b5cf6",
      "background": "#ffffff",
      "text": "#1f2937"
    },
    "fonts": {
      "heading": "Montserrat, sans-serif",
      "body": "Open Sans, sans-serif"
    },
    "defaultPages": [
      {
        "type": "home",
        "title": "Home",
        "slug": "home",
        "sections": [
          {"type": "hero", "content": {"headline": "Bold. Beautiful. Yours.", "subheadline": "Stand out with custom window solutions"}},
          {"type": "featured-products", "content": {"title": "Trending Now", "limit": 8}},
          {"type": "features", "content": {"title": "What We Offer"}},
          {"type": "gallery", "content": {"title": "Our Work"}},
          {"type": "cta", "content": {"headline": "Let''s Create Something Amazing"}}
        ]
      },
      {
        "type": "products",
        "title": "Shop All",
        "slug": "products",
        "sections": [
          {"type": "product-grid", "content": {}}
        ]
      },
      {
        "type": "about",
        "title": "About",
        "slug": "about",
        "sections": [
          {"type": "text-image", "content": {}}
        ]
      },
      {
        "type": "contact",
        "title": "Contact",
        "slug": "contact",
        "sections": [
          {"type": "contact-form", "content": {}}
        ]
      }
    ]
  }',
  false
),
(
  'professional-business',
  'Professional Business',
  'Corporate and trustworthy design ideal for B2B clients',
  'professional',
  '/templates/professional-business.jpg',
  '{
    "colors": {
      "primary": "#0f172a",
      "secondary": "#0ea5e9",
      "accent": "#10b981",
      "background": "#f8fafc",
      "text": "#334155"
    },
    "fonts": {
      "heading": "Roboto, sans-serif",
      "body": "Roboto, sans-serif"
    },
    "defaultPages": [
      {
        "type": "home",
        "title": "Home",
        "slug": "home",
        "sections": [
          {"type": "hero", "content": {"headline": "Professional Window Solutions", "subheadline": "Trusted by businesses across the region"}},
          {"type": "features", "content": {"title": "Our Services"}},
          {"type": "featured-products", "content": {"title": "Commercial Products", "limit": 6}},
          {"type": "testimonials", "content": {"title": "Client Success Stories"}},
          {"type": "cta", "content": {"headline": "Request a Commercial Quote"}}
        ]
      },
      {
        "type": "products",
        "title": "Products & Services",
        "slug": "products",
        "sections": [
          {"type": "product-grid", "content": {}}
        ]
      },
      {
        "type": "about",
        "title": "About Our Company",
        "slug": "about",
        "sections": [
          {"type": "text-image", "content": {}}
        ]
      },
      {
        "type": "contact",
        "title": "Get in Touch",
        "slug": "contact",
        "sections": [
          {"type": "contact-form", "content": {}}
        ]
      }
    ]
  }',
  false
),
(
  'portfolio-style',
  'Portfolio Style',
  'Image-focused design perfect for showcasing your best work',
  'portfolio',
  '/templates/portfolio-style.jpg',
  '{
    "colors": {
      "primary": "#000000",
      "secondary": "#ffffff",
      "accent": "#3b82f6",
      "background": "#ffffff",
      "text": "#171717"
    },
    "fonts": {
      "heading": "Cormorant Garamond, serif",
      "body": "Work Sans, sans-serif"
    },
    "defaultPages": [
      {
        "type": "home",
        "title": "Home",
        "slug": "home",
        "sections": [
          {"type": "hero", "content": {"headline": "Crafted with Care", "subheadline": "Every detail matters"}},
          {"type": "gallery", "content": {"title": "Our Portfolio"}},
          {"type": "featured-products", "content": {"title": "Products", "limit": 4}},
          {"type": "cta", "content": {"headline": "Start Your Project"}}
        ]
      },
      {
        "type": "products",
        "title": "Collection",
        "slug": "products",
        "sections": [
          {"type": "product-grid", "content": {}}
        ]
      },
      {
        "type": "about",
        "title": "About",
        "slug": "about",
        "sections": [
          {"type": "text-image", "content": {}}
        ]
      },
      {
        "type": "contact",
        "title": "Contact",
        "slug": "contact",
        "sections": [
          {"type": "contact-form", "content": {}}
        ]
      }
    ]
  }',
  false
)
ON CONFLICT (id) DO NOTHING;