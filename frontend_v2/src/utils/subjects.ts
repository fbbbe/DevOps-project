// 스터디 주제 카테고리
export const STUDY_SUBJECTS = [
  { value: '어학', label: '어학' },
  { value: 'IT/프로그래밍', label: 'IT/프로그래밍' },
  { value: '자격증', label: '자격증' },
  { value: '취업/이직', label: '취업/이직' },
  { value: '공무원/고시', label: '공무원/고시' },
  { value: '대학 전공', label: '대학 전공' },
  { value: '독서/글쓰기', label: '독서/글쓰기' },
  { value: '경제/금융', label: '경제/금융' },
  { value: '마케팅/경영', label: '마케팅/경영' },
  { value: '디자인/영상', label: '디자인/영상' },
  { value: '외국어 회화', label: '외국어 회화' },
  { value: '수능/입시', label: '수능/입시' },
  { value: '프로젝트', label: '프로젝트' },
  { value: '기타', label: '기타' },
];

export const SUBJECT_VALUES = STUDY_SUBJECTS.map(s => s.value);
