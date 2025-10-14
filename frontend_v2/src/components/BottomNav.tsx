import React from 'react';
import { Home, MessageSquare, User, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface BottomNavProps {
  currentView: 'dashboard' | 'chat-list' | 'profile' | 'create-study';
  onNavigate: (view: 'dashboard' | 'chat-list' | 'profile' | 'create-study') => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
      <div className="grid grid-cols-4 h-16">
        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center space-y-1 rounded-none h-full ${
            currentView === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => onNavigate('dashboard')}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">메인</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center space-y-1 rounded-none h-full ${
            currentView === 'chat-list' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => onNavigate('chat-list')}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs">채팅</span>
        </Button>

        <Button
          variant="ghost"
          className="flex flex-col items-center justify-center space-y-1 rounded-none h-full text-muted-foreground"
          onClick={() => onNavigate('create-study')}
        >
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center -mt-2">
            <Plus className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xs">만들기</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center justify-center space-y-1 rounded-none h-full ${
            currentView === 'profile' ? 'text-primary' : 'text-muted-foreground'
          }`}
          onClick={() => onNavigate('profile')}
        >
          <User className="w-5 h-5" />
          <span className="text-xs">마이</span>
        </Button>
      </div>
    </div>
  );
}
