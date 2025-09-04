export const generateSVGSnapshot = (measurements: Record<string, number>, template: any): string => {
  // Create a simple SVG representation of the window
  const width = measurements.rail_width || 1000;
  const drop = measurements.drop || 2000;
  
  // Scale down for preview (max 300px width)
  const scale = Math.min(300 / width, 200 / drop);
  const svgWidth = width * scale;
  const svgHeight = drop * scale;
  
  const svg = `
    <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="fabric" patternUnits="userSpaceOnUse" width="20" height="20">
          <rect width="20" height="20" fill="#f8f9fa"/>
          <circle cx="10" cy="10" r="2" fill="#e9ecef"/>
        </pattern>
      </defs>
      
      <!-- Window frame -->
      <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" 
            fill="none" stroke="#6b7280" stroke-width="2"/>
      
      <!-- Curtain panels -->
      <rect x="10" y="20" width="${(svgWidth - 20) / 2}" height="${svgHeight - 40}" 
            fill="url(#fabric)" stroke="#374151" stroke-width="1"/>
      <rect x="${(svgWidth / 2) + 5}" y="20" width="${(svgWidth - 20) / 2}" height="${svgHeight - 40}" 
            fill="url(#fabric)" stroke="#374151" stroke-width="1"/>
      
      <!-- Track/pole -->
      <rect x="0" y="5" width="${svgWidth}" height="8" 
            fill="#4b5563" rx="4"/>
      
      <!-- Dimensions -->
      <text x="${svgWidth / 2}" y="${svgHeight - 5}" 
            text-anchor="middle" font-family="Arial" font-size="10" fill="#6b7280">
        ${width}mm × ${drop}mm
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export const svgToPng = async (svgDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw SVG
      ctx.drawImage(img, 0, 0);
      
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => reject(new Error('Failed to load SVG'));
    img.src = svgDataUrl;
  });
};