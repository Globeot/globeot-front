import api from "./api";

export type ProfileResponse = {
  nickname?: string;
  email?: string;
  stage?: "PRE_ASSIGN" | "PRE_DEPART" | "ABROAD" | "RETURNED";
};

export type MyArticle = {
  articleId: number | string;
  title: string;
  content?: string;
  type: "QUESTION" | "INFO" | "SALE" | "COMPANION";
  articleStatus?: "OPEN" | "CLOSED";
  createdAt: string;
  commentCount: number;
};

export type MyComment = {
  commentId?: number | string;
  content: string;
  createdAt: string;
  articleId?: number | string;
  title?: string;
  articleTitle?: string;
};

export type MyScrap = {
  articleId: number | string;
  title: string;
  content?: string;
  type?: "QUESTION" | "INFO" | "SALE" | "COMPANION";
  createdAt?: string;
  commentCount?: number;
};

export type FavoriteSchool = {
  favoriteId?: number;
  schoolId?: number | string;
  name: string;
  country?: string;
  city?: string;
  avgScore?: number;
  travelAccessLevel?: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | null;
  monthlyCost?: string;
  officialSite?: string;
};

export async function getMyProfile() {
  const res = await api.get<any>("/users/profile");
  return res.data.result; // res.data가 아니라 res.data.result를 반환!
}

export async function updateMyProfile(body: {
  nickname: string;
  stage: "PRE_ASSIGN" | "PRE_DEPART" | "ABROAD" | "RETURNED";
}) {
  const res = await api.patch("/users/profile", body);
  return res.data;
}

export async function updateMyPassword(body: {
  newPassword: string;
  confirmPassword: string;
}) {
  const res = await api.patch("/users/password", body);
  return res.data;
}

export async function getMyArticles() {
  const res = await api.get<any>("/users/articles");
  return res.data.result;
}


export async function getMyComments() {
  const res = await api.get<any>("/users/comments");
  return res.data.result;
}

export async function getMyScraps() {
  const res = await api.get<any>("/users/scraps");
  return res.data.result;
}

export async function getMyFavorites() {
  const res = await api.get<any>("/users/favorites");
  return res.data.result;}

export async function deleteMe() {
  const res = await api.delete("/users/me");
  return res.data.result;
}