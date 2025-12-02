import { useRef } from 'react';
import { useOnboardingWizard } from '@/hooks/useOnboardingWizard';
import { WizardProgress } from '@/components/onboarding-wizard/WizardProgress';
import { WizardNavigation } from '@/components/onboarding-wizard/WizardNavigation';
import { CompanyInfoStep } from '@/components/onboarding-wizard/steps/CompanyInfoStep';
import { RegionalSettingsStep } from '@/components/onboarding-wizard/steps/RegionalSettingsStep';
import { DocumentSequencesStep } from '@/components/onboarding-wizard/steps/DocumentSequencesStep';
import { InventoryDataStep } from '@/components/onboarding-wizard/steps/InventoryDataStep';
import { PricingGridsStep } from '@/components/onboarding-wizard/steps/PricingGridsStep';
import { WindowCoveringsStep } from '@/components/onboarding-wizard/steps/WindowCoveringsStep';
import { ManufacturingStep } from '@/components/onboarding-wizard/steps/ManufacturingStep';
import { StockManagementStep } from '@/components/onboarding-wizard/steps/StockManagementStep';
import { EmailTemplatesStep } from '@/components/onboarding-wizard/steps/EmailTemplatesStep';
import { QuotationSettingsStep } from '@/components/onboarding-wizard/steps/QuotationSettingsStep';
import { IntegrationsStep } from '@/components/onboarding-wizard/steps/IntegrationsStep';
import { UsersPermissionsStep } from '@/components/onboarding-wizard/steps/UsersPermissionsStep';
import { ReviewStep } from '@/components/onboarding-wizard/steps/ReviewStep';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generateQuotePDF } from '@/utils/generateQuotePDF';

const OnboardingWizard = () => {
  const wizard = useOnboardingWizard();
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (printRef.current) {
      await generateQuotePDF(printRef.current, {
        filename: 'Client_Onboarding_Checklist.pdf',
        margin: 10,
      });
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: wizard.data,
      updateSection: wizard.updateSection,
      isSaving: wizard.isSaving,
    };

    switch (wizard.currentStepName) {
      case 'company_info':
        return <CompanyInfoStep {...stepProps} />;
      case 'regional_settings':
        return <RegionalSettingsStep {...stepProps} />;
      case 'document_sequences':
        return <DocumentSequencesStep {...stepProps} />;
      case 'inventory_data':
        return <InventoryDataStep {...stepProps} />;
      case 'pricing_grids':
        return <PricingGridsStep {...stepProps} />;
      case 'window_coverings':
        return <WindowCoveringsStep {...stepProps} />;
      case 'manufacturing_settings':
        return <ManufacturingStep {...stepProps} />;
      case 'stock_management':
        return <StockManagementStep {...stepProps} />;
      case 'email_templates':
        return <EmailTemplatesStep {...stepProps} />;
      case 'quotation_settings':
        return <QuotationSettingsStep {...stepProps} />;
      case 'integrations_config':
        return <IntegrationsStep {...stepProps} />;
      case 'users_permissions':
        return <UsersPermissionsStep {...stepProps} />;
      case 'review':
        return <ReviewStep data={wizard.data} completionStatus={wizard.completionStatus} onComplete={wizard.completeWizard} />;
      default:
        return null;
    }
  };

  if (wizard.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Client Onboarding Wizard</h1>
              <p className="text-muted-foreground text-sm">Complete the setup to configure your account</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <WizardProgress
          currentStep={wizard.currentStep}
          totalSteps={wizard.totalSteps}
          steps={wizard.steps}
          completionStatus={wizard.completionStatus}
          onStepClick={wizard.goToStep}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-32">
        <div ref={printRef}>
          {renderStep()}
        </div>
      </div>

      {/* Navigation Footer */}
      <WizardNavigation
        currentStep={wizard.currentStep}
        totalSteps={wizard.totalSteps}
        onNext={wizard.nextStep}
        onPrev={wizard.prevStep}
        isSaving={wizard.isSaving}
        isFirstStep={wizard.currentStep === 0}
        isLastStep={wizard.currentStep === wizard.totalSteps - 1}
      />
    </div>
  );
};

export default OnboardingWizard;
