import React, { useState } from 'react';
import { MainDashboard } from './components/MainDashboard';
import { LoginForm } from './components/LoginForm';
import { StudyCreate } from './components/StudyCreate';
import { StudyDetail } from './components/StudyDetail';
import { AttendanceCode } from './components/AttendanceCode';
import { ProgressManager } from './components/ProgressManager';
import { UserProfile } from './components/UserProfile';

export type User = {
  id: string;
  nickname: string;
  gender: '남성' | '여성';
  email: string;
  role: 'user' | 'admin';
};

export type Study = {
  id: string;
  name: string;
  subject: string;
  description: string;
  tags: string[];
  region: string;
  type: 'online' | 'offline';
  duration: 'short' | 'long';
  startDate: string;
  endDate: string;
  maxMembers: number;
  currentMembers: number;
  ownerId: string;
  ownerNickname: string;
  ownerGender: '남성' | '여성';
  status: 'recruiting' | 'active' | 'completed';
  progress?: number;
};

export type AttendanceSession = {
  id: string;
  studyId: string;
  date: string;
  code: string;
  isActive: boolean;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'dashboard' | 'create-study' | 'study-detail' | 'attendance' | 'progress' | 'profile'>('login');
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleViewChange = (view: typeof currentView, study?: Study) => {
    setCurrentView(view);
    if (study) {
      setSelectedStudy(study);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <LoginForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'dashboard' && (
        <MainDashboard 
          user={currentUser} 
          onViewChange={handleViewChange}
          onLogout={handleLogout}
        />
      )}
      {currentView === 'create-study' && (
        <StudyCreate 
          user={currentUser} 
          onBack={() => setCurrentView('dashboard')}
        />
      )}
      {currentView === 'study-detail' && selectedStudy && (
        <StudyDetail 
          study={selectedStudy}
          user={currentUser}
          onBack={() => setCurrentView('dashboard')}
          onViewChange={handleViewChange}
        />
      )}
      {currentView === 'attendance' && selectedStudy && (
        <AttendanceCode 
          study={selectedStudy}
          user={currentUser}
          onBack={() => setCurrentView('study-detail')}
        />
      )}
      {currentView === 'progress' && selectedStudy && (
        <ProgressManager 
          study={selectedStudy}
          user={currentUser}
          onBack={() => setCurrentView('study-detail')}
        />
      )}
      {currentView === 'profile' && (
        <UserProfile 
          user={currentUser}
          onBack={() => setCurrentView('dashboard')}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}