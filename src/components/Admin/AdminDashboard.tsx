import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { AdminNav } from './AdminNav';
import { UserManagement } from './UserManagement';
import { ChatManagement } from './ChatManagement';
import { AccessoryManagement } from './AccessoryManagement';
import { requireAdmin } from '../../lib/auth';

interface AdminDashboardProps {
  session: Session;
}

export function AdminDashboard({ session }: AdminDashboardProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const hasAccess = await requireAdmin(session.user);
      setIsAdmin(hasAccess);
    };
    checkAdmin();
  }, [session]);

  if (isAdmin === null) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<UserManagement session={session} />} />
          <Route path="/users" element={<UserManagement session={session} />} />
          <Route path="/chats" element={<ChatManagement session={session} />} />
          <Route path="/accessories" element={<AccessoryManagement session={session} />} />
        </Routes>
      </main>
    </div>
  );
}