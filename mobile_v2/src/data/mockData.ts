import {
  AttendanceSession,
  ChatMessage,
  ProgressCheckpoint,
  Study,
} from '../types';

export const STUDY_SUBJECTS = [
  { value: 'language', label: 'Language' },
  { value: 'it', label: 'IT & Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'certification', label: 'Certification' },
  { value: 'career', label: 'Career' },
];

export const MOCK_STUDIES: Study[] = [
  {
    id: 'study-1',
    name: 'TOEIC 900 Project',
    subject: 'language',
    description:
      'Join a focused twelve-week sprint to reach a 900 TOEIC score with weekly mock tests.',
    tags: ['TOEIC', 'weekly-test', 'accountability'],
    region: 'Seoul',
    regionDetail: {
      sido: 'Seoul',
      sigungu: 'Gangnam-gu',
      dongEupMyeon: 'Yeoksam-dong',
    },
    type: 'offline',
    duration: 'short',
    startDate: '2024-03-01',
    endDate: '2024-05-24',
    maxMembers: 10,
    currentMembers: 7,
    ownerId: 'user-mentor-1',
    ownerNickname: 'Sunny Mentor',
    status: 'recruiting',
    progress: 35,
  },
  {
    id: 'study-2',
    name: 'React Native Launch Pad',
    subject: 'it',
    description:
      'Hands-on mobile app study group that ships a side project using Expo and Supabase.',
    tags: ['react-native', 'expo', 'typescript'],
    region: 'Remote',
    type: 'online',
    duration: 'long',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    maxMembers: 15,
    currentMembers: 12,
    ownerId: 'user-mentor-2',
    ownerNickname: 'Code Captain',
    status: 'active',
    progress: 62,
  },
  {
    id: 'study-3',
    name: 'UX Writing Mastermind',
    subject: 'design',
    description:
      'Story-driven UX writing workshop with weekly peer reviews and live critique sessions.',
    tags: ['ux', 'writing', 'portfolio'],
    region: 'Busan',
    regionDetail: {
      sido: 'Busan',
      sigungu: 'Suyeong-gu',
      dongEupMyeon: 'Gwangan-dong',
    },
    type: 'offline',
    duration: 'long',
    startDate: '2024-02-20',
    endDate: '2024-08-20',
    maxMembers: 8,
    currentMembers: 8,
    ownerId: 'user-mentor-3',
    ownerNickname: 'UX Rebel',
    status: 'completed',
    progress: 100,
  },
];

export const MOCK_ATTENDANCE: AttendanceSession[] = [
  {
    id: 'attendance-1',
    studyId: 'study-1',
    date: '2024-04-10',
    code: 'ENG410',
    isActive: true,
  },
  {
    id: 'attendance-2',
    studyId: 'study-2',
    date: '2024-04-08',
    code: 'RNDEV',
    isActive: false,
  },
];

export const MOCK_PROGRESS: Record<string, ProgressCheckpoint[]> = {
  'study-1': [
    {
      id: 'progress-1',
      title: 'Diagnostic Test',
      description: 'Complete the initial full-length mock test.',
      completed: true,
      dueDate: '2024-03-02',
    },
    {
      id: 'progress-2',
      title: 'Grammar Sprint',
      description: 'Review 5 grammar chapters and share notes.',
      completed: false,
      dueDate: '2024-04-14',
    },
  ],
  'study-2': [
    {
      id: 'progress-3',
      title: 'Design Wireframes',
      description: 'Upload wireframes for the main mobile flows.',
      completed: true,
      dueDate: '2024-03-20',
    },
    {
      id: 'progress-4',
      title: 'Integrate Supabase',
      description: 'Connect the Expo project to Supabase Auth and DB.',
      completed: false,
      dueDate: '2024-05-10',
    },
  ],
};

export const MOCK_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  'study-1': [
    {
      id: 'msg-1',
      userId: 'user-mentor-1',
      userNickname: 'Sunny Mentor',
      text: 'Reminder: upload your mock test score sheets before tonight!',
      timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      userId: 'user-peer-1',
      userNickname: 'Kelly',
      text: 'Score improved by 50 points this week. Sharing a vocab cheat sheet shortly.',
      timestamp: new Date(Date.now() - 1800 * 1000).toISOString(),
    },
  ],
  'study-2': [
    {
      id: 'msg-3',
      userId: 'user-mentor-2',
      userNickname: 'Code Captain',
      text: 'Great demo earlier. Next up: we will wire authentication flows.',
      timestamp: new Date(Date.now() - 5400 * 1000).toISOString(),
    },
  ],
};
