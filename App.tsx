
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
import { X } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [resources, setResources] = useState<Resource[]>([
    { rid: 'r1', title: '2024年象山支行信贷产品全指引', description: '包含支行目前所有在售的小微、零售信贷产品详细要素。', type: '信息资源', tags: ['政策信息'], owner: '王管理', ownerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', status: 'ACTIVE', createdAt: '2024-03-10', comments: [] },
  ]);
  const [demands, setDemands] = useState<Demand[]>([
    { did: 'd1', title: '关于某大型建材企业跨境结算方案咨询', description: '需要针对当地外汇管制情况设计一套回笼资金方案。', customerInfo: '象山某规上建材企业', rewardType: 'POINTS', rewardValue: 800, urgency: DemandUrgency.URGENT, isRecommended: true, tags: ['投行类', '股权融资'], status: DemandStatus.PUBLISHED, creatorId: 'u4', creatorName: '赵默笙', creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emp2', createdAt: '2024-03-15', comments: [] },
  ]);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('nb_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      const liveUser = users.find(u => u.uid === parsed.uid);
      setCurrentUser(liveUser || parsed);
    }
    setLoading(false);
  }, [users]);

  const activeUser = useMemo(() => {
    if (!currentUser) return null;
    return users.find(u => u.uid === currentUser.uid) || currentUser;
  }, [currentUser, users]);

  const addNotification = (notif: Omit<Notification, 'id' | 'timestamp'>) => {
    setNotifications(prev => [{
      ...notif,
      id: Date.now().toString(),
      timestamp: '刚刚',
    }, ...prev]);
  };

  const handleLogin = (u: User) => {
    setCurrentUser(u);
    localStorage.setItem('nb_user', JSON.stringify(u));
    addNotification({ 
      title: '登录成功', 
      content: `欢迎回来, ${u.realName}！支行今日有新的协作需求待处理。`, 
      type: 'INFO',
      targetUid: u.uid 
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nb_user');
  };

  const addResource = (res: Resource) => {
    setResources(prev => [res, ...prev]);
    addNotification({ 
      title: '资源发布成功', 
      content: `您的资源《${res.title}》已同步至资源中心。`, 
      type: 'SUCCESS',
      targetUid: activeUser?.uid 
    });
  };

  const addDemand = (dem: Demand) => {
    setDemands(prev => [dem, ...prev]);
    if (dem.rewardType === 'POINTS') {
      setUsers(prev => prev.map(u => u.uid === dem.creatorId ? { ...u, points: u.points - dem.rewardValue } : u));
    }
    addNotification({ 
      title: '需求已发布', 
      content: `需求《${dem.title}》发布成功，已预扣除 ${dem.rewardValue} 积分。`, 
      type: 'SUCCESS',
      targetUid: activeUser?.uid 
    });
    addNotification({
      title: '新需求广播',
      content: `${activeUser?.realName} 发布了新需求：${dem.title}`,
      type: 'INFO',
      targetRole: UserRole.EMPLOYEE
    });
  };
  
  const updateDemand = (did: string, updates: Partial<Demand>) => {
    const oldDemand = demands.find(d => d.did === did);
    if (!oldDemand) return;

    setDemands(prev => prev.map(d => d.did === did ? { ...d, ...updates } : d));

    if (updates.isRecommended === true) {
      addNotification({ 
        title: '行长推荐通知', 
        content: `您的需求《${oldDemand.title}》已被设置为行长推荐。`, 
        type: 'SUCCESS',
        targetUid: oldDemand.creatorId 
      });
    }

    if (updates.status === DemandStatus.ACCEPTED && updates.helperId) {
      addNotification({ 
        title: '需求已被承接', 
        content: `您的需求《${oldDemand.title}》已被 ${updates.helperName} 承接。`, 
        type: 'INFO',
        targetUid: oldDemand.creatorId 
      });
    }

    if (updates.status === DemandStatus.COMPLETED) {
      if (oldDemand.rewardType === 'POINTS' && oldDemand.helperId) {
        setUsers(prev => prev.map(u => u.uid === oldDemand.helperId ? { ...u, points: u.points + oldDemand.rewardValue } : u));
        addNotification({ 
          title: '协作积分到账', 
          content: `您参与的《${oldDemand.title}》已确认完成，${oldDemand.rewardValue} 积分已存入您的账户。`, 
          type: 'SUCCESS',
          targetUid: oldDemand.helperId 
        });
      }
      addNotification({ 
        title: '需求对接办结', 
        content: `需求《${oldDemand.title}》已正式结案。`, 
        type: 'SUCCESS',
        targetUid: oldDemand.creatorId 
      });
    }
  };

  const addDemandComment = (did: string, comment: Comment) => {
    setDemands(prev => prev.map(d => d.did === did ? { ...d, comments: [...d.comments, comment] } : d));
    const target = demands.find(d => d.did === did);
    if (target && target.creatorId !== activeUser?.uid) {
      addNotification({ 
        title: '收到新互动', 
        content: `${comment.userName} 评论了您的需求：${target.title}`, 
        type: 'INFO',
        targetUid: target.creatorId 
      });
    }
  };

  const addResourceComment = (rid: string, comment: Comment) => {
    setResources(prev => prev.map(r => r.rid === rid ? { ...r, comments: [...r.comments, comment] } : r));
    const target = resources.find(r => r.rid === rid);
    const owner = users.find(u => u.realName === target?.owner);
    if (owner && owner.uid !== activeUser?.uid) {
      addNotification({ 
        title: '资源收到反馈', 
        content: `${comment.userName} 对您的资源发表了评论。`, 
        type: 'INFO',
        targetUid: owner.uid 
      });
    }
  };

  const handleUpdateUsers = (newUsers: User[]) => setUsers(newUsers);

  if (loading) return <div className="flex h-screen items-center justify-center">加载中...</div>;
  if (!activeUser) return <LoginView onLogin={handleLogin} />;

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50 relative">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white animate-in slide-in-from-left duration-300">
              <div className="flex justify-end p-4">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
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
              <Route path="/resources" element={<ResourceView user={activeUser} resources={resources} />} />
              <Route path="/resources/upload" element={<ResourceUploadView user={activeUser} onUpload={addResource} />} />
              <Route path="/resources/:id" element={<ResourceDetailView user={activeUser} resources={resources} onAddComment={addResourceComment} />} />
              <Route path="/demands" element={<DemandView user={activeUser} demands={demands} />} />
              <Route path="/demands/upload" element={<DemandUploadView user={activeUser} onUpload={addDemand} />} />
              <Route path="/demands/:id" element={<DemandDetailView user={activeUser} demands={demands} onUpdate={updateDemand} onAddComment={addDemandComment} />} />
              <Route path="/points" element={<PointsView user={activeUser} />} />
              {activeUser.role === UserRole.ADMIN && (
                <Route path="/admin" element={<AdminView users={users} onUpdateUsers={handleUpdateUsers} />} />
              )}
              {['ADMIN', 'PRESIDENT', 'VP'].includes(activeUser.role) && (
                <Route path="/analytics" element={<AnalyticsView user={activeUser} demands={demands} resources={resources} users={users} />} />
              )}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
