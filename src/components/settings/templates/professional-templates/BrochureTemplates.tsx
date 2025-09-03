export const productShowcaseTemplate = {
  id: 'product-showcase',
  name: 'Product Showcase',
  description: 'Stunning visual catalog with product galleries',
  documentType: 'brochure',
  blocks: [
    {
      id: 'brochure-cover',
      type: 'cover-page',
      content: {
        layout: 'magazine-cover',
        title: '{{company_name}}',
        subtitle: 'Premium Window Treatment Collection',
        heroImage: '/api/placeholder/800/600',
        overlayColor: 'rgba(0,0,0,0.4)',
        textColor: '#ffffff',
        style: {
          backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          titleFont: 'Playfair Display, serif',
          titleSize: '48px',
          subtitleFont: 'Inter, sans-serif',
          subtitleSize: '18px',
          height: '100vh'
        }
      },
      editable: true
    },
    {
      id: 'company-story',
      type: 'story-section',
      content: {
        layout: 'split-story',
        title: 'Crafting Excellence Since 2010',
        story: `At {{company_name}}, we believe that windows are the soul of your home. 
        
Our journey began with a simple vision: to transform ordinary spaces into extraordinary experiences through the art of window treatments. Today, we're proud to be the preferred choice for discerning homeowners who demand nothing but the finest.

Every piece in our collection tells a story of craftsmanship, innovation, and timeless elegance.`,
        image: '/api/placeholder/600/400',
        style: {
          backgroundColor: '#f8fafc',
          padding: '80px 40px',
          imageStyle: 'rounded-elegant'
        }
      },
      editable: true
    },
    {
      id: 'product-categories',
      type: 'category-grid',
      content: {
        title: 'Our Collections',
        categories: [
          {
            name: 'Luxury Curtains',
            description: 'Handcrafted elegance in premium fabrics',
            image: '/api/placeholder/400/300',
            features: ['Bespoke sizing', 'Premium fabrics', 'Expert installation']
          },
          {
            name: 'Modern Blinds',
            description: 'Contemporary solutions for modern living',
            image: '/api/placeholder/400/300',
            features: ['Smart automation', 'Energy efficient', 'Easy maintenance']
          },
          {
            name: 'Roman Shades',
            description: 'Classic sophistication with modern functionality',
            image: '/api/placeholder/400/300',
            features: ['Cordless safety', 'Blackout options', 'Custom patterns']
          },
          {
            name: 'Shutters',
            description: 'Architectural beauty that adds value',
            image: '/api/placeholder/400/300',
            features: ['Solid hardwood', 'Lifetime warranty', 'Increase home value']
          }
        ],
        style: {
          layout: '2x2-grid',
          cardStyle: 'elevated-hover',
          spacing: '24px',
          backgroundColor: '#ffffff'
        }
      },
      editable: true
    },
    {
      id: 'featured-products',
      type: 'product-gallery',
      content: {
        title: 'Featured Products',
        layout: 'masonry-gallery',
        products: [
          {
            name: 'Heritage Collection Curtains',
            image: '/api/placeholder/500/400',
            price: 'From £299',
            description: 'Timeless elegance meets modern craftsmanship',
            features: ['100% silk lining', 'Hand-sewn details', 'Custom embroidery available']
          },
          {
            name: 'Smart Motorized Blinds',
            image: '/api/placeholder/500/600',
            price: 'From £450',
            description: 'Control light and privacy with a touch',
            features: ['App control', 'Voice activation', 'Solar powered options']
          },
          {
            name: 'Artisan Roman Shades',
            image: '/api/placeholder/500/350',
            price: 'From £225',
            description: 'Sophisticated style for any room',
            features: ['Cordless operation', 'Blackout fabrics', 'Custom sizing']
          }
        ],
        style: {
          galleryStyle: 'pinterest-masonry',
          cardStyle: 'luxury-elevated',
          hoverEffect: 'zoom-overlay'
        }
      },
      editable: true
    },
    {
      id: 'testimonials-showcase',
      type: 'testimonials-grid',
      content: {
        title: 'What Our Clients Say',
        testimonials: [
          {
            quote: "The transformation of our home is simply breathtaking. The attention to detail and quality of craftsmanship exceeded all expectations.",
            author: "Sarah & James Mitchell",
            location: "Hampstead, London",
            image: '/api/placeholder/80/80',
            rating: 5
          },
          {
            quote: "Professional service from start to finish. The team understood our vision perfectly and delivered beyond our dreams.",
            author: "Dr. Amanda Roberts",
            location: "Chelsea, London",
            image: '/api/placeholder/80/80',
            rating: 5
          },
          {
            quote: "Outstanding quality and service. Our new shutters have completely transformed our living space.",
            author: "The Harrison Family",
            location: "Richmond, Surrey",
            image: '/api/placeholder/80/80',
            rating: 5
          }
        ],
        style: {
          layout: 'carousel-cards',
          backgroundColor: '#f1f5f9',
          cardStyle: 'testimonial-elegant'
        }
      },
      editable: true
    },
    {
      id: 'process-timeline',
      type: 'process-flow',
      content: {
        title: 'Our Simple Process',
        steps: [
          {
            number: '01',
            title: 'Free Consultation',
            description: 'We visit your home to understand your needs and measure your windows',
            icon: 'home-visit'
          },
          {
            number: '02',
            title: 'Design & Quote',
            description: 'Receive a detailed proposal with fabric samples and 3D visualizations',
            icon: 'design'
          },
          {
            number: '03',
            title: 'Manufacturing',
            description: 'Your bespoke treatments are crafted by our skilled artisans',
            icon: 'manufacturing'
          },
          {
            number: '04',
            title: 'Installation',
            description: 'Professional installation and styling for the perfect finish',
            icon: 'installation'
          }
        ],
        style: {
          layout: 'horizontal-timeline',
          accentColor: '#2563eb',
          backgroundColor: '#ffffff'
        }
      },
      editable: true
    },
    {
      id: 'call-to-action-brochure',
      type: 'brochure-cta',
      content: {
        layout: 'full-width-banner',
        title: 'Ready to Transform Your Home?',
        subtitle: 'Book your free consultation today and discover the perfect window treatments for your space',
        buttonText: 'Book Free Consultation',
        contactInfo: {
          phone: '{{company_phone}}',
          email: '{{company_email}}',
          website: '{{company_website}}'
        },
        backgroundImage: '/api/placeholder/1200/400',
        style: {
          backgroundColor: '#1e293b',
          textColor: '#ffffff',
          buttonColor: '#2563eb',
          overlayOpacity: 0.7
        }
      },
      editable: true
    },
    {
      id: 'contact-info',
      type: 'contact-footer',
      content: {
        layout: 'professional-footer',
        companyName: '{{company_name}}',
        address: '{{company_address}}',
        phone: '{{company_phone}}',
        email: '{{company_email}}',
        website: '{{company_website}}',
        socialMedia: {
          instagram: '@yourcompany',
          facebook: 'YourCompany',
          pinterest: 'YourCompany'
        },
        businessHours: 'Mon-Fri: 9am-6pm, Sat: 10am-4pm',
        style: {
          backgroundColor: '#f8fafc',
          textColor: '#475569',
          accentColor: '#2563eb'
        }
      },
      editable: true
    }
  ]
};

