import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { ArrowLeft, Send, BookOpen } from 'lucide-react';
import { Study, User } from '../App';

interface StudyChatProps {
  study: Study;
  user: User;
  onBack: () => void;
}

interface Message {
  id: string;
  userId: string;
  userNickname: string;
  text: string;
  timestamp: Date;
}

// Mock messages
const initialMessages: Message[] = [
  {
    id: '1',
    userId: '2',
    userNickname: '영어왕',
    text: '안녕하세요! 첫 모임 때 준비물이 따로 있을까요?',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    userId: '3',
    userNickname: '스터디킹',
    text: '노트북이랑 필기도구 정도면 충분할 것 같아요!',
    timestamp: new Date(Date.now() - 3000000),
  },
  {
    id: '3',
    userId: '2',
    userNickname: '영어왕',
    text: '감사합니다~ 그럼 내일 뵙겠습니다!',
    timestamp: new Date(Date.now() - 1800000),
  },
];

export function StudyChat({ study, user, onBack }: StudyChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      userId: user.id,
      userNickname: user.nickname,
      text: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHours = hours % 12 || 12;
    return `${ampm} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (today.toDateString() === messageDate.toDateString()) {
      return '오늘';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (yesterday.toDateString() === messageDate.toDateString()) {
      return '어제';
    }
    
    return `${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일`;
  };

  const groupMessagesByDate = () => {
    const grouped: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const dateKey = formatDate(message.timestamp);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    
    return grouped;
  };

  const groupedMessages = groupMessagesByDate();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center flex-1">
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-medium line-clamp-1">{study.name}</h1>
              <p className="text-xs text-muted-foreground">{study.currentMembers}명</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                  {date}
                </div>
              </div>

              {/* Messages for this date */}
              {msgs.map((message) => {
                const isOwnMessage = message.userId === user.id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 mb-4 ${
                      isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {!isOwnMessage && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {message.userNickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      {!isOwnMessage && (
                        <span className="text-xs text-muted-foreground mb-1">
                          {message.userNickname}
                        </span>
                      )}
                      
                      <div className="flex items-end space-x-1">
                        {isOwnMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        )}
                        
                        <Card
                          className={`${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <CardContent className="p-3">
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.text}
                            </p>
                          </CardContent>
                        </Card>
                        
                        {!isOwnMessage && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={newMessage.trim() === ''}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
