import React from 'react';
import { Star, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccessoryCardProps {
  accessory: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    category: string;
    average_rating?: number;
  };
  onRate: (rating: number) => void;
  requireAuth?: boolean;
}

export function AccessoryCard({ accessory, onRate, requireAuth }: AccessoryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={accessory.image_url}
        alt={accessory.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{accessory.name}</h3>
        <p className="text-sm text-gray-500 mb-2">{accessory.category}</p>
        <p className="text-gray-700 mb-4">{accessory.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {requireAuth ? (
              <Link
                to="/login"
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <LogIn className="w-4 h-4 mr-1" />
                Sign in to rate
              </Link>
            ) : (
              <div className="flex">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => onRate(rating)}
                    className="p-1"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        rating <= (accessory.average_rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          {accessory.average_rating && (
            <span className="text-sm text-gray-500">
              {accessory.average_rating.toFixed(1)} / 5.0
            </span>
          )}
        </div>
      </div>
    </div>
  );
}