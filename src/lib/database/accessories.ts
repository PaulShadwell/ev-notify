import { supabase } from '../supabase';

export interface Accessory {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  created_at?: string;
}

export async function fetchAccessories() {
  const { data, error } = await supabase
    .from('accessories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch accessories: ${error.message}`);
  }

  return data || [];
}

export async function createAccessory(accessory: Omit<Accessory, 'id' | 'created_at'>) {
  const { error } = await supabase
    .from('accessories')
    .insert([accessory]);

  if (error) {
    throw new Error(`Failed to create accessory: ${error.message}`);
  }
}

export async function updateAccessory(id: string, data: Partial<Accessory>) {
  const { error } = await supabase
    .from('accessories')
    .update(data)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update accessory: ${error.message}`);
  }
}

export async function deleteAccessory(id: string) {
  const { error } = await supabase
    .from('accessories')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete accessory: ${error.message}`);
  }
}