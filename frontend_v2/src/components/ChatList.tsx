import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { BookOpen, MessageSquare } from 'lucide-react';
import { Study, User } from '../App';

interface ChatListProps {
  user: User;
  myStudies: Study[];
  onSelectStudy: (study: Study) => void;
}

export function ChatList({ user, myStudies, onSelectStudy }: ChatListProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center p-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">채팅</h1>
          </div>
        </div>
      </header>

      <div className="p-4">
        {myStudies.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>참여 중인 스터디가 없습니다.</p>
            <p className="text-sm mt-2">스터디에 참여하면 채팅을 시작할 수 있습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myStudies.map((study) => (
              <Card 
                key={study.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectStudy(study)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarFallback>
                        {study.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium line-clamp-1">{study.name}</h3>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {study.currentMembers}명
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {study.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
