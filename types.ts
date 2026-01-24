
export enum UserRole {
  ADMIN = 'ADMIN',
  PRESIDENT = 'PRESIDENT',
  VP = 'VP',
  EMPLOYEE = 'EMPLOYEE'
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING';
  targetUid?: string; // Specific user
  targetRole?: UserRole; // Or a whole role group
}

export interface User {
  uid: string;
  employeeId: string;
  username: string;
  realName: string;
  dept: string;
  line: '公司' | '零售' | '个人' | '运营' | '中后台';
  role: UserRole;
  points: number;
  avatar: string;
}

export enum DemandStatus {
  DRAFT = '草稿',
  PENDING = '待审核',
  PUBLISHED = '已发布',
  ACCEPTED = '已承接',
  IN_PROGRESS = '进行中',
  COMPLETED = '已完成',
  CLOSED = '已关闭'
}

export enum DemandUrgency {
  NORMAL = '正常',
  URGENT = '紧急',
  EXTREME = '十万火急'
}

export interface Resource {
  rid: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  owner: string;
  ownerAvatar?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  comments: Comment[];
}

export interface Demand {
  did: string;
  title: string;
  description: string;
  customerInfo: string;
  rewardType: 'POINTS' | 'AMOUNT';
  rewardValue: number;
  urgency: DemandUrgency;
  isRecommended: boolean;
  tags: string[];
  status: DemandStatus;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  helperId?: string;
  helperName?: string;
  createdAt: string;
  comments: Comment[];
}

export interface PointsLog {
  id: string;
  userId: string;
  changeAmount: number;
  balanceAfter: number;
  operator: string;
  reason: string;
  timestamp: string;
}
