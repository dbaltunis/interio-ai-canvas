import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useCreateSMSContact, useUpdateSMSContact } from "@/hooks/useSMSContacts";

interface SMSContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: any;
}

export const SMSContactDialog = ({ open, onOpenChange, contact }: SMSContactDialogProps) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [optedIn, setOptedIn] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  const createContact = useCreateSMSContact();
  const updateContact = useUpdateSMSContact();

  const isEditing = !!contact;

  useEffect(() => {
    if (contact) {
      setName(contact.name || "");
      setPhoneNumber(contact.phone_number);
      setOptedIn(contact.opted_in);
      setTags(contact.tags || []);
    } else {
      setName("");
      setPhoneNumber("");
      setOptedIn(true);
      setTags([]);
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const contactData = {
      name: name || undefined,
      phone_number: phoneNumber,
      opted_in: optedIn,
      tags: tags.length > 0 ? tags : undefined,
      ...(optedIn ? { opted_in_at: new Date().toISOString() } : { opted_out_at: new Date().toISOString() }),
    };

    try {
      if (isEditing) {
        await updateContact.mutateAsync({
          id: contact.id,
          updates: contactData,
        });
      } else {
        await createContact.mutateAsync(contactData);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit SMS Contact' : 'Add SMS Contact'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contact name..."
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Include country code (e.g., +1 for US numbers)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="opted-in">SMS Opt-in Status</Label>
                <p className="text-sm text-gray-500">
                  Contact has consented to receive SMS messages
                </p>
              </div>
              <Switch
                id="opted-in"
                checked={optedIn}
                onCheckedChange={setOptedIn}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tag..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use tags to organize contacts (e.g., "VIP", "New Customer")
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createContact.isPending || updateContact.isPending || !phoneNumber.trim()}
            >
              {isEditing ? 'Update Contact' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};