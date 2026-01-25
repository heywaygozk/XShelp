
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import DashboardView from './views/DashboardView.tsx';
import ResourceView from './views/ResourceView.tsx';
import ResourceUploadView from './views/ResourceUploadView.tsx';
import ResourceDetailView from './views/ResourceDetailView.tsx';
import DemandView from './views/DemandView.tsx';
import DemandUploadView from './views/DemandUploadView.tsx';
import DemandDetailView from './views/DemandDetailView.tsx';
import PointsView from './views/PointsView.tsx';
import AdminView from './views/AdminView.tsx';
import AnalyticsView from './views/AnalyticsView.tsx';
import LoginView from './views/LoginView.tsx';
import { User, UserRole, Resource, Demand, DemandUrgency, DemandStatus, Comment, Notification } from './types.ts';
import { MOCK_USERS } from './constants.tsx';
import { createClient } from '@supabase/supabase-js';

// --- 配置区 ---
const SUPABASE_URL = 'https://clikvzxpvoesglyjqpnm.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_5St6vaCtaq51_yqJaj5HFw_l-ebm8Jh';

const isConfigValid = SUPABASE_URL && !SUPABASE_URL.includes('YOUR_');
const supabase = isConfigValid ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- 字段映射工具 (DB 格式 <-> 前端格式) ---
const mapUser = (u: any): User => ({
  uid: u.uid,
  employeeId: u.employee_id,
  username: u.username,
  realName: u.real_name,
  password: u.password || '123456', // 映射密码字段
  dept: u.dept,
  line: u.line,
  role: u.role,
  points: u.points,
  avatar: u.avatar
});

const mapDemand = (d: any): Demand => ({
  did: d.did,
  title: d.title,
  description: d.description,
  customerInfo: d.customer_info,
  rewardType: d.reward_type,
  rewardValue: d.reward_value,
  urgency: d.urgency,
  isRecommended: d.is_recommended,
  tags: d.tags || [],
  status: d.status,
  creatorId: d.creator_id,
  creatorName: d.creator_name,
  creatorAvatar: d.creator_avatar,
  helperId: d.helper_id,
  helperName: d.helper_name,
  createdAt: d.created_at,
  comments: d.comments || []
});

