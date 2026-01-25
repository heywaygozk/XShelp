
import React, { useState, useMemo } from 'react';
import { User, DemandStatus, Demand, Comment, UserRole } from '../types.ts';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, HandHelping, CheckCircle2, User as UserIcon, ShieldCheck, MessageSquare, Star, Trash2, Edit3, X, Save } from 'lucide-react';
import { TAG_COLORS } from '../constants.tsx';

interface DemandDetailViewProps {
  user: User;
  demands: Demand[];
  onUpdate: (did: string, updates: Partial<Demand>) => void;
  onDelete: (did: string) => void;
  onAddComment: (did: string, comment: Comment) => void;
}

const DemandDetailView: React.FC<DemandDetailViewProps> = ({ user, demands, onUpdate, onDelete, onAddComment }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Demand>>({});

  const demand = useMemo(() => demands.find(d => d.did === id), [demands, id]);

  if (!demand) return <div className="p-20 text-center text-slate-500 font-black">该需求已下架或不存在</div>;

  const isCreator = demand.creatorId === user.uid || (demand.creatorId.includes('NB') && user.employeeId === demand.creatorId);
  const isAdmin = user.role === UserRole.ADMIN;
  const canManage = isCreator || isAdmin;
  const canManageRecommendation = [UserRole.ADMIN, UserRole.PRESIDENT, UserRole.VP].includes(user.role);

  const handleAccept = () => {
    onUpdate(demand.did, { 
      status: DemandStatus.ACCEPTED,
      helperId: user.uid,
      helperName: user.realName
    });
    alert('已成功承接！');
  };

  const handleConfirmCompletion = () => {
    onUpdate(demand.did, { status: DemandStatus.COMPLETED });
    alert('协作圆满结束！');
  };

  const toggleRecommendation = () => {
    onUpdate(demand.did, { isRecommended: !demand.isRecommended });
  };

  const handleDelete = () => {
    if (confirm('确定要删除这条需求吗？删除后不可恢复。')) {
      onDelete(demand.did);
      navigate('/demands');
    }
  };

  const startEdit = () => {
    setEditForm({ title: demand.title, description: demand.description, customerInfo: demand.customerInfo });
    setIsEditing(true);
  };

  const saveEdit = () => {
    onUpdate(demand.did, editForm);
    setIsEditing(false);
    alert('修改已保存');
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      userName: user.realName,
      userAvatar: user.avatar,
      content: commentText,
      createdAt: '刚刚'
    };
    onAddComment(demand.did, newComment);
    setCommentText('');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-10 space-y-8 animate-in fade-in duration-500 pb-32 px-1 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4 px-1">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-black w-fit active:scale-95 group p-2"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="text-sm uppercase tracking-widest">返回广场</span>
        </button>
        
        {canManage && !isEditing && (
          <div className="flex gap-2">
            <button onClick={startEdit} className="p-3 bg-white border border-slate-100 text-slate-500 rounded-2xl shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all font-black text-xs">
              <Edit3 size={16} /> 编辑需求
            </button>
            <button onClick={handleDelete} className="p-3 bg-red-50 text-red-500 rounded-2xl flex items-center gap-2 hover:bg-red-100 transition-all font-black text-xs">
              <Trash2 size={16} /> 删除
            </button>
          </div>
        )}

        <div className="flex gap-2 p-2 bg-white rounded-3xl border border-slate-100 overflow-x-auto no-scrollbar shadow-sm">
          {[DemandStatus.PUBLISHED, DemandStatus.ACCEPTED, DemandStatus.COMPLETED].map((s, idx) => (
            <div key={s} className="flex items-center gap-3 px-4 py-1">
              <div className={`h-7 w-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${
                demand.status === s ? 'bg-nb-red text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-[10px] font-black whitespace-nowrap uppercase tracking-[0.15em] ${demand.status === s ? 'text-nb-red' : 'text-slate-400'}`}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl p-7 md:p-14 relative overflow-hidden">
            {demand.isRecommended && (
              <div className="absolute top-0 right-0 px-8 py-3 bg-yellow-400 text-slate-900 font-black text-xs uppercase rounded-bl-[40px] shadow-xl flex items-center gap-2 z-10 animate-in slide-in-from-top-4">
                <Star size={14} fill="currentColor" /> 行长推荐需求
              </div>
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-8">
              <div className="flex flex-wrap gap-3">
                {demand.tags.map(tag => (
                  <span key={tag} className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${TAG_COLORS[tag] || 'bg-slate-50'}`}>#{tag}</span>
                ))}
                {canManageRecommendation && (
                  <button 
                    onClick={toggleRecommendation}
                    className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-md active:scale-95 ${demand.isRecommended ? 'bg-slate-800 text-yellow-400' : 'bg-white border border-slate-200 text-slate-400 hover:border-nb-red hover:text-nb-red'}`}
                  >
                    <ShieldCheck size={16} />
                    {demand.isRecommended ? '取消推荐' : '设为行长推荐'}
                  </button>
                )}
              </div>
              <div className="bg-slate-50/80 p-6 rounded-[32px] min-w-[160px] text-center border border-slate-100 shadow-inner">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mb-2">协作激励奖励</p>
                <p className="text-4xl font-black text-nb-red tracking-tighter">{demand.rewardValue} <span className="text-sm font-bold opacity-40 ml-1">{demand.rewardType === 'POINTS' ? 'P' : '¥'}</span></p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-6 animate-in zoom-in-95 duration-200">
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-black text-2xl border-2 border-nb-red/20 outline-none focus:border-nb-red" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-nb-red" value={editForm.customerInfo} onChange={e => setEditForm({...editForm, customerInfo: e.target.value})} />
                <textarea rows={6} className="w-full p-4 bg-slate-50 rounded-2xl font-medium border-2 border-slate-100 outline-none focus:border-nb-red" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                <div className="flex gap-4">
                   <button onClick={saveEdit} className="flex-1 py-4 bg-nb-red text-white rounded-2xl font-black flex items-center justify-center gap-2"><Save size={18}/> 保存修改</button>
                   <button onClick={() => setIsEditing(false)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black flex items-center gap-2"><X size={18}/> 取消</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-10 leading-tight tracking-tight">{demand.title}</h1>
                <div className="bg-nb-red/[0.03] rounded-[32px] p-8 mb-10 border border-nb-red/5">
                  <p className="text-[10px] font-black text-nb-red uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="h-1 w-6 bg-nb-red rounded-full"></div> 客户基本画像
                  </p>
                  <p className="text-slate-800 font-bold leading-relaxed text-sm md:text-lg">{demand.customerInfo}</p>
                </div>
                <div className="text-slate-600 font-medium leading-relaxed mb-14 whitespace-pre-wrap text-sm md:text-lg bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                  {demand.description}
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-slate-100 gap-8">
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <img src={demand.creatorAvatar} className="h-14 w-14 rounded-full ring-4 ring-slate-50 shadow-md object-cover" alt="" />
                <div>
                  <p className="font-black text-slate-900 text-base">{demand.creatorName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">发布于 {demand.createdAt}</p>
                </div>
              </div>
              
              <div className="flex gap-4 w-full sm:w-auto">
                {demand.status === DemandStatus.PUBLISHED && !isCreator && (
                  <button onClick={handleAccept} className="flex-1 sm:flex-none px-12 py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-slate-300">
                    <HandHelping size={20} /> 立即承接
                  </button>
                )}
                {demand.status === DemandStatus.ACCEPTED && isCreator && (
                  <button onClick={handleConfirmCompletion} className="flex-1 sm:flex-none px-12 py-5 bg-green-600 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-green-200">
                    <CheckCircle2 size={20} /> 确认对接完毕
                  </button>
                )}
                {demand.status === DemandStatus.COMPLETED && (
                   <div className="flex-1 sm:flex-none px-12 py-5 bg-slate-100 text-slate-400 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 cursor-default border border-slate-200">
                    <CheckCircle2 size={20} /> 协作圆满成功
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Discussion Area remains the same... */}
          <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl p-8 md:p-14">
            <h3 className="font-black text-slate-900 text-2xl mb-10 flex items-center gap-4">
              <MessageSquare className="text-nb-red" size={24} /> 协作讨论区
            </h3>
            <div className="flex gap-5 mb-12">
              <img src={user.avatar} className="h-12 w-12 rounded-full shrink-0 shadow-md object-cover ring-4 ring-slate-50" alt="" />
              <div className="flex-1 flex flex-col md:flex-row gap-3">
                <input 
                  className="flex-1 p-5 bg-slate-50 border border-slate-100 rounded-[24px] text-sm font-bold outline-none focus:ring-4 focus:ring-nb-red/5 focus:bg-white transition-all shadow-inner"
                  placeholder="询问细节、同步对接进度..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button onClick={handleSubmitComment} className="p-5 bg-nb-red text-white rounded-[24px] active:scale-90 transition-all shadow-xl shadow-red-200 flex items-center justify-center"><Send size={22} /></button>
              </div>
            </div>
            {/* Comment list rendering... */}
            <div className="space-y-8">
              {demand.comments.map(c => (
                <div key={c.id} className="flex gap-5 animate-in slide-in-from-bottom-4 duration-300">
                  <img src={c.userAvatar} className="h-11 w-11 rounded-full shrink-0 shadow-sm object-cover ring-2 ring-slate-50" alt="" />
                  <div className="flex-1 bg-slate-50 p-6 rounded-[32px] relative border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2"><span className="text-xs font-black text-slate-900">{c.userName}</span><span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{c.createdAt}</span></div>
                    <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl p-8 md:p-10 sticky top-24">
            <h4 className="font-black text-slate-900 text-xl mb-10 flex items-center gap-3"><ShieldCheck className="text-nb-red" size={24} /> 协助执行官</h4>
            {demand.status === DemandStatus.PUBLISHED ? (
              <div className="text-center py-14 bg-slate-50/50 rounded-[40px] border border-slate-100 shadow-inner">
                <div className="h-24 w-24 bg-white rounded-[32px] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-xl"><UserIcon size={48} /></div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">招募中</p>
              </div>
            ) : (
              <div className="flex items-center gap-5 p-6 bg-slate-900 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                  <div className="h-16 w-16 rounded-2xl bg-nb-red flex items-center justify-center text-white font-black text-2xl shadow-xl z-10">{demand.helperName?.[0]}</div>
                  <div className="z-10">
                    <p className="font-black text-lg leading-tight tracking-tight">{demand.helperName}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1.5 ${demand.status === DemandStatus.COMPLETED ? 'text-green-400' : 'text-yellow-400'}`}>{demand.status === DemandStatus.COMPLETED ? '任务圆满解决' : '全力承办中'}</p>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandDetailView;
