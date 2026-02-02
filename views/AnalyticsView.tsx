
import React, { useMemo } from 'react';
import { User, Demand, Resource, UserRole } from '../types.ts';
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
  FileDown, 
  Flame,
  TrendingDown,
  Calendar,
  Zap,
  ShieldAlert
} from 'lucide-react';

interface AnalyticsViewProps {
  user: User;
  demands: Demand[];
  resources: Resource[];
  users: User[];
  activities: any[];
}

const COLORS = ['#E60012', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user, demands, resources, users, activities = [] }) => {
  
  // --- 活跃度计算 ---
  const activityStats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 计算本周范围 (周一到周日)
    const now = new Date();
    const day = now.getDay(); 
    const diff = now.getDate() - (day === 0 ? 6 : day - 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // 日活跃用户数 (DAU)
    const dau = new Set(activities.filter(a => a.activity_date === todayStr).map(a => a.uid)).size;

    // 周活跃用户数 (WAU)
    const wau = new Set(activities.filter(a => {
      const aDate = new Date(a.activity_date);
      return aDate >= startOfWeek && aDate <= endOfWeek;
    }).map(a => a.uid)).size;

    // 计算每个人的周活跃总得分 (每天最多3分)
    const userScores: Record<string, number> = {};
    users.forEach(u => userScores[u.uid] = 0);
    
    activities.forEach(a => {
      const aDate = new Date(a.activity_date);
      if (aDate >= startOfWeek && aDate <= endOfWeek && userScores[a.uid] !== undefined) {
        userScores[a.uid] += (a.count || 0);
      }
    });

    // 关键修复：过滤角色，排行榜仅展示普通员工 (EMPLOYEE)
    const employeeRankingData = users
      .filter(u => u.role === UserRole.EMPLOYEE)
      .map(u => ({
        uid: u.uid,
        name: u.realName,
        dept: u.dept,
        avatar: u.avatar,
        score: userScores[u.uid] || 0
      }));

    // 前十榜 (从高到低)
    const topTen = [...employeeRankingData].sort((a, b) => b.score - a.score).slice(0, 10);
    // 后十榜 (从低到高)
    const bottomTen = [...employeeRankingData].sort((a, b) => a.score - b.score).slice(0, 10);

    return { dau, wau, topTen, bottomTen };
  }, [activities, users]);

  const demandDistribution = useMemo(() => {
    const stats: Record<string, number> = {};
    demands.forEach(d => {
      const l1 = d.tags[0] || '未分类';
      stats[l1] = (stats[l1] || 0) + 1;
    });
    return Object.keys(stats).map(name => ({ name, value: stats[name] }));
  }, [demands]);

  // --- 全量 CSV 导出功能 ---
  const handleFullExport = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. 行员信息部分
    let csv = "--- 象山支行协作平台全量数据报告 ---\n";
    csv += "导出时间," + new Date().toLocaleString() + "\n\n";
    
    csv += "1. 行员基础数据\n";
    csv += "姓名,工号,部门,条线,角色,当前积分\n";
    users.forEach(u => {
      csv += `${u.realName},${u.employeeId},${u.dept},${u.line},${u.role},${u.points}\n`;
    });

    // 2. 需求广场明细
    csv += "\n2. 协作需求明细\n";
    csv += "ID,标题,发布人,状态,紧急度,悬赏,承接人,发布日期\n";
    demands.forEach(d => {
      csv += `${d.did},${d.title},${d.creatorName},${d.status},${d.urgency},${d.rewardValue},${d.helperName || '无'},${d.createdAt}\n`;
    });

    // 3. 智库资源清单
    csv += "\n3. 资源智库清单\n";
    csv += "ID,标题,分类,贡献者,创建时间\n";
    resources.forEach(r => {
      csv += `${r.rid},${r.title},${r.type},${r.owner},${r.createdAt}\n`;
    });

    // 使用 BOM 防止 Excel 打开乱码
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `象山帮帮全量报表_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert('全量报表（CSV格式）已生成并开始下载。');
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
          <FileDown size={22} /> 导出全量 EXCEL 报表
        </button>
      </div>

      {/* 活跃度看板 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
          <div className="h-16 w-16 bg-red-50 text-nb-red rounded-[24px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <Zap size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">今日活跃用户 (DAU)</p>
            <p className="text-2xl font-black text-slate-900">{activityStats.dau}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
          <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-[24px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">本周活跃用户 (WAU)</p>
            <p className="text-2xl font-black text-slate-900">{activityStats.wau}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
          <div className="h-16 w-16 bg-green-50 text-green-600 rounded-[24px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">协作需求总量</p>
            <p className="text-2xl font-black text-slate-900">{demands.length}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
          <div className="h-16 w-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <Users size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">系统全量行员</p>
            <p className="text-2xl font-black text-slate-900">{users.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* 前十榜 */}
        <div className="bg-white p-8 md:p-12 rounded-[56px] border border-slate-100 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5"><Flame size={120} className="text-orange-500" /></div>
          <div className="flex justify-between items-start mb-10">
            <h3 className="font-black text-slate-900 text-2xl flex items-center gap-4">
              <Flame className="text-orange-500" size={24} /> 本周活跃度 · 前十榜
            </h3>
            <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black flex items-center gap-2"><ShieldAlert size={12}/> 排除管理层</span>
          </div>
          <div className="space-y-4">
            {activityStats.topTen.map((item, idx) => (
              <div key={item.uid} className="flex items-center justify-between p-4 rounded-[28px] bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-xs ${idx < 3 ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <img src={item.avatar} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" alt="" />
                  <div>
                    <p className="font-black text-slate-900 text-sm">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{item.dept}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-orange-500">{item.score}</span>
                  <span className="text-[10px] text-slate-400 font-bold ml-1">分</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 后十榜 */}
        <div className="bg-white p-8 md:p-12 rounded-[56px] border border-slate-100 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-10 opacity-5"><TrendingDown size={120} className="text-slate-400" /></div>
          <div className="flex justify-between items-start mb-10">
            <h3 className="font-black text-slate-900 text-2xl flex items-center gap-4">
              <TrendingDown className="text-slate-400" size={24} /> 本周活跃度 · 后十榜
            </h3>
            <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black flex items-center gap-2"><ShieldAlert size={12}/> 排除管理层</span>
          </div>
          <div className="space-y-4">
            {activityStats.bottomTen.map((item, idx) => (
              <div key={item.uid} className="flex items-center justify-between p-4 rounded-[28px] bg-slate-50 hover:bg-white hover:shadow-md transition-all border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center font-black text-xs bg-slate-200 text-slate-500">
                    {idx + 1}
                  </div>
                  <img src={item.avatar} className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm" alt="" />
                  <div>
                    <p className="font-black text-slate-900 text-sm">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{item.dept}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-400">{item.score}</span>
                  <span className="text-[10px] text-slate-400 font-bold ml-1">分</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        <div className="bg-white p-8 md:p-14 rounded-[56px] border border-slate-100 shadow-xl relative overflow-hidden">
          <h3 className="font-black text-slate-900 text-2xl mb-12 flex items-center gap-4">
            需求分类热度透视
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={demandDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                  {demandDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={16} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-8 md:p-14 rounded-[56px] border border-slate-100 shadow-xl">
           <h3 className="font-black text-slate-900 text-2xl mb-12">统计口径说明</h3>
           <div className="space-y-6">
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">活跃度计分逻辑</p>
                <p className="text-xs font-bold text-slate-900 mt-2 leading-relaxed">
                  1. 员工每日登录或协作操作（发布/承接/共享/评论）均计入活跃。<br/>
                  2. 每人每日活跃度上限为 3 次，防止频繁无效登录刷分。<br/>
                  3. 周活跃积分为周一至周日的总计分值，次周一归零重新统计。<br/>
                  4. 排行榜仅针对员工角色的活跃轨迹进行横向排名。
                </p>
             </div>
             <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">安全与隐私</p>
                <p className="text-xs font-bold text-slate-900 mt-2 leading-relaxed">系统监控并记录行员协作效率，管理员有权对恶意刷分行为进行积分干预。</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
