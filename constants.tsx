
import React from 'react';
import { 
  LayoutDashboard, 
  Library, 
  MessageSquare, 
  Coins, 
  ShieldCheck, 
  BarChart3
} from 'lucide-react';
import { User, UserRole } from './types';

export const NAVIGATION_ITEMS = [
  { name: '工作看板', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'PRESIDENT', 'VP', 'EMPLOYEE'] },
  { name: '资源中心', path: '/resources', icon: <Library size={20} />, roles: ['ADMIN', 'PRESIDENT', 'VP', 'EMPLOYEE'] },
  { name: '需求广场', path: '/demands', icon: <MessageSquare size={20} />, roles: ['ADMIN', 'PRESIDENT', 'VP', 'EMPLOYEE'] },
  { name: '积分变动', path: '/points', icon: <Coins size={20} />, roles: ['ADMIN', 'PRESIDENT', 'VP', 'EMPLOYEE'] },
  { name: '管理后台', path: '/admin', icon: <ShieldCheck size={20} />, roles: ['ADMIN'] },
  { name: '数据分析', path: '/analytics', icon: <BarChart3 size={20} />, roles: ['ADMIN', 'PRESIDENT', 'VP'] },
];

export const MOCK_USERS: User[] = [
  { uid: 'u1', employeeId: 'NB001', username: 'admin01', password: '123456', realName: '王管理', dept: '信息技术部', line: '中后台', role: UserRole.ADMIN, points: 10000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin' },
  { uid: 'u2', employeeId: 'NB002', username: 'pre01', password: '123456', realName: '李行长', dept: '支行办公室', line: '运营', role: UserRole.PRESIDENT, points: 10000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pre' },
  { uid: 'u3', employeeId: 'NB003', username: 'emp01', password: '123456', realName: '张小凡', dept: '零售银行部', line: '零售', role: UserRole.EMPLOYEE, points: 10000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emp1' },
  { uid: 'u4', employeeId: 'NB004', username: 'emp02', password: '123456', realName: '赵默笙', dept: '公司业务部', line: '公司', role: UserRole.EMPLOYEE, points: 10000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emp2' },
];

export const DEMAND_TAGS = {
  '企业类': ['找产品销路', '对接供应商', '解决研发痛点', '不动产租售', '招聘需求', '其他'],
  '个人类': ['医疗资源对接', '名校升学通道', '婚恋相亲', '热门票务', '身份规划', '找实习', '其他'],
  '投行类': ['科创企业股权融资', '产业基金GP/LP对接', '企业收并购咨询', '国资/投促/投资机构找科创项目', '其他'],
  '机构客户需求': ['政府需求对接', '其他']
};

export const RESOURCE_TAGS = {
  '场地资源': ['商业场地', '产业场地', '活动场地', '其他'],
  '实物资源': ['象山特产', '闲置设备', '商品资源', '其他'],
  '人力资源': ['专家智库', '技术服务', '临时人力', '其他'],
  '服务资源': ['专业服务', '生活服务', '政务服务', '其他'],
  '信息资源': ['市场信息', '政策信息', '人脉信息', '其他'],
  '其他资源': ['其他']
};

export const TAG_COLORS: Record<string, string> = {
  '企业类': 'bg-blue-100 text-blue-700',
  '个人类': 'bg-green-100 text-green-700',
  '投行类': 'bg-purple-100 text-purple-700',
  '机构客户需求': 'bg-red-100 text-red-700',
  '场地资源': 'bg-yellow-100 text-yellow-700',
  '实物资源': 'bg-indigo-100 text-indigo-700',
  '人力资源': 'bg-orange-100 text-orange-700',
  '服务资源': 'bg-teal-100 text-teal-700',
  '信息资源': 'bg-slate-100 text-slate-700',
};

export const AppLogo = ({ className = "h-8 w-8" }: { className?: string }) => (
  <div className={`${className} bg-nb-red rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
    <span className="text-white font-black text-xl italic relative z-10">象</span>
  </div>
);
