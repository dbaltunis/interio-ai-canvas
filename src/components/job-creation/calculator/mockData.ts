
import { FabricLibraryItem, AdditionalFeature } from './types';

export const fabricLibrary: FabricLibraryItem[] = [
  { id: '1', name: 'Premium Linen Blend', code: 'LB001', pricePerYard: 45, width: 140, type: 'Linen', collection: 'Natural' },
  { id: '2', name: 'Velvet Luxe', code: 'VL002', pricePerYard: 65, width: 140, type: 'Velvet', collection: 'Premium' },
  { id: '3', name: 'Cotton Damask', code: 'CD003', pricePerYard: 35, width: 140, type: 'Cotton', collection: 'Classic' },
  { id: '4', name: 'Silk Dupioni', code: 'SD004', pricePerYard: 85, width: 140, type: 'Silk', collection: 'Luxury' },
  { id: '5', name: 'Blackout Thermal', code: 'BT005', pricePerYard: 55, width: 140, type: 'Blackout', collection: 'Functional' },
];

export const availableFeatures: AdditionalFeature[] = [
  { id: '1', name: 'French Pleats', price: 25, selected: false },
  { id: '2', name: 'Contrast Trim', price: 15, selected: false },
  { id: '3', name: 'Blackout Lining', price: 20, selected: false },
  { id: '4', name: 'Thermal Interlining', price: 30, selected: false },
  { id: '5', name: 'Weighted Hem', price: 12, selected: false },
  { id: '6', name: 'Cord Tidy', price: 8, selected: false },
];
