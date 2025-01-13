import React from 'react';
import { Edit, Shield, ShieldOff } from 'lucide-react';
import { User } from '../../../types/user';

interface UserListItemProps {
  user: User;
  onEdit: (user: User) => void;
  onToggleAdmin: (userId: string, isAdmin: boolean) => Promise<void>;
}

export function UserListItem({ user, onEdit, onToggleAdmin }: UserListItemProps) {
  const handleToggleAdmin = async () => {
    await onToggleAdmin(user.id, !user.isAdmin);
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {user.first_name} {user.last_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.plate_number}</div>
        <div className="text-sm text-gray-500">{user.vehicle_model}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {user.isAdmin ? 'Admin' : 'User'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(user)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleToggleAdmin}
            className={`${
              user.isAdmin ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
            }`}
          >
            {user.isAdmin ? (
              <ShieldOff className="h-5 w-5" />
            ) : (
              <Shield className="h-5 w-5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}