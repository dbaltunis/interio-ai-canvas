// Homekaara inventory import data parsed from CSV files

export interface BlindMaterial {
  name: string;
  categoryType: string;
  blindsType: string;
  type: string;
  supplier: string;
  catalog: string;
  maxWidth: string;
  itemMrp: number;
  cassetteMrp: number;
  colors: Array<{
    supplierCode: string;
    homekaaraCode: string;
    colorName: string;
    slNo: number;
  }>;
}

export interface TrackItem {
  name: string;
  color: string;
  brand: string;
  trackMrp: number;
  pleated: string;
  rippleFold: string;
  mountTypes: string[];
  accessories: {
    runner: number;
    endCap: number;
    ceilingBracket: number;
    wallSingleBracket: number;
    wallDoubleBracket: number;
    jointer: number;
    overlap: number;
    magnet?: number;
    wand?: number;
    bendingJointer?: number;
    extraLongBracket?: number;
    motor?: number;
    remote2ch?: number;
    remote4ch?: number;
    remote6ch?: number;
  };
}

export interface RodItem {
  name: string;
  brand: string;
  rodPerFeet: number;
  endCap: number;
  roundBallFinial: number;
  singleLineFinial: number;
  dimFineFinial: number;
  accordTieback: number;
  singleBracket: number;
  doubleBracket: number;
  bend: number;
  rings: number;
}

// Parsed blind materials from blinds.csv
export const BLIND_MATERIALS: BlindMaterial[] = [
  {
    name: "Solyx",
    categoryType: "Sunscreen",
    blindsType: "Roller-Blinds",
    type: "Roller",
    supplier: "VIENTO",
    catalog: "Contract",
    maxWidth: '96"',
    itemMrp: 349,
    cassetteMrp: 449,
    colors: [
      { supplierCode: "SS 403", homekaaraCode: "EIV/NOC/304SS", colorName: "Pepper", slNo: 1 },
      { supplierCode: "SS 402", homekaaraCode: "EIV/NOC/204SS", colorName: "Beach", slNo: 2 },
      { supplierCode: "SS 401", homekaaraCode: "EIV/NOC/104SS", colorName: "White", slNo: 3 },
    ]
  },
  {
    name: "Opalyx",
    categoryType: "Sunscreen",
    blindsType: "Roller-Blinds",
    type: "Roller",
    supplier: "VIENTO",
    catalog: "Contract",
    maxWidth: '96"',
    itemMrp: 249,
    cassetteMrp: 349,
    colors: [
      { supplierCode: "DS 2003", homekaaraCode: "EIV/NOC/3002SD", colorName: "Cloud", slNo: 4 },
      { supplierCode: "DS 2002", homekaaraCode: "EIV/NOC/2002SD", colorName: "Sand", slNo: 5 },
    ]
  },
  {
    name: "Brunyx",
    categoryType: "Sunscreen",
    blindsType: "Roller-Blinds",
    type: "Roller",
    supplier: "VIENTO",
    catalog: "Contract",
    maxWidth: '96"',
    itemMrp: 349,
    cassetteMrp: 449,
    colors: [
      { supplierCode: "RS 304", homekaaraCode: "EIV/NOC/403SR", colorName: "Saddle", slNo: 6 },
      { supplierCode: "RS 303", homekaaraCode: "EIV/NOC/303SR", colorName: "Tan", slNo: 7 },
      { supplierCode: "RS 301", homekaaraCode: "EIV/NOC/103SR", colorName: "Camel", slNo: 8 },
    ]
  },
  {
    name: "Claryx",
    categoryType: "Sunscreen",
    blindsType: "Roller-Blinds",
    type: "Roller",
    supplier: "VIENTO",
    catalog: "Contract",
    maxWidth: '96"',
    itemMrp: 249,
    cassetteMrp: 349,
    colors: [
      { supplierCode: "DS 2006", homekaaraCode: "EIV/NOC/6002SD", colorName: "Smoke", slNo: 9 },
      { supplierCode: "DS 2005", homekaaraCode: "EIV/NOC/5002SD", colorName: "Beach", slNo: 10 },
      { supplierCode: "DS 2004", homekaaraCode: "EIV/NOC/4002SD", colorName: "Oyster", slNo: 11 },
    ]
  },
  {
    name: "Noctile",
    categoryType: "Blackout",
    blindsType: "Roller-Blinds",
    type: "Roller",
    supplier: "VIENTO",
    catalog: "Contract",
    maxWidth: '96"',
    itemMrp: 179,
    cassetteMrp: 279,
    colors: [
      { supplierCode: "EB1019", homekaaraCode: "EIV/NOC/9101BE", colorName: "Iron", slNo: 21 },
      { supplierCode: "EB110", homekaaraCode: "EIV/NOC/011BE", colorName: "Wood", slNo: 22 },
      { supplierCode: "EB109", homekaaraCode: "EIV/NOC/901BE", colorName: "Desert", slNo: 23 },
      { supplierCode: "EB108", homekaaraCode: "EIV/NOC/801BE", colorName: "Midnight", slNo: 24 },
      { supplierCode: "EB1022", homekaaraCode: "EIV/NOC/2201BE", colorName: "Klein", slNo: 25 },
      { supplierCode: "EB104", homekaaraCode: "EIV/NOC/401BE", colorName: "Cloud", slNo: 26 },
      { supplierCode: "EB107", homekaaraCode: "EIV/NOC/701BE", colorName: "Carmine", slNo: 27 },
      { supplierCode: "EB106", homekaaraCode: "EIV/NOC/601BE", colorName: "Peach", slNo: 28 },
      { supplierCode: "EB105", homekaaraCode: "EIV/NOC/501BE", colorName: "Beach", slNo: 29 },
      { supplierCode: "EB103", homekaaraCode: "EIV/NOC/301BE", colorName: "Sand", slNo: 30 },
      { supplierCode: "EB102", homekaaraCode: "EIV/NOC/201BE", colorName: "Oyster", slNo: 31 },
      { supplierCode: "EB101", homekaaraCode: "EIV/NOC/101BE", colorName: "White", slNo: 32 },
    ]
  },
  {
    name: "Subtile",
    categoryType: "Dimout",
    blindsType: "Roller-Blinds",
    type: "Roller",
    supplier: "VIENTO",
    catalog: "Contract",
    maxWidth: '96"',
    itemMrp: 179,
    cassetteMrp: 279,
    colors: [
      { supplierCode: "TR 610", homekaaraCode: "EIV/NOC/016RT", colorName: "Desert", slNo: 33 },
      { supplierCode: "TR 609", homekaaraCode: "EIV/NOC/906RT", colorName: "Wood", slNo: 34 },
      { supplierCode: "TR 608", homekaaraCode: "EIV/NOC/806RT", colorName: "Cloud", slNo: 35 },
      { supplierCode: "TR 607", homekaaraCode: "EIV/NOC/706RT", colorName: "Klein", slNo: 36 },
      { supplierCode: "TR 606", homekaaraCode: "EIV/NOC/606RT", colorName: "Carmine", slNo: 37 },
      { supplierCode: "TR 605", homekaaraCode: "EIV/NOC/506RT", colorName: "Peach", slNo: 38 },
      { supplierCode: "TR 604", homekaaraCode: "EIV/NOC/406RT", colorName: "Mellow", slNo: 39 },
      { supplierCode: "TR 603", homekaaraCode: "EIV/NOC/306RT", colorName: "Beach", slNo: 40 },
      { supplierCode: "TR 602", homekaaraCode: "EIV/NOC/206RT", colorName: "Sand", slNo: 41 },
      { supplierCode: "TR 601", homekaaraCode: "EIV/NOC/106RT", colorName: "White", slNo: 42 },
    ]
  },
  {
    name: "Subdual",
    categoryType: "Semi Blackout",
    blindsType: "Zebra-Blinds",
    type: "Zebra",
    supplier: "VIENTO",
    catalog: "Sunshade",
    maxWidth: '96"',
    itemMrp: 299,
    cassetteMrp: 0,
    colors: [
      { supplierCode: "B70-16", homekaaraCode: "EIV/NOC/61-07B", colorName: "Rust", slNo: 91 },
      { supplierCode: "B70-15", homekaaraCode: "EIV/NOC/51-07B", colorName: "Mahogany", slNo: 92 },
      { supplierCode: "B70-13", homekaaraCode: "EIV/NUS/31-07B", colorName: "Steel", slNo: 93 },
      { supplierCode: "B70-12", homekaaraCode: "EIV/NUS/21-07B", colorName: "Syrup", slNo: 94 },
      { supplierCode: "B70-10", homekaaraCode: "EIV/CED/01-07B", colorName: "Black", slNo: 95 },
      { supplierCode: "B70-08", homekaaraCode: "EIV/NUS/80-07B", colorName: "Brunette", slNo: 96 },
      { supplierCode: "B70-07", homekaaraCode: "EIV/NUS/70-07B", colorName: "Saddle", slNo: 97 },
      { supplierCode: "B70-06", homekaaraCode: "EIV/NUS/60-07B", colorName: "Wood", slNo: 98 },
      { supplierCode: "B70-05", homekaaraCode: "EIV/NUS/50-07B", colorName: "Cider", slNo: 99 },
      { supplierCode: "B70-04", homekaaraCode: "EIV/NUS/40-07B", colorName: "Balsam", slNo: 100 },
      { supplierCode: "B70-03", homekaaraCode: "EIV/NUS/30-07B", colorName: "Cloud", slNo: 101 },
      { supplierCode: "B70-02", homekaaraCode: "EIV/NUS/20-07B", colorName: "Sand", slNo: 102 },
      { supplierCode: "B70-01", homekaaraCode: "EIV/NUS/10-07B", colorName: "Oyster", slNo: 103 },
    ]
  },
  {
    name: "Linendual",
    categoryType: "Dual-Shade",
    blindsType: "Zebra-Blinds",
    type: "Zebra",
    supplier: "VIENTO",
    catalog: "Decoshades",
    maxWidth: '112"',
    itemMrp: 499,
    cassetteMrp: 0,
    colors: [
      { supplierCode: "A2-09", homekaaraCode: "EIV/NOC/90-2A", colorName: "Silver", slNo: 104 },
      { supplierCode: "A2-08", homekaaraCode: "EIV/NOC/80-2A", colorName: "Cedar", slNo: 105 },
      { supplierCode: "A2-07", homekaaraCode: "EIV/NUS/70-2A", colorName: "Steel", slNo: 106 },
      { supplierCode: "A2-06", homekaaraCode: "EIV/NUS/60-2A", colorName: "Ice", slNo: 107 },
      { supplierCode: "A2-05", homekaaraCode: "EIV/CED/50-2A", colorName: "Iron", slNo: 108 },
      { supplierCode: "A2-04", homekaaraCode: "EIV/CED/40-2A", colorName: "Silver", slNo: 109 },
      { supplierCode: "A2-03", homekaaraCode: "EIV/NUS/30-2A", colorName: "Sand", slNo: 110 },
      { supplierCode: "A2-02", homekaaraCode: "EIV/NUS/20-2A", colorName: "Beach", slNo: 111 },
      { supplierCode: "A2-01", homekaaraCode: "EIV/CED/10-2A", colorName: "White", slNo: 112 },
    ]
  },
];

