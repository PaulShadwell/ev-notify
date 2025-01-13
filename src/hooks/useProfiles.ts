import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  avatar_url: string | null;
  plate_number: string;
  vehicle_model: string;
}

export function useProfiles(userIds: string[]) {
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    if (userIds.length === 0) return;

    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, avatar_url, plate_number, vehicle_model')
        .in('id', userIds);

      if (!error && data) {
        const profileMap = data.reduce((acc, profile) => ({
          ...acc,
          [profile.id]: profile
        }), {});
        setProfiles(profileMap);
      }
    };

    fetchProfiles();
  }, [userIds.join(',')]);

  return { profiles };
}