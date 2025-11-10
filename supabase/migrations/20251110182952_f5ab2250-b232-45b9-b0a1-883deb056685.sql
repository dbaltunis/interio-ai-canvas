-- Add sample products to all demo stores

INSERT INTO store_product_visibility (store_id, inventory_item_id, is_visible, is_featured, sort_order, custom_description)
VALUES
  -- Modern Minimalist Demo (8 products)
  ('ddf79587-d408-4c59-a399-ddf209205352', '9f6f9830-66bd-4e7c-b76a-df29d55b7a9f', true, true, 1, 'Elegant purple floral fabric perfect for modern interiors. Lightweight and durable.'),
  ('ddf79587-d408-4c59-a399-ddf209205352', 'b35c06c8-1bfe-474d-bf9f-7ac931051e9c', true, true, 2, 'Pure white cotton fabric for a clean, minimalist look. Perfect for any room.'),
  ('ddf79587-d408-4c59-a399-ddf209205352', '1d8378d0-6ade-4490-8e89-5313c32bfa78', true, false, 3, 'Premium roller blind fabric with excellent light control and privacy.'),
  ('ddf79587-d408-4c59-a399-ddf209205352', 'f01723ee-276c-4214-aafe-22d3dc677dc8', true, false, 4, 'High-quality roller blind fabric designed for durability and style.'),
  ('ddf79587-d408-4c59-a399-ddf209205352', '387df560-e435-4e0f-af1a-acfd88499579', true, false, 5, 'Striking geometric wallpaper to create a bold feature wall.'),
  ('ddf79587-d408-4c59-a399-ddf209205352', 'd5ddc63a-85b6-471f-bfc0-2b919bfbd096', true, false, 6, 'Contemporary wallpaper design perfect for modern spaces.'),
  ('ddf79587-d408-4c59-a399-ddf209205352', 'ebe338d1-1d37-478f-91dd-1243204f0adc', true, false, 7, 'Eyelet pleat heading for a modern curtain look with easy installation.'),
  ('ddf79587-d408-4c59-a399-ddf209205352', 'f3053bf2-3b2f-4b08-82d0-842ed36e11fe', true, false, 8, 'Uniview fabric with superior light filtering properties.'),
  
  -- Classic Elegance Demo (8 products)
  ('91c23a92-da51-4cac-9b27-79f2e9e78a23', 'b35c06c8-1bfe-474d-bf9f-7ac931051e9c', true, true, 1, 'Luxurious white cotton fabric for timeless elegance.'),
  ('91c23a92-da51-4cac-9b27-79f2e9e78a23', '9f6f9830-66bd-4e7c-b76a-df29d55b7a9f', true, true, 2, 'Rich purple fabric with delicate floral patterns for classic interiors.'),
  ('91c23a92-da51-4cac-9b27-79f2e9e78a23', '1bf051c7-8d78-4d9b-a440-a59fb1f451df', true, false, 3, 'Traditional wallpaper design adding sophistication to any room.'),
  ('91c23a92-da51-4cac-9b27-79f2e9e78a23', '387df560-e435-4e0f-af1a-acfd88499579', true, false, 4, 'Elegant wallpaper with intricate details for refined spaces.'),
  ('91c23a92-da51-4cac-9b27-79f2e9e78a23', 'f3053bf2-3b2f-4b08-82d0-842ed36e11fe', true, false, 5, 'Premium curtain fabric with classic appeal and modern functionality.'),
  ('91c23a92-da51-4cac-9b27-79f2e9e78a23', '33c117db-37f7-49f3-9798-c8562f6fe04c', true, false, 6, 'Versatile roller blind fabric suitable for traditional settings.'),
  ('91c23a92-da51-4cac-9b27-79f2e9e78a23', 'ebe338d1-1d37-478f-91dd-1243204f0adc', true, false, 7, 'Classic eyelet heading style for elegant curtain draping.'),
  ('91c23a92-da51-4cac-9b27-79f2e9e78a23', '1d8378d0-6ade-4490-8e89-5313c32bfa78', true, false, 8, 'Premium quality roller fabric for timeless window treatments.'),
  
  -- Bold Showcase Demo (8 products)
  ('46422872-9921-44b3-8cf9-f19a80ae843a', '9f6f9830-66bd-4e7c-b76a-df29d55b7a9f', true, true, 1, 'Bold purple fabric that makes a statement in any contemporary space.'),
  ('46422872-9921-44b3-8cf9-f19a80ae843a', '387df560-e435-4e0f-af1a-acfd88499579', true, true, 2, 'Dramatic geometric wallpaper for striking feature walls.'),
  ('46422872-9921-44b3-8cf9-f19a80ae843a', '1bf051c7-8d78-4d9b-a440-a59fb1f451df', true, true, 3, 'Eye-catching wallpaper design to showcase your bold style.'),
  ('46422872-9921-44b3-8cf9-f19a80ae843a', 'd5ddc63a-85b6-471f-bfc0-2b919bfbd096', true, false, 4, 'Modern wallpaper perfect for creating impactful spaces.'),
  ('46422872-9921-44b3-8cf9-f19a80ae843a', '1d8378d0-6ade-4490-8e89-5313c32bfa78', true, false, 5, 'Contemporary roller blind fabric with bold visual appeal.'),
  ('46422872-9921-44b3-8cf9-f19a80ae843a', 'f01723ee-276c-4214-aafe-22d3dc677dc8', true, false, 6, 'Statement roller blind fabric for modern interiors.'),
  ('46422872-9921-44b3-8cf9-f19a80ae843a', 'b35c06c8-1bfe-474d-bf9f-7ac931051e9c', true, false, 7, 'Clean white fabric as a perfect canvas for bold accents.'),
  ('46422872-9921-44b3-8cf9-f19a80ae843a', 'ebe338d1-1d37-478f-91dd-1243204f0adc', true, false, 8, 'Modern eyelet heading for showcasing beautiful fabrics.'),
  
  -- Professional Business Demo (8 products)
  ('971de7c0-40c4-4715-90c9-f4763d2ef9fe', 'b35c06c8-1bfe-474d-bf9f-7ac931051e9c', true, true, 1, 'Professional white cotton fabric ideal for corporate environments.'),
  ('971de7c0-40c4-4715-90c9-f4763d2ef9fe', 'f3053bf2-3b2f-4b08-82d0-842ed36e11fe', true, true, 2, 'Uniview fabric providing privacy while maintaining natural light.'),
  ('971de7c0-40c4-4715-90c9-f4763d2ef9fe', '1d8378d0-6ade-4490-8e89-5313c32bfa78', true, false, 3, 'Professional-grade roller blind fabric for offices and businesses.'),
  ('971de7c0-40c4-4715-90c9-f4763d2ef9fe', 'f01723ee-276c-4214-aafe-22d3dc677dc8', true, false, 4, 'Commercial quality roller fabric built for high-traffic areas.'),
  ('971de7c0-40c4-4715-90c9-f4763d2ef9fe', '33c117db-37f7-49f3-9798-c8562f6fe04c', true, false, 5, 'Durable roller blind solution for professional spaces.'),
  ('971de7c0-40c4-4715-90c9-f4763d2ef9fe', '9f6f9830-66bd-4e7c-b76a-df29d55b7a9f', true, false, 6, 'Elegant fabric option for executive offices and meeting rooms.'),
  ('971de7c0-40c4-4715-90c9-f4763d2ef9fe', 'd5ddc63a-85b6-471f-bfc0-2b919bfbd096', true, false, 7, 'Sophisticated wallpaper for professional office interiors.'),
  ('971de7c0-40c4-4715-90c9-f4763d2ef9fe', 'ebe338d1-1d37-478f-91dd-1243204f0adc', true, false, 8, 'Professional eyelet heading system for easy maintenance.'),
  
  -- Portfolio Style Demo (9 products)
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', '387df560-e435-4e0f-af1a-acfd88499579', true, true, 1, 'Artistic wallpaper design showcasing premium quality and style.'),
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', '1bf051c7-8d78-4d9b-a440-a59fb1f451df', true, true, 2, 'Designer wallpaper perfect for portfolio-quality interiors.'),
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', '9f6f9830-66bd-4e7c-b76a-df29d55b7a9f', true, true, 3, 'Premium floral fabric showcasing exceptional craftsmanship.'),
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', 'b35c06c8-1bfe-474d-bf9f-7ac931051e9c', true, false, 4, 'Pure cotton fabric demonstrating quality and attention to detail.'),
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', 'f3053bf2-3b2f-4b08-82d0-842ed36e11fe', true, false, 5, 'High-end Uniview fabric for sophisticated window treatments.'),
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', 'd5ddc63a-85b6-471f-bfc0-2b919bfbd096', true, false, 6, 'Contemporary wallpaper design for showcase projects.'),
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', '1d8378d0-6ade-4490-8e89-5313c32bfa78', true, false, 7, 'Portfolio-quality roller blind fabric with exceptional finish.'),
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', 'f01723ee-276c-4214-aafe-22d3dc677dc8', true, false, 8, 'Premium roller fabric ideal for high-end residential projects.'),
  ('bdc7fcac-1b9e-44f0-b9d9-588a123e3e57', 'ebe338d1-1d37-478f-91dd-1243204f0adc', true, false, 9, 'Designer eyelet heading for elegant curtain presentations.')
ON CONFLICT (store_id, inventory_item_id) DO NOTHING;