
import { TreatmentPricingForm } from "./TreatmentPricingForm";
import { EnhancedTreatmentCalculator } from "./calculator/EnhancedTreatmentCalculator";

interface RoomTreatmentDialogsProps {
  projectId: string;
  pricingFormOpen: boolean;
  calculatorDialogOpen: boolean;
  currentFormData: {
    treatmentType: string;
    surfaceId: string;
    surfaceType: string;
    windowCovering: any;
  };
  onClosePricingForm: () => void;
  onCloseCalculatorDialog: () => void;
  onPricingFormSave: (treatmentData: any) => void;
  onCalculatorSave: (treatmentData: any) => void;
}

export const RoomTreatmentDialogs = ({
  projectId,
  pricingFormOpen,
  calculatorDialogOpen,
  currentFormData,
  onClosePricingForm,
  onCloseCalculatorDialog,
  onPricingFormSave,
  onCalculatorSave
}: RoomTreatmentDialogsProps) => {
  return (
    <>
      <TreatmentPricingForm
        isOpen={pricingFormOpen}
        onClose={onClosePricingForm}
        onSave={onPricingFormSave}
        treatmentType={currentFormData.treatmentType}
        surfaceType={currentFormData.surfaceType}
        windowCovering={currentFormData.windowCovering}
        projectId={projectId}
      />

      <EnhancedTreatmentCalculator
        isOpen={calculatorDialogOpen}
        onClose={onCloseCalculatorDialog}
        onSave={onCalculatorSave}
        treatmentType={currentFormData.treatmentType}
      />
    </>
  );
};
