
import { supabase } from '@/integrations/supabase/client';
import type { WindowCoveringOption } from '../types/windowCoveringOptionsTypes';

export const createOption = async (option: Omit<WindowCoveringOption, 'id'>) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('window_covering_options')
    .insert([
      {
        ...option,
        user_id: user.id
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateOption = async (id: string, updates: Partial<WindowCoveringOption>) => {
  const { data, error } = await supabase
    .from('window_covering_options')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteOption = async (id: string) => {
  const { error } = await supabase
    .from('window_covering_options')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
