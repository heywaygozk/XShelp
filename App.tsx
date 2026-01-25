
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
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('nb_users_db');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('nb_resources_db');
    return saved ? JSON.parse(saved) : [];
  });
  const [demands, setDemands] = useState<Demand[]>(() => {
    const saved = localStorage.getItem('nb_demands_db');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('nb_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setCurrentUser(parsed);
    }
    setLoading(false);
  }, []);

  useEffect(() => { localStorage.setItem('nb_users_db', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('nb_demands_db', JSON.stringify(demands)); }, [demands]);
  useEffect(() => { localStorage.setItem('nb_resources_db', JSON.stringify(resources)); }, [resources]);

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

  // --- 数据操作函数 ---
  const addResource = (res: Resource) => setResources(prev => [res, ...prev]);
  const updateResource = (rid: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.rid === rid ? { ...r, ...updates } : r));
  };
  const deleteResource = (rid: string) => {
    setResources(prev => prev.filter(r => r.rid !== rid));
  };

  const addDemand = (dem: Demand) => {
    setDemands(prev => [dem, ...prev]);
    if (dem.rewardType === 'POINTS') {
      setUsers(prev => prev.map(u => u.uid === dem.creatorId ? { ...u, points: Math.max(0, u.points - dem.rewardValue) } : u));
    }
  };
  const updateDemand = (did: string, updates: Partial<Demand>) => {
    setDemands(prev => prev.map(d => d.did === did ? { ...d, ...updates } : d));
  };
  const deleteDemand = (did: string) => {
    setDemands(prev => prev.filter(d => d.did !== did));
  };

  const addComment = (type: 'DEMAND' | 'RESOURCE', id: string, comment: Comment) => {
    if (type === 'DEMAND') setDemands(prev => prev.map(d => d.did === id ? { ...d, comments: [...d.comments, comment] } : d));
    else setResources(prev => prev.map(r => r.rid === id ? { ...r, comments: [...r.comments, comment] } : r));
  };

  if (loading) return <div className="h-screen flex items-center justify-center">同步中...</div>;
  if (!activeUser) return <LoginView onLogin={handleLogin} />;

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
              <Route path="/points" element={<PointsView user={activeUser} />} />
              <Route path="/admin" element={<AdminView users={users} demands={demands} resources={resources} onUpdateUsers={setUsers} onUpdateDemands={setDemands} onUpdateResources={setResources} />} />
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
