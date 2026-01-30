import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import ReminderManager from './ReminderManager';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto shadow-xl min-w-[320px] relative">
      <ReminderManager />
      <Outlet />
      <BottomNav />
    </div>
  );
}
