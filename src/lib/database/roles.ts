import { supabase } from '../supabase';

export async function getUserRole(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch user role: ${error.message}`);
  }

  return data?.role;
}

export async function getAllUserRoles() {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (error) {
    throw new Error(`Failed to fetch user roles: ${error.message}`);
  }

  return data || [];
}

export async function toggleAdminRole(userId: string, makeAdmin: boolean) {
  if (makeAdmin) {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role: 'admin' });
    
    if (error) {
      throw new Error(`Failed to add admin role: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      throw new Error(`Failed to remove admin role: ${error.message}`);
    }
  }
}