import { API_BASE_URL } from '../config';

// 현재는 목(mock) 구현입니다. 실제 백엔드 연동 시 주석의 fetch 예시를 참고하세요.

export async function login(email, password) {
  await delay(500);
  if (!email || !password) {
    throw new Error('이메일과 비밀번호를 입력하세요.');
  }

  // 실제 API 예시
  // const res = await fetch(`${API_BASE_URL}/auth/login`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password })
  // });
  // if (!res.ok) throw new Error('로그인에 실패했습니다.');
  // return await res.json();

  return {
    id: generateId(),
    email,
    nickname: '사용자',
    gender: '남성',
    token: 'mock-token'
  };
}

export async function register({ email, password, nickname, gender, university }) {
  await delay(700);
  if (!email || !password || !nickname) {
    throw new Error('필수 항목을 입력하세요.');
  }

  // 실제 API 예시
  // const res = await fetch(`${API_BASE_URL}/auth/register`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ email, password, nickname, gender, university })
  // });
  // if (!res.ok) throw new Error('회원가입에 실패했습니다.');
  // return await res.json();

  return {
    id: generateId(),
    email,
    nickname,
    gender,
    university,
    token: 'mock-token'
  };
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

