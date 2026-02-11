import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import ReminderManager from './ReminderManager';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto shadow-xl min-w-[320px] relative">
      <ReminderManager />
      <Outlet />
      {/* Ensure BottomNav is outside the main content flow if possible, but inside the layout container to inherit width context if needed, though fixed ignores it. */}
      <BottomNav />
    </div>
  );
}
