export type RootStackParamList = {
  Tabs: undefined;
  StudyDetail: { studyId: string };
  Attendance: { studyId: string };
  Progress: { studyId: string };
  Chat: { studyId: string };
};

export type AppTabsParamList = {
  Dashboard: undefined;
  CreateStudy: undefined;
  ChatList: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
};