// Parsed track items from tracks.csv
export const TRACK_ITEMS: TrackItem[] = [
  {
    name: "Kings Choice Track",
    color: "White",
    brand: "Kings",
    trackMrp: 88,
    pleated: "Available",
    rippleFold: "Available",
    mountTypes: ["ceiling", "wall"],
    accessories: {
      runner: 3.6,
      endCap: 10,
      ceilingBracket: 22,
      wallSingleBracket: 26,
      wallDoubleBracket: 84,
      jointer: 80,
      overlap: 520,
      wand: 2080,
    }
  },
  {
    name: "Modique Curtain Track",
    color: "White",
    brand: "HOMEKAARA",
    trackMrp: 118.67,
    pleated: "Available",
    rippleFold: "Available",
    mountTypes: ["ceiling", "wall"],
    accessories: {
      runner: 10,
      endCap: 32,
      ceilingBracket: 40,
      wallSingleBracket: 220,
      wallDoubleBracket: 388,
      jointer: 260,
      overlap: 520,
      magnet: 220,
      wand: 2080,
    }
  },
  {
    name: "Modique Curtain Track",
    color: "Ivory",
    brand: "HOMEKAARA",
    trackMrp: 118.67,
    pleated: "Available",
    rippleFold: "Available",
    mountTypes: ["ceiling", "wall"],
    accessories: {
      runner: 10,
      endCap: 32,
      ceilingBracket: 40,
      wallSingleBracket: 220,
      wallDoubleBracket: 388,
      jointer: 260,
      overlap: 520,
      magnet: 220,
      wand: 2080,
    }
  },
  {
    name: "Modique Curtain Track",
    color: "Black",
    brand: "HOMEKAARA",
    trackMrp: 118.67,
    pleated: "Available",
    rippleFold: "Available",
    mountTypes: ["ceiling", "wall"],
    accessories: {
      runner: 10,
      endCap: 32,
      ceilingBracket: 40,
      wallSingleBracket: 220,
      wallDoubleBracket: 388,
      jointer: 260,
      overlap: 520,
      magnet: 220,
      wand: 2080,
    }
  },
  {
    name: "Glide Curtain Track",
    color: "Ivory",
    brand: "HOMEKAARA",
    trackMrp: 220,
    pleated: "Available",
    rippleFold: "Available",
    mountTypes: ["ceiling", "wall"],
    accessories: {
      runner: 30,
      endCap: 104,
      ceilingBracket: 116,
      wallSingleBracket: 156,
      wallDoubleBracket: 392,
      jointer: 516,
      overlap: 912,
      magnet: 360,
      wand: 2080,
      bendingJointer: 800,
      extraLongBracket: 1592,
    }
  },
  {
    name: "Glide Curtain Track",
    color: "Black",
    brand: "HOMEKAARA",
    trackMrp: 236,
    pleated: "Available",
    rippleFold: "Available",
    mountTypes: ["ceiling", "wall"],
    accessories: {
      runner: 30,
      endCap: 208,
      ceilingBracket: 1160,
      wallSingleBracket: 440,
      wallDoubleBracket: 1160,
      jointer: 516,
      overlap: 912,
      magnet: 360,
      wand: 2080,
      bendingJointer: 800,
      extraLongBracket: 1592,
    }
  },
  {
    name: "Homekaara Motor Track",
    color: "Ivory",
    brand: "HOMEKAARA",
    trackMrp: 1960,
    pleated: "Available",
    rippleFold: "Available",
    mountTypes: ["ceiling", "wall"],
    accessories: {
      runner: 50,
      endCap: 0,
      ceilingBracket: 50,
      wallSingleBracket: 376,
      wallDoubleBracket: 676,
      jointer: 800,
      overlap: 880,
      wand: 2080,
      motor: 16240,
      remote2ch: 2748,
      remote4ch: 3500,
      remote6ch: 4240,
      bendingJointer: 9600,
    }
  },
];

// Parsed rod items from rods.csv
export const ROD_ITEMS: RodItem[] = [
  {
    name: "SS Rod",
    brand: "HOMEKAARA",
    rodPerFeet: 75,
    endCap: 120,
    roundBallFinial: 240,
    singleLineFinial: 300,
    dimFineFinial: 300,
    accordTieback: 1400,
    singleBracket: 440,
    doubleBracket: 660,
    bend: 500,
    rings: 36,
  },
  {
    name: "Black Rod",
    brand: "HOMEKAARA",
    rodPerFeet: 160,
    endCap: 120,
    roundBallFinial: 240,
    singleLineFinial: 300,
    dimFineFinial: 300,
    accordTieback: 1400,
    singleBracket: 440,
    doubleBracket: 660,
    bend: 500,
    rings: 36,
  },
  {
    name: "Antique Rod",
    brand: "HOMEKAARA",
    rodPerFeet: 171.67,
    endCap: 120,
    roundBallFinial: 240,
    singleLineFinial: 300,
    dimFineFinial: 300,
    accordTieback: 1400,
    singleBracket: 440,
    doubleBracket: 660,
    bend: 500,
    rings: 36,
  },
];

// Generate inventory items from the parsed data
export function generateBlindInventoryItems(userId: string) {
  const items: any[] = [];
  
  for (const blind of BLIND_MATERIALS) {
    // Create one inventory item per color variant
    for (const color of blind.colors) {
      items.push({
        user_id: userId,
        name: `${blind.name} - ${color.colorName}`,
        description: `${blind.categoryType} ${blind.blindsType} - ${color.colorName}`,
        sku: color.homekaaraCode,
        category: 'blind_material',
        subcategory: blind.categoryType.toLowerCase().replace(' ', '_'),
        cost_price: blind.itemMrp * 0.6, // Assume 40% margin
        selling_price: blind.itemMrp,
        supplier: blind.supplier,
        unit: 'sqft',
        active: true,
        show_in_quote: true,
        color: color.colorName,
        treatment_type: blind.type.toLowerCase(),
        system_type: blind.blindsType.toLowerCase().replace('-', '_'),
        metadata: {
          supplier_code: color.supplierCode,
          homekaara_code: color.homekaaraCode,
          sl_no: color.slNo,
          cassette_mrp: blind.cassetteMrp,
          max_width: blind.maxWidth,
          catalog: blind.catalog,
          pricing_method: 'per_sqft',
          category_type: blind.categoryType,
          blinds_type: blind.blindsType,
        }
      });
    }
  }
  
  return items;
}

