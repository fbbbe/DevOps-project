import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  AttendanceSession,
  ChatMessage,
  ProgressCheckpoint,
  Study,
  User,
} from '../types';
import {
  MOCK_ATTENDANCE,
  MOCK_CHAT_MESSAGES,
  MOCK_PROGRESS,
  MOCK_STUDIES,
} from '../data/mockData';

interface AddStudyPayload {
  name: string;
  subject: string;
  description: string;
  tags: string[];
  region: string;
  type: Study['type'];
  duration: Study['duration'];
  startDate: string;
  endDate: string;
  maxMembers: number;
}

interface AppContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  studies: Study[];
  favoriteStudyIds: string[];
  toggleFavorite: (studyId: string) => void;
  addStudy: (payload: AddStudyPayload, ownerNickname: string) => Study;
  attendanceSessions: AttendanceSession[];
  createAttendanceSession: (studyId: string) => AttendanceSession;
  closeAttendanceSession: (sessionId: string) => void;
  progressByStudy: Record<string, ProgressCheckpoint[]>;
  toggleProgressCheckpoint: (studyId: string, checkpointId: string) => void;
  chatMessages: Record<string, ChatMessage[]>;
  addChatMessage: (studyId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [studies, setStudies] = useState<Study[]>(MOCK_STUDIES);
  const [favoriteStudyIds, setFavoriteStudyIds] = useState<string[]>([]);
  const [attendanceSessions, setAttendanceSessions] =
    useState<AttendanceSession[]>(MOCK_ATTENDANCE);
  const [progressByStudy, setProgressByStudy] =
    useState<Record<string, ProgressCheckpoint[]>>(MOCK_PROGRESS);
  const [chatMessages, setChatMessages] =
    useState<Record<string, ChatMessage[]>>(MOCK_CHAT_MESSAGES);

  const login = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setFavoriteStudyIds([]);
  }, []);

  const toggleFavorite = useCallback((studyId: string) => {
    setFavoriteStudyIds(prev =>
      prev.includes(studyId)
        ? prev.filter(id => id !== studyId)
        : [...prev, studyId],
    );
  }, []);

  const addStudy = useCallback(
    (payload: AddStudyPayload, ownerNickname: string) => {
      const newStudy: Study = {
        id: `study-${Date.now()}`,
        name: payload.name,
        subject: payload.subject,
        description: payload.description,
        tags: payload.tags,
        region: payload.region,
        type: payload.type,
        duration: payload.duration,
        startDate: payload.startDate,
        endDate: payload.endDate,
        maxMembers: payload.maxMembers,
        currentMembers: 1,
        ownerId: user?.id ?? 'anonymous',
        ownerNickname,
        status: 'recruiting',
      };

      setStudies(prev => [newStudy, ...prev]);
      return newStudy;
    },
    [user],
  );

  const createAttendanceSession = useCallback((studyId: string) => {
    const newSession: AttendanceSession = {
      id: `attendance-${Date.now()}`,
      studyId,
      date: new Date().toISOString(),
      code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      isActive: true,
    };

    setAttendanceSessions(prev => [newSession, ...prev]);
    return newSession;
  }, []);

  const closeAttendanceSession = useCallback((sessionId: string) => {
    setAttendanceSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? { ...session, isActive: false }
          : session,
      ),
    );
  }, []);

  const toggleProgressCheckpoint = useCallback(
    (studyId: string, checkpointId: string) => {
      setProgressByStudy(prev => {
        const checkpoints = prev[studyId] ?? [];
        const updated = checkpoints.map(checkpoint =>
          checkpoint.id === checkpointId
            ? { ...checkpoint, completed: !checkpoint.completed }
            : checkpoint,
        );
        return { ...prev, [studyId]: updated };
      });
    },
    [],
  );

  const addChatMessage = useCallback(
    (
      studyId: string,
      message: Omit<ChatMessage, 'id' | 'timestamp'>,
    ) => {
      const payload: ChatMessage = {
        id: `message-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...message,
      };

      setChatMessages(prev => {
        const studyMessages = prev[studyId] ?? [];
        return { ...prev, [studyId]: [...studyMessages, payload] };
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      studies,
      favoriteStudyIds,
      toggleFavorite,
      addStudy,
      attendanceSessions,
      createAttendanceSession,
      closeAttendanceSession,
      progressByStudy,
      toggleProgressCheckpoint,
      chatMessages,
      addChatMessage,
    }),
    [
      user,
      login,
      logout,
      studies,
      favoriteStudyIds,
      toggleFavorite,
      addStudy,
      attendanceSessions,
      createAttendanceSession,
      closeAttendanceSession,
      progressByStudy,
      toggleProgressCheckpoint,
      chatMessages,
      addChatMessage,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
};
