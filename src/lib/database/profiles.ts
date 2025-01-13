import { supabase } from '../supabase';
import { User } from '../../types/user';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  return data;
}

export async function checkEmailUniqueness(email: string, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .neq('id', userId);

  if (error) {
    throw new Error(`Failed to check email uniqueness: ${error.message}`);
  }

  return data?.length === 0;
}

export async function checkPlateNumberUniqueness(plateNumber: string, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('plate_number', plateNumber)
    .neq('id', userId);

  if (error) {
    throw new Error(`Failed to check plate number uniqueness: ${error.message}`);
  }

  return data?.length === 0;
}

export async function updateProfile(userId: string, userData: Partial<User>): Promise<User> {
  const existingProfile = await getProfile(userId);
  if (!existingProfile) {
    throw new Error('Profile not found');
  }

  if (userData.email && userData.email !== existingProfile.email) {
    const isEmailUnique = await checkEmailUniqueness(userData.email, userId);
    if (!isEmailUnique) {
      throw new Error('Email already in use');
    }
  }

  if (userData.plate_number && userData.plate_number !== existingProfile.plate_number) {
    const isPlateUnique = await checkPlateNumberUniqueness(userData.plate_number, userId);
    if (!isPlateUnique) {
      throw new Error('Plate number already in use');
    }
  }

  const { data, error } = await supabase
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

  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`);
  }

  return data;
}