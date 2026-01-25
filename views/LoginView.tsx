
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, Loader2, DatabaseZap } from 'lucide-react';
import { AppLogo, MOCK_USERS } from '../constants.tsx';

interface LoginViewProps {
  onLogin: (u: User) => void;
  users: User[];
  onSeedData?: (users: User[]) => Promise<void>;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, users, onSeedData }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      // 容错处理：
      // 1. 去除两端空格
      // 2. 将用户可能误输入的字母 'O' (大写) 或 'o' (小写) 统一纠正为数字 '0'
      const cleanUsername = username.trim().toUpperCase().replace(/O/g, '0');
      
      const foundUser = users.find(u => {
        const dbEmpId = (u.employeeId || '').toUpperCase();
        const dbUsername = (u.username || '').toUpperCase();
        return dbEmpId === cleanUsername || dbUsername === cleanUsername;
      });
      
      const defaultPassword = '123456';
      if (foundUser && password === (foundUser.password || defaultPassword)) {
        onLogin(foundUser as User);
      } else {
        if (users.length === 0) {
          setError('云端数据库为空，请先点击下方按钮初始化演示数据');
        } else {
          setError('工号或密码错误。注意：默认密码为123456');
        }
      }
      setLoading(false);
    }, 600);
  };

  const handleSeed = async () => {
    if (!onSeedData) return;
    setIsSeeding(true);
    try {
      await onSeedData(MOCK_USERS);
      alert('演示账号已同步至云端！测试账号: NB001, 密码: 123456');
    } catch (err) {
      alert('同步失败，请检查网络或 Supabase 配置');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
             <AppLogo className="h-16 w-16 shadow-xl" />
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
                  placeholder="NB001"
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

          {users.length === 0 && (
            <div className="mt-8 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2">
              <button
                onClick={handleSeed}
                disabled={isSeeding}
                className="w-full bg-blue-50 text-blue-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-100 transition-all border border-blue-100 border-dashed"
              >
                {isSeeding ? <Loader2 className="animate-spin" size={16}/> : <DatabaseZap size={16}/>}
                云端无数据，一键同步演示账号
              </button>
            </div>
          )}
        </div>
        
        <p className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-8">
          宁波银行象山支行内部专属资产
        </p>
      </div>
    </div>
  );
};

export default LoginView;
