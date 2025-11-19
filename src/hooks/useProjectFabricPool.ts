import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SurfaceUsage {
  surfaceId: string;
  surfaceName: string;
  orderedForThis: number;
  usedByThis: number;
  leftoverFromThis: number;
  usedFromPool: number;
  orientation: string;
  widthsOrdered: number;
  timestamp: string;
}

export interface FabricPoolEntry {
  fabricId: string;
  fabricName: string;
  fabricWidth: number;
  totalOrdered: number;
  totalUsed: number;
  availableLeftover: number;
  unit: string;
  costPerUnit: number;
  surfaces: SurfaceUsage[];
}

export interface FabricPools {
  [fabricId: string]: FabricPoolEntry;
}

export interface PoolUsage {
  availableFromPool: number;
  usedFromPool: number;
  needsOrdering: number;
  leftoverFromOrder: number;
  addedToPool: number;
  costSavings: number;
}

// Fetch project fabric pools
export const useProjectFabricPools = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ["project-fabric-pools", projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const { data, error } = await supabase
        .from("projects")
        .select("fabric_pools")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      return (data?.fabric_pools as unknown as FabricPools) || {};
    },
    enabled: !!projectId,
  });
};

// Calculate fabric needs considering pool
export const calculateFabricNeeds = (
  fabricId: string,
  requiredAmount: number,
  fabricPools: FabricPools | null,
  costPerUnit: number
): PoolUsage => {
  const pool = fabricPools?.[fabricId];
  const availableFromPool = pool?.availableLeftover || 0;

  let usedFromPool = 0;
  let needsOrdering = 0;
  let leftoverFromOrder = 0;

  if (availableFromPool >= requiredAmount) {
    // Use entirely from pool
    usedFromPool = requiredAmount;
    needsOrdering = 0;
  } else if (availableFromPool > 0) {
    // Use partial from pool + order rest
    usedFromPool = availableFromPool;
    needsOrdering = requiredAmount - availableFromPool;
  } else {
    // No pool available, order full amount
    usedFromPool = 0;
    needsOrdering = requiredAmount;
  }

  const costSavings = usedFromPool * costPerUnit;

  return {
    availableFromPool,
    usedFromPool,
    needsOrdering,
    leftoverFromOrder: 0, // Will be calculated after actual ordering
    addedToPool: 0,
    costSavings,
  };
};

// Update project fabric pool
export const useUpdateProjectFabricPool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      fabricId,
      surfaceId,
      surfaceName,
      orderedForThis,
      usedByThis,
      leftoverFromThis,
      usedFromPool,
      orientation,
      widthsOrdered,
      fabricName,
      fabricWidth,
      unit,
      costPerUnit,
    }: {
      projectId: string;
      fabricId: string;
      surfaceId: string;
      surfaceName: string;
      orderedForThis: number;
      usedByThis: number;
      leftoverFromThis: number;
      usedFromPool: number;
      orientation: string;
      widthsOrdered: number;
      fabricName: string;
      fabricWidth: number;
      unit: string;
      costPerUnit: number;
    }) => {
      // Get current pools
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("fabric_pools")
        .eq("id", projectId)
        .single();

      if (fetchError) throw fetchError;

      const currentPools = (project?.fabric_pools as unknown as FabricPools) || {};
      const pool = currentPools[fabricId] || {
        fabricId,
        fabricName,
        fabricWidth,
        totalOrdered: 0,
        totalUsed: 0,
        availableLeftover: 0,
        unit,
        costPerUnit,
        surfaces: [],
      };

      // Update or add surface usage
      const existingSurfaceIndex = pool.surfaces.findIndex(
        (s) => s.surfaceId === surfaceId
      );

      const newSurface: SurfaceUsage = {
        surfaceId,
        surfaceName,
        orderedForThis,
        usedByThis,
        leftoverFromThis,
        usedFromPool,
        orientation,
        widthsOrdered,
        timestamp: new Date().toISOString(),
      };

      if (existingSurfaceIndex >= 0) {
        // Update existing surface
        pool.surfaces[existingSurfaceIndex] = newSurface;
      } else {
        // Add new surface
        pool.surfaces.push(newSurface);
      }

      // Recalculate totals
      pool.totalOrdered = pool.surfaces.reduce(
        (sum, s) => sum + s.orderedForThis,
        0
      );
      pool.totalUsed = pool.surfaces.reduce((sum, s) => sum + s.usedByThis, 0);
      pool.availableLeftover = pool.totalOrdered - pool.totalUsed;

      // Update pools object
      currentPools[fabricId] = pool;

      // Save to database
      const { error: updateError } = await supabase
        .from("projects")
        .update({ fabric_pools: currentPools as unknown as any })
        .eq("id", projectId);

      if (updateError) throw updateError;

      return currentPools;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-fabric-pools", variables.projectId],
      });
    },
    onError: (error) => {
      console.error("Error updating fabric pool:", error);
      toast.error("Failed to update fabric pool");
    },
  });
};

// Remove surface from pool (when surface is deleted)
export const useRemoveSurfaceFromPool = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      surfaceId,
    }: {
      projectId: string;
      surfaceId: string;
    }) => {
      // Get current pools
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("fabric_pools")
        .eq("id", projectId)
        .single();

      if (fetchError) throw fetchError;

      const currentPools = (project?.fabric_pools as unknown as FabricPools) || {};

      // Remove surface from all fabric pools
      Object.keys(currentPools).forEach((fabricId) => {
        const pool = currentPools[fabricId];
        pool.surfaces = pool.surfaces.filter((s) => s.surfaceId !== surfaceId);

        // Recalculate totals
        pool.totalOrdered = pool.surfaces.reduce(
          (sum, s) => sum + s.orderedForThis,
          0
        );
        pool.totalUsed = pool.surfaces.reduce(
          (sum, s) => sum + s.usedByThis,
          0
        );
        pool.availableLeftover = pool.totalOrdered - pool.totalUsed;

        // Remove pool if no surfaces left
        if (pool.surfaces.length === 0) {
          delete currentPools[fabricId];
        }
      });

      // Save to database
      const { error: updateError } = await supabase
        .from("projects")
        .update({ fabric_pools: currentPools as unknown as any })
        .eq("id", projectId);

      if (updateError) throw updateError;

      return currentPools;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-fabric-pools", variables.projectId],
      });
    },
    onError: (error) => {
      console.error("Error removing surface from pool:", error);
      toast.error("Failed to remove surface from pool");
    },
  });
};

// Get available pool for specific fabric
export const getAvailablePool = (
  fabricId: string,
  fabricPools: FabricPools | null
): number => {
  const pool = fabricPools?.[fabricId];
  return pool?.availableLeftover || 0;
};
