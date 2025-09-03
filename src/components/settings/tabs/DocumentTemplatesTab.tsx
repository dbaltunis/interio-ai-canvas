import { SavedTemplatesManager } from "../templates/SavedTemplatesManager";

export const DocumentTemplatesTab = () => {
  return (
    <div className="space-y-6">
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">✨ Enhanced Template Editor</h3>
        <p className="text-sm text-blue-700">
          Create professional quotations, invoices, and work orders with our new Canva-like editor featuring:
          drag-and-drop blocks, canvas design tools, real-time preview, and dynamic data integration.
        </p>
      </div>
      <SavedTemplatesManager />
    </div>
  );
};
