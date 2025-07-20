
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ServiceOption {
  id: string;
  name: string;
  price: number;
  unit: string;
  description?: string;
  active: boolean;
}

// Mock data
const mockServiceOptions: ServiceOption[] = [
  {
    id: "1",
    name: "Installation Service",
    price: 50,
    unit: "per-window",
    description: "Professional curtain installation",
    active: true
  },
  {
    id: "2",
    name: "Measurement Service",
    price: 30,
    unit: "per-room",
    description: "Accurate window measurements",
    active: true
  }
];

export const useServiceOptions = () => {
  return useQuery({
    queryKey: ['service-options'],
    queryFn: async () => mockServiceOptions
  });
};

export const useCreateServiceOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (option: Omit<ServiceOption, 'id'>) => {
      const newOption = { ...option, id: Date.now().toString() };
      return newOption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
      toast.success('Service option created');
    }
  });
};

export const useUpdateServiceOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (option: Partial<ServiceOption> & { id: string }) => {
      return option;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
      toast.success('Service option updated');
    }
  });
};

export const useDeleteServiceOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-options'] });
      toast.success('Service option deleted');
    }
  });
};
