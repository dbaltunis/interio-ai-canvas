import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Home } from "lucide-react";

interface WindowSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWindow: (windowId: string, windowName: string) => void;
  onCreateNewWindow: (windowName: string, windowData: any) => void;
  existingWindows: any[];
  roomName: string;
}

export const WindowSelectionDialog = ({
  isOpen,
  onClose,
  onSelectWindow,
  onCreateNewWindow,
  existingWindows,
  roomName
}: WindowSelectionDialogProps) => {
  const [selectedOption, setSelectedOption] = useState<'existing' | 'new'>('existing');
  const [selectedWindowId, setSelectedWindowId] = useState<string>('');
  const [newWindowData, setNewWindowData] = useState({
    name: '',
    width: 60,
    height: 48,
    surface_type: 'window'
  });

  const handleConfirm = () => {
    if (selectedOption === 'existing' && selectedWindowId) {
      const selectedWindow = existingWindows.find(w => w.id === selectedWindowId);
      onSelectWindow(selectedWindowId, selectedWindow?.name || '');
    } else if (selectedOption === 'new' && newWindowData.name) {
      onCreateNewWindow(newWindowData.name, newWindowData);
    }
    onClose();
  };

  const handleReset = () => {
    setSelectedOption('existing');
    setSelectedWindowId('');
    setNewWindowData({
      name: '',
      width: 60,
      height: 48,
      surface_type: 'window'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Add Treatment to Window
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Room: <span className="font-medium">{roomName}</span>
          </div>

          <RadioGroup value={selectedOption} onValueChange={(value: 'existing' | 'new') => setSelectedOption(value)}>
            {/* Existing Window Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="existing" />
                <Label htmlFor="existing" className="font-medium">Add to existing window</Label>
              </div>
              
              {selectedOption === 'existing' && (
                <div className="ml-6 space-y-2">
                  {existingWindows.length > 0 ? (
                    <RadioGroup value={selectedWindowId} onValueChange={setSelectedWindowId}>
                      {existingWindows.map((window) => (
                        <div key={window.id} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={window.id} 
                            id={window.id}
                          />
                          <Label htmlFor={window.id} className="text-sm">
                            {window.name} ({window.width || 60}" × {window.height || 48}")
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No existing windows in this room
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* New Window Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-medium">Create new window</Label>
              </div>
              
              {selectedOption === 'new' && (
                <div className="ml-6 space-y-4">
                  <div>
                    <Label htmlFor="window_name">Window Name</Label>
                    <Input
                      id="window_name"
                      value={newWindowData.name}
                      onChange={(e) => setNewWindowData({...newWindowData, name: e.target.value})}
                      placeholder="e.g., Window #1, Bay Window"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="width">Width (inches)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={newWindowData.width}
                        onChange={(e) => setNewWindowData({...newWindowData, width: parseInt(e.target.value) || 60})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">Height (inches)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={newWindowData.height}
                        onChange={(e) => setNewWindowData({...newWindowData, height: parseInt(e.target.value) || 48})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleConfirm}
              disabled={
                (selectedOption === 'existing' && !selectedWindowId) ||
                (selectedOption === 'new' && !newWindowData.name)
              }
              className="flex items-center gap-2"
            >
              {selectedOption === 'new' && <Plus className="h-4 w-4" />}
              {selectedOption === 'existing' ? 'Add to Window' : 'Create & Add'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
