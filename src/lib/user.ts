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


export async function getMyArticles() {
  const res = await api.get<any>("/users/articles");
  return res.data.result; // 게시글 목록도 result 안에 들어있을 확률이 높습니다.
}


export async function getMyComments() {
  const res = await api.get<any>("/users/comments");
  return res.data.result; // 댓글 목록도 result 안에 들어있을 확률이 높습니다.
}

export async function getMyScraps() {
  const res = await api.get<any>("/users/scraps");
  return res.data.result; // 스크랩 목록도 result 안에 들어있을 확률이 높습니다.
}

export async function getMyFavorites() {
  const res = await api.get<any>("/users/favorites");
  return res.data.result; // 관심 학교 목록도 result 안에 들어있을 확률이 높습니다.
}

export async function deleteMe() {
  const res = await api.delete("/users/me");
  return res.data.result;
}