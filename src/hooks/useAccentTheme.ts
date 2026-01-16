import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export type AccentTheme = 'brand' | 'winter' | 'spring' | 'summer' | 'autumn';

export interface ThemePalette {
  id: AccentTheme;
  name: string;
  description: string;
  colors: string[]; // Preview colors for the selector
}

export const THEME_PALETTES: ThemePalette[] = [
  {
    id: 'brand',
    name: 'Brand',
    description: 'Your brand colors (teal & sage)',
    colors: ['#415e6b', '#4A8BA0', '#9bb6bc', '#C5D6DA', '#7A9BA3', '#2F4A54', '#5d7d87'],
  },
  {
    id: 'winter',
    name: 'Winter',
    description: 'Cool blues, silvers, deep navy',
    colors: ['#1f4980', '#3b8ed4', '#a8bdd1', '#6b8aa8', '#8fa6be', '#c8d4e0', '#4a6f9c'],
  },
  {
    id: 'spring',
    name: 'Spring',
    description: 'Fresh greens, soft pinks, lavender',
    colors: ['#3d9962', '#e07a9a', '#c4a8d9', '#f5c99d', '#7ac4d9', '#6bb38a', '#f0b8c8'],
  },
  {
    id: 'summer',
    name: 'Summer',
    description: 'Warm yellows, coral, turquoise',
    colors: ['#f5a623', '#3db8b8', '#e87a5d', '#2d9ec9', '#d4c4a0', '#f58a4d', '#4db8d9'],
  },
  {
    id: 'autumn',
    name: 'Autumn',
    description: 'Rich oranges, burgundy, gold',
    colors: ['#cc5500', '#8b2942', '#c9962e', '#a85533', '#d9764a', '#e8a040', '#a32e4a'],
  },
];

// Apply accent theme to document
export const applyAccentTheme = (theme: AccentTheme) => {
  document.documentElement.setAttribute('data-accent', theme);
  localStorage.setItem('accent-theme', theme);
};

// Hook to get current accent theme from database
export const useAccentTheme = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['accent-theme', user?.id],
    queryFn: async () => {
      if (!user) return 'brand' as AccentTheme;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('accent_theme')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.warn('Failed to load accent theme:', error);
        return 'brand' as AccentTheme;
      }
      
      return (data?.accent_theme || 'brand') as AccentTheme;
    },
    enabled: !!user,
    staleTime: Infinity, // Theme doesn't change often
  });
};

// Hook to update accent theme
export const useUpdateAccentTheme = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (theme: AccentTheme) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ accent_theme: theme })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Apply immediately
      applyAccentTheme(theme);
      
      return theme;
    },
    onSuccess: (theme) => {
      queryClient.setQueryData(['accent-theme', user?.id], theme);
      toast.success(`Theme changed to ${THEME_PALETTES.find(p => p.id === theme)?.name}`);
    },
    onError: (error) => {
      console.error('Failed to update accent theme:', error);
      toast.error('Failed to save theme preference');
    },
  });
};

// Hook to initialize theme on app load
export const useInitializeAccentTheme = () => {
  const { data: theme, isSuccess } = useAccentTheme();

  useEffect(() => {
    if (isSuccess && theme) {
      applyAccentTheme(theme);
    } else {
      // Check localStorage for cached theme
      const cached = localStorage.getItem('accent-theme') as AccentTheme | null;
      if (cached && THEME_PALETTES.some(p => p.id === cached)) {
        document.documentElement.setAttribute('data-accent', cached);
      } else {
        document.documentElement.setAttribute('data-accent', 'brand');
      }
    }
  }, [theme, isSuccess]);
};
