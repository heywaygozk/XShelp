
import React, { useMemo } from 'react';
import { User, Demand, Resource } from '../types';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { 
  Users, 
  Activity, 
  CheckCircle, 
  FileDown, 
  PieChart as PieIcon
} from 'lucide-react';

interface AnalyticsViewProps {
  user: User;
  demands: Demand[];
  resources: Resource[];
  users: User[];
}

const COLORS = ['#E60012', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user, demands, resources, users }) => {
  
  const demandDistribution = useMemo(() => {
    const stats: Record<string, number> = {};
    demands.forEach(d => {
      const l1 = d.tags[0] || '未分类';
      stats[l1] = (stats[l1] || 0) + 1;
    });
    return Object.keys(stats).map(name => ({ name, value: stats[name] }));
  }, [demands]);

  const resourceDistribution = useMemo(() => {
    const stats: Record<string, number> = {};
    resources.forEach(r => {
      const l1 = r.type || '未分类';
      stats[l1] = (stats[l1] || 0) + 1;
    });
    return Object.keys(stats).map(name => ({ name, value: stats[name] }));
  }, [resources]);

  const handleFullExport = () => {
    const esc = (v: any) => `"${(v || '').toString().replace(/"/g, '""')}"`;
    const userHeaders = ["工号", "姓名", "部门", "条线", "当前积分", "系统角色"];
    const userRows = users.map(u => [u.employeeId, u.realName, u.dept, u.line, u.points, u.role].map(esc).join(","));
    const demandHeaders = ["ID", "标题", "状态", "奖励值", "紧迫度", "发起人", "发起时间"];
    const demandRows = demands.map(d => [d.did, d.title, d.status, d.rewardValue, d.urgency, d.creatorName, d.createdAt].map(esc).join(","));
    const resourceHeaders = ["ID", "标题", "分类", "贡献人", "日期"];
    const resourceRows = resources.map(r => [r.rid, r.title, r.type, r.owner, r.createdAt].map(esc).join(","));

    const csvContent = [
      "\uFEFF员工信息列表",
      userHeaders.join(","),
      ...userRows,
      "",
      "需求广场协作数据",
      demandHeaders.join(","),
      ...demandRows,
      "",
      "资源库全行沉淀清单",
      resourceHeaders.join(","),
      ...resourceRows
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `象山帮帮_运营效能报表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    alert('全量报表（员工/需求/资源）已成功导出，请使用 Excel 打开查看。');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-24 max-w-7xl mx-auto px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-1">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">运营效能洞察</h1>
          <p className="text-slate-500 font-bold text-sm md:text-base mt-2">基于实时协作数据的支行人力与资源库画像分析</p>
        </div>
        <button 
          onClick={handleFullExport}
          className="flex items-center justify-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-[28px] text-sm font-black shadow-2xl active:scale-95 transition-all shadow-slate-200 hover:bg-nb-red"
        >
          <FileDown size={22} /> 导出全量 Excel 报表
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all">
          <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <Users size={36} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">活跃行员总量</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{users.length}</p>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all">
          <div className="h-20 w-20 bg-red-50 text-nb-red rounded-[32px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <Activity size={36} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">协作响应次数</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{demands.length}</p>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm flex items-center gap-8 group hover:shadow-xl transition-all">
          <div className="h-20 w-20 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <CheckCircle size={36} />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">资源库总存量</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{resources.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="bg-white p-8 md:p-14 rounded-[56px] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nb-red/[0.02] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="font-black text-slate-900 text-2xl mb-12 flex items-center gap-4">
            <div className="h-3 w-3 bg-nb-red rounded-full animate-pulse"></div> 需求分类热度透视
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={demandDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  {demandDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={16} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px' }}
                  itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {demandDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-[28px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[11px] font-black text-slate-600 truncate uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-base font-black text-slate-900 ml-4">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 md:p-14 rounded-[56px] border border-slate-100 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/[0.02] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <h3 className="font-black text-slate-900 text-2xl mb-12 flex items-center gap-4">
            <div className="h-3 w-3 bg-blue-600 rounded-full animate-pulse"></div> 资源库贡献分布透视
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={resourceDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  {resourceDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={16} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px' }}
                  itemStyle={{ fontWeight: '900', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4">
            {resourceDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-5 rounded-[28px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-[11px] font-black text-slate-600 truncate uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-base font-black text-slate-900 ml-4">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