const mapResource = (r: any): Resource => ({
  rid: r.rid,
  title: r.title,
  description: r.description,
  type: r.type,
  tags: r.tags || [],
  owner: r.owner,
  ownerAvatar: r.owner_avatar,
  status: r.status,
  createdAt: r.created_at,
  comments: r.comments || []
});

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchAllData = async () => {
    if (!supabase) {
      setUsers(MOCK_USERS);
      setLoading(false);
      return;
    }

    try {
      const { data: uData } = await supabase.from('users').select('*');
      const { data: dData } = await supabase.from('demands').select('*').order('created_at', { ascending: false });
      const { data: rData } = await supabase.from('resources').select('*').order('created_at', { ascending: false });

      const mappedUsers = (uData || []).map(mapUser);
      const mappedDemands = (dData || []).map(mapDemand);
      const mappedResources = (rData || []).map(mapResource);

      setUsers(mappedUsers);
      setDemands(mappedDemands);
      setResources(mappedResources);
      
      const savedUser = localStorage.getItem('nb_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const match = mappedUsers.find(u => u.uid === parsed.uid);
        if (match) setCurrentUser(match);
      }
    } catch (err) {
      console.error('Cloud Sync Error:', err);
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const activeUser = useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.uid === currentUser.uid) || currentUser;
  }, [currentUser, users]);

  const handleLogin = (u: User) => {
    setCurrentUser(u);
    localStorage.setItem('nb_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nb_user');
  };

  // --- 写入云端的方法 ---

  const addResource = async (res: Resource) => {
    if (supabase) {
      await supabase.from('resources').insert([{
        rid: res.rid,
        title: res.title,
        description: res.description,
        type: res.type,
        tags: res.tags,
        owner: res.owner,
        owner_avatar: res.ownerAvatar,
        status: res.status,
        created_at: res.createdAt,
        comments: res.comments
      }]);
    }
    setResources(prev => [res, ...prev]);
  };

  const updateResource = async (rid: string, updates: Partial<Resource>) => {
    if (supabase) {
      const dbUpdates: any = { ...updates };
      if (updates.ownerAvatar) { dbUpdates.owner_avatar = updates.ownerAvatar; delete dbUpdates.ownerAvatar; }
      await supabase.from('resources').update(dbUpdates).eq('rid', rid);
    }
    setResources(prev => prev.map(r => r.rid === rid ? { ...r, ...updates } : r));
  };

  const deleteResource = async (rid: string) => {
    if (supabase) await supabase.from('resources').delete().eq('rid', rid);
    setResources(prev => prev.filter(r => r.rid !== rid));
  };

  const addDemand = async (dem: Demand) => {
    if (supabase) {
      await supabase.from('demands').insert([{
        did: dem.did,
        title: dem.title,
        description: dem.description,
        customer_info: dem.customerInfo,
        reward_type: dem.rewardType,
        reward_value: dem.rewardValue,
        urgency: dem.urgency,
        is_recommended: dem.isRecommended,
        tags: dem.tags,
        status: dem.status,
        creator_id: dem.creatorId,
        creator_name: dem.creatorName,
        creator_avatar: dem.creatorAvatar,
        created_at: dem.createdAt,
        comments: dem.comments
      }]);
      
      if (dem.rewardType === 'POINTS') {
        const newPoints = Math.max(0, (activeUser?.points || 0) - dem.rewardValue);
        await supabase.from('users').update({ points: newPoints }).eq('uid', dem.creatorId);
        setUsers(prev => prev.map(u => u.uid === dem.creatorId ? { ...u, points: newPoints } : u));
      }
    }
    setDemands(prev => [dem, ...prev]);
  };

  const updateDemand = async (did: string, updates: Partial<Demand>) => {
    if (supabase) {
      const dbUpdates: any = { ...updates };
      if (updates.customerInfo) { dbUpdates.customer_info = updates.customerInfo; delete dbUpdates.customerInfo; }
      if (updates.rewardType) { dbUpdates.reward_type = updates.rewardType; delete dbUpdates.rewardType; }
      if (updates.rewardValue) { dbUpdates.reward_value = updates.rewardValue; delete dbUpdates.rewardValue; }
      if (updates.isRecommended !== undefined) { dbUpdates.is_recommended = updates.isRecommended; delete updates.isRecommended; }
      if (updates.creatorId) { dbUpdates.creator_id = updates.creatorId; delete dbUpdates.creatorId; }
      if (updates.creatorName) { dbUpdates.creator_name = updates.creatorName; delete dbUpdates.creatorName; }
      if (updates.creatorAvatar) { dbUpdates.creator_avatar = updates.creatorAvatar; delete dbUpdates.creatorAvatar; }
      if (updates.helperId) { dbUpdates.helper_id = updates.helperId; delete dbUpdates.helperId; }
      if (updates.helperName) { dbUpdates.helper_name = updates.helperName; delete dbUpdates.helperName; }
      
      await supabase.from('demands').update(dbUpdates).eq('did', did);
    }
    setDemands(prev => prev.map(d => d.did === did ? { ...d, ...updates } : d));
  };

  const deleteDemand = async (did: string) => {
    if (supabase) await supabase.from('demands').delete().eq('did', did);
    setDemands(prev => prev.filter(d => d.did !== did));
  };

  const addComment = async (type: 'DEMAND' | 'RESOURCE', id: string, comment: Comment) => {
    const table = type === 'DEMAND' ? 'demands' : 'resources';
    const idKey = type === 'DEMAND' ? 'did' : 'rid';
    const currentItem = type === 'DEMAND' ? demands.find(d => d.did === id) : resources.find(r => r.rid === id);
    if (!currentItem) return;

    const newComments = [...currentItem.comments, comment];
    if (supabase) await supabase.from(table).update({ comments: newComments }).eq(idKey, id);
    
    if (type === 'DEMAND') setDemands(prev => prev.map(d => d.did === id ? { ...d, comments: newComments } : d));
    else setResources(prev => prev.map(r => r.rid === id ? { ...r, comments: newComments } : r));
  };

  const updateUsers = async (newUsers: User[]) => {
    setUsers(newUsers);
    if (supabase) {
      for (const u of newUsers) {
        await supabase.from('users').upsert({
          uid: u.uid,
          employee_id: u.employeeId,
          username: u.username,
          real_name: u.realName,
          password: u.password, // 保存密码
          dept: u.dept,
          line: u.line,
          role: u.role,
          points: u.points,
          avatar: u.avatar
        });
      }
    }
  };

  // 新增：修改个人密码
  const handleUpdatePassword = async (uid: string, newPass: string) => {
    if (supabase) {
      const { error } = await supabase.from('users').update({ password: newPass }).eq('uid', uid);
      if (error) {
        alert('密码修改失败: ' + error.message);
        return;
      }
    }
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, password: newPass } : u));
    alert('密码修改成功，下次请使用新密码登录');
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="h-12 w-12 border-4 border-nb-red border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 animate-pulse uppercase tracking-widest text-sm text-center px-6">
        正在同步象山支行云端数据...
      </p>
    </div>
  );
  
  if (!activeUser) return <LoginView onLogin={handleLogin} users={users} />;

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white animate-in slide-in-from-left">
              <Sidebar user={activeUser} users={users} onNavClick={() => setIsMobileMenuOpen(false)} />
            </div>
          </div>
        )}
        <Sidebar user={activeUser} users={users} className="hidden lg:flex" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={activeUser} notifications={notifications} onLogout={handleLogout} onMenuClick={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
            <Routes>
              <Route path="/" element={<DashboardView user={activeUser} demands={demands} resources={resources} />} />
              <Route path="/demands" element={<DemandView user={activeUser} demands={demands} />} />
              <Route path="/demands/upload" element={<DemandUploadView user={activeUser} onUpload={addDemand} />} />
              <Route path="/demands/:id" element={<DemandDetailView user={activeUser} demands={demands} onUpdate={updateDemand} onDelete={deleteDemand} onAddComment={(id, c) => addComment('DEMAND', id, c)} />} />
              <Route path="/resources" element={<ResourceView user={activeUser} resources={resources} />} />
              <Route path="/resources/upload" element={<ResourceUploadView user={activeUser} onUpload={addResource} />} />
              <Route path="/resources/:id" element={<ResourceDetailView user={activeUser} resources={resources} onUpdate={updateResource} onDelete={deleteResource} onAddComment={(id, c) => addComment('RESOURCE', id, c)} />} />
              <Route path="/points" element={<PointsView user={activeUser} onUpdatePassword={handleUpdatePassword} />} />
              <Route path="/admin" element={<AdminView users={users} demands={demands} resources={resources} onUpdateUsers={updateUsers} onUpdateDemands={setDemands} onUpdateResources={setResources} />} />
              <Route path="/analytics" element={<AnalyticsView user={activeUser} demands={demands} resources={resources} users={users} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
