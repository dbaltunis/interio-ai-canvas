import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BeforeAfterPhotoUploadProps {
  itemId: string;
  stage: 'before' | 'after';
  label: string;
}

export const BeforeAfterPhotoUpload: React.FC<BeforeAfterPhotoUploadProps> = ({ 
  itemId, 
  stage, 
  label 
}) => {
  const [image, setImage] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const storageKey = `workroom:${stage}:${itemId}`;
  
  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setImage(data.image);
        setTimestamp(data.timestamp);
      } catch (e) {
        console.error('Failed to parse stored image', e);
      }
    }
  }, [storageKey]);
  
  // Save to localStorage
  useEffect(() => {
    if (image) {
      localStorage.setItem(storageKey, JSON.stringify({ image, timestamp }));
    }
  }, [image, timestamp, storageKey]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = () => {
      setImage(reader.result as string);
      setTimestamp(new Date().toLocaleString());
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleRemove = () => {
    setImage(null);
    setTimestamp(null);
    localStorage.removeItem(storageKey);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {timestamp && (
          <span className="text-xs text-muted-foreground no-print">{timestamp}</span>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {!image ? (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-2 border-dashed no-print"
          onClick={handleClick}
        >
          <div className="flex flex-col items-center gap-2">
            <Camera className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Take or upload photo
            </span>
          </div>
        </Button>
      ) : (
        <Card className="relative">
          <img 
            src={image} 
            alt={label}
            className="w-full h-48 object-cover rounded-lg print-image"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 no-print"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          {timestamp && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {timestamp}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
