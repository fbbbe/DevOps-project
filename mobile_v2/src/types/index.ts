export type Gender = '남성' | '여성';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  nickname: string;
  gender: Gender;
  email: string;
  role: UserRole;
}

export type StudyStatus = 'recruiting' | 'active' | 'completed';

export type StudyType = 'online' | 'offline';

export type StudyDuration = 'short' | 'long';

export interface Study {
  id: string;
  name: string;
  subject: string;
  description: string;
  tags: string[];
  region: string;
  regionDetail?: {
    sido: string;
    sigungu: string;
    dongEupMyeon: string;
  };
  type: StudyType;
  duration: StudyDuration;
  startDate: string;
  endDate: string;
  maxMembers: number;
  currentMembers: number;
  ownerId: string;
  ownerNickname: string;
  status: StudyStatus;
  progress?: number;
  isFavorite?: boolean;
}

export interface AttendanceSession {
  id: string;
  studyId: string;
  date: string;
  code: string;
  isActive: boolean;
}

export interface ProgressCheckpoint {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userNickname: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}
