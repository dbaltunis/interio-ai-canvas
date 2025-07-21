
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X } from "lucide-react";

interface ImageUploadBlockProps {
  content: any;
  onUpdate: (content: any) => void;
}

export const ImageUploadBlock = ({ content, onUpdate }: ImageUploadBlockProps) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onUpdate({
          ...content,
          src: dataUrl,
          alt: file.name,
          fileName: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    onUpdate({
      ...content,
      src: '',
      alt: '',
      fileName: ''
    });
  };

  if (content.src) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <img
            src={content.src}
            alt={content.alt || 'Uploaded image'}
            className={`max-w-full h-auto rounded ${
              content.alignment === 'left' ? 'mr-auto' :
              content.alignment === 'right' ? 'ml-auto' :
              'mx-auto'
            }`}
            style={{ width: content.width || 'auto' }}
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={removeImage}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Width</Label>
            <Select
              value={content.width || '100%'}
              onValueChange={(value) => onUpdate({ ...content, width: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25%">25%</SelectItem>
                <SelectItem value="50%">50%</SelectItem>
                <SelectItem value="75%">75%</SelectItem>
                <SelectItem value="100%">100%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Alignment</Label>
            <Select
              value={content.alignment || 'center'}
              onValueChange={(value) => onUpdate({ ...content, alignment: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Alt Text</Label>
          <Input
            value={content.alt || ''}
            onChange={(e) => onUpdate({ ...content, alt: e.target.value })}
            placeholder="Describe the image..."
          />
        </div>
      </div>
    );
  }

  return (
    <Card
      className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
        dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="text-center space-y-4">
        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
        <div>
          <p className="text-lg font-medium">Upload an image</p>
          <p className="text-sm text-gray-500">
            Drag and drop an image here, or click to select
          </p>
        </div>
        <Button variant="outline">
          Choose File
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </Card>
  );
};
