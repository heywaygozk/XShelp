
import React, { useState, useMemo } from 'react';
import { User, Resource, Comment } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, FileText, User as UserIcon } from 'lucide-react';

interface ResourceDetailViewProps {
  user: User;
  resources: Resource[];
  onAddComment: (rid: string, comment: Comment) => void;
}

const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({ user, resources, onAddComment }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  
  const res = useMemo(() => resources.find(r => r.rid === id), [resources, id]);

  if (!res) return <div className="p-20 text-center text-slate-500 font-black">该资源文件已归档或不存在</div>;

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: `rc${Date.now()}`,
      userName: user.realName,
      userAvatar: user.avatar,
      content: commentText,
      createdAt: '刚刚'
    };
    onAddComment(res.rid, newComment);
    setCommentText('');
  };

  return (
    <div className="max-w-5xl mx-auto py-6 md:py-10 space-y-8 animate-in fade-in duration-500 pb-32 px-1 md:px-0">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-black w-fit group p-2 transition-colors active:scale-95"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        <span className="text-sm uppercase tracking-widest">返回中心</span>
      </button>

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
          <FileText size={180} />
        </div>

        <div className="p-8 md:p-14 border-b border-slate-50">
          <div className="flex flex-wrap gap-2 mb-6">
            {res.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-red-50 text-nb-red rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">#{tag}</span>
            ))}
            <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">{res.type}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-8 leading-tight tracking-tight">{res.title}</h1>
          
          <div className="flex items-center gap-5">
            <img src={res.ownerAvatar} className="h-14 w-14 rounded-2xl ring-4 ring-slate-50 shadow-md object-cover" alt="" />
            <div>
              <p className="font-black text-slate-900 text-base leading-none mb-1.5">{res.owner}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">贡献于 {res.createdAt}</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-14 bg-slate-50/40">
          <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed md:text-xl whitespace-pre-wrap">
            {res.description}
          </div>
        </div>

        <div className="p-8 md:p-14 border-t border-slate-50">
          <h3 className="font-black text-slate-900 text-2xl mb-10 flex items-center gap-4">
            使用反馈及探讨
            <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase">{res.comments.length}</span>
          </h3>
          
          <div className="flex gap-5 mb-14">
            <img src={user.avatar} className="h-12 w-12 rounded-full shrink-0 shadow-md ring-4 ring-slate-50 object-cover" alt="" />
            <div className="flex-1 relative">
              <textarea 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-nb-red/5 focus:bg-white transition-all resize-none text-sm font-bold shadow-inner"
                placeholder="分享你的实际应用心得，或向贡献者咨询更多技术细节..."
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button 
                onClick={handleSubmitComment}
                className="absolute right-4 bottom-4 p-4 bg-nb-red text-white rounded-2xl active:scale-90 transition-all shadow-xl shadow-red-200"
              >
                <Send size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-10">
            {res.comments.length > 0 ? res.comments.map(c => (
              <div key={c.id} className="flex gap-5 animate-in slide-in-from-bottom-4 duration-300">
                <img src={c.userAvatar} className="h-11 w-11 rounded-full shrink-0 shadow-sm ring-2 ring-slate-50 object-cover" alt="" />
                <div className="flex-1 bg-slate-50 p-6 rounded-[32px] relative border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-slate-900 text-sm tracking-tight">{c.userName}</span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{c.createdAt}</span>
                  </div>
                  <p className="text-xs md:text-base text-slate-600 font-medium leading-relaxed">{c.content}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-14 bg-slate-50/30 rounded-[40px] border-2 border-dashed border-slate-100">
                 <p className="text-sm text-slate-400 font-black uppercase tracking-widest">暂无探讨记录，成为第一个发现价值的人</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailView;
