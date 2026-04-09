import api from "./api";

export type ArticleType = "QUESTION" | "INFO" | "TRADE" | "COMPANION";
export type ExchangeStatus = "APPLYING" | "PRE_DEPARTURE" | "ABROAD" | "RETURNED";
export type RegionType = "EUROPE" | "AMERICA" | "ASIA" | "OCEANIA" | "ETC";

export type ArticleItem = {
  id: number | string;
  title: string;
  authorNickname: string;
  exchangeStatus: ExchangeStatus | string;
  region: string;
  type: ArticleType | string;
  createdAt: string;
  commentCount: number;
  topic?: string;
  articleStatus?: string;
};

export type ArticleListResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    content: ArticleItem[];
    totalPages: number;
    totalElements: number;
  };
};

export type ArticleDetailResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: {
    id: number | string;
    title: string;
    content: string;
    authorId: number | string;
    authorNickname: string;
    exchangeStatus: ExchangeStatus | string;
    region: string;
    type: ArticleType | string;
    viewCount: number;
    commentCount: number;
    createdAt: string;
    updatedAt: string;
    topic?: string;
    schoolId?: number | string;
    schoolName?: string;
    imageUrls?: string[];
    articleStatus?: string;
    author?: boolean;
    scrapped?: boolean;
    blinded?: boolean;
    isAuthor?: boolean;
    isScrapped?: boolean;
    isBlinded?: boolean;
  };
};

export type CommentItem = {
  id: number | string;
  userId: number | string;
  authorNickname: string;
  content: string;
  parentId?: number | string | null;
  createdAt: string;
  updatedAt: string;
  isAuthor: boolean;
};

export type CommentListResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: CommentItem[];
};

export type CreateArticleRequest = {
  title: string;
  content: string;
  region: RegionType;
  type: ArticleType;
  exchangeStatus: ExchangeStatus;
  topic?: string;
  schoolId?: number | string;
  imageUrls?: string[];
};

export type UpdateArticleRequest = {
  title: string;
  content: string;
  region: RegionType;
  type: ArticleType;
  exchangeStatus: ExchangeStatus;
  topic?: string;
  schoolId?: number | string;
  imageUrls?: string[];
};

export type CreateCommentRequest = {
  content: string;
  parentId?: number | string | null;
};

export type SchoolSearchItem = {
  id: number | string;
  name: string;
};

export type SchoolSearchResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: SchoolSearchItem[];
};

export type UploadImageResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: Record<string, string>;
};

export const getArticles = async (page = 0, size = 10) => {
  const res = await api.get<ArticleListResponse>("/articles", {
    params: { page, size },
  });
  return res.data;
};

export const getArticleDetail = async (articleId: string | number) => {
  const res = await api.get<ArticleDetailResponse>(`/articles/${articleId}`);
  return res.data;
};

export const getArticleComments = async (articleId: string | number) => {
  const res = await api.get<CommentListResponse>(`/articles/${articleId}/comments`);
  return res.data;
};

export const createArticle = async (body: CreateArticleRequest) => {
  const res = await api.post("/articles", body);
  return res.data;
};

export const createArticleComment = async (
  articleId: string | number,
  body: CreateCommentRequest
) => {
  const res = await api.post(`/articles/${articleId}/comments`, body);
  return res.data;
};

export const scrapArticle = async (articleId: string | number) => {
  const res = await api.post(`/articles/${articleId}/scrap`);
  return res.data;
};

export const unscrapArticle = async (articleId: string | number) => {
  const res = await api.delete(`/articles/${articleId}/scrap`);
  return res.data;
};
export const updateArticle = async (
  articleId: string | number,
  body: UpdateArticleRequest
) => {
  const res = await api.patch(`/articles/${articleId}`, body);
  return res.data;
};
export const reportArticle = async (articleId: string | number) => {
  const res = await api.post(`/articles/${articleId}/report`);
  return res.data;
};

export const deleteArticle = async (articleId: string | number) => {
  const res = await api.delete(`/articles/${articleId}`);
  return res.data;
};

export const searchSchools = async (name: string) => {
  const res = await api.get<SchoolSearchResponse>("/schools/search", {
    params: { name },
  });
  return res.data;
};

export const uploadImage = async (file: string) => {
  const res = await api.post<UploadImageResponse>("/images/upload", {
    file,
  });
  return res.data;
};