import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function checkUserRole(user: User | null): Promise<'admin' | 'user' | null> {
  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking user role:', error);
      // Return 'user' as default role if there's an error
      return 'user';
    }

    // If no role is found, create a default user role
    if (!data) {
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert([{ user_id: user.id, role: 'user' }]);

      if (insertError) {
        console.error('Error creating default user role:', insertError);
      }
      return 'user';
    }

    return data.role;
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return 'user';
  }
}

export async function requireAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  
  try {
    const role = await checkUserRole(user);
    return role === 'admin';
  } catch (error) {
    console.error('Error in requireAdmin:', error);
    return false;
  }
}

export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    throw new Error(error.message);
  }
}