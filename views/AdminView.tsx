
import React, { useState, useMemo } from 'react';
import { Download, Upload, Edit3, X, UserPlus, Search, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { User, UserRole } from '../types';

interface AdminViewProps {
  users: User[];
  onUpdateUsers: (newUsers: User[]) => void;
}

const LINES = ["公司", "零售", "个人", "运营", "中后台"];

const AdminView: React.FC<AdminViewProps> = ({ users, onUpdateUsers }) => {
  const [activeTab, setActiveTab] = useState<'USERS' | 'IMPORT'>('USERS');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const totalPoints = useMemo(() => users.reduce((sum, u) => sum + (u.role === UserRole.ADMIN ? 0 : u.points), 0), [users]);

  const filteredUsers = users.filter(u => 
    u.realName.includes(searchTerm) || u.employeeId.includes(searchTerm) || u.dept.includes(searchTerm)
  );

  const handleOpenEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingUser({
      uid: `u${Date.now()}`,
      employeeId: '',
      username: '',
      realName: '',
      dept: '',
      line: '公司',
      role: UserRole.EMPLOYEE,
      points: 10000,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
    });
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (isAdding) {
      onUpdateUsers([...users, { ...editingUser, username: editingUser.employeeId }]);
    } else {
      onUpdateUsers(users.map(u => u.uid === editingUser.uid ? editingUser : u));
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDownloadTemplate = (type: string) => {
    let content = "";
    if (type === 'USERS') {
      content = "工号,姓名,部门,条线(公司/零售/个人/运营/中后台),角色(ADMIN/PRESIDENT/VP/EMPLOYEE),初始积分\nNB100,测试员,测试部,公司,EMPLOYEE,10000";
    } else {
      content = "标题,内容,条线,奖励,描述\n测试标题,详情,公司,800,描述文字";
    }
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nb_template_${type.toLowerCase()}.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">管理中心</h1>
          <p className="text-slate-500 font-bold text-sm">全行积分池总额: <span className="text-nb-red">{totalPoints.toLocaleString()}</span> P</p>
        </div>
        <div className="flex p-1 bg-slate-200 rounded-2xl w-fit">
          <button onClick={() => setActiveTab('USERS')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'USERS' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>成员管理</button>
          <button onClick={() => setActiveTab('IMPORT')} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'IMPORT' ? 'bg-white shadow-lg text-slate-900' : 'text-slate-500'}`}>批量操作</button>
        </div>
      </div>

      {activeTab === 'USERS' ? (
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/30">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm border-none shadow-sm outline-none focus:ring-2 focus:ring-nb-red/20" 
                placeholder="搜索姓名、工号、部门..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={handleOpenAdd} className="px-6 py-3 bg-nb-red text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-red-100">
              <UserPlus size={16} /> 入职新成员
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">工号 / 姓名</th>
                  <th className="px-8 py-5">部门</th>
                  <th className="px-8 py-5">条线</th>
                  <th className="px-8 py-5">角色</th>
                  <th className="px-8 py-5">积分余额</th>
                  <th className="px-8 py-5 text-right">管理</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} className="h-8 w-8 rounded-full" alt="" />
                        <div>
                          <p className="font-black text-slate-900 text-sm whitespace-nowrap">{u.realName}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{u.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-600 whitespace-nowrap">{u.dept}</td>
                    <td className="px-8 py-5">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg">{u.line}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>{u.role}</span>
                    </td>
                    <td className="px-8 py-5 font-black text-slate-900 whitespace-nowrap">{u.points} P</td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => handleOpenEdit(u)} className="p-2 text-slate-400 hover:text-nb-red active:scale-75 transition-all"><Edit3 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: '成员名单导入', type: 'USERS', desc: '批量入职新员工并分配初始积分，需包含工号、姓名、条线等。' },
            { title: '资源库同步', type: 'RESOURCES', desc: '批量导入各条线标准化文档及工具。' },
            { title: '协作历史导入', type: 'DEMANDS', desc: '迁移支行历史协作数据及积分记录。' }
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-3 font-bold leading-relaxed">{item.desc}</p>
              </div>
              <div className="flex gap-3 pt-8 mt-8 border-t border-slate-50">
                <button onClick={() => handleDownloadTemplate(item.type)} className="flex-1 py-4 bg-slate-50 text-slate-700 rounded-2xl text-[10px] font-black">下载模板</button>
                <button className="flex-1 py-4 bg-nb-red text-white rounded-2xl text-[10px] font-black shadow-lg shadow-red-200">开始上传</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[40px] p-8 w-full max-w-lg relative animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-2xl font-black mb-8">{isAdding ? '入职新成员' : '编辑成员信息'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">工号</label>
                  <input required disabled={!isAdding} className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold disabled:opacity-50" value={editingUser.employeeId} onChange={e => setEditingUser({...editingUser, employeeId: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">姓名</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={editingUser.realName} onChange={e => setEditingUser({...editingUser, realName: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">条线</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={editingUser.line} onChange={e => setEditingUser({...editingUser, line: e.target.value as any})}>
                    {LINES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">部门</label>
                  <input required className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={editingUser.dept} onChange={e => setEditingUser({...editingUser, dept: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">角色权限</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})}>
                    {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">当前积分</label>
                  <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-nb-red" value={editingUser.points} onChange={e => setEditingUser({...editingUser, points: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-nb-red text-white rounded-2xl font-black mt-8 shadow-xl shadow-red-200 active:scale-95">提交保存</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
