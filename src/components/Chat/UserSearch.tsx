import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Profile {
  id: string;
  plate_number: string;
  vehicle_model: string;
}

interface UserSearchProps {
  onUserSelect: (user: Profile) => void;
  currentUserId: string;
}

export function UserSearch({ onUserSelect, currentUserId }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Profile[]>([]);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.length < 2) {
      setResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUserId) // Don't show current user
      .ilike('plate_number', `%${value}%`)
      .limit(5);

    if (!error && data) {
      setResults(data);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by plate number..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {results.length > 0 && (
        <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-10">
          {results.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                onUserSelect(user);
                setResults([]);
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="font-medium">{user.plate_number}</div>
              <div className="text-sm text-gray-500">{user.vehicle_model}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}