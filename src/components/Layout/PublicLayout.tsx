import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { MapPin, ShoppingBag, MessageSquare, LogIn, Menu, X } from 'lucide-react';

interface PublicLayoutProps {
  session: Session | null;
}

export function PublicLayout({ session }: PublicLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLinks = () => (
    <>
      <Link
        to="/charging-stations"
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        onClick={() => setIsMenuOpen(false)}
      >
        <MapPin className="w-5 h-5 mr-1" />
        Charging Stations
      </Link>
      <Link
        to="/accessories"
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        onClick={() => setIsMenuOpen(false)}
      >
        <ShoppingBag className="w-5 h-5 mr-1" />
        Accessories
      </Link>
      {session ? (
        <Link
          to="/dashboard/chat"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          onClick={() => setIsMenuOpen(false)}
        >
          <MessageSquare className="w-5 h-5 mr-1" />
          Chat
        </Link>
      ) : (
        <Link
          to="/login"
          className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          onClick={() => setIsMenuOpen(false)}
        >
          <LogIn className="w-5 h-5 mr-1" />
          Sign In
        </Link>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-900"
              >
                EV Notify
              </Link>
              <div className="hidden md:flex md:items-center">
                <NavLinks />
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="pt-2 pb-3 space-y-1">
              <NavLinks />
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}