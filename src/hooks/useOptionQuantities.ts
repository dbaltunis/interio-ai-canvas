import { useState, useCallback } from 'react';

export interface OptionQuantity {
  optionId: string;
  quantity: number;
}

export const useOptionQuantities = (initialQuantities: Record<string, number> = {}) => {
  const [quantities, setQuantities] = useState<Record<string, number>>(initialQuantities);

  const setQuantity = useCallback((optionId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [optionId]: quantity
    }));
  }, []);

  const getQuantity = useCallback((optionId: string): number => {
    return quantities[optionId] || 1;
  }, [quantities]);

  const removeQuantity = useCallback((optionId: string) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      delete newQuantities[optionId];
      return newQuantities;
    });
  }, []);

  const getTotalPrice = useCallback((optionId: string, basePrice: number): number => {
    const quantity = getQuantity(optionId);
    return basePrice * quantity;
  }, [getQuantity]);

  return {
    quantities,
    setQuantity,
    getQuantity,
    removeQuantity,
    getTotalPrice,
  };
};
