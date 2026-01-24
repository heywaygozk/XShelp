
import React from 'react';
import { User, PointsLog } from '../types';
import { Coins, History, Calendar } from 'lucide-react';

const MOCK_LOGS: PointsLog[] = [
  { id: 'l1', userId: 'u3', changeAmount: 500, balanceAfter: 10500, operator: '系统', reason: '资源分享获得好评', timestamp: '2024-03-12 14:20' },
  { id: 'l2', userId: 'u3', changeAmount: -200, balanceAfter: 10300, operator: '管理员', reason: '发布需求预扣除', timestamp: '2024-03-10 09:15' },
];

interface PointsViewProps {
  user: User;
}

const PointsView: React.FC<PointsViewProps> = ({ user }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black text-slate-900">积分资产</h1>
        <p className="text-slate-500 font-bold text-sm">积累支行贡献，记录成长点滴。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          <div className="h-20 w-20 bg-yellow-400 text-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-400/20">
            <Coins size={40} />
          </div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">当前可用积分</p>
          <p className="text-5xl font-black text-white mt-3 tracking-tighter">{user.points.toLocaleString()}</p>
        </div>

        <div className="md:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <History size={18} className="text-nb-red" />
              最近变动明细
            </h3>
            <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl active:scale-90"><Calendar size={18} /></button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4 whitespace-nowrap">时间</th>
                  <th className="px-6 py-4">事由</th>
                  <th className="px-6 py-4">变动</th>
                  <th className="px-8 py-4">余额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_LOGS.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 text-xs font-bold text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-6 py-6 min-w-[200px]">
                      <p className="text-sm font-black text-slate-900">{log.reason}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">操作: {log.operator}</p>
                    </td>
                    <td className="px-6 py-6">
                      <div className={`flex items-center gap-1 font-black ${log.changeAmount > 0 ? 'text-green-600' : 'text-nb-red'}`}>
                        {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-black text-slate-900">{log.balanceAfter.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsView;
