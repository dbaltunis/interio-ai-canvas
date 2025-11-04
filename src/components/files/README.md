# Enhanced Image Upload Components

A complete set of components for handling image uploads with drag-drop, previews, progress tracking, and optimization.

## Components

### EnhancedImageUpload

Full-featured image upload component with all the bells and whistles.

```tsx
import { EnhancedImageUpload } from '@/components/files/EnhancedImageUpload';

<EnhancedImageUpload
  projectId="my-project-123"
  onUploadComplete={(urls) => console.log('Uploaded:', urls)}
  maxFiles={10}
  maxSizeMB={5}
  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
  showPreview={true}
/>
```

**Features:**
- ✓ Drag & drop with visual feedback
- ✓ Image preview thumbnails
- ✓ Individual file progress tracking
- ✓ File validation (size, type)
- ✓ Multiple file support
- ✓ Error handling
- ✓ Smooth animations

**Props:**
- `projectId?`: string - Project identifier for organizing uploads
- `onUploadComplete?`: (urls: string[]) => void - Callback when uploads finish
- `maxFiles?`: number - Maximum files allowed (default: 10)
- `maxSizeMB?`: number - Max file size in MB (default: 5)
- `acceptedFormats?`: string[] - Allowed MIME types
- `showPreview?`: boolean - Show image thumbnails (default: true)

---

### DragDropZone

Reusable drag-drop wrapper for any content.

```tsx
import { DragDropZone } from '@/components/files/DragDropZone';

<DragDropZone
  onFilesDropped={(files) => handleFiles(files)}
  accept="image/*"
  multiple={true}
>
  <div>Drop files here or click to browse</div>
</DragDropZone>
```

**Props:**
- `onFilesDropped`: (files: FileList) => void - Required callback
- `accept?`: string - File types to accept
- `multiple?`: boolean - Allow multiple files
- `disabled?`: boolean - Disable drop zone
- `children?`: ReactNode - Content to display
- `className?`: string - Additional CSS classes

---

### ImagePreviewGrid

Display uploaded images in a responsive grid with actions.

```tsx
import { ImagePreviewGrid } from '@/components/files/ImagePreviewGrid';

<ImagePreviewGrid
  images={[
    { id: '1', url: '/path/to/image.jpg', name: 'Image 1', size: 1024000 }
  ]}
  onRemove={(id) => handleRemove(id)}
  onView={(image) => window.open(image.url)}
  columns={3}
/>
```

**Props:**
- `images`: ImagePreview[] - Array of images to display
- `onRemove?`: (id: string) => void - Callback for remove action
- `onView?`: (image: ImagePreview) => void - Callback for view action
- `columns?`: 2 | 3 | 4 - Grid columns (default: 3)
- `className?`: string - Additional CSS classes

**ImagePreview Interface:**
```tsx
interface ImagePreview {
  id: string;
  url: string;
  name: string;
  size?: number;
}
```

---

## Hooks

### useImageOptimization

Optimize images before upload to reduce file size.

```tsx
import { useImageOptimization } from '@/hooks/useImageOptimization';

const { optimizeImage, optimizeMultipleImages, isOptimizing } = useImageOptimization();

// Optimize single image
const optimizedFile = await optimizeImage(file, {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: 'image/jpeg'
});

// Optimize multiple images
const optimizedFiles = await optimizeMultipleImages(files, options);
```

**Options:**
- `maxWidth?`: number - Maximum width (default: 1920)
- `maxHeight?`: number - Maximum height (default: 1920)
- `quality?`: number - Compression quality 0-1 (default: 0.85)
- `format?`: 'image/jpeg' | 'image/png' | 'image/webp' - Output format

---

## Usage Examples

### Basic Upload

```tsx
import { EnhancedImageUpload } from '@/components/files/EnhancedImageUpload';

function MyComponent() {
  return (
    <EnhancedImageUpload
      projectId="project-123"
      onUploadComplete={(urls) => {
        console.log('Uploaded:', urls);
      }}
    />
  );
}
```

### With Image Optimization

```tsx
import { EnhancedImageUpload } from '@/components/files/EnhancedImageUpload';
import { useImageOptimization } from '@/hooks/useImageOptimization';

function MyComponent() {
  const { optimizeImage } = useImageOptimization();

  const handleBeforeUpload = async (file: File) => {
    // Optimize before upload
    return await optimizeImage(file, {
      maxWidth: 1200,
      quality: 0.8
    });
  };

  return <EnhancedImageUpload projectId="project-123" />;
}
```

### Custom Gallery

```tsx
import { ImagePreviewGrid } from '@/components/files/ImagePreviewGrid';
import { useState } from 'react';

function Gallery() {
  const [images, setImages] = useState([
    { id: '1', url: '/image1.jpg', name: 'Photo 1', size: 1024000 }
  ]);

  return (
    <ImagePreviewGrid
      images={images}
      onRemove={(id) => setImages(prev => prev.filter(img => img.id !== id))}
      onView={(img) => window.open(img.url, '_blank')}
      columns={4}
    />
  );
}
```

---

## Styling

All components use Tailwind CSS and support dark mode. They integrate with your existing design system through semantic tokens.

### Animations

Components include smooth animations:
- `animate-fade-in` - Fade in entrance
- `animate-scale-in` - Scale in entrance  
- `animate-pulse` - Pulsing during upload

### Customization

Add custom classes via `className` prop:

```tsx
<EnhancedImageUpload
  className="custom-upload-styles"
  projectId="project-123"
/>
```

---

## Demo

Try the demo component to see all features in action:

```tsx
import { ImageUploadDemo } from '@/components/files/ImageUploadDemo';

<ImageUploadDemo />
```

---

## Requirements

- React 18+
- Tailwind CSS
- @tanstack/react-query
- Supabase (for storage)
- sonner (for toasts)

---

## Future Enhancements

Potential additions:
- Background removal for product images
- Image cropping/editing
- Batch operations
- AI-powered image tagging
- Upload to multiple destinations
- Paste from clipboard support
