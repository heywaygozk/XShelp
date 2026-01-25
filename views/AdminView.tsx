
import React, { useState, useMemo, useRef } from 'react';
import { Search, UserPlus, Edit3, Trash2, Download, Upload, RefreshCw, FileText } from 'lucide-react';
import { User, UserRole, Demand, Resource, DemandUrgency, DemandStatus } from '../types.ts';

interface AdminViewProps {
  users: User[];
  demands: Demand[];
  resources: Resource[];
  onUpdateUsers: (newUsers: User[]) => void;
  onUpdateDemands: (newDemands: Demand[]) => void;
  onUpdateResources: (newResources: Resource[]) => void;
}

const AdminView: React.FC<AdminViewProps> = ({ users, demands, resources, onUpdateUsers, onUpdateDemands, onUpdateResources }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'BATCH' | 'SYNC'>('USERS');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => u.realName.includes(searchTerm) || u.employeeId.includes(searchTerm));

  const downloadTemplate = (type: string) => {
    let content = "";
    let name = "";
    if (type === 'USER') {
      content = "工号,姓名,部门,条线(公司/零售/个人/运营/中后台),角色(EMPLOYEE/VP/PRESIDENT),积分\nNB005,李小明,普陀支行,零售,EMPLOYEE,5000";
      name = "员工导入模板.csv";
    } else if (type === 'DEMAND') {
      content = "标题,客户信息,需求描述,激励数值,激励类型(POINTS/AMOUNT),紧迫度(正常/紧急/十万火急),发布人姓名,发布人工号,发布人部门,发布人条线,状态(待接单/已接单/已完成),发布时间(YYYY-MM-DD)\n某出口企业融资需求,象山某针织厂,需要外币贸易融资方案,1000,POINTS,紧急,王小二,NB999,象山支行营业部,公司,待接单,2024-03-20";
      name = "需求导入模板.csv";
    } else {
      content = "标题,描述,分类,二级标签,发布人姓名,发布人工号,发布人部门,发布人条线,发布时间(YYYY-MM-DD)\n象山支行信贷产品手册,全行信贷产品汇总,信息资源,政策信息,张贡献,NB888,零售银行部,零售,2024-03-15";
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
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const rows = text.split('\n').slice(1).filter(r => r.trim());
      
      try {
        if (type === 'USER') {
          const newUsers = rows.map(r => {
            const c = r.split(',');
            return {
              uid: `u${Math.random().toString(36).substr(2, 9)}`,
              employeeId: c[0], username: c[0], realName: c[1], dept: c[2],
              line: (c[3] || '公司') as any, role: (c[4] || 'EMPLOYEE') as any,
              points: parseInt(c[5]) || 0, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c[0]}`
            };
          });
          onUpdateUsers([...users, ...newUsers]);
        } else if (type === 'DEMAND') {
          const newDemands = rows.map(r => {
            const c = r.split(',');
            const creatorId = c[7] || 'NB_ADMIN';
            return {
              did: `d${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
              title: c[0], customerInfo: c[1], description: c[2],
              rewardValue: parseInt(c[3]) || 0, rewardType: (c[4] || 'POINTS') as any,
              urgency: (c[5] || '正常') as any, isRecommended: false, tags: [c[9] || '导入'],
              status: (c[10] as any) || DemandStatus.PUBLISHED, 
              creatorId: creatorId, 
              creatorName: c[6] || '系统导入',
              creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${creatorId}`,
              createdAt: c[11] || new Date().toISOString().split('T')[0], 
              comments: []
            };
          });
          onUpdateDemands([...demands, ...newDemands]);
        } else if (type === 'RESOURCE') {
          const newRes = rows.map(r => {
            const c = r.split(',');
            const ownerId = c[5] || 'NB_ADMIN';
            return {
              rid: `r${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
              title: c[0], description: c[1], type: c[2], tags: [c[3]],
              owner: c[4] || '系统导入', 
              ownerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerId}`,
              status: 'ACTIVE', 
              createdAt: c[8] || new Date().toISOString().split('T')[0], 
              comments: []
            };
          });
          onUpdateResources([...resources, ...newRes]);
        }
        alert('批量导入完成！');
      } catch (err) {
        alert('导入失败，请确保CSV格式与模板完全一致。');
      }
      e.target.value = ''; // Reset input
    };
    reader.readAsText(file);
  };

  const exportAllData = () => {
    const data = { users, demands, resources, timestamp: Date.now() };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `象山帮帮_数据备份_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importAllData = () => {
    const str = prompt("请粘贴导出的 JSON 数据：");
    if (!str) return;
    try {
      const data = JSON.parse(str);
      if (data.users && data.demands) {
        onUpdateUsers(data.users);
        onUpdateDemands(data.demands);
        onUpdateResources(data.resources);
        alert('数据同步成功！');
      }
    } catch (e) { alert('解析失败'); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 px-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-2xl font-black text-slate-900">管理中心</h1>
        <div className="flex bg-slate-200 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('USERS')} className={`px-6 py-2 rounded-xl text-xs font-black ${activeTab === 'USERS' ? 'bg-white shadow' : 'text-slate-500'}`}>成员管理</button>
          <button onClick={() => setActiveTab('BATCH')} className={`px-6 py-2 rounded-xl text-xs font-black ${activeTab === 'BATCH' ? 'bg-white shadow' : 'text-slate-500'}`}>批量操作</button>
          <button onClick={() => setActiveTab('SYNC')} className={`px-6 py-2 rounded-xl text-xs font-black ${activeTab === 'SYNC' ? 'bg-white shadow' : 'text-slate-500'}`}>全量备份</button>
        </div>
      </div>

      {activeTab === 'USERS' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl outline-none" placeholder="搜索成员..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr><th className="px-8 py-4">姓名/工号</th><th className="px-8 py-4">角色</th><th className="px-8 py-4">积分</th><th className="px-8 py-4 text-right">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50">
                    <td className="px-8 py-4 flex items-center gap-3"><img src={u.avatar} className="h-8 w-8 rounded-full"/><div><p className="font-black text-sm">{u.realName}</p><p className="text-[10px] text-slate-400">{u.employeeId}</p></div></td>
                    <td className="px-8 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black">{u.role}</span></td>
                    <td className="px-8 py-4 font-black">{u.points} P</td>
                    <td className="px-8 py-4 text-right">
                      <button onClick={() => {
                        if(confirm('确定删除该员工？')) onUpdateUsers(users.filter(item => item.uid !== u.uid));
                      }} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'BATCH' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['USER', 'DEMAND', 'RESOURCE'].map(t => (
            <div key={t} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-lg text-center space-y-4">
              <h3 className="font-black text-lg">{t === 'USER' ? '行员' : t === 'DEMAND' ? '协作需求' : '共享资源'}导入</h3>
              <button onClick={() => downloadTemplate(t)} className="w-full py-3 bg-slate-50 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-slate-100"><Download size={16}/>下载导入模板</button>
              <label className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer hover:bg-nb-red transition-all">
                <Upload size={16}/>上传填好的 CSV
                <input type="file" className="hidden" accept=".csv" onChange={e => handleCsvImport(e, t)}/>
              </label>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'SYNC' && (
        <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-xl text-center space-y-6 max-w-xl mx-auto">
          <div className="h-16 w-16 bg-red-50 text-nb-red rounded-full flex items-center justify-center mx-auto"><RefreshCw size={32}/></div>
          <h3 className="text-xl font-black">系统全量同步</h3>
          <p className="text-sm text-slate-500 leading-relaxed">此功能可将全行现有数据（员工、需求、资源）打包导出。在更换设备或进行版本迁移时，可一键还原工作状态。</p>
          <div className="flex flex-col gap-3 pt-4">
            <button onClick={exportAllData} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">导出全站数据 JSON</button>
            <button onClick={importAllData} className="w-full py-4 bg-nb-red text-white rounded-2xl font-black">导入同步历史数据</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
