
import React, { useState, useMemo, useEffect } from 'react';
import { User, Resource } from '../types';
import { Search, Plus, FileText, ChevronRight, Share2, Filter, LayoutGrid, Star } from 'lucide-react';
import { TAG_COLORS, RESOURCE_TAGS } from '../constants';
import { useNavigate, useLocation } from 'react-router-dom';

interface ResourceViewProps {
  user: User;
  resources: Resource[];
}

const ResourceView: React.FC<ResourceViewProps> = ({ user, resources }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedL1, setSelectedL1] = useState<string | 'ALL'>('ALL');
  const [selectedL2, setSelectedL2] = useState<string | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY'>('ALL');

  useEffect(() => {
    if (location.state?.filter === 'MY') {
      setActiveTab('MY');
    }
  }, [location.state]);

  const l2Options = useMemo(() => {
    if (selectedL1 === 'ALL') return [];
    return RESOURCE_TAGS[selectedL1 as keyof typeof RESOURCE_TAGS] || [];
  }, [selectedL1]);

  const filtered = useMemo(() => {
    let result = resources.filter(r => {
      const term = searchTerm.toLowerCase();
      const matchSearch = searchTerm === '' || 
        r.title.toLowerCase().includes(term) || 
        r.description.toLowerCase().includes(term) ||
        r.owner.toLowerCase().includes(term);
        
      const matchL1 = selectedL1 === 'ALL' || r.type === selectedL1;
      const matchL2 = selectedL2 === 'ALL' || r.tags.includes(selectedL2);
      const matchTab = activeTab === 'ALL' || r.owner === user.realName;
      
      return matchSearch && matchL1 && matchL2 && matchTab;
    });
    return result;
  }, [resources, searchTerm, selectedL1, selectedL2, activeTab, user.realName]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300 pb-24 px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">资源中心</h1>
          <p className="text-slate-500 text-sm font-bold mt-1">沉淀支行核心资产，让专家智慧触手可及。</p>
        </div>
        <button 
          onClick={() => navigate('/resources/upload')}
          className="bg-nb-red text-white w-full md:w-auto px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl shadow-red-200 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          <Share2 size={18} />
          共享新资源
        </button>
      </div>

      <div className="relative group px-1">
        <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-nb-red transition-colors" size={22} />
        <input 
          type="text" 
          placeholder="找需求、找资源..."
          className="w-full pl-16 md:pl-20 pr-6 py-5 md:py-6 bg-white border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-nb-red/5 focus:border-nb-red/20 transition-all shadow-sm font-medium text-slate-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 p-2 bg-white border border-slate-100 rounded-[24px] shadow-sm mx-1">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-widest ${
            activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 active:bg-slate-50'
          }`}
        >
          <LayoutGrid size={16} /> 全部资源
        </button>
        <button
          onClick={() => setActiveTab('MY')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-black transition-all uppercase tracking-widest ${
            activeTab === 'MY' ? 'bg-nb-red text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 active:bg-slate-50'
          }`}
        >
          <Star size={16} /> 我的分享
        </button>
      </div>

      <div className="bg-white rounded-[32px] p-4 md:p-6 border border-slate-100 shadow-sm space-y-4 mx-1">
        <div className="flex items-center gap-2 mb-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">分类筛选</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => { setSelectedL1('ALL'); setSelectedL2('ALL'); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
              selectedL1 === 'ALL' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'
            }`}
          >
            全部类型
          </button>
          {Object.keys(RESOURCE_TAGS).map(tag => (
            <button
              key={tag}
              onClick={() => { setSelectedL1(tag); setSelectedL2('ALL'); }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                selectedL1 === tag ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {selectedL1 !== 'ALL' && (
          <div className="flex flex-wrap gap-2 pt-2 animate-in slide-in-from-top-2">
            <button
              onClick={() => setSelectedL2('ALL')}
              className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                selectedL2 === 'ALL' ? 'bg-slate-200 text-slate-800' : 'bg-slate-50 text-slate-400'
              }`}
            >
              全部二级
            </button>
            {l2Options.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedL2(tag)}
                className={`px-4 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
                  selectedL2 === tag ? 'bg-slate-200 text-slate-800' : 'bg-slate-50 text-slate-400'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-1">
        {filtered.length > 0 ? filtered.map((res) => (
          <div 
            key={res.rid} 
            onClick={() => navigate(`/resources/${res.rid}`)}
            className="bg-white rounded-[40px] p-8 border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group cursor-pointer active:scale-[0.98]"
          >
            <div className="flex justify-between items-start mb-8">
              <div className="h-14 w-14 bg-red-50 text-nb-red rounded-[24px] flex items-center justify-center group-hover:bg-nb-red group-hover:text-white transition-all shadow-inner">
                <FileText size={28} />
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${TAG_COLORS[res.type] || 'bg-slate-100 text-slate-500'}`}>
                {res.type}
              </span>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-nb-red line-clamp-1 leading-tight tracking-tight transition-colors">{res.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2 flex-1 mb-8 leading-relaxed font-medium">{res.description}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <img src={res.ownerAvatar} className="h-8 w-8 rounded-full ring-2 ring-slate-100 shadow-sm object-cover" alt="" />
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{res.owner}</span>
              </div>
              <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-nb-red/10 transition-all">
                <ChevronRight size={18} className="text-slate-300 group-hover:text-nb-red transition-all" />
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full bg-white rounded-[40px] p-24 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase tracking-widest text-sm">未找到相关资源成果</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceView;
