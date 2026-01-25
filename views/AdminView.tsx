
import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Edit3, Trash2, Download, Upload, RefreshCw, FileText, CheckCircle2, AlertCircle, Info, X, Save } from 'lucide-react';
import { User, UserRole, Demand, Resource, DemandUrgency, DemandStatus } from '../types.ts';

interface AdminViewProps {
  users: User[];
  demands: Demand[];
  resources: Resource[];
  onUpsertUser: (u: User) => Promise<void>;
  onDeleteUser: (uid: string) => Promise<void>;
  onUpdateDemands: (newDemands: Demand[]) => void;
  onUpdateResources: (newResources: Resource[]) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ users = [], demands = [], resources = [], onUpsertUser, onDeleteUser, onUpdateDemands, onUpdateResources }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'BATCH' | 'SYNC'>('USERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const filteredUsers = useMemo(() => {
    return (users || []).filter(u => {
      const name = (u.realName || '').toLowerCase();
      const id = (u.employeeId || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || id.includes(term);
    });
  }, [users, searchTerm]);

  const downloadTemplate = (type: string) => {
    let content = "";
    let name = "";
    if (type === 'USER') {
      content = "字段说明：工号(必填), 姓名(必填), 部门(必填), 条线(选填: 公司/零售/个人/运营/中后台), 角色(必填: EMPLOYEE/VP/PRESIDENT/ADMIN), 积分(数字), 密码(默认123456)\n" +
                "工号,姓名,部门,条线,角色,积分,密码\n" +
                "NB005,李小明,普陀支行,零售,EMPLOYEE,5000,123456";
      name = "行员导入模板_UTF8.csv";
    } else if (type === 'DEMAND') {
      content = "说明：激励类型需大写；紧迫度按括号内填写；标签用英文分号隔开\n" +
                "标题,客户信息,需求描述,激励数值,激励类型(POINTS/AMOUNT),紧迫度(正常/紧急/十万火急),标签\n" +
                "跨境结汇方案需求,象山某外贸公司,需要协助,1000,POINTS,紧急,企业类;金融";
      name = "需求导入模板_UTF8.csv";
    } else if (type === 'RESOURCE') {
      content = "说明：分类请对应预设分类\n" +
                "标题,描述,分类,二级标签,贡献者姓名\n" +
                "信贷手册,描述文字,信息资源,政策信息,张贡献";
      name = "资源导入模板_UTF8.csv";
    }

    const blob = new Blob(["\uFEFF" + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        // 注意：这里跳过了第一行（说明行）和第二行（表头行）
        const rows = text.split('\n').slice(2).filter(r => r.trim());
        
        if (type === 'USER') {
          for (const r of rows) {
            const c = r.split(',');
            const empId = c[0]?.trim();
            if (!empId) continue;
            await onUpsertUser({
              uid: `u${Math.random().toString(36).substr(2, 9)}`,
              employeeId: empId, 
              username: empId, 
              realName: c[1]?.trim() || '新员工', 
              dept: c[2]?.trim() || '未分配',
              line: (c[3]?.trim() || '公司') as any, 
              role: (c[4]?.trim() || 'EMPLOYEE') as any,
              points: parseInt(c[5]) || 0,
              password: c[6]?.trim() || '123456',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${empId}`
            });
          }
        } else if (type === 'DEMAND') {
          const newDemands = rows.map(r => {
            const c = r.split(',');
            return {
              did: `d${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              title: c[0]?.trim(),
              customerInfo: c[1]?.trim(),
              description: c[2]?.trim(),
              rewardValue: parseInt(c[3]) || 0,
              rewardType: (c[4]?.trim() || 'POINTS') as any,
              urgency: (c[5]?.trim() || '正常') as any,
              tags: c[6]?.split(';').map(t => t.trim()) || [],
              status: DemandStatus.PUBLISHED,
              creatorId: 'ADMIN',
              creatorName: '管理员导入',
              creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
              createdAt: new Date().toISOString().split('T')[0],
              comments: [],
              isRecommended: false
            };
          });
          onUpdateDemands([...demands, ...newDemands]);
        }
        alert('导入成功，已同步云端。');
      } catch (err) {
        alert('导入出错，请检查CSV格式。');
      }
      setIsProcessing(false);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const UserFormModal = ({ user, onClose }: { user: Partial<User>, onClose: () => void }) => {
    const [form, setForm] = useState<Partial<User>>(user);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsProcessing(true);
      const finalUser = {
        ...form,
        uid: form.uid || `u${Math.random().toString(36).substr(2, 9)}`,
        avatar: form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.employeeId}`
      } as User;
      await onUpsertUser(finalUser);
      setIsProcessing(false);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <h3 className="text-xl font-black">{form.uid ? '编辑行员资料' : '新增全行成员'}</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">工号 (ID)</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={form.employeeId || ''} onChange={e => setForm({...form, employeeId: e.target.value, username: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">真实姓名</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={form.realName || ''} onChange={e => setForm({...form, realName: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">所属部门</label>
                <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={form.dept || ''} onChange={e => setForm({...form, dept: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">业务条线</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={form.line} onChange={e => setForm({...form, line: e.target.value as any})}>
                  <option value="公司">公司</option>
                  <option value="零售">零售</option>
                  <option value="个人">个人</option>
                  <option value="运营">运营</option>
                  <option value="中后台">中后台</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">系统角色</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={form.role} onChange={e => setForm({...form, role: e.target.value as any})}>
                  <option value={UserRole.EMPLOYEE}>普通行员</option>
                  <option value={UserRole.VP}>副行长级</option>
                  <option value={UserRole.PRESIDENT}>行长级</option>
                  <option value={UserRole.ADMIN}>管理员</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">当前积分余额</label>
                <input type="number" required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-nb-red" value={form.points || 0} onChange={e => setForm({...form, points: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <button disabled={isProcessing} className="w-full py-5 bg-nb-red text-white rounded-[24px] font-black shadow-xl shadow-red-100 active:scale-95 transition-all mt-4">
              {isProcessing ? '正在同步云端...' : '保存更改'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-1 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">象山管理中心</h1>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">全行行员、需求与激励资产统一管理</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('USERS')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'USERS' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>成员管理</button>
          <button onClick={() => setActiveTab('BATCH')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'BATCH' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>批量导入</button>
          <button onClick={() => setActiveTab('SYNC')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'SYNC' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>备份</button>
        </div>
      </div>

      {activeTab === 'USERS' && (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden animate-in fade-in duration-500">
          <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
              <input 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border-none focus:ring-4 focus:ring-nb-red/5 font-bold text-sm" 
                placeholder="搜索姓名或工号进行快速定位..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddingUser(true)}
              className="px-8 py-4 bg-nb-red text-white rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl shadow-red-100 whitespace-nowrap active:scale-95 transition-all"
            >
              <UserPlus size={18}/> 新增成员
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">行员/工号</th>
                  <th className="px-8 py-5">条线/部门</th>
                  <th className="px-8 py-5">角色权限</th>
                  <th className="px-8 py-5">当前积分</th>
                  <th className="px-8 py-5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <img src={u.avatar} className="h-10 w-10 rounded-full bg-slate-100 shadow-inner border-2 border-white"/>
                      <div>
                        <p className="font-black text-slate-900">{u.realName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{u.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-black text-slate-700">{u.line}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{u.dept}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-lg shadow-sm ${
                        u.role === UserRole.ADMIN ? 'bg-slate-900 text-white' : 
                        u.role === UserRole.PRESIDENT ? 'bg-red-50 text-nb-red' : 
                        u.role === UserRole.VP ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role === UserRole.ADMIN ? '管理员' : 
                         u.role === UserRole.PRESIDENT ? '行长级' : 
                         u.role === UserRole.VP ? '副行长级' : '普通员工'}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-nb-red">{u.points} P</td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingUser(u)} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm">
                          <Edit3 size={18}/>
                        </button>
                        <button onClick={() => {
                          if(confirm(`确定删除行员 ${u.realName} 吗？`)) onDeleteUser(u.uid);
                        }} className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm">
                          <Trash2 size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BATCH' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'USER', name: '批量行员同步', desc: '上传CSV快速同步全行成员架构，支持批量设置角色。' },
            { id: 'DEMAND', name: '需求广场初始化', desc: '大批量导入存量业务需求，瞬间丰富全行协作场景。' },
            { id: 'RESOURCE', name: '知识智库迁移', desc: '批量沉淀信贷产品、政策通告等支行核心知识资源。' }
          ].map(t => (
            <div key={t.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl text-center space-y-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
              <div className="space-y-4">
                <div className="h-16 w-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center mx-auto shadow-inner">
                  <FileText size={32} />
                </div>
                <h3 className="font-black text-lg">{t.name}</h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed px-2">{t.desc}</p>
              </div>
              <div className="pt-4 space-y-3">
                <button onClick={() => downloadTemplate(t.id)} className="w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all border border-slate-100">
                  <Download size={16}/> 下载模板
                </button>
                <label className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer hover:bg-nb-red transition-all shadow-xl">
                  {isProcessing ? <RefreshCw className="animate-spin" size={16}/> : <Upload size={16}/>}
                  {isProcessing ? '同步中...' : '上传CSV导入'}
                  <input type="file" className="hidden" accept=".csv" disabled={isProcessing} onChange={e => handleCsvImport(e, t.id)}/>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'SYNC' && (
        <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl text-center space-y-8 max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto"><RefreshCw size={40}/></div>
          <h3 className="text-2xl font-black">系统全量备份</h3>
          <p className="text-sm text-slate-500 font-bold">将全行所有员工、需求记录、资源沉淀导出为 JSON 备份包。</p>
          <button onClick={() => {
             const blob = new Blob([JSON.stringify({users, demands, resources})], { type: 'application/json' });
             const link = document.createElement("a");
             link.href = URL.createObjectURL(blob);
             link.download = `备份_${new Date().toISOString().split('T')[0]}.json`;
             link.click();
          }} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black hover:bg-nb-red transition-all shadow-2xl">立即下载备份包</button>
        </div>
      )}

      {(editingUser || isAddingUser) && (
        <UserFormModal 
          user={editingUser || { role: UserRole.EMPLOYEE, points: 0, line: '公司' }} 
          onClose={() => { setEditingUser(null); setIsAddingUser(false); }} 
        />
      )}
    </div>
  );
};

export default AdminView;
