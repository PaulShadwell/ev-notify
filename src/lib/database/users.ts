import { supabase } from '../supabase';
import { User } from '../../types/user';
import { getProfile, updateProfile } from './profiles';
import { getAllUserRoles, getUserRole, toggleAdminRole } from './roles';

export async function fetchUsers(): Promise<User[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  const roles = await getAllUserRoles();
  const adminIds = new Set(roles.filter(r => r.role === 'admin').map(r => r.user_id));

  return (profiles || []).map(profile => ({
    ...profile,
    isAdmin: adminIds.has(profile.id)
  }));
}

export async function updateUser(userId: string, userData: Partial<User>): Promise<User> {
  // First check if profile exists
  const profile = await getProfile(userId);
  if (!profile) {
    throw new Error(`Profile not found for user ${userId}`);
  }

  const updatedProfile = await updateProfile(userId, userData);
  const role = await getUserRole(userId);

  return {
    ...updatedProfile,
    isAdmin: role === 'admin'
  };
}

export async function toggleUserAdmin(userId: string, makeAdmin: boolean): Promise<void> {
  // First check if profile exists
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to check profile: ${profileError.message}`);
  }

  if (!profile) {
    throw new Error(`Profile not found for user ${userId}`);
  }

  await toggleAdminRole(userId, makeAdmin);
}