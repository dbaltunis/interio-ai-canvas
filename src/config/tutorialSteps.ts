import { ComponentType } from "react";
import { 
  TemplatesStep1, 
  TemplatesStep2, 
  TemplatesStep3, 
  TemplatesStep4, 
  TemplatesStep5,
  TemplatesStep6,
} from "@/components/help/tutorial-steps/TemplatesSteps";

export interface TutorialStep {
  title: string;
  actionLabel: string;
  description: string;
  Visual: ComponentType;
}

export interface Tutorial {
  id: string;
  steps: TutorialStep[];
}

// Templates Tutorial
export const templatesTutorial: Tutorial = {
  id: "products-templates",
  steps: [
    {
      title: "Start by clicking Add Template",
      actionLabel: "Click Button",
      description: "The Add Template button is located in the top right of the templates section. This opens the template creation form.",
      Visual: TemplatesStep1,
    },
    {
      title: "Enter a name for your template",
      actionLabel: "Focus Input",
      description: "Give your template a descriptive name that helps you identify it quickly when creating quotes.",
      Visual: TemplatesStep2,
    },
    {
      title: "Type your template name",
      actionLabel: "Type Name",
      description: "Choose a clear name like 'Premium Sheer' or 'Standard Blockout' that describes the product configuration.",
      Visual: TemplatesStep3,
    },
    {
      title: "Select the product category",
      actionLabel: "Select Category",
      description: "Choose which product type this template is for. This determines which options and pricing rules apply.",
      Visual: TemplatesStep4,
    },
    {
      title: "Save your new template",
      actionLabel: "Click Save",
      description: "Once you've configured the template settings, click Save to add it to your templates list.",
      Visual: TemplatesStep5,
    },
    {
      title: "Template created successfully!",
      actionLabel: "Done",
      description: "Your new template now appears in the list and is ready to use when creating quotes for clients.",
      Visual: TemplatesStep6,
    },
  ],
};

// Suppliers Tutorial (placeholder - will be implemented)
export const suppliersTutorial: Tutorial = {
  id: "products-suppliers",
  steps: [
    {
      title: "Browse the supplier catalog",
      actionLabel: "Navigate",
      description: "Access the TWC supplier catalog to find pre-configured products you can import as templates.",
      Visual: () => null, // Placeholder
    },
  ],
};

// Headings Tutorial (placeholder - will be implemented)
export const headingsTutorial: Tutorial = {
  id: "products-headings",
  steps: [
    {
      title: "Create a new heading style",
      actionLabel: "Click Add",
      description: "Add custom heading styles with specific fullness ratios and pricing for your curtain products.",
      Visual: () => null, // Placeholder
    },
  ],
};

// Options Tutorial (placeholder - will be implemented)
export const optionsTutorial: Tutorial = {
  id: "products-options",
  steps: [
    {
      title: "Add a new option category",
      actionLabel: "Click Add",
      description: "Create option categories like 'Fabric Type' or 'Lining' with associated values and prices.",
      Visual: () => null, // Placeholder
    },
  ],
};

// Defaults Tutorial (placeholder - will be implemented)
export const defaultsTutorial: Tutorial = {
  id: "products-defaults",
  steps: [
    {
      title: "Configure manufacturing defaults",
      actionLabel: "Edit Settings",
      description: "Set default values for hem allowance, side allowance, and fabric waste percentages.",
      Visual: () => null, // Placeholder
    },
  ],
};

// Map of all tutorials by section ID
export const tutorialMap: Record<string, Tutorial> = {
  "products-templates": templatesTutorial,
  "products-suppliers": suppliersTutorial,
  "products-headings": headingsTutorial,
  "products-options": optionsTutorial,
  "products-defaults": defaultsTutorial,
};
