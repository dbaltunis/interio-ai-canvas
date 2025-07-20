
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface HardwareOption {
  id: string;
  name: string;
  category?: string;
  price: number;
  unit: string;
  description?: string;
  active: boolean;
}

export interface LiningOption {
  id: string;
  name: string;
  price: number;
  unit: string;
  description?: string;
  active: boolean;
}

export interface PartsOption {
  id: string;
  name: string;
  category?: string;
  price: number;
  unit: string;
  description?: string;
  active: boolean;
}

// Mock data
const mockHardwareOptions: HardwareOption[] = [
  {
    id: "1",
    name: "Standard Track",
    category: "Tracks",
    price: 25,
    unit: "per-meter",
    description: "Basic curtain track",
    active: true
  }
];

const mockLiningOptions: LiningOption[] = [
  {
    id: "1",
    name: "Blackout Lining",
    price: 15,
    unit: "per-meter",
    description: "Light blocking lining",
    active: true
  }
];

const mockPartsOptions: PartsOption[] = [
  {
    id: "1",
    name: "Curtain Weights",
    category: "Weights & Chains",
    price: 5,
    unit: "per-piece",
    description: "Lead weights for curtain hems",
    active: true
  }
];

// Hardware Options Hooks
export const useHardwareOptions = () => {
  return useQuery({
    queryKey: ['hardware-options'],
    queryFn: async () => mockHardwareOptions
  });
};

export const useCreateHardwareOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (option: Omit<HardwareOption, 'id'>) => {
      const newOption = { ...option, id: Date.now().toString() };
      return newOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
      toast.success('Hardware option created');
    }
  });
};

export const useUpdateHardwareOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (option: Partial<HardwareOption> & { id: string }) => {
      return option;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
      toast.success('Hardware option updated');
    }
  });
};

export const useDeleteHardwareOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware-options'] });
      toast.success('Hardware option deleted');
    }
  });
};

// Lining Options Hooks
export const useLiningOptions = () => {
  return useQuery({
    queryKey: ['lining-options'],
    queryFn: async () => mockLiningOptions
  });
};

export const useCreateLiningOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (option: Omit<LiningOption, 'id'>) => {
      const newOption = { ...option, id: Date.now().toString() };
      return newOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lining-options'] });
      toast.success('Lining option created');
    }
  });
};

export const useUpdateLiningOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (option: Partial<LiningOption> & { id: string }) => {
      return option;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lining-options'] });
      toast.success('Lining option updated');
    }
  });
};

export const useDeleteLiningOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lining-options'] });
      toast.success('Lining option deleted');
    }
  });
};

// Parts Options Hooks
export const usePartsOptions = () => {
  return useQuery({
    queryKey: ['parts-options'],
    queryFn: async () => mockPartsOptions
  });
};

export const useCreatePartsOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (option: Omit<PartsOption, 'id'>) => {
      const newOption = { ...option, id: Date.now().toString() };
      return newOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-options'] });
      toast.success('Parts option created');
    }
  });
};

export const useUpdatePartsOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (option: Partial<PartsOption> & { id: string }) => {
      return option;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-options'] });
      toast.success('Parts option updated');
    }
  });
};

export const useDeletePartsOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts-options'] });
      toast.success('Parts option deleted');
    }
  });
};
