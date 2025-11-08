import { DocumentBlock } from '../DocumentBuilderTab';
import { Package } from 'lucide-react';

interface ProductImageBlockProps {
  block: DocumentBlock;
}

export const ProductImageBlock = ({ block }: ProductImageBlockProps) => {
  const { content = {}, settings = {} } = block;
  
  const imageSettings = settings.productImage || {
    width: 150,
    height: 150,
    imagesPerRow: 2,
    showProductType: true,
    showFabricSeparately: false,
    position: 'left',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${imageSettings.imagesPerRow}, 1fr)`,
    gap: '16px',
    justifyItems: imageSettings.position,
  };

  // Sample product images
  const productImages = content.products || [];

  return (
    <div>
      {imageSettings.showProductType && (
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Product Images</h4>
      )}
      <div style={gridStyle}>
        {productImages.length > 0 ? (
          productImages.map((product: any, index: number) => (
            <div key={index} className="space-y-2">
              <div 
                className="bg-gray-100 rounded overflow-hidden"
                style={{
                  width: `${imageSettings.width}px`,
                  height: `${imageSettings.height}px`,
                }}
              >
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              {product.name && (
                <p className="text-xs text-gray-600 text-center">{product.name}</p>
              )}
            </div>
          ))
        ) : (
          <div 
            className="bg-gray-100 rounded flex items-center justify-center"
            style={{
              width: `${imageSettings.width}px`,
              height: `${imageSettings.height}px`,
            }}
          >
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};
