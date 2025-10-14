import React, { useState } from "react";
import { MainDashboard } from "./components/MainDashboard";
import { LoginForm } from "./components/LoginForm";
import { StudyCreate } from "./components/StudyCreate";
import { StudyDetail } from "./components/StudyDetail";
import { AttendanceCode } from "./components/AttendanceCode";
import { ProgressManager } from "./components/ProgressManager";
import { UserProfile } from "./components/UserProfile";
import { StudyChat } from "./components/StudyChat";
import { ChatList } from "./components/ChatList";
import { BottomNav } from "./components/BottomNav";
import { Toaster } from "./components/ui/sonner";

export type User = {
  id: string;
  nickname: string;
  gender: "남성" | "여성";
  email: string;
  role: "user" | "admin";
};

export type Study = {
  id: string;
  name: string;
  subject: string;
  description: string;
  tags: string[];
  region: string; // 전체 주소 (표시용)
  regionDetail?: {
    sido: string; // 시/도
    sigungu: string; // 시/군/구
    dongEupMyeon: string; // 동/읍/면
  };
  type: "online" | "offline";
  duration: "short" | "long";
  startDate: string;
  endDate: string;
  maxMembers: number;
  currentMembers: number;
  ownerId: string;
  ownerNickname: string;
  status: "recruiting" | "active" | "completed";
  progress?: number;
  isFavorite?: boolean;
};

export type AttendanceSession = {
  id: string;
  studyId: string;
  date: string;
  code: string;
  isActive: boolean;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(
    null,
  );
  const [currentView, setCurrentView] = useState<
    | "login"
    | "dashboard"
    | "create-study"
    | "study-detail"
    | "attendance"
    | "progress"
    | "profile"
    | "chat"
    | "chat-list"
  >("login");
  const [selectedStudy, setSelectedStudy] =
    useState<Study | null>(null);
  const [favoriteStudyIds, setFavoriteStudyIds] = useState<string[]>([]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("login");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleViewChange = (
    view: typeof currentView,
    study?: Study,
  ) => {
    setCurrentView(view);
    if (study) {
      setSelectedStudy(study);
    }
  };

  const handleToggleFavorite = (studyId: string) => {
    setFavoriteStudyIds(prev => 
      prev.includes(studyId)
        ? prev.filter(id => id !== studyId)
        : [...prev, studyId]
    );
  };

  const handleBottomNavNavigate = (view: 'dashboard' | 'chat-list' | 'profile' | 'create-study') => {
    setCurrentView(view);
  };

  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <LoginForm onLogin={handleLogin} />
        </div>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
      {currentView === "dashboard" && (
        <MainDashboard
          user={currentUser}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          favoriteStudyIds={favoriteStudyIds}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {currentView === "create-study" && (
        <StudyCreate
          user={currentUser}
          onBack={() => setCurrentView("dashboard")}
        />
      )}
      {currentView === "study-detail" && selectedStudy && (
        <StudyDetail
          study={selectedStudy}
          user={currentUser}
          onBack={() => setCurrentView("dashboard")}
          onViewChange={handleViewChange}
        />
      )}
      {currentView === "attendance" && selectedStudy && (
        <AttendanceCode
          study={selectedStudy}
          user={currentUser}
          onBack={() => setCurrentView("study-detail")}
        />
      )}
      {currentView === "progress" && selectedStudy && (
        <ProgressManager
          study={selectedStudy}
          user={currentUser}
          onBack={() => setCurrentView("study-detail")}
        />
      )}
      {currentView === "profile" && (
        <UserProfile
          user={currentUser}
          onBack={() => setCurrentView("dashboard")}
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          onViewStudy={handleViewChange}
        />
      )}
      {currentView === "chat-list" && (
        <ChatList
          user={currentUser}
          myStudies={[]}
          onSelectStudy={(study) => {
            setSelectedStudy(study);
            setCurrentView("chat");
          }}
        />
      )}
      {currentView === "chat" && selectedStudy && (
        <StudyChat
          study={selectedStudy}
          user={currentUser}
          onBack={() => setCurrentView("chat-list")}
        />
      )}
    </div>
    
    {/* Bottom Navigation */}
    {currentView !== 'login' && currentView !== 'attendance' && currentView !== 'progress' && currentView !== 'chat' && (
      <BottomNav
        currentView={
          currentView === 'dashboard' ? 'dashboard' :
          currentView === 'chat-list' ? 'chat-list' :
          currentView === 'profile' ? 'profile' :
          currentView === 'create-study' ? 'create-study' :
          'dashboard'
        }
        onNavigate={handleBottomNavNavigate}
      />
    )}
    
    <Toaster />
    </>
  );
}