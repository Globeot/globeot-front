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
  type: "QUESTION" | "INFO" | "TRADE" | "COMPANION";
  articleStatus?: "OPEN" | "CLOSED";
  createdAt: string;
  commentCount: number;
};

export type MyComment = {
  commentId?: number | string;
  content: string;
  createdAt: string;
  articleId?: number | string;
  articleTitle?: string;
};

export type MyScrap = {
  articleId: number | string;
  title: string;
  content?: string;
  type?: "QUESTION" | "INFO" | "TRADE" | "COMPANION";
  createdAt?: string;
  commentCount?: number;
};

export type FavoriteSchool = {
  schoolId?: number | string;
  name: string;
  country?: string;
  city?: string;
  convertedScore?: number;
  travelAccess?: string;
  livingCost?: string;
  website?: string;
};

export async function getMyProfile() {
  const res = await api.get<ProfileResponse>("/users/profile");
  return res.data;
}

export async function updateMyProfile(body: {
  nickname: string;
  stage: "PRE_ASSIGN" | "PRE_DEPART" | "ABROAD" | "RETURNED";
}) {
  const res = await api.patch("/users/profile", body);
  return res.data;
}

export async function getMyArticles() {
  const res = await api.get<MyArticle[]>("/users/articles");
  return res.data;
}

export async function getMyComments() {
  const res = await api.get<MyComment[]>("/users/comments");
  return res.data;
}

export async function getMyScraps() {
  const res = await api.get<MyScrap[]>("/users/scraps");
  return res.data;
}

export async function getMyFavorites() {
  const res = await api.get<FavoriteSchool[]>("/users/favorites");
  return res.data;
}

export async function deleteMe() {
  const res = await api.delete("/users/me");
  return res.data;
}