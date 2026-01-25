
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { AppLogo } from '../constants.tsx';

interface LoginViewProps {
  onLogin: (u: User) => void;
  users: User[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const foundUser = users.find(u => u.username === username || u.employeeId === username);
      // 匹配数据库中的用户密码，默认为 123456
      if (foundUser && password === (foundUser.password || '123456')) {
        onLogin(foundUser as User);
      } else {
        setError('用户名或密码错误，请核实行员账户');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <AppLogo className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">象山帮帮</h1>
        </div>

        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">行员账户 (工号)</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="NB000"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-nb-red/5 focus:bg-white transition-all font-bold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">登录密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-nb-red/5 focus:bg-white transition-all font-bold"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-[11px] font-bold rounded-xl border border-red-100 animate-in shake duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-nb-red active:scale-95 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200 disabled:opacity-70 mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : '进入协作空间'}
            </button>
          </form>
        </div>
        
        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-8">
          宁波银行象山支行内部资产
        </p>
      </div>
    </div>
  );
};

export default LoginView;
