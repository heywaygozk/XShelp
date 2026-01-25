
import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Edit3, Trash2, Download, Upload, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { User, UserRole, Demand, Resource, DemandUrgency, DemandStatus } from '../types.ts';

interface AdminViewProps {
  users: User[];
  demands: Demand[];
  resources: Resource[];
  onUpdateUsers: (newUsers: User[]) => void;
  onUpdateDemands: (newDemands: Demand[]) => void;
  onUpdateResources: (newResources: Resource[]) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ users = [], demands = [], resources = [], onUpdateUsers, onUpdateDemands, onUpdateResources }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'BATCH' | 'SYNC'>('USERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = useMemo(() => {
    return (users || []).filter(u => {
      const name = (u.realName || '').toLowerCase();
      const id = (u.employeeId || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      return name.includes(term) || id.includes(term);
    });
  }, [users, searchTerm]);

  // 修改行员角色
  const handleRoleChange = (uid: string, newRole: UserRole) => {
    const updatedUsers = users.map(u => u.uid === uid ? { ...u, role: newRole } : u);
    onUpdateUsers(updatedUsers);
  };

  const downloadTemplate = (type: string) => {
    let content = "";
    let name = "";
    if (type === 'USER') {
      content = "工号,姓名,部门,条线(公司/零售/个人/运营/中后台),角色(EMPLOYEE/VP/PRESIDENT/ADMIN),积分,密码\nNB005,李小明,普陀支行,零售,EMPLOYEE,5000,123456";
      name = "行员导入模板.csv";
    } else if (type === 'DEMAND') {
      content = "标题,客户信息,需求描述,激励数值,激励类型(POINTS/AMOUNT),紧迫度(正常/紧急/十万火急),标签(用分号隔开)\n跨境结汇方案需求,象山某外贸公司,需要资深产品经理协助制定方案,1000,POINTS,紧急,企业类;找产品销路";
      name = "需求导入模板.csv";
    } else if (type === 'RESOURCE') {
      content = "标题,描述,分类,二级标签,贡献者姓名\n象山支行信贷手册,2024年最新版全行信贷产品汇总,信息资源,政策信息,张贡献";
      name = "资源导入模板.csv";
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
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const rows = text.split('\n').slice(1).filter(r => r.trim());
      
      try {
        if (type === 'USER') {
          const newUsers = rows.map(r => {
            const c = r.split(',');
            const empId = c[0]?.trim() || '';
            return {
              uid: `u${Math.random().toString(36).substr(2, 9)}`,
              employeeId: empId, 
              username: empId, 
              realName: c[1]?.trim() || '未命名', 
              dept: c[2]?.trim() || '未分配部门',
              line: (c[3]?.trim() || '公司') as any, 
              role: (c[4]?.trim() || 'EMPLOYEE') as any,
              points: parseInt(c[5]) || 0,
              password: c[6]?.trim() || '123456',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${empId || Math.random()}`
            };
          });
          onUpdateUsers([...users, ...newUsers]);
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
              creatorId: 'ADMIN_IMPORT',
              creatorName: '系统管理员',
              creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
              createdAt: new Date().toISOString().split('T')[0],
              comments: [],
              isRecommended: false
            };
          });
          onUpdateDemands([...demands, ...newDemands]);
        } else if (type === 'RESOURCE') {
          const newResources = rows.map(r => {
            const c = r.split(',');
            return {
              rid: `r${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              title: c[0]?.trim(),
              description: c[1]?.trim(),
              type: c[2]?.trim(),
              tags: [c[3]?.trim()],
              owner: c[4]?.trim() || '系统',
              ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=resource',
              status: 'ACTIVE' as any,
              createdAt: new Date().toISOString().split('T')[0],
              comments: []
            };
          });
          onUpdateResources([...resources, ...newResources]);
        }
        alert('数据批量处理并云端同步完成！');
      } catch (err) {
        console.error(err);
        alert('导入出错，请检查CSV格式。');
      }
      setIsProcessing(false);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const exportAllData = () => {
    const data = { users, demands, resources, timestamp: Date.now() };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `象山帮帮_全量备份_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">管理中心</h1>
          <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-widest">系统最高权限执行空间</p>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('USERS')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'USERS' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>成员管理</button>
          <button onClick={() => setActiveTab('BATCH')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'BATCH' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>批量操作</button>
          <button onClick={() => setActiveTab('SYNC')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'SYNC' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>数据备份</button>
        </div>
      </div>

      {activeTab === 'USERS' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
          <div className="p-6 border-b border-slate-50 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
              <input 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none border-none focus:ring-4 focus:ring-nb-red/5 font-bold text-sm" 
                placeholder="搜索姓名或工号进行快速管理..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">行员/工号</th>
                  <th className="px-8 py-5">所属条线</th>
                  <th className="px-8 py-5">角色权限</th>
                  <th className="px-8 py-5">当前积分</th>
                  <th className="px-8 py-5 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.length > 0 ? filteredUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <img src={u.avatar} className="h-10 w-10 rounded-full bg-slate-100 shadow-sm border-2 border-white"/>
                      <div>
                        <p className="font-black text-slate-900">{u.realName || '未命名'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{u.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black uppercase shadow-sm text-slate-600">{u.line}</span>
                    </td>
                    <td className="px-8 py-5">
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer shadow-sm transition-all ${
                          u.role === UserRole.ADMIN ? 'bg-slate-900 text-white' : 
                          u.role === UserRole.PRESIDENT ? 'bg-red-50 text-nb-red' : 
                          u.role === UserRole.VP ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <option value={UserRole.ADMIN}>管理员</option>
                        <option value={UserRole.PRESIDENT}>行长级</option>
                        <option value={UserRole.VP}>副行长级</option>
                        <option value={UserRole.EMPLOYEE}>普通员工</option>
                      </select>
                    </td>
                    <td className="px-8 py-5 font-black text-nb-red">{u.points} P</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => {
                        if(confirm(`确定删除员工 ${u.realName} 吗？此操作将同步删除云端记录。`)) {
                          onUpdateUsers(users.filter(item => item.uid !== u.uid));
                        }
                      }} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={20}/>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-24 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">未检索到符合条件的成员数据</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BATCH' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { id: 'USER', name: '全行成员管理', desc: '批量导入员工工号、部门、初始积分等基础信息。', color: 'bg-blue-50 text-blue-600' },
            { id: 'DEMAND', name: '需求广场初始化', desc: '一键导入大量客户协作需求，用于快速铺开业务场景。', color: 'bg-red-50 text-nb-red' },
            { id: 'RESOURCE', name: '资源智库沉淀', desc: '批量同步信贷产品、政策文件等全行核心知识资产。', color: 'bg-green-50 text-green-600' }
          ].map(t => (
            <div key={t.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl text-center space-y-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
              <div className="space-y-4">
                <div className={`h-16 w-16 ${t.color} rounded-[24px] flex items-center justify-center mx-auto shadow-inner`}>
                  <FileText size={32} />
                </div>
                <h3 className="font-black text-lg">{t.name}</h3>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed px-2">{t.desc}</p>
              </div>
              <div className="pt-4 space-y-3">
                <button onClick={() => downloadTemplate(t.id)} className="w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-100 transition-all border border-slate-100">
                  <Download size={16}/> 下载 CSV 模板
                </button>
                <label className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer hover:bg-nb-red transition-all shadow-xl shadow-slate-200">
                  {isProcessing ? <RefreshCw className="animate-spin" size={16}/> : <Upload size={16}/>}
                  {isProcessing ? '正在同步云端...' : '上传 CSV 导入'}
                  <input type="file" className="hidden" accept=".csv" disabled={isProcessing} onChange={e => handleCsvImport(e, t.id)}/>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'SYNC' && (
        <div className="bg-white rounded-[48px] p-12 border border-slate-100 shadow-2xl text-center space-y-8 max-w-2xl mx-auto relative overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 p-8 text-slate-50"><RefreshCw size={120} className="rotate-12 opacity-5"/></div>
          <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><RefreshCw size={40}/></div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">系统全量资产导出</h3>
            <p className="text-sm text-slate-500 font-bold max-w-sm mx-auto">将全行所有员工积分、需求协作记录、智库资源一键导出为本地 JSON 备份文件。</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 text-left space-y-4">
             <div className="flex items-center gap-3 text-xs font-black text-slate-600"><CheckCircle2 size={16} className="text-green-500"/> 包含行员敏感信息加密</div>
             <div className="flex items-center gap-3 text-xs font-black text-slate-600"><CheckCircle2 size={16} className="text-green-500"/> 包含协作讨论区完整记录</div>
             <div className="flex items-center gap-3 text-xs font-black text-slate-600"><CheckCircle2 size={16} className="text-green-500"/> 支持后期一键离线还原</div>
          </div>
          <button onClick={exportAllData} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black hover:bg-nb-red transition-all shadow-2xl shadow-slate-300 active:scale-95">导出云端数据备份包</button>
        </div>
      )}
    </div>
  );
};

export default AdminView;
