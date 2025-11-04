/**
 * Sample Pricing Grid Data
 * Use this to populate test grids in the database
 */

export const sampleRollerBlindGrid = {
  name: 'Roller Blind - Standard Pricing',
  gridCode: 'RB-STD-2024',
  description: 'Standard pricing grid for roller blinds - Cassette system',
  gridData: {
    widthColumns: ['50', '80', '100', '120', '150', '180', '200', '250'],
    dropRows: [
      { drop: '100', prices: [45, 50, 55, 60, 65, 70, 75, 85] },
      { drop: '120', prices: [50, 55, 60, 65, 70, 75, 80, 90] },
      { drop: '150', prices: [55, 60, 65, 70, 75, 80, 85, 95] },
      { drop: '180', prices: [60, 65, 70, 75, 80, 85, 90, 100] },
      { drop: '200', prices: [65, 70, 75, 80, 85, 90, 95, 105] },
      { drop: '220', prices: [70, 75, 80, 85, 90, 95, 100, 110] },
      { drop: '250', prices: [75, 80, 85, 90, 95, 100, 105, 115] },
      { drop: '280', prices: [80, 85, 90, 95, 100, 105, 110, 120] },
      { drop: '300', prices: [85, 90, 95, 100, 105, 110, 115, 125] }
    ]
  }
};

export const sampleRomanBlindGrid = {
  name: 'Roman Blind - Premium Pricing',
  gridCode: 'ROM-PREM-2024',
  description: 'Premium pricing grid for roman blinds',
  gridData: {
    widthColumns: ['50', '80', '100', '120', '150', '180', '200'],
    dropRows: [
      { drop: '100', prices: [85, 95, 105, 115, 125, 135, 145] },
      { drop: '150', prices: [95, 105, 115, 125, 135, 145, 155] },
      { drop: '200', prices: [105, 115, 125, 135, 145, 155, 165] },
      { drop: '250', prices: [115, 125, 135, 145, 155, 165, 175] }
    ]
  }
};

export const sampleRoutingRules = [
  {
    productType: 'roller_blinds',
    systemType: 'Cassette',
    priceGroup: 'Standard',
    priority: 100,
    description: 'Cassette roller blinds with standard fabric'
  },
  {
    productType: 'roller_blinds',
    systemType: 'Open Roll',
    priceGroup: 'Standard',
    priority: 90,
    description: 'Open roll roller blinds with standard fabric'
  },
  {
    productType: 'roman_blinds',
    systemType: null,
    priceGroup: 'Premium',
    priority: 80,
    description: 'Premium roman blinds (any system)'
  },
  {
    productType: 'roller_blinds',
    systemType: null,
    priceGroup: null,
    priority: 10,
    description: 'Fallback for all roller blinds'
  }
];

/**
 * CSV Template for Roller Blind Pricing Grid
 */
export const sampleCsvTemplate = `Drop,50,80,100,120,150,180,200,250
100,45,50,55,60,65,70,75,85
120,50,55,60,65,70,75,80,90
150,55,60,65,70,75,80,85,95
180,60,65,70,75,80,85,90,100
200,65,70,75,80,85,90,95,105
220,70,75,80,85,90,95,100,110
250,75,80,85,90,95,100,105,115
280,80,85,90,95,100,105,110,120
300,85,90,95,100,105,110,115,125`;

/**
 * Generate CSV blob for download
 */
export const downloadSampleCsv = () => {
  const blob = new Blob([sampleCsvTemplate], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sample-pricing-grid.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
