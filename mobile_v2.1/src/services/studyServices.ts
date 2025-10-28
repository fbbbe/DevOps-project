// 학습 관련 API 호출을 처리하는 서비스 모듈

// 예시
import api from "./api";

export const studyService = {
  getStudies: async () => {
    const res = await api.get("/studies/");
    return res.data.items;
  },
  getStudyById: async (id: number) => {
    const res = await api.get(`/studies/${id}`);
    return res.data;
  },
  createStudy: async (data: any) => {
    const res = await api.post("/studies/", data);
    return res.data;
  },
  deleteStudy: async (id: number) => {
    await api.delete(`/studies/${id}`);
  },
};

// 예시 — src/screens/DashboardScreen.tsx에서 사용

// import React, { useEffect, useState } from "react";
// import { studyService } from "../services/studyService";

// export default function DashboardScreen() {
//   const [studies, setStudies] = useState([]);

//   useEffect(() => {
//     studyService.getStudies()
//       .then(setStudies)
//       .catch((err) => console.error("Failed to load studies:", err));
//   }, []);

//   return (
//     <>
//       {studies.map((s) => (
//         <div key={s.study_id}>{s.study_name}</div>
//       ))}
//     </>
//   );
// }
