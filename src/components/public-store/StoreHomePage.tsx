import { ModernMinimalistHome } from "./templates/ModernMinimalistHome";
import { ClassicEleganceHome } from "./templates/ClassicEleganceHome";
import { BoldShowcaseHome } from "./templates/BoldShowcaseHome";
import { ProfessionalBusinessHome } from "./templates/ProfessionalBusinessHome";
import { PortfolioStyleHome } from "./templates/PortfolioStyleHome";
import { WindowTreatmentPro } from "./templates/WindowTreatmentPro";

interface StoreHomePageProps {
  storeData: any;
}

export const StoreHomePage = ({ storeData }: StoreHomePageProps) => {
  // Route to template-specific home page based on template_id
  const templateId = storeData.template_id;

  switch (templateId) {
    case 'window-treatment-pro':
      return <WindowTreatmentPro storeData={storeData} />;
    case 'modern-minimalist':
      return <ModernMinimalistHome storeData={storeData} />;
    case 'classic-elegance':
      return <ClassicEleganceHome storeData={storeData} />;
    case 'bold-showcase':
      return <BoldShowcaseHome storeData={storeData} />;
    case 'professional-business':
      return <ProfessionalBusinessHome storeData={storeData} />;
    case 'portfolio-style':
      return <PortfolioStyleHome storeData={storeData} />;
    default:
      // Fallback to professional window treatment template
      return <WindowTreatmentPro storeData={storeData} />;
  }
};

