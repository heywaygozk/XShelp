
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

// --- 字段映射工具 ---
const mapUser = (u: any): User => ({
  uid: u.uid,
  employeeId: u.employee_id,
  username: u.username,
  realName: u.real_name,
  password: u.password || '123456', 
  dept: u.dept,
  line: u.line,
  role: u.role,
  points: Number(u.points || 0),
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
  // 核心：强制布尔转换
  isRecommended: d.is_recommended === true, 
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

  const addNotification = (notif: Partial<Notification>) => {
    const newNotif: Notification = {
      id: `n${Date.now()}`,
      title: notif.title || '系统通知',
      content: notif.content || '',
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      type: notif.type || 'INFO',
      targetUid: notif.targetUid,
      targetRole: notif.targetRole
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleLogin = (u: User) => {
    setCurrentUser(u);
    localStorage.setItem('nb_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nb_user');
  };

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
      if (updates.ownerAvatar) { dbUpdates.owner_avatar = updates.ownerAvatar; }
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
        const creator = users.find(u => u.uid === dem.creatorId);
        const newPoints = Math.max(0, (creator?.points || 0) - dem.rewardValue);
        await supabase.from('users').update({ points: newPoints }).eq('uid', dem.creatorId);
        setUsers(prev => prev.map(u => u.uid === dem.creatorId ? { ...u, points: newPoints } : u));
      }
    }
    setDemands(prev => [dem, ...prev]);
  };

  const updateDemand = async (did: string, updates: Partial<Demand>) => {
    const currentDemand = demands.find(d => d.did === did);
    if (!currentDemand) return;

    if (supabase) {
      // 核心：构建数据库专用更新对象
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.customerInfo !== undefined) dbUpdates.customer_info = updates.customerInfo;
      if (updates.rewardType !== undefined) dbUpdates.reward_type = updates.rewardType;
      if (updates.rewardValue !== undefined) dbUpdates.reward_value = updates.rewardValue;
      if (updates.urgency !== undefined) dbUpdates.urgency = updates.urgency;
      if (updates.isRecommended !== undefined) dbUpdates.is_recommended = updates.isRecommended;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.helperId !== undefined) dbUpdates.helper_id = updates.helperId;
      if (updates.helperName !== undefined) dbUpdates.helper_name = updates.helperName;

      const { error } = await supabase.from('demands').update(dbUpdates).eq('did', did);
      if (error) {
        console.error('Supabase Update Error:', error);
        alert('同步至云端失败，请检查数据库字段。');
        return;
      }

      // 通知逻辑：接单
      if (updates.status === DemandStatus.ACCEPTED && currentDemand.status === DemandStatus.PUBLISHED) {
        addNotification({
          title: '需求已被承接',
          content: `${updates.helperName || '同事'} 已经接单了：${currentDemand.title}`,
          type: 'SUCCESS',
          targetUid: currentDemand.creatorId
        });
      }

      // 通知逻辑：完成
      if (updates.status === DemandStatus.COMPLETED && currentDemand.status !== DemandStatus.COMPLETED) {
        const hId = updates.helperId || currentDemand.helperId;
        if (hId) {
          addNotification({
            title: '需求确认完成',
            content: `【${currentDemand.title}】协作圆满结束，奖励已发放。`,
            type: 'SUCCESS',
            targetUid: hId
          });
          if ((updates.rewardType || currentDemand.rewardType) === 'POINTS') {
            const helper = users.find(u => u.uid === hId);
            if (helper) {
              const rVal = updates.rewardValue || currentDemand.rewardValue;
              const newPoints = (helper.points || 0) + rVal;
              await supabase.from('users').update({ points: newPoints }).eq('uid', hId);
              setUsers(prev => prev.map(u => u.uid === hId ? { ...u, points: newPoints } : u));
            }
          }
        }
      }
    }
    // 即使没联网，也先更新本地 UI
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
    
    let targetUid = '';
    if (type === 'DEMAND') {
      targetUid = (currentItem as Demand).creatorId;
    } else {
      const ownerUser = users.find(u => u.realName === (currentItem as Resource).owner);
      if (ownerUser) targetUid = ownerUser.uid;
    }

    if (targetUid && targetUid !== activeUser?.uid) {
      addNotification({
        title: type === 'DEMAND' ? '需求有了新动态' : '资源有了新评价',
        content: `${comment.userName} 给您留言了。`,
        type: 'INFO',
        targetUid: targetUid
      });
    }

    if (type === 'DEMAND') setDemands(prev => prev.map(d => d.did === id ? { ...d, comments: newComments } : d));
    else setResources(prev => prev.map(r => r.rid === id ? { ...r, comments: newComments } : r));
  };

  const handleUpsertUser = async (u: User) => {
    if (supabase) {
      await supabase.from('users').upsert({
        uid: u.uid,
        employee_id: u.employeeId,
        username: u.username || u.employeeId,
        real_name: u.realName,
        password: u.password || '123456',
        dept: u.dept,
        line: u.line,
        role: u.role,
        points: Number(u.points || 0),
        avatar: u.avatar
      });
    }
    setUsers(prev => {
      const exists = prev.find(item => item.uid === u.uid);
      if (exists) return prev.map(item => item.uid === u.uid ? u : item);
      return [...prev, u];
    });
  };

  const handleDeleteUser = async (uid: string) => {
    if (supabase) await supabase.from('users').delete().eq('uid', uid);
    setUsers(prev => prev.filter(u => u.uid !== uid));
  };

  const handleUpdateUsers = async (newUsers: User[]) => {
    if (supabase) {
      for (const u of newUsers) {
        await handleUpsertUser(u);
      }
    }
  };

  const handleUpdateDemands = async (newDemands: Demand[]) => {
    if (supabase) {
      for (const d of newDemands) {
        await supabase.from('demands').upsert({
          did: d.did,
          title: d.title,
          description: d.description,
          customer_info: d.customerInfo,
          reward_type: d.rewardType,
          reward_value: d.rewardValue,
          urgency: d.urgency,
          is_recommended: d.isRecommended,
          tags: d.tags,
          status: d.status,
          creator_id: d.creatorId,
          creator_name: d.creatorName,
          creator_avatar: d.creatorAvatar,
          created_at: d.createdAt,
          comments: d.comments
        });
      }
    }
    setDemands(newDemands);
  };

  const handleUpdateResources = async (newResources: Resource[]) => {
    if (supabase) {
      for (const r of newResources) {
        await supabase.from('resources').upsert({
          rid: r.rid,
          title: r.title,
          description: r.description,
          type: r.type,
          tags: r.tags,
          owner: r.owner,
          owner_avatar: r.ownerAvatar,
          status: r.status,
          created_at: r.createdAt,
          comments: r.comments
        });
      }
    }
    setResources(newResources);
  };

  const handleUpdatePassword = async (uid: string, newPass: string) => {
    if (supabase) {
      const { error } = await supabase.from('users').update({ password: newPass }).eq('uid', uid);
      if (error) {
        alert('密码修改失败');
        return;
      }
    }
    setUsers(prev => prev.map(u => u.uid === uid ? { ...u, password: newPass } : u));
    alert('密码修改成功');
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="h-12 w-12 border-4 border-nb-red border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-slate-400 animate-pulse uppercase tracking-widest text-sm text-center px-6">
        正在同步象山支行云端数据...
      </p>
    </div>
  );
  
  if (!activeUser) return <LoginView onLogin={handleLogin} users={users} onSeedData={handleUpdateUsers} />;

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
              <Route path="/admin" element={<AdminView users={users} demands={demands} resources={resources} onUpsertUser={handleUpsertUser} onDeleteUser={handleDeleteUser} onUpdateDemands={handleUpdateDemands} onUpdateResources={handleUpdateResources} />} />
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
