// src/services/devTestService.ts
import api from "./api";

// /api/recipes 호출해서 rows를 가져오기
export async function getRecipes() {
  const data = await api.request<any[]>("/api/recipes", {
    method: "GET",
  });
  return data;
}
