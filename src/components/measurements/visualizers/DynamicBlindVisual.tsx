import React from 'react';
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits';

interface DynamicBlindVisualProps {
  windowType: string;
  measurements: Record<string, any>;
  template?: any;
  blindType: 'roller' | 'venetian' | 'vertical' | 'roman' | 'cellular' | 'zebra';
  mountType?: 'inside' | 'outside';
  chainSide?: 'left' | 'right';
  controlType?: string;
  material?: any;
  selectedColor?: string; // User-selected color from ColorSelector
}

export const DynamicBlindVisual: React.FC<DynamicBlindVisualProps> = ({
  windowType,
  measurements,
  template,
  blindType = 'roller',
  mountType = 'outside',
  chainSide = 'right',
  controlType,
  material,
  selectedColor
}) => {
  const { units } = useMeasurementUnits();
  const hasValue = (value: any) => value && value !== "" && value !== "0";
  
  // Convert color name to CSS color value
  const getColorValue = (colorName?: string): string => {
    if (!colorName) return 'hsl(var(--primary))';
    // If it's already a hex/rgb/hsl value, use it directly
    if (colorName.startsWith('#') || colorName.startsWith('rgb') || colorName.startsWith('hsl')) {
      return colorName;
    }
    // Map common color names to actual colors
    const colorMap: Record<string, string> = {
      'white': '#FFFFFF',
      'black': '#1a1a1a',
      'grey': '#808080',
      'gray': '#808080',
      'silver': '#C0C0C0',
      'cream': '#FFFDD0',
      'ivory': '#FFFFF0',
      'beige': '#F5F5DC',
      'brown': '#8B4513',
      'tan': '#D2B48C',
      'red': '#DC2626',
      'blue': '#2563EB',
      'green': '#16A34A',
      'yellow': '#EAB308',
      'orange': '#EA580C',
      'purple': '#9333EA',
      'pink': '#EC4899',
      'gold': '#D4AF37',
      'bronze': '#CD7F32',
      'navy': '#001f3f',
      'charcoal': '#36454F',
      'walnut': '#5D432C',
      'oak': '#806517',
      'mahogany': '#C04000',
      'cherry': '#DE3163',
      'natural': '#E8D4A8',
      'aluminum': '#A8A9AD',
      'aluminium': '#A8A9AD',
    };
    return colorMap[colorName.toLowerCase()] || colorName;
  };
  
  const blindColor = getColorValue(selectedColor);
  
  // Helper to display measurement with correct unit (measurements already in user's unit)
  const displayValue = (value: any) => {
    const unitLabels: Record<string, string> = {
      'mm': 'mm',
      'cm': 'cm',
      'm': 'm',
      'inches': '"',
      'feet': "'"
    };
    const unitSymbol = unitLabels[units.length] || units.length;
    return `${value}${unitSymbol}`;
  };
  
  // Determine if chain should be visible
  const showChain = controlType !== 'motorized' && controlType !== 'motor';

  const renderRollerBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    
    return (
      <>
        {/* Roller Tube/Mechanism */}
        <div className={`absolute ${blindTop} ${blindWidth} h-4 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          {/* Mounting brackets */}
          <div className="absolute -left-2 -top-1 w-3 h-6 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-1 w-3 h-6 bg-foreground/80 rounded-sm"></div>
          
          {/* Chain/Control - Only show if not motorized */}
          {showChain && (
            <>
              {chainSide === 'right' ? (
                <div className="absolute -right-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
                  <div className="absolute -right-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
                </div>
              ) : (
                <div className="absolute -left-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
                  <div className="absolute -left-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Roller Blind Fabric - Semi-transparent */}
        <div className={`absolute ${blindWidth} backdrop-blur-[1px] shadow-lg overflow-hidden`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1rem)`,
               bottom: hasValue(measurements.drop) ? '4rem' : '8rem',
               backgroundColor: selectedColor ? `${blindColor}4D` : 'hsl(var(--primary) / 0.3)'
             }}>
          {/* Fabric image if available */}
          {material?.image_url ? (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage: `url(${material.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ) : (
            /* Fabric texture effect fallback */
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-primary/5"></div>
          )}
          
          {/* Bottom bar/hembar */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/80 rounded-sm shadow-md z-10"></div>
        </div>
      </>
    );
  };

  const renderVenetianBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    
    // Get slat size from measurements or use default
    const slatSize = measurements.slat_size || measurements.slat_width || '25mm';
    const slatSizeNum = parseInt(slatSize); // e.g., 25, 50, 63
    
    // Calculate number of slats based on slat size (smaller slats = more slats)
    const slatsCount = slatSizeNum <= 25 ? 24 : slatSizeNum <= 50 ? 16 : 12;
    
    return (
      <>
        {/* Headrail with modern design */}
        <div className={`absolute ${blindTop} ${blindWidth} h-4 bg-gradient-to-b from-muted-foreground via-muted to-muted-foreground rounded-sm shadow-lg z-20`}>
          {/* Mounting brackets */}
          <div className="absolute -left-2 -top-0.5 w-4 h-5 bg-foreground/90 rounded-sm shadow-md">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-background/20"></div>
          </div>
          <div className="absolute -right-2 -top-0.5 w-4 h-5 bg-foreground/90 rounded-sm shadow-md">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3 bg-background/20"></div>
          </div>
          
          {/* Control mechanism indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1 bg-foreground/40 rounded-full"></div>
          
          {/* Tilt wand and lift cord - Only show if not motorized */}
          {showChain && (
            <>
              {chainSide === 'right' ? (
                <div className="absolute -right-0.5 top-full w-1 h-28 bg-muted-foreground/70 rounded-full z-30 shadow-sm">
                  <div className="absolute -right-0.5 bottom-0 w-2 h-3 bg-muted-foreground/90 rounded-full"></div>
                </div>
              ) : (
                <div className="absolute -left-0.5 top-full w-1 h-28 bg-muted-foreground/70 rounded-full z-30 shadow-sm">
                  <div className="absolute -left-0.5 bottom-0 w-2 h-3 bg-muted-foreground/90 rounded-full"></div>
                </div>
              )}
              
              {/* Lift cord */}
              <div className={`absolute ${chainSide === 'right' ? 'right-8' : 'left-8'} top-full w-0.5 h-24 bg-muted-foreground/50 z-25`}>
                <div className="absolute -left-1 bottom-0 w-2.5 h-6 bg-muted-foreground/80 rounded-sm shadow-sm"></div>
              </div>
            </>
          )}
        </div>

        {/* Venetian Slats - Realistic tilted appearance */}
        <div className={`absolute ${blindWidth}`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1rem)`,
               bottom: '4rem'
             }}>
          {Array.from({ length: slatsCount }).map((_, i) => {
            // Create realistic slat tilting effect (45-degree angle when closed)
            const slatHeight = slatSizeNum <= 25 ? 'h-1.5' : slatSizeNum <= 50 ? 'h-2' : 'h-2.5';
            
            return (
              <div
                key={i}
                className={`absolute left-0 right-0 ${slatHeight} transition-all duration-300`}
                style={{ 
                  top: `${(i / slatsCount) * 100}%`,
                  background: selectedColor 
                    ? `linear-gradient(180deg, ${blindColor} 0%, ${blindColor}CC 40%, ${blindColor}DD 60%, ${blindColor}AA 100%)`
                    : `linear-gradient(180deg, hsl(var(--primary) / 0.5) 0%, hsl(var(--primary) / 0.35) 40%, hsl(var(--primary) / 0.45) 60%, hsl(var(--primary) / 0.3) 100%)`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)',
                  borderRadius: '1px',
                  transform: 'perspective(500px) rotateX(45deg)',
                  transformOrigin: 'center center',
                  borderTop: selectedColor ? `1px solid ${blindColor}33` : '1px solid hsl(var(--primary) / 0.2)',
                  borderBottom: selectedColor ? `1px solid ${blindColor}22` : '1px solid hsl(var(--primary) / 0.15)',
                }}
              >
                {/* Slat highlight for 3D effect */}
                <div 
                  className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  style={{ opacity: 0.3 }}
                ></div>
              </div>
            );
          })}
          
          {/* Bottom rail */}
          <div className="absolute -bottom-2 left-0 right-0 h-2.5 bg-gradient-to-b from-muted-foreground/70 to-muted-foreground/90 rounded-sm shadow-md z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        </div>
      </>
    );
  };

  const renderVerticalBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    const vaneCount = 12;
    
    return (
      <>
        {/* Headrail */}
        <div className={`absolute ${blindTop} ${blindWidth} h-3 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          <div className="absolute -left-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          
          {/* Control chain - Only show if not motorized */}
          {showChain && (
            <>
              {chainSide === 'right' ? (
                <div className="absolute -right-1 top-full w-0.5 h-40 bg-muted-foreground/60 z-30"></div>
              ) : (
                <div className="absolute -left-1 top-full w-0.5 h-40 bg-muted-foreground/60 z-30"></div>
              )}
            </>
          )}
        </div>

        {/* Vertical Vanes */}
        <div className={`absolute ${blindWidth} flex justify-between`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 0.75rem)`,
               bottom: '4rem'
             }}>
          {Array.from({ length: vaneCount }).map((_, i) => (
            <div
              key={i}
              className="h-full border-l border-r shadow-md overflow-hidden relative"
              style={{ 
                width: `calc(100% / ${vaneCount} - 2px)`,
                transform: 'rotateY(30deg)',
                transformOrigin: 'top center',
                backgroundColor: selectedColor ? `${blindColor}5A` : 'hsl(var(--primary) / 0.35)',
                borderColor: selectedColor ? `${blindColor}33` : 'hsl(var(--primary) / 0.2)'
              }}
            >
              {material?.image_url && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-40"
                  style={{
                    backgroundImage: `url(${material.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderRomanBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    const foldCount = 6;
    
    return (
      <>
        {/* Headrail */}
        <div className={`absolute ${blindTop} ${blindWidth} h-3 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          <div className="absolute -left-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          
          {/* Control cord - Only show if not motorized */}
          {showChain && (
            <>
              {chainSide === 'right' ? (
                <div className="absolute -right-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
                  <div className="absolute -right-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
                </div>
              ) : (
                <div className="absolute -left-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
                  <div className="absolute -left-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Roman Blind Fabric with Folds */}
        <div className={`absolute ${blindWidth} shadow-lg overflow-hidden`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 0.75rem)`,
               bottom: '4rem',
               backgroundColor: selectedColor ? blindColor : (material?.color || 'hsl(var(--primary) / 0.3)')
             }}>
          {/* Fabric image if available */}
          {material?.image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-50"
              style={{
                backgroundImage: `url(${material.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
          
          {/* Horizontal folds */}
          {Array.from({ length: foldCount }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-1 bg-foreground/20 shadow-inner z-10"
              style={{ 
                bottom: `${(i / foldCount) * 100}%`,
              }}
            />
          ))}
          
          {/* Fabric texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-transparent to-background/10 z-5"></div>
          
          {/* Bottom bar */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/80 rounded-sm shadow-md z-20"></div>
        </div>
      </>
    );
  };

  const renderCellularBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    const cellCount = 8;
    
    return (
      <>
        {/* Headrail */}
        <div className={`absolute ${blindTop} ${blindWidth} h-3 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          <div className="absolute -left-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-0.5 w-3 h-4 bg-foreground/80 rounded-sm"></div>
          
          {/* Control cord - Only show if not motorized */}
          {showChain && (
            <>
              {chainSide === 'right' ? (
                <div className="absolute -right-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
                  <div className="absolute -right-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
                </div>
              ) : (
                <div className="absolute -left-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
                  <div className="absolute -left-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cellular honeycomb structure */}
        <div className={`absolute ${blindWidth} backdrop-blur-[1px] shadow-lg overflow-hidden`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 0.75rem)`,
               bottom: '4rem',
               backgroundColor: selectedColor ? `${blindColor}40` : 'hsl(var(--primary) / 0.25)'
             }}>
          {/* Fabric image background if available */}
          {material?.image_url && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{
                backgroundImage: `url(${material.image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          )}
          
          {/* Honeycomb cells */}
          {Array.from({ length: cellCount }).map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-b border-primary/30"
              style={{ 
                height: `${100 / cellCount}%`,
                top: `${(i / cellCount) * 100}%`,
                background: `linear-gradient(90deg, transparent 0%, ${i % 2 === 0 ? 'hsl(var(--primary) / 0.15)' : 'hsl(var(--primary) / 0.25)'} 50%, transparent 100%)`
              }}
            >
              {/* Cell dividers */}
              <div className="absolute left-1/4 top-0 bottom-0 w-px bg-primary/20"></div>
              <div className="absolute left-2/4 top-0 bottom-0 w-px bg-primary/20"></div>
              <div className="absolute left-3/4 top-0 bottom-0 w-px bg-primary/20"></div>
            </div>
          ))}
          
          {/* Bottom bar */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/80 rounded-sm shadow-md z-10"></div>
        </div>
      </>
    );
  };

  const renderZebraBlind = () => {
    const isInsideMount = mountType === 'inside';
    const blindWidth = isInsideMount ? 'left-16 right-16' : 'left-12 right-12';
    const blindTop = isInsideMount ? 'top-24' : 'top-20';
    const bandCount = 12;
    
    return (
      <>
        {/* Roller Tube/Mechanism */}
        <div className={`absolute ${blindTop} ${blindWidth} h-4 bg-gradient-to-b from-muted-foreground to-muted rounded-sm shadow-md z-20`}>
          <div className="absolute -left-2 -top-1 w-3 h-6 bg-foreground/80 rounded-sm"></div>
          <div className="absolute -right-2 -top-1 w-3 h-6 bg-foreground/80 rounded-sm"></div>
          
          {/* Chain/Control - Only show if not motorized */}
          {showChain && (
            <>
              {chainSide === 'right' ? (
                <div className="absolute -right-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
                  <div className="absolute -right-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
                </div>
              ) : (
                <div className="absolute -left-1 top-full w-0.5 h-32 bg-muted-foreground/60 z-30">
                  <div className="absolute -left-1 bottom-0 w-2 h-8 bg-muted-foreground/80 rounded-sm"></div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Zebra Blind - Alternating sheer and opaque bands */}
        <div className={`absolute ${blindWidth} shadow-lg overflow-hidden`}
             style={{
               top: `calc(${blindTop.includes('24') ? '6rem' : '5rem'} + 1rem)`,
               bottom: '4rem'
             }}>
          {/* Alternating horizontal bands */}
          {Array.from({ length: bandCount }).map((_, i) => {
            const isSheerBand = i % 2 === 0;
            return (
              <div
                key={i}
                className="absolute left-0 right-0"
                style={{ 
                  height: `${100 / bandCount}%`,
                  top: `${(i / bandCount) * 100}%`,
                  backgroundColor: isSheerBand 
                    ? (selectedColor ? `${blindColor}20` : 'hsl(var(--primary) / 0.1)')
                    : (selectedColor ? `${blindColor}90` : 'hsl(var(--primary) / 0.55)'),
                  borderBottom: isSheerBand 
                    ? `1px solid ${selectedColor ? `${blindColor}40` : 'hsl(var(--primary) / 0.25)'}`
                    : 'none'
                }}
              >
                {/* Texture for opaque bands */}
                {!isSheerBand && material?.image_url && (
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-40"
                    style={{
                      backgroundImage: `url(${material.image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )}
              </div>
            );
          })}
          
          {/* Bottom bar/hembar */}
          <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-b from-muted-foreground/60 to-muted-foreground/80 rounded-sm shadow-md z-10"></div>
        </div>
      </>
    );
  };

  const renderBlindVisualization = () => {
    switch (blindType) {
      case 'roller':
        return renderRollerBlind();
      case 'zebra':
        return renderZebraBlind();
      case 'venetian':
        return renderVenetianBlind();
      case 'vertical':
        return renderVerticalBlind();
      case 'roman':
        return renderRomanBlind();
      case 'cellular':
        return renderCellularBlind();
      default:
        return renderRollerBlind();
    }
  };

  return (
    <div className="relative container-level-2 rounded-lg p-8 min-h-[400px] overflow-visible">
      {/* Window Frame - Same structure as curtains */}
      {windowType === 'bay' ? (
        <>
          {/* Bay Window - Three angled sections */}
          <div className="absolute top-24 left-12 w-20 bottom-16 transform -skew-y-12 origin-bottom">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-20 left-32 right-32 bottom-20">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="absolute top-24 right-12 w-20 bottom-16 transform skew-y-12 origin-bottom">
            <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
              <div className="grid grid-cols-1 grid-rows-3 h-full gap-1 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-muted border border-border"></div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="absolute top-24 left-16 right-16 bottom-16">
          <div className="w-full h-full border-4 border-muted-foreground bg-background relative">
            <div className="grid grid-cols-2 grid-rows-3 h-full gap-1 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-muted border border-border"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blind Treatment */}
      {renderBlindVisualization()}

      {/* Width measurement - inside visualization, on top */}
      {hasValue(measurements.rail_width) && (
        <div className="absolute left-12 right-12 flex items-center z-30" style={{ top: '12px' }}>
          <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-r-[6px] border-transparent border-r-blue-600"></div>
          <div className="flex-1 border-t border-blue-600 relative">
            <span className="absolute left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold shadow-md whitespace-nowrap" style={{ top: '-18px' }}>
              W: {displayValue(measurements.rail_width)}
            </span>
          </div>
          <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-blue-600"></div>
        </div>
      )}

      {/* Drop measurement - inside visualization, on top */}
      {hasValue(measurements.drop) && (
        <div className="absolute top-20 bottom-16 flex flex-col items-center z-30" style={{ right: '12px' }}>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-transparent border-b-green-600"></div>
          <div className="flex-1 border-r border-green-600 relative">
            <span className="absolute top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold shadow-md whitespace-nowrap" style={{ right: '-42px' }}>
              H: {displayValue(measurements.drop)}
            </span>
          </div>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-transparent border-t-green-600"></div>
        </div>
      )}

      {/* Floor Line */}
      <div className="absolute bottom-4 left-8 right-8 border-t-4 border-muted-foreground">
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-base font-bold text-muted-foreground">
          Floor Line
        </span>
      </div>
    </div>
  );
};
