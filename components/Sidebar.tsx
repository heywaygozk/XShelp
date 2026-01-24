
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { User, UserRole } from '../types';
import { NAVIGATION_ITEMS, AppLogo } from '../constants';

interface SidebarProps {
  user: User;
  users: User[];
  onNavClick?: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ user, users, onNavClick, className }) => {
  const filteredItems = NAVIGATION_ITEMS.filter(item => item.roles.includes(user.role));

  const displayPoints = useMemo(() => {
    if (user.role === UserRole.ADMIN) {
      // Calculate total points of ALL users EXCEPT admins
      return users.filter(u => u.role !== UserRole.ADMIN).reduce((sum, u) => sum + u.points, 0);
    }
    return user.points;
  }, [user, users]);

  return (
    <aside className={`${className} w-64 bg-white border-r border-slate-200 flex flex-col shrink-0`}>
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <AppLogo className="h-9 w-9" />
          <span className="font-black text-slate-800 text-xl tracking-tight">象山帮帮</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                isActive
                  ? 'bg-red-50 text-nb-red'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {React.cloneElement(item.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-900 rounded-2xl p-5 shadow-inner">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
            {user.role === UserRole.ADMIN ? '全行结算总池' : '个人积分余额'}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white">{displayPoints.toLocaleString()}</span>
            <div className="h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-[10px] font-black text-slate-900">P</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
