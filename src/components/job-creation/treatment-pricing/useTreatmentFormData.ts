
import { useState } from "react";

export interface TreatmentFormData {
  product_name: string;
  rail_width: string;
  drop: string;
  pooling: string;
  quantity: number;
  fabric_type: string;
  fabric_code: string;
  fabric_cost_per_yard: string;
  fabric_width: string;
  roll_direction: string;
  heading_fullness: string;
  selected_options: string[];
  notes: string;
  images: File[];
}

export const useTreatmentFormData = (treatmentType: string, windowCovering?: any) => {
  const [formData, setFormData] = useState<TreatmentFormData>({
    product_name: windowCovering?.name || treatmentType,
    rail_width: "",
    drop: "",
    pooling: "0",
    quantity: 1,
    fabric_type: "",
    fabric_code: "",
    fabric_cost_per_yard: "",
    fabric_width: "137",
    roll_direction: "horizontal",
    heading_fullness: "2.5",
    selected_options: [],
    notes: "",
    images: []
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      product_name: windowCovering?.name || treatmentType,
      rail_width: "",
      drop: "",
      pooling: "0",
      quantity: 1,
      fabric_type: "",
      fabric_code: "",
      fabric_cost_per_yard: "",
      fabric_width: "137",
      roll_direction: "horizontal",
      heading_fullness: "2.5",
      selected_options: [],
      notes: "",
      images: []
    });
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    resetForm
  };
};