export function generateTrackInventoryItems(userId: string) {
  const items: any[] = [];
  
  for (const track of TRACK_ITEMS) {
    const colorSuffix = track.color !== 'White' ? ` - ${track.color}` : '';
    items.push({
      user_id: userId,
      name: `${track.name}${colorSuffix}`,
      description: `${track.brand} Curtain Track - ${track.pleated === 'Available' ? 'Pleated' : ''} ${track.rippleFold === 'Available' ? 'Ripple Fold' : ''}`.trim(),
      category: 'hardware',
      subcategory: 'track',
      cost_price: track.trackMrp * 0.6,
      selling_price: track.trackMrp,
      supplier: track.brand,
      unit: 'feet',
      active: true,
      show_in_quote: true,
      color: track.color,
      hardware_finish: track.color,
      hardware_mounting_type: track.mountTypes.join(','),
      treatment_type: 'curtain',
      metadata: {
        brand: track.brand,
        mount_types: track.mountTypes,
        pleated_compatible: track.pleated === 'Available',
        ripple_fold_compatible: track.rippleFold === 'Available',
        pricing_method: 'per_ft',
        accessories: track.accessories,
        compatible_headings: ['pleated', 'wave', 'european', 's-fold'],
      }
    });
  }
  
  return items;
}

export function generateRodInventoryItems(userId: string) {
  const items: any[] = [];
  
  for (const rod of ROD_ITEMS) {
    items.push({
      user_id: userId,
      name: rod.name,
      description: `${rod.brand} Curtain Rod`,
      category: 'hardware',
      subcategory: 'rod',
      cost_price: rod.rodPerFeet * 0.6,
      selling_price: rod.rodPerFeet,
      supplier: rod.brand,
      unit: 'feet',
      active: true,
      show_in_quote: true,
      hardware_finish: rod.name.replace(' Rod', ''),
      treatment_type: 'curtain',
      metadata: {
        brand: rod.brand,
        pricing_method: 'per_ft',
        accessories: {
          end_cap: rod.endCap,
          round_ball_finial: rod.roundBallFinial,
          single_line_finial: rod.singleLineFinial,
          dim_fine_finial: rod.dimFineFinial,
          accord_tieback: rod.accordTieback,
          single_bracket: rod.singleBracket,
          double_bracket: rod.doubleBracket,
          bend: rod.bend,
          rings: rod.rings,
        },
        compatible_headings: ['eyelet', 'rod_pocket'],
      }
    });
  }
  
  return items;
}