export const digitalEbookTemplate = {
  id: 'ebook-template',
  name: 'Digital eBook',
  description: 'Multi-page digital catalog for email sharing',
  documentType: 'brochure',
  blocks: [
    {
      id: 'ebook-cover',
      type: 'ebook-cover',
      content: {
        title: 'The Complete Guide to Window Treatments',
        subtitle: 'Transform Your Home with Style',
        authorLine: 'By {{company_name}}',
        coverImage: '/api/placeholder/600/800',
        style: {
          layout: 'book-cover',
          backgroundColor: '#1e293b',
          textColor: '#ffffff',
          titleFont: 'Playfair Display, serif',
          aspectRatio: '3:4'
        }
      },
      editable: true
    },
    {
      id: 'table-of-contents',
      type: 'table-of-contents',
      content: {
        title: 'Contents',
        chapters: [
          { title: 'Introduction to Window Treatments', page: 3 },
          { title: 'Choosing the Right Style', page: 7 },
          { title: 'Fabric Guide', page: 12 },
          { title: 'Measuring Your Windows', page: 18 },
          { title: 'Installation Process', page: 23 },
          { title: 'Care & Maintenance', page: 28 },
          { title: 'Our Services', page: 33 }
        ],
        style: {
          layout: 'elegant-toc',
          backgroundColor: '#ffffff',
          dotStyle: 'decorative'
        }
      },
      editable: true
    },
    {
      id: 'chapter-introduction',
      type: 'chapter-page',
      content: {
        chapterNumber: '01',
        title: 'Introduction to Window Treatments',
        content: `Welcome to the world of beautiful window treatments. Whether you're looking to enhance privacy, control light, or simply add a touch of elegance to your home, the right window treatments can completely transform your living space.

In this comprehensive guide, we'll walk you through everything you need to know about selecting, measuring, and installing the perfect window treatments for your home.`,
        sidebarContent: {
          title: 'Did You Know?',
          text: 'The right window treatments can reduce energy costs by up to 30% while adding significant value to your home.'
        },
        images: ['/api/placeholder/400/300'],
        style: {
          layout: 'magazine-article',
          backgroundColor: '#ffffff',
          accentColor: '#2563eb'
        }
      },
      editable: true
    },
    {
      id: 'style-guide-chapter',
      type: 'style-guide',
      content: {
        chapterNumber: '02',
        title: 'Choosing the Right Style',
        styleCategories: [
          {
            name: 'Traditional',
            description: 'Classic elegance that never goes out of style',
            characteristics: ['Rich fabrics', 'Ornate details', 'Formal appearance'],
            bestFor: 'Formal living rooms, dining rooms, master bedrooms',
            image: '/api/placeholder/300/200'
          },
          {
            name: 'Contemporary',
            description: 'Clean lines and modern functionality',
            characteristics: ['Minimal design', 'Neutral colors', 'Smart features'],
            bestFor: 'Modern homes, offices, minimalist spaces',
            image: '/api/placeholder/300/200'
          },
          {
            name: 'Transitional',
            description: 'The perfect blend of traditional and modern',
            characteristics: ['Versatile design', 'Comfortable luxury', 'Timeless appeal'],
            bestFor: 'Family rooms, versatile spaces, evolving decor',
            image: '/api/placeholder/300/200'
          }
        ],
        style: {
          layout: 'grid-showcase',
          backgroundColor: '#f8fafc'
        }
      },
      editable: true
    },
    {
      id: 'fabric-guide-chapter',
      type: 'fabric-guide',
      content: {
        chapterNumber: '03',
        title: 'Complete Fabric Guide',
        fabricTypes: [
          {
            name: 'Natural Silk',
            properties: ['Luxurious sheen', 'Excellent draping', 'Light filtering'],
            care: 'Professional cleaning recommended',
            bestFor: 'Formal spaces, elegant interiors',
            durability: 'High with proper care',
            image: '/api/placeholder/200/150'
          },
          {
            name: 'Linen Blends',
            properties: ['Natural texture', 'Casual elegance', 'Breathable'],
            care: 'Machine washable options available',
            bestFor: 'Relaxed living areas, coastal themes',
            durability: 'Very high',
            image: '/api/placeholder/200/150'
          },
          {
            name: 'Performance Fabrics',
            properties: ['Stain resistant', 'Easy care', 'UV protection'],
            care: 'Machine washable',
            bestFor: 'High-traffic areas, family homes',
            durability: 'Exceptional',
            image: '/api/placeholder/200/150'
          }
        ],
        style: {
          layout: 'comparison-cards',
          backgroundColor: '#ffffff'
        }
      },
      editable: true
    }
  ]
};