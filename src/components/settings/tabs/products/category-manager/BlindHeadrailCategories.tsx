
import { OptionCategory, OptionSubcategory } from "@/hooks/useWindowCoveringCategories";

export const blindHeadrailCategories: Partial<OptionCategory>[] = [
  {
    name: "Headrail System",
    description: "Headrail mounting and operation systems for blinds",
    is_required: true,
    sort_order: 1,
    category_type: "headrail",
    calculation_method: "per-unit"
  },
  {
    name: "Chain Control",
    description: "Chain operation and positioning for blinds",
    is_required: false,
    sort_order: 2,
    category_type: "control",
    calculation_method: "per-unit"
  },
  {
    name: "Motorization",
    description: "Motorized operation systems and remotes",
    is_required: false,
    sort_order: 3,
    category_type: "motorization",
    calculation_method: "per-unit"
  }
];

export const blindHeadrailSubcategories: Record<string, Partial<OptionSubcategory>[]> = {
  "Headrail System": [
    {
      name: "Standard Headrail",
      description: "Basic headrail system",
      pricing_method: "fixed",
      base_price: 45.00,
      sort_order: 1
    },
    {
      name: "Heavy Duty Headrail",
      description: "Reinforced headrail for larger blinds",
      pricing_method: "fixed",
      base_price: 85.00,
      sort_order: 2
    },
    {
      name: "Face Fix Headrail",
      description: "Wall mounted headrail system",
      pricing_method: "fixed",
      base_price: 55.00,
      sort_order: 3
    },
    {
      name: "Top Fix Headrail",
      description: "Ceiling mounted headrail system",
      pricing_method: "fixed",
      base_price: 65.00,
      sort_order: 4
    }
  ],
  "Chain Control": [
    {
      name: "Standard Chain - Left",
      description: "Chain control positioned on left side",
      pricing_method: "fixed",
      base_price: 0.00,
      sort_order: 1
    },
    {
      name: "Standard Chain - Right",
      description: "Chain control positioned on right side",
      pricing_method: "fixed",
      base_price: 0.00,
      sort_order: 2
    },
    {
      name: "Extended Chain",
      description: "Longer chain for high installations",
      pricing_method: "per-meter",
      base_price: 8.50,
      sort_order: 3
    },
    {
      name: "Child Safety Chain",
      description: "Break-away safety chain system",
      pricing_method: "fixed",
      base_price: 15.00,
      sort_order: 4
    }
  ],
  "Motorization": [
    {
      name: "Battery Motor",
      description: "Rechargeable battery operated motor",
      pricing_method: "fixed",
      base_price: 350.00,
      sort_order: 1
    },
    {
      name: "Mains Powered Motor",
      description: "Hardwired electric motor system",
      pricing_method: "fixed",
      base_price: 425.00,
      sort_order: 2
    },
    {
      name: "Solar Powered Motor",
      description: "Solar rechargeable motor system",
      pricing_method: "fixed",
      base_price: 475.00,
      sort_order: 3
    },
    {
      name: "Remote Control",
      description: "Handheld remote controller",
      pricing_method: "fixed",
      base_price: 65.00,
      sort_order: 4
    },
    {
      name: "Wall Switch",
      description: "Hardwired wall switch control",
      pricing_method: "fixed",
      base_price: 85.00,
      sort_order: 5
    },
    {
      name: "Smart Home Integration",
      description: "WiFi enabled smart home compatibility",
      pricing_method: "fixed",
      base_price: 125.00,
      sort_order: 6
    }
  ]
};
