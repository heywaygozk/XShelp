
import React, { useState, useMemo } from 'react';
import { User, Notification, UserRole } from '../types.ts';
import { Bell, LogOut, Menu, X, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { AppLogo } from '../constants.tsx';

interface HeaderProps {
  user: User;
  notifications: Notification[];
  onLogout: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, notifications, onLogout, onMenuClick }) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (n.targetUid && n.targetUid === user.uid) return true;
      if (n.targetRole && n.targetRole === user.role) return true;
      if (!n.targetUid && !n.targetRole) return true;
      return false;
    });
  }, [notifications, user]);

  const roleLabel = useMemo(() => {
    switch(user.role?.toUpperCase()) {
      case UserRole.ADMIN: return '管理员';
      case UserRole.PRESIDENT: return '行长级';
      case UserRole.VP: return '副行长级';
      default: return '普通行员';
    }
  }, [user.role]);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-3 lg:hidden">
        <button 
          onClick={onMenuClick}
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl active:scale-90 transition-all"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-1.5">
          <AppLogo className="h-6 w-6" />
          <span className="font-black text-slate-800 text-sm tracking-tight">象山帮帮</span>
        </div>
      </div>

      <div className="hidden md:block"></div>

      <div className="flex items-center gap-1 md:gap-4">
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-xl relative active:scale-90 transition-all"
          >
            <Bell size={20} />
            {filteredNotifications.length > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-72 md:w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <span className="font-black text-slate-800 text-sm tracking-tight">通知中心 ({filteredNotifications.length})</span>
                <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="max-h-80 overflow-y-auto px-2 py-2">
                {filteredNotifications.length > 0 ? filteredNotifications.map(notif => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer group flex gap-3 items-start">
                    <div className={`mt-0.5 shrink-0 ${notif.type === 'SUCCESS' ? 'text-green-500' : notif.type === 'WARNING' ? 'text-orange-500' : 'text-blue-500'}`}>
                      {notif.type === 'SUCCESS' ? <CheckCircle2 size={14}/> : notif.type === 'WARNING' ? <AlertTriangle size={14}/> : <Info size={14}/>}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-black text-slate-900 group-hover:text-nb-red transition-colors">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{notif.content}</p>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest">{notif.timestamp}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-300 text-xs font-bold">暂无专属通知记录</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        <div className="flex items-center gap-2.5 ml-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 leading-none mb-1">{user.realName}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{roleLabel} · {user.line}</p>
          </div>
          <img
            src={user.avatar}
            alt={user.realName}
            className="h-8 w-8 md:h-9 md:w-9 rounded-full ring-2 ring-slate-100 object-cover shadow-sm"
          />
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
