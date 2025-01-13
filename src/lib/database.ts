import { supabase } from './supabase';
import { User } from '../types/user';

export async function fetchUsers(): Promise<User[]> {
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profilesError) {
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
  }

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role');

  if (rolesError) {
    throw new Error(`Failed to fetch roles: ${rolesError.message}`);
  }

  const adminIds = new Set(
    (roles || []).filter(r => r.role === 'admin').map(r => r.user_id)
  );

  return (profiles || []).map(profile => ({
    ...profile,
    isAdmin: adminIds.has(profile.id)
  }));
}

export async function updateUserProfile(userId: string, userData: Partial<User>): Promise<User> {
  // Check if profile exists first
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to check profile: ${profileError.message}`);
  }

  if (!existingProfile) {
    throw new Error('Profile not found');
  }

  // Check email uniqueness
  if (userData.email && userData.email !== existingProfile.email) {
    const { data: existingEmails, error: emailError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userData.email)
      .neq('id', userId);

    if (emailError) {
      throw new Error(`Failed to check email uniqueness: ${emailError.message}`);
    }

    if (existingEmails && existingEmails.length > 0) {
      throw new Error('Email already in use');
    }
  }

  // Check plate number uniqueness
  if (userData.plate_number && userData.plate_number !== existingProfile.plate_number) {
    const { data: existingPlates, error: plateError } = await supabase
      .from('profiles')
      .select('id')
      .eq('plate_number', userData.plate_number)
      .neq('id', userId);

    if (plateError) {
      throw new Error(`Failed to check plate number uniqueness: ${plateError.message}`);
    }

    if (existingPlates && existingPlates.length > 0) {
      throw new Error('Plate number already in use');
    }
  }

  // Update profile
  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      plate_number: userData.plate_number,
      vehicle_model: userData.vehicle_model
    })
    .eq('id', userId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update profile: ${updateError.message}`);
  }

  // Get admin status
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  return {
    ...updatedProfile,
    isAdmin: roleData?.role === 'admin'
  };
}

export async function toggleUserAdminRole(userId: string, makeAdmin: boolean): Promise<void> {
  // Check if profile exists first
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Failed to check profile: ${profileError.message}`);
  }

  if (!profile) {
    throw new Error('Profile not found');
  }

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