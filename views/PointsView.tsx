
import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../types';
import { Coins, History, Calendar, Lock, ShieldCheck } from 'lucide-react';

interface PointsViewProps {
  user: User;
  logs: any[];
  users: User[];
  onUpdatePassword?: (uid: string, newPass: string) => void;
}

const PointsView: React.FC<PointsViewProps> = ({ user, logs = [], users = [], onUpdatePassword }) => {
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  // 根据角色过滤流水逻辑
  const visibleLogs = useMemo(() => {
    let filtered = [];
    if (user.role === UserRole.ADMIN) {
      // 管理员看到全量流水
      filtered = logs;
    } else {
      // 普通员工仅看到自己的流水
      filtered = logs.filter(l => l.uid === user.uid);
    }
    return filtered;
  }, [logs, user.uid, user.role]);

  const handlePassChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.old !== (user.password || '123456')) {
      alert('当前原密码输入不正确');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      alert('两次输入的新密码不一致');
      return;
    }
    if (passwords.new.length < 6) {
      alert('新密码长度至少需要 6 位');
      return;
    }
    onUpdatePassword?.(user.uid, passwords.new);
    setIsChangingPass(false);
    setPasswords({ old: '', new: '', confirm: '' });
  };

  // 辅助函数：根据 UID 寻找行员姓名（仅管理员视图需要）
  const getEmployeeName = (uid: string) => {
    const u = users.find(item => item.uid === uid);
    return u ? u.realName : '未知用户';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900">个人资产与安全</h1>
        <p className="text-slate-500 font-bold text-sm">积累支行贡献，保障账户安全。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl text-center relative overflow-hidden h-fit">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="h-20 w-20 bg-yellow-400 text-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-400/20">
            <Coins size={40} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">当前可用积分</p>
          <p className="text-5xl font-black text-white mt-3 tracking-tighter">{user.points.toLocaleString()}</p>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <History size={18} className="text-nb-red" />
                积分变动明细 {user.role === UserRole.ADMIN && <span className="text-xs bg-red-50 text-nb-red px-2 py-1 rounded-lg">管理员全量视图</span>}
              </h3>
              <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl active:scale-90"><Calendar size={18} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4 whitespace-nowrap">时间</th>
                    {user.role === UserRole.ADMIN && <th className="px-6 py-4">变动人</th>}
                    <th className="px-6 py-4">事由</th>
                    <th className="px-6 py-4">变动</th>
                    <th className="px-8 py-4">余额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visibleLogs.length > 0 ? visibleLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6 text-xs font-bold text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('zh-CN', { hour12: false })}
                      </td>
                      {user.role === UserRole.ADMIN && (
                        <td className="px-6 py-6 text-xs font-black text-slate-900">{getEmployeeName(log.uid)}</td>
                      )}
                      <td className="px-6 py-6 min-w-[200px]">
                        <p className="text-sm font-black text-slate-900">{log.reason}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">操作人: {log.operator}</p>
                      </td>
                      <td className="px-6 py-6">
                        <div className={`flex items-center gap-1 font-black ${log.change_amount > 0 ? 'text-green-600' : 'text-nb-red'}`}>
                          {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-900">{(log.balance_after || 0).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={user.role === UserRole.ADMIN ? 5 : 4} className="px-8 py-12 text-center text-slate-300 font-black text-sm uppercase tracking-widest">
                        暂无积分变动记录
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 md:p-10">
             <div className="flex items-center justify-between mb-8">
               <h3 className="font-black text-slate-900 text-xl flex items-center gap-3">
                 <ShieldCheck className="text-blue-500" size={24} /> 账户安全管理
               </h3>
               {!isChangingPass && (
                 <button 
                  onClick={() => setIsChangingPass(true)} 
                  className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl text-xs font-black flex items-center gap-2 hover:bg-slate-100 transition-all"
                 >
                   <Lock size={16} /> 修改登录密码
                 </button>
               )}
             </div>

             {isChangingPass ? (
               <form onSubmit={handlePassChange} className="space-y-6 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">当前原密码</label>
                      <input 
                        type="password" 
                        required 
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-nb-red/5 font-bold"
                        value={passwords.old}
                        onChange={e => setPasswords({...passwords, old: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">设置新密码</label>
                      <input 
                        type="password" 
                        required 
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-nb-red/5 font-bold"
                        value={passwords.new}
                        onChange={e => setPasswords({...passwords, new: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">确认新密码</label>
                      <input 
                        type="password" 
                        required 
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-nb-red/5 font-bold"
                        value={passwords.confirm}
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="submit" className="px-10 py-4 bg-nb-red text-white rounded-2xl font-black text-xs shadow-xl shadow-red-100">确认更新密码</button>
                    <button type="button" onClick={() => setIsChangingPass(false)} className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs">取消</button>
                  </div>
               </form>
             ) : (
               <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                 <div className="h-10 w-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} />
                 </div>
                 <div className="flex-1">
                   <p className="text-xs font-black text-slate-900">密码安全保护已开启</p>
                   <p className="text-[10px] text-slate-500 font-bold mt-1">建议定期更换密码，密码由 AD/LDAP 验证服务保障。</p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsView;
