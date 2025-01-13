import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Session } from '@supabase/supabase-js';
import { PublicLayout } from './components/Layout/PublicLayout';
import { ChargingMap } from './components/ChargingStations/ChargingMap';
import { Accessories } from './components/Accessories/Accessories';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout session={session} />}>
          <Route path="/" element={<ChargingMap />} />
          <Route path="/charging-stations" element={<ChargingMap />} />
          <Route path="/accessories" element={<Accessories session={session} />} />
        </Route>

        {/* Authentication routes */}
        <Route
          path="/login"
          element={
            !session ? (
              <Auth />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard/*"
          element={
            session ? (
              <Dashboard session={session} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/admin/*"
          element={
            session ? (
              <AdminDashboard session={session} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;