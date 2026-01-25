
import React, { useMemo } from 'react';
import { User, Demand, Resource, DemandStatus } from '../types.ts';
import { TAG_COLORS } from '../constants.tsx';
import { 
  HelpingHand,
  TrendingUp,
  ChevronRight,
  Target,
  Trophy,
  Package,
  FileText,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardViewProps {
  user: User;
  demands: Demand[];
  resources: Resource[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, demands, resources }) => {
  const navigate = useNavigate();

  const myDemandsCount = useMemo(() => demands.filter(d => d.creatorId === user.uid).length, [demands, user]);
  const myResourcesCount = useMemo(() => resources.filter(r => r.owner === user.realName).length, [resources, user]);

  const stats = useMemo(() => {
    const completedHelps = demands.filter(d => d.helperId === user.uid && d.status === DemandStatus.COMPLETED);
    const cumulativeHelp = completedHelps.length;
    const pointsRevenue = completedHelps
      .filter(d => d.rewardType === 'POINTS')
      .reduce((acc, d) => acc + d.rewardValue, 0);

    const pendingTasks = demands.filter(d => 
      (d.creatorId === user.uid && d.status === DemandStatus.ACCEPTED) || 
      (d.helperId === user.uid && d.status === DemandStatus.ACCEPTED)
    ).length;

    return [
      { label: '累计帮助', value: cumulativeHelp.toString(), icon: <HelpingHand size={20} />, textColor: 'text-blue-600', bgColor: 'bg-blue-50' },
      { label: '积分收益', value: `+${pointsRevenue.toLocaleString()}`, icon: <Trophy size={20} />, textColor: 'text-green-600', bgColor: 'bg-green-50' },
      { label: '正在对接', value: pendingTasks.toString(), icon: <Target size={20} />, textColor: 'text-orange-600', bgColor: 'bg-orange-50' },
      { label: '个人总积分', value: user.points.toLocaleString(), icon: <TrendingUp size={20} />, textColor: 'text-nb-red', bgColor: 'bg-red-50' },
    ];
  }, [demands, user]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20 px-1 md:px-0">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">你好, {user.realName}</h1>
        <p className="text-slate-500 font-bold text-sm md:text-base">象山帮帮 · 内部协作效率提升看板</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 md:p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-md">
            <div className={`h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bgColor} ${stat.textColor} shadow-inner`}>
              {stat.icon}
            </div>
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl md:text-3xl font-black text-slate-900 mt-1 tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => navigate('/demands', { state: { filter: 'MY' } })}
          className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-nb-red/20 transition-all cursor-pointer group flex items-center gap-6"
        >
          <div className="h-20 w-20 bg-red-50 text-nb-red rounded-[28px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <Package size={40} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-900">我的发布</h3>
            <p className="text-slate-500 font-bold text-sm mt-1">您共发布了 <span className="text-nb-red">{myDemandsCount}</span> 个协作需求</p>
            <div className="mt-4 flex items-center gap-2 text-nb-red text-xs font-black uppercase tracking-widest">
              点击进入管理 <ChevronRight size={14} />
            </div>
          </div>
        </div>
        <div 
          onClick={() => navigate('/resources', { state: { filter: 'MY' } })}
          className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-500/20 transition-all cursor-pointer group flex items-center gap-6"
        >
          <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-[28px] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
            <FileText size={40} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-slate-900">我的智库</h3>
            <p className="text-slate-500 font-bold text-sm mt-1">您共分享了 <span className="text-blue-600">{myResourcesCount}</span> 项知识资产</p>
            <div className="mt-4 flex items-center gap-2 text-blue-600 text-xs font-black uppercase tracking-widest">
              点击进入查看 <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-slate-800">最新需求动态</h2>
            <button onClick={() => navigate('/demands')} className="text-xs font-black text-nb-red flex items-center gap-1 hover:translate-x-1 transition-transform p-2">
              进入广场 <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {demands.filter(d => d.status !== DemandStatus.COMPLETED).slice(0, 3).map((item) => (
              <div 
                key={item.did} 
                onClick={() => navigate(`/demands/${item.did}`)}
                className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center gap-4 group cursor-pointer active:scale-[0.98] transition-all hover:border-nb-red/20"
              >
                <img src={item.creatorAvatar} className="h-14 w-14 rounded-full ring-4 ring-slate-50 shadow-sm object-cover" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 overflow-hidden">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 ${TAG_COLORS[item.tags[0]] || 'bg-slate-100'}`}>{item.tags[0]}</span>
                    <h3 className="font-black text-slate-900 text-base md:text-lg truncate group-hover:text-nb-red transition-colors">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 font-bold truncate">{item.creatorName} · {item.createdAt}</p>
                </div>
                <div className="text-right shrink-0 bg-slate-50 px-5 py-3 rounded-[20px] shadow-inner border border-slate-100">
                  <p className="text-xl font-black text-nb-red tracking-tighter">{item.rewardValue}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.rewardType === 'POINTS' ? 'P' : '¥'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-black text-slate-800">热门智库</h2>
            <button onClick={() => navigate('/resources')} className="text-xs font-black text-slate-400 hover:text-nb-red transition-colors p-2">全部</button>
          </div>
          <div className="bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl p-8 relative group">
            <div className="space-y-6 relative z-10">
              {resources.slice(0, 4).map((res) => (
                <div 
                  key={res.rid} 
                  onClick={() => navigate(`/resources/${res.rid}`)}
                  className="flex items-center justify-between group/item cursor-pointer"
                >
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-black text-white group-hover/item:text-nb-red truncate transition-colors mb-1">{res.title}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{res.type}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-500 group-hover/item:text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
