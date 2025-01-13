import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, ShoppingBag, Home } from 'lucide-react';

export function AdminNav() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">Admin Dashboard</span>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <Home className="w-5 h-5 mr-1" />
                Back to Dashboard
              </Link>
              <Link
                to="/admin/users"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <Users className="w-5 h-5 mr-1" />
                Users
              </Link>
              <Link
                to="/admin/chats"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <MessageSquare className="w-5 h-5 mr-1" />
                Chats
              </Link>
              <Link
                to="/admin/accessories"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <ShoppingBag className="w-5 h-5 mr-1" />
                Accessories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}