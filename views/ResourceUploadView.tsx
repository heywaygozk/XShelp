
import React, { useState } from 'react';
import { User, Resource } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { RESOURCE_TAGS } from '../constants';

interface ResourceUploadViewProps {
  user: User;
  onUpload: (res: Resource) => void;
}

const ResourceUploadView: React.FC<ResourceUploadViewProps> = ({ user, onUpload }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    l1Tag: Object.keys(RESOURCE_TAGS)[0],
    l2Tag: RESOURCE_TAGS[Object.keys(RESOURCE_TAGS)[0] as keyof typeof RESOURCE_TAGS][0]
  });

  const handleL1Change = (val: string) => {
    const subTags = RESOURCE_TAGS[val as keyof typeof RESOURCE_TAGS];
    setFormData({ ...formData, l1Tag: val, l2Tag: subTags[0] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Added missing comments array to comply with Resource interface
    const newRes: Resource = {
      rid: `r${Date.now()}`,
      title: formData.title,
      description: formData.content.substring(0, 100) + '...',
      type: formData.l1Tag,
      tags: [formData.l2Tag],
      owner: user.realName,
      ownerAvatar: user.avatar,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      comments: []
    };
    onUpload(newRes);
    alert('资源已成功同步至全行资源中心！');
    navigate('/resources');
  };

  return (
    <div className="max-w-2xl mx-auto py-4 md:py-8 animate-in slide-in-from-right duration-300">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold mb-6">
        <ArrowLeft size={18} /> 返回
      </button>

      <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-100">
        <div className="bg-nb-red p-8 md:p-10 text-white">
          <h1 className="text-2xl font-black">贡献全行智慧</h1>
          <p className="text-red-100 text-sm mt-2 opacity-80">您的分享将帮助更多同事高效解决客户难题。</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-800">资源标题</label>
            <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-nb-red/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-800">详细描述</label>
            <textarea required rows={6} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-nb-red/20 resize-none" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-800">一级分类</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={formData.l1Tag} onChange={e => handleL1Change(e.target.value)}>
                {Object.keys(RESOURCE_TAGS).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-800">二级标签</label>
              <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={formData.l2Tag} onChange={e => setFormData({...formData, l2Tag: e.target.value})}>
                {RESOURCE_TAGS[formData.l1Tag as keyof typeof RESOURCE_TAGS].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-5 bg-nb-red text-white rounded-2xl font-black shadow-xl shadow-red-200 active:scale-95 transition-all">
            立即提交发布
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResourceUploadView;
