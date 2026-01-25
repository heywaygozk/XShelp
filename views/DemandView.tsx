
import React, { useState, useMemo, useEffect } from 'react';
import { User, Demand, DemandUrgency, DemandStatus } from '../types.ts';
import { Search, Plus, Coins, Zap, Star, LayoutGrid, CheckCircle2, Filter, Loader2, Clock } from 'lucide-react';
import { TAG_COLORS, DEMAND_TAGS } from '../constants.tsx';
import { useNavigate, useLocation } from 'react-router-dom';

interface DemandViewProps {
  user: User;
  demands: Demand[];
}

const DemandView: React.FC<DemandViewProps> = ({ user, demands }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'ALL' | 'URGENT' | 'HIGH_REWARD' | 'RECOMMENDED' | 'COMPLETED' | 'MY'>('ALL');
  const [selectedL1, setSelectedL1] = useState<string | 'ALL'>('ALL');
  const [selectedL2, setSelectedL2] = useState<string | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (location.state?.filter === 'MY') {
      setActiveTab('MY');
    }
  }, [location.state]);

  const l2Options = useMemo(() => {
    if (selectedL1 === 'ALL') return [];
    return DEMAND_TAGS[selectedL1 as keyof typeof DEMAND_TAGS] || [];
  }, [selectedL1]);

  const filteredDemands = useMemo(() => {
    let result = [...demands];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.title.toLowerCase().includes(term) || 
        d.description.toLowerCase().includes(term) || 
        d.customerInfo.toLowerCase().includes(term) ||
        d.creatorName.toLowerCase().includes(term)
      );
    }

    switch (activeTab) {
      case 'MY':
        result = result.filter(d => d.creatorId === user.uid);
        break;
      case 'URGENT':
        result = result.filter(d => [DemandUrgency.URGENT, DemandUrgency.EXTREME].includes(d.urgency) && d.status !== DemandStatus.COMPLETED);
        break;
      case 'HIGH_REWARD':
        result = result.filter(d => ((d.rewardType === 'POINTS' && d.rewardValue >= 1000) || (d.rewardType === 'AMOUNT' && d.rewardValue >= 500)) && d.status !== DemandStatus.COMPLETED);
        break;
      case 'RECOMMENDED':
        result = result.filter(d => d.isRecommended && d.status !== DemandStatus.COMPLETED);
        break;
      case 'COMPLETED':
        result = result.filter(d => d.status === DemandStatus.COMPLETED);
        break;
      default:
        if (activeTab === 'ALL') result = result.filter(d => d.status !== DemandStatus.COMPLETED);
    }

    if (selectedL1 !== 'ALL') {
      result = result.filter(d => d.tags.includes(selectedL1));
    }
    if (selectedL2 !== 'ALL') {
      result = result.filter(d => d.tags.includes(selectedL2));
    }

    return result;
  }, [demands, activeTab, selectedL1, selectedL2, searchTerm, user.uid]);

  const getStatusLabel = (status: DemandStatus) => {
    switch(status) {
      case DemandStatus.PUBLISHED: return { label: '待接单', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <Clock size={12}/> };
      case DemandStatus.ACCEPTED: 
      case DemandStatus.IN_PROGRESS: return { label: '已接单', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: <Loader2 className="animate-spin" size={12}/> };
      case DemandStatus.COMPLETED: return { label: '已完成', color: 'bg-green-50 text-green-600 border-green-100', icon: <CheckCircle2 size={12}/> };
      default: return { label: status, color: 'bg-slate-50 text-slate-500 border-slate-100', icon: null };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-24 px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">需求广场</h1>
          <p className="text-slate-500 text-sm font-bold mt-1">象山支行内部协同，共同创造实战价值。</p>
        </div>
        <button 
          onClick={() => navigate('/demands/upload')}
          className="bg-nb-red text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all w-full md:w-auto text-sm"
        >
          <Plus size={20} /> 发布需求
        </button>
      </div>

      <div className="relative group px-1">
        <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-nb-red transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="找需求、找同事、搜关键词..."
          className="w-full pl-16 md:pl-20 pr-6 py-5 md:py-6 bg-white border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-nb-red/5 transition-all shadow-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] p-4 md:p-6 border border-slate-100 shadow-sm space-y-4 mx-1">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedL1('ALL'); setSelectedL2('ALL'); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedL1 === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}
          >全部类型</button>
          {Object.keys(DEMAND_TAGS).map(tag => (
            <button key={tag} onClick={() => { setSelectedL1(tag); setSelectedL2('ALL'); }} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${selectedL1 === tag ? 'bg-nb-red text-white border-nb-red' : 'bg-white text-slate-500 border-slate-200'}`}>{tag}</button>
          ))}
        </div>
        {selectedL1 !== 'ALL' && (
          <div className="flex flex-wrap gap-2 pt-2 animate-in slide-in-from-top-2">
            <button onClick={() => setSelectedL2('ALL')} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold ${selectedL2 === 'ALL' ? 'bg-slate-200' : 'bg-slate-50'}`}>全部场景</button>
            {l2Options.map(tag => (
              <button key={tag} onClick={() => setSelectedL2(tag)} className={`px-4 py-1.5 rounded-lg text-[9px] font-bold ${selectedL2 === tag ? 'bg-slate-200' : 'bg-slate-50'}`}>{tag}</button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 p-2 bg-white border border-slate-100 rounded-[24px] shadow-sm sticky top-16 z-30 mx-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: '全部', icon: <LayoutGrid size={14} /> },
          { id: 'MY', label: '我的发布', icon: <Star size={14} /> },
          { id: 'URGENT', label: '象山急事', icon: <Zap size={14} /> },
          { id: 'RECOMMENDED', label: '行长推荐', icon: <Star size={14} /> },
          { id: 'COMPLETED', label: '已完成', icon: <CheckCircle2 size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 px-1">
        {filteredDemands.length > 0 ? filteredDemands.map(demand => {
          const statusInfo = getStatusLabel(demand.status);
          return (
            <div 
              key={demand.did} 
              onClick={() => navigate(`/demands/${demand.did}`)}
              className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:border-nb-red/30 hover:shadow-2xl transition-all group cursor-pointer active:scale-[0.99]"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {demand.isRecommended && <span className="bg-yellow-400 text-slate-900 text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1"><Star size={10} fill="currentColor"/> 行长推荐</span>}
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${demand.urgency === DemandUrgency.EXTREME ? 'bg-nb-red text-white' : 'bg-slate-100 text-slate-500'}`}>{demand.urgency}</span>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${TAG_COLORS[demand.tags[0]] || 'bg-slate-50'}`}>{demand.tags[0]}</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-nb-red transition-colors line-clamp-1">{demand.title}</h3>
                  <p className="text-sm md:text-base text-slate-500 mt-3 line-clamp-2">{demand.customerInfo} · {demand.description}</p>
                </div>
                <div className={`shrink-0 px-6 py-4 rounded-[28px] text-center border ${demand.rewardType === 'POINTS' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60">激励</p>
                  <p className="text-2xl font-black">{demand.rewardValue}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <img src={demand.creatorAvatar} className="h-10 w-10 rounded-full ring-2 ring-slate-100" alt="" />
                  <div>
                    <p className="text-xs font-black text-slate-900">{demand.creatorName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{demand.createdAt}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 font-black text-[11px] px-4 py-2 rounded-2xl border ${statusInfo.color} uppercase shadow-sm`}>
                  {statusInfo.icon}
                  {statusInfo.label}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black text-sm uppercase">暂无符合条件的协作需求</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemandView;
