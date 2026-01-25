
import React, { useState, useMemo } from 'react';
import { User, Resource, Comment, UserRole } from '../types.ts';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, FileText, User as UserIcon, Trash2, Edit3, X, Save } from 'lucide-react';

interface ResourceDetailViewProps {
  user: User;
  resources: Resource[];
  onUpdate: (rid: string, updates: Partial<Resource>) => void;
  onDelete: (rid: string) => void;
  onAddComment: (rid: string, comment: Comment) => void;
}

const ResourceDetailView: React.FC<ResourceDetailViewProps> = ({ user, resources, onUpdate, onDelete, onAddComment }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Resource>>({});
  
  const res = useMemo(() => resources.find(r => r.rid === id), [resources, id]);

  if (!res) return <div className="p-20 text-center text-slate-500 font-black">该资源文件已归档或不存在</div>;

  // 这里的 owner 匹配逻辑可以根据导入时的 employeeId 扩展
  const canManage = res.owner === user.realName || user.role === UserRole.ADMIN;

  const handleDelete = () => {
    if (confirm('确定要删除这项共享资源吗？')) {
      onDelete(res.rid);
      navigate('/resources');
    }
  };

  const startEdit = () => {
    setEditForm({ title: res.title, description: res.description });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdate(res.rid, editForm);
    setIsEditing(false);
    alert('资源信息已更新');
  };

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
      <div className="flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-black group p-2 transition-colors">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-sm uppercase tracking-widest">返回中心</span>
        </button>
        {canManage && !isEditing && (
          <div className="flex gap-2">
            <button onClick={startEdit} className="p-3 bg-white border border-slate-100 text-slate-500 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all font-black text-xs shadow-sm">
              <Edit3 size={16} /> 编辑
            </button>
            <button onClick={handleDelete} className="p-3 bg-red-50 text-red-500 rounded-2xl flex items-center gap-2 hover:bg-red-100 transition-all font-black text-xs">
              <Trash2 size={16} /> 删除
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl overflow-hidden relative">
        <div className="p-8 md:p-14 border-b border-slate-50">
          <div className="flex flex-wrap gap-2 mb-6">
            {res.tags.map(tag => (
              <span key={tag} className="px-4 py-1.5 bg-red-50 text-nb-red rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">#{tag}</span>
            ))}
            <span className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">{res.type}</span>
          </div>
          
          {isEditing ? (
             <div className="space-y-6 animate-in zoom-in-95">
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-black text-2xl border-2 border-nb-red/20 outline-none focus:border-nb-red" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                <textarea rows={10} className="w-full p-4 bg-slate-50 rounded-2xl font-medium border-2 border-slate-100 outline-none focus:border-nb-red" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                <div className="flex gap-4">
                   <button onClick={saveEdit} className="flex-1 py-4 bg-nb-red text-white rounded-2xl font-black flex items-center justify-center gap-2"><Save size={18}/> 保存</button>
                   <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black"><X size={18}/></button>
                </div>
             </div>
          ) : (
            <>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-8 leading-tight tracking-tight">{res.title}</h1>
              <div className="flex items-center gap-5">
                <img src={res.ownerAvatar} className="h-14 w-14 rounded-2xl ring-4 ring-slate-50 shadow-md object-cover" alt="" />
                <div>
                  <p className="font-black text-slate-900 text-base leading-none mb-1.5">{res.owner}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">贡献于 {res.createdAt}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="p-8 md:p-14 bg-slate-50/40">
            <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed md:text-xl whitespace-pre-wrap">{res.description}</div>
          </div>
        )}

        <div className="p-8 md:p-14 border-t border-slate-50">
          <h3 className="font-black text-slate-900 text-2xl mb-10 flex items-center gap-4">使用反馈及探讨</h3>
          {/* Discussion inputs and list... */}
          <div className="flex gap-5 mb-14">
            <img src={user.avatar} className="h-12 w-12 rounded-full shrink-0 shadow-md ring-4 ring-slate-50" alt="" />
            <div className="flex-1 relative">
              <textarea 
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-nb-red/5 focus:bg-white transition-all resize-none text-sm font-bold shadow-inner"
                placeholder="分享心得或向贡献者咨询..."
                rows={3}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <button onClick={handleSubmitComment} className="absolute right-4 bottom-4 p-4 bg-nb-red text-white rounded-2xl active:scale-90 transition-all shadow-xl"><Send size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetailView;
