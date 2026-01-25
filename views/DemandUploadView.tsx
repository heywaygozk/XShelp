
import React, { useState, useMemo } from 'react';
import { User, Demand, DemandUrgency, DemandStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Coins, Banknote, AlertCircle, Tag } from 'lucide-react';
import { DEMAND_TAGS } from '../constants';

interface DemandUploadViewProps {
  user: User;
  onUpload: (dem: Demand) => void;
}

const DemandUploadView: React.FC<DemandUploadViewProps> = ({ user, onUpload }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customerInfo: '',
    l1Tag: Object.keys(DEMAND_TAGS)[0],
    l2Tag: DEMAND_TAGS[Object.keys(DEMAND_TAGS)[0] as keyof typeof DEMAND_TAGS][0],
    rewardType: 'POINTS' as 'POINTS' | 'AMOUNT',
    rewardValue: 500,
    urgency: DemandUrgency.NORMAL
  });

  const subTagOptions = useMemo(() => {
    return DEMAND_TAGS[formData.l1Tag as keyof typeof DEMAND_TAGS] || [];
  }, [formData.l1Tag]);

  const handleL1Change = (val: string) => {
    const subTags = DEMAND_TAGS[val as keyof typeof DEMAND_TAGS];
    setFormData({ 
      ...formData, 
      l1Tag: val, 
      l2Tag: subTags && subTags.length > 0 ? subTags[0] : '其他' 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDem: Demand = {
      did: `d${Date.now()}`,
      title: formData.title,
      description: formData.description,
      customerInfo: formData.customerInfo,
      rewardType: formData.rewardType,
      rewardValue: formData.rewardValue,
      urgency: formData.urgency,
      isRecommended: false,
      tags: [formData.l1Tag, formData.l2Tag],
      status: DemandStatus.PUBLISHED,
      creatorId: user.uid,
      creatorName: user.realName,
      creatorAvatar: user.avatar,
      createdAt: new Date().toISOString().split('T')[0],
      comments: []
    };
    onUpload(newDem);
    navigate('/demands');
  };

  return (
    <div className="max-w-3xl mx-auto py-4 animate-in slide-in-from-bottom-8 duration-500 px-1">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold mb-6">
        <ArrowLeft size={18} /> 返回
      </button>

      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-12 text-white relative">
          <Sparkles className="absolute right-8 top-8 text-yellow-400 opacity-50" size={48} />
          <h1 className="text-3xl font-black">发布新需求</h1>
          <p className="text-slate-400 mt-2">准确描述需求，更利于同事快速承接对接。</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-black text-slate-800 flex items-center gap-2">
              <AlertCircle size={16} className="text-nb-red" /> 紧急程度
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[DemandUrgency.NORMAL, DemandUrgency.URGENT, DemandUrgency.EXTREME].map(u => (
                <button
                  key={u} type="button"
                  onClick={() => setFormData({...formData, urgency: u})}
                  className={`py-3 rounded-2xl font-black text-xs transition-all border ${
                    formData.urgency === u 
                    ? (u === DemandUrgency.EXTREME ? 'bg-red-600 border-red-600 text-white' : u === DemandUrgency.URGENT ? 'bg-red-50 border-red-200 text-red-600' : 'bg-slate-900 border-slate-900 text-white')
                    : 'bg-white border-slate-200 text-slate-400'
                  }`}
                >{u}</button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-slate-800">需求标题</label>
            <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="例如：急需针对某企业的跨境结汇方案..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-800 flex items-center gap-2"><Tag size={16} /> 需求一级标签</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={formData.l1Tag} onChange={e => handleL1Change(e.target.value)}>
                {Object.keys(DEMAND_TAGS).map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-800 flex items-center gap-2"><Tag size={16} /> 需求二级场景</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold outline-none" value={formData.l2Tag} onChange={e => setFormData({...formData, l2Tag: e.target.value})}>
                {subTagOptions.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-slate-800">客户信息</label>
            <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={formData.customerInfo} onChange={e => setFormData({...formData, customerInfo: e.target.value})} placeholder="例如：某石浦规上水产加工企业" />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-black text-slate-800">详细描述</label>
            <textarea required rows={5} className="w-full p-4 bg-slate-50 rounded-2xl border-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="详细说明面临的困难及所需的协助..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-800">悬赏类型</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFormData({...formData, rewardType: 'POINTS'})} className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs border ${formData.rewardType === 'POINTS' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-slate-50 border-transparent text-slate-400'}`}><Coins size={16}/> 积分</button>
                <button type="button" onClick={() => setFormData({...formData, rewardType: 'AMOUNT'})} className={`flex-1 p-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs border ${formData.rewardType === 'AMOUNT' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-transparent text-slate-400'}`}><Banknote size={16}/> 现金</button>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-black text-slate-800">激励数值</label>
              <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-xl text-nb-red" value={formData.rewardValue} onChange={e => setFormData({...formData, rewardValue: parseInt(e.target.value) || 0})} />
            </div>
          </div>

          <button type="submit" className="w-full py-5 bg-nb-red text-white rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">立即发布</button>
        </form>
      </div>
    </div>
  );
};

export default DemandUploadView;
