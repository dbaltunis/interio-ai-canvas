
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FabricForm } from "./FabricForm";
import { BrandForm } from "./BrandForm";
import { CollectionForm } from "./CollectionForm";
import { FilterDialog } from "./FilterDialog";
import { FabricCSVUpload } from "./FabricCSVUpload";

interface LibraryDialogsProps {
  showFabricForm: boolean;
  setShowFabricForm: (show: boolean) => void;
  showBrandForm: boolean;
  setShowBrandForm: (show: boolean) => void;
  showCollectionForm: boolean;
  setShowCollectionForm: (show: boolean) => void;
  showFilterDialog: boolean;
  setShowFilterDialog: (show: boolean) => void;
  showCSVUpload: boolean;
  setShowCSVUpload: (show: boolean) => void;
}

export const LibraryDialogs = ({
  showFabricForm,
  setShowFabricForm,
  showBrandForm,
  setShowBrandForm,
  showCollectionForm,
  setShowCollectionForm,
  showFilterDialog,
  setShowFilterDialog,
  showCSVUpload,
  setShowCSVUpload
}: LibraryDialogsProps) => {
  return (
    <>
      <Dialog open={showFabricForm} onOpenChange={setShowFabricForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Fabric</DialogTitle>
          </DialogHeader>
          <FabricForm onClose={() => setShowFabricForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showBrandForm} onOpenChange={setShowBrandForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <BrandForm onClose={() => setShowBrandForm(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showCollectionForm} onOpenChange={setShowCollectionForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Collection</DialogTitle>
          </DialogHeader>
          <CollectionForm onClose={() => setShowCollectionForm(false)} />
        </DialogContent>
      </Dialog>

      <FilterDialog 
        open={showFilterDialog} 
        onOpenChange={setShowFilterDialog} 
      />

      <Dialog open={showCSVUpload} onOpenChange={setShowCSVUpload}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Fabrics from CSV</DialogTitle>
          </DialogHeader>
          <FabricCSVUpload onClose={() => setShowCSVUpload(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
