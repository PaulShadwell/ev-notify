import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { AccessoryCard } from './AccessoryCard';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

interface AccessoriesProps {
  session: Session | null;
}

export function Accessories({ session }: AccessoriesProps) {
  const [accessories, setAccessories] = useState<any[]>([]);
  const [featuredAccessory, setFeaturedAccessory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccessories = async () => {
      const { data } = await supabase
        .from('accessories')
        .select(`
          *,
          accessory_ratings(rating, user_id)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        const processedData = data.map(accessory => ({
          ...accessory,
          userRating: session?.user ? accessory.accessory_ratings.find(
            (r: any) => r.user_id === session.user.id
          )?.rating : null,
          average_rating: accessory.accessory_ratings.length
            ? accessory.accessory_ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / 
              accessory.accessory_ratings.length
            : 0
        }));

        setAccessories(processedData);
        setFeaturedAccessory(processedData[0]);
      }
    };

    fetchAccessories();
  }, [session?.user?.id]);

  const handleRate = async (accessoryId: string, rating: number) => {
    if (!session) {
      return;
    }

    try {
      setError(null);
      const { error: upsertError } = await supabase
        .from('accessory_ratings')
        .upsert([
          {
            accessory_id: accessoryId,
            user_id: session.user.id,
            rating,
          }
        ]);

      if (upsertError) throw upsertError;

      // Refresh the accessories list
      const { data } = await supabase
        .from('accessories')
        .select(`
          *,
          accessory_ratings(rating, user_id)
        `)
        .order('created_at', { ascending: false });

      if (data) {
        const processedData = data.map(accessory => ({
          ...accessory,
          userRating: accessory.accessory_ratings.find(
            (r: any) => r.user_id === session.user.id
          )?.rating,
          average_rating: accessory.accessory_ratings.length
            ? accessory.accessory_ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0) / 
              accessory.accessory_ratings.length
            : 0
        }));
        setAccessories(processedData);
      }
    } catch (err) {
      setError('Failed to update rating. Please try again.');
      console.error('Rating error:', err);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
          {error}
        </div>
      )}

      {!session && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <LogIn className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <Link to="/login" className="font-medium underline hover:text-blue-600">
                  Sign in
                </Link>
                {' '}to rate accessories and save your favorites.
              </p>
            </div>
          </div>
        </div>
      )}

      {featuredAccessory && (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Accessory of the Day</h2>
          <AccessoryCard
            accessory={featuredAccessory}
            onRate={(rating) => handleRate(featuredAccessory.id, rating)}
            requireAuth={!session}
          />
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Top Rated Accessories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessories
            .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
            .slice(0, 10)
            .map((accessory) => (
              <AccessoryCard
                key={accessory.id}
                accessory={accessory}
                onRate={(rating) => handleRate(accessory.id, rating)}
                requireAuth={!session}
              />
            ))}
        </div>
      </div>
    </div>
  );
}