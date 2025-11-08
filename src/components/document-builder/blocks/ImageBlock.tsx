import { DocumentBlock } from '../DocumentBuilderTab';
import { Image as ImageIcon } from 'lucide-react';

interface ImageBlockProps {
  block: DocumentBlock;
}

export const ImageBlock = ({ block }: ImageBlockProps) => {
  const { content = {}, styles = {}, settings = {} } = block;
  
  const imageSettings = settings.image || {
    width: 200,
    height: 200,
    position: 'center',
    showBorder: false,
    borderRadius: 4,
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: imageSettings.position === 'left' ? 'flex-start' 
      : imageSettings.position === 'right' ? 'flex-end' 
      : 'center',
  };

  const imageStyle = {
    width: `${imageSettings.width}px`,
    height: `${imageSettings.height}px`,
    borderRadius: `${imageSettings.borderRadius}px`,
    border: imageSettings.showBorder ? '1px solid #e5e7eb' : 'none',
    objectFit: 'cover' as const,
    ...styles,
  };

  return (
    <div style={containerStyle}>
      {content.imageUrl ? (
        <img 
          src={content.imageUrl} 
          alt={content.alt || 'Image'} 
          style={imageStyle}
        />
      ) : (
        <div 
          style={{
            ...imageStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
          }}
        >
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </div>
  );
};
