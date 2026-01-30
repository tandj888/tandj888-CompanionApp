import React from 'react';
import { Home, Users, User, Clock } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function BottomNav() {
  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 transition-colors ${
      isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center z-50 pb-safe">
      <NavLink to="/" className={navItemClass}>
        <Home size={24} />
        <span className="text-xs font-medium">首页</span>
      </NavLink>
      <NavLink to="/group" className={navItemClass}>
        <Users size={24} />
        <span className="text-xs font-medium">小陪团</span>
      </NavLink>
      <NavLink to="/moments" className={navItemClass}>
        <Clock size={24} />
        <span className="text-xs font-medium">时光馆</span>
      </NavLink>
      <NavLink to="/profile" className={navItemClass}>
        <User size={24} />
        <span className="text-xs font-medium">我的</span>
      </NavLink>
    </div>
  );
}
