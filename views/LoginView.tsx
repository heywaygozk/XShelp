
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { Lock, User as UserIcon, Loader2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (u: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate LDAP auth delay
    setTimeout(() => {
      const foundUser = MOCK_USERS.find(u => u.username === username);
      if (foundUser && password === '123456') { // Mock password
        onLogin(foundUser as User);
      } else {
        setError('用户名或密码错误，请核实 AD/LDAP 账户');
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="h-16 w-16 bg-nb-red rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-200">
            <span className="text-white text-3xl font-bold">NB</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">一键帮帮 · 内部协作平台</h1>
          <p className="text-slate-500 mt-2">宁波银行象山支行专属工作空间</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">AD 账户</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="工号或账户名"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-nb-red/20 focus:border-nb-red transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">登录密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="域控登录密码"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-nb-red/20 focus:border-nb-red transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-nb-red text-white font-bold py-3.5 rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : '认证登录'}
            </button>

            <div className="text-center">
              <p className="text-xs text-slate-400">
                请使用支行内网 AD/LDAP 账户进行身份认证
                <br />
                如忘记密码请联系金融科技部：8888
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
