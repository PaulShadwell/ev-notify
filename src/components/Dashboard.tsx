import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { MessageSquare, LogOut, Settings, UserCircle, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Chat } from './Chat/Chat';
import { ProfileEdit } from './Profile/ProfileEdit';
import { checkUserRole } from '../lib/auth';

interface DashboardProps {
  session: Session;
}

export function Dashboard({ session }: DashboardProps) {
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const loadUserRole = async () => {
      const role = await checkUserRole(session.user);
      setUserRole(role);
    };
    loadUserRole();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const NavLinks = () => (
    <>
      <Link
        to="/dashboard/chat"
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        onClick={() => setIsMenuOpen(false)}
      >
        <MessageSquare className="w-5 h-5 mr-1" />
        Chat
      </Link>
      {userRole === 'admin' && (
        <Link
          to="/admin"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          onClick={() => setIsMenuOpen(false)}
        >
          <Settings className="w-5 h-5 mr-1" />
          Admin
        </Link>
      )}
      <Link
        to="/dashboard/profile"
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        onClick={() => setIsMenuOpen(false)}
      >
        <UserCircle className="w-5 h-5 mr-1" />
        Profile
      </Link>
      <button
        onClick={() => {
          handleSignOut();
          setIsMenuOpen(false);
        }}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <LogOut className="w-5 h-5 mr-1" />
        Sign Out
      </button>
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
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard/chat" replace />} />
          <Route path="/chat" element={<Chat session={session} />} />
          <Route path="/profile" element={<ProfileEdit session={session} />} />
        </Routes>
      </main>
    </div>
  );
}