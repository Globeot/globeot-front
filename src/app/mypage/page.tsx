"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  FileText,
  MessageSquare,
  Bookmark,
  Settings,
  LogOut,
  Heart,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  deleteMe,
  getMyArticles,
  getMyComments,
  getMyFavorites,
  getMyProfile,
  getMyScraps,
  updateMyProfile,
  type FavoriteSchool,
  type MyArticle,
  type MyComment,
  type MyScrap,
} from "../../lib/user";

type Tab = "posts" | "comments" | "scraps" | "bookmarks" | "settings";
type StageValue = "PRE_ASSIGN" | "PRE_DEPART" | "ABROAD" | "RETURNED";

const stageLabelMap: Record<StageValue, string> = {
  PRE_ASSIGN: "배정 전",
  PRE_DEPART: "파견 전",
  ABROAD: "파견 중",
  RETURNED: "파견 후",
};

const stageBadgeClassMap: Record<StageValue, string> = {
  PRE_ASSIGN: "status-badge-pre",
  PRE_DEPART: "status-badge-pre",
  ABROAD: "status-badge-abroad",
  RETURNED: "status-badge-returned",
};

const articleTypeLabelMap: Record<string, string> = {
  QUESTION: "질문",
  INFO: "정보",
  TRADE: "중고거래",
  COMPANION: "동행",
};

const articleStatusLabelMap: Record<string, string> = {
  OPEN: "판매중",
  CLOSED: "거래완료",
};

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("ko-KR");
}

export default function MyPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [isEditing, setIsEditing] = useState(false);

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<StageValue>("ABROAD");

  const [posts, setPosts] = useState<MyArticle[]>([]);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [scraps, setScraps] = useState<MyScrap[]>([]);
  const [favorites, setFavorites] = useState<FavoriteSchool[]>([]);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [tabError, setTabError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "posts", label: "내 글", icon: <FileText className="h-4 w-4" /> },
    { key: "comments", label: "내 댓글", icon: <MessageSquare className="h-4 w-4" /> },
    { key: "scraps", label: "스크랩", icon: <Bookmark className="h-4 w-4" /> },
    { key: "bookmarks", label: "관심 학교", icon: <Heart className="h-4 w-4" /> },
    { key: "settings", label: "설정", icon: <Settings className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setProfileError("");
        const data = await getMyProfile();
        console.log("내 프로필 데이터:", data);

        setNickname(data.nickname ?? "");
        setEmail(data.email ?? "");
        setStage((data.exchangeStatus ?? "ABROAD"));
      } catch (error) {
        console.error("프로필 조회 실패:", error);
        setProfileError("프로필을 불러오지 못했습니다. 로그인 상태를 확인하세요.");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchTabData = async () => {
      if (activeTab === "settings") return;

      try {
        setLoadingTab(true);
        setTabError("");

        if (activeTab === "posts") {
          const data = await getMyArticles();
          setPosts(Array.isArray(data) ? data : []);
        } else if (activeTab === "comments") {
          const data = await getMyComments();
          setComments(Array.isArray(data) ? data : []);
        } else if (activeTab === "scraps") {
          const data = await getMyScraps();
          setScraps(Array.isArray(data) ? data : []);
        } else if (activeTab === "bookmarks") {
          const data = await getMyFavorites();
          setFavorites(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("탭 데이터 조회 실패:", error);
        setTabError("데이터 불러오기에 실패했습니다.");
      } finally {
        setLoadingTab(false);
      }
    };

    fetchTabData();
  }, [activeTab]);

  const handleSaveProfile = async () => {
    if (!nickname.trim()) return;

    try {
      setSaveLoading(true);
      await updateMyProfile({
        nickname: nickname.trim(),
        stage,
      });
      setIsEditing(false);
      alert("프로필이 저장됐습니다.");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 저장에 실패했습니다.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteMe = async () => {
    const ok = window.confirm("정말 회원 탈퇴하시겠습니까?");
    if (!ok) return;

    try {
      await deleteMe();
      localStorage.removeItem("accessToken");
      alert("회원 탈퇴가 완료됐습니다.");
      router.push("/");
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴에 실패했습니다.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    alert("로그아웃 되었습니다.");
    router.push("/");
  };

  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="card-elevated p-6 mb-6">
            {loadingProfile ? (
              <div className="text-sm text-muted-foreground">프로필 불러오는 중...</div>
            ) : profileError ? (
              <div className="text-sm text-destructive">{profileError}</div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-7 w-7 text-accent-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-foreground">{nickname || "닉네임 없음"}</h2>
                    <p className="text-sm text-muted-foreground">{email || "이메일 없음"}</p>
                    <span className={`${stageBadgeClassMap[stage]} mt-1 inline-block`}>
                      {stageLabelMap[stage]}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "취소" : "프로필 수정"}
                  </Button>
                </div>

                {isEditing && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mt-6 pt-6 border-t space-y-4"
                  >
                    <div>
                      <Label className="text-sm font-medium">닉네임</Label>
                      <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium">파견 단계</Label>
                      <div className="grid grid-cols-4 gap-2 mt-1.5">
                        {(
                          [
                            { value: "PRE_ASSIGN", label: "배정 전" },
                            { value: "PRE_DEPART", label: "파견 전" },
                            { value: "ABROAD", label: "파견 중" },
                            { value: "RETURNED", label: "파견 후" },
                          ] as const
                        ).map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setStage(s.value)}
                            className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                              stage === s.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={handleSaveProfile}
                      disabled={saveLoading || !nickname.trim()}
                    >
                      {saveLoading ? "저장 중..." : "저장"}
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </div>

          <div className="flex gap-1 border-b mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {tabError && <div className="mb-4 text-sm text-destructive">{tabError}</div>}

          {loadingTab && activeTab !== "settings" ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
          ) : (
            <>
              {activeTab === "posts" && (
                <div className="space-y-2">
                  {posts.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      작성한 글이 없습니다.
                    </div>
                  ) : (
                    posts.map((post) => (
                      <div
                        key={String(post.articleId)}
                        className="card-elevated p-4 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
                        onClick={() => router.push(`/community/${post.articleId}`)}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {articleTypeLabelMap[post.type] ?? post.type}
                            </span>
                            {post.type === "TRADE" && post.articleStatus && (
                              <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                                {articleStatusLabelMap[post.articleStatus] ?? post.articleStatus}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">{post.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(post.createdAt)} · 💬 {post.commentCount}
                          </p>
                        </div>
                        {post.type === "TRADE" && post.articleStatus === "OPEN" && (
                          <Button variant="outline" size="sm">
                            거래완료
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-2">
                  {comments.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      작성한 댓글이 없습니다.
                    </div>
                  ) : (
                    comments.map((comment, idx) => (
                      <div key={String(comment.commentId ?? idx)} className="card-elevated p-4">
                        <p className="text-sm text-foreground">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          원글:{" "}
                          <span className="text-primary">
                            {comment.articleTitle ?? "제목 정보 없음"}
                            console.log("댓글 목록:", comments);
                          </span>{" "}
                          · {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "scraps" && (
                <div className="space-y-2">
                  {scraps.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      스크랩한 게시글이 없습니다.
                    </div>
                  ) : (
                    scraps.map((post) => (
                      <div
                        key={String(post.articleId)}
                        className="card-elevated p-4 cursor-pointer hover:border-primary transition-colors"
                        onClick={() => router.push(`/community/${post.articleId}`)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {post.type && (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              {articleTypeLabelMap[post.type] ?? post.type}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{post.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(post.createdAt)}{" "}
                          {typeof post.commentCount === "number" ? `· 💬 ${post.commentCount}` : ""}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "bookmarks" && (
                <div>
                  {favorites.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      관심 등록한 학교가 없습니다.
                    </div>
                  ) : (
                    <div className="card-elevated overflow-hidden">
                      <Table className="table-fixed">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[12%]">국가</TableHead>
                            <TableHead className="w-[14%]">도시</TableHead>
                            <TableHead className="w-[20%]">학교</TableHead>
                            <TableHead className="w-[14%] text-right">환산 점수</TableHead>
                            <TableHead className="w-[14%]">여행접근성</TableHead>
                            <TableHead className="w-[16%]">예상생활비</TableHead>
                            <TableHead className="w-[10%]">사이트</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {favorites.map((school, idx) => (
                            <TableRow key={String(school.schoolId ?? school.name ?? idx)}>
                              <TableCell className="text-sm text-muted-foreground">
                                {school.country ?? "-"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {school.city ?? "-"}
                              </TableCell>
                              <TableCell>
                                <button
                                  onClick={() =>
                                    router.push(`/dispatch-db/${encodeURIComponent(school.name)}`)
                                  }
                                  className="text-sm font-medium text-primary hover:underline text-left"
                                >
                                  {school.name}
                                </button>
                              </TableCell>
                              <TableCell className="text-right font-semibold text-foreground">
                                {school.convertedScore ?? "-"}
                              </TableCell>
                              <TableCell>
                                {school.travelAccess ? (
                                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted text-foreground">
                                    {school.travelAccess}
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {school.livingCost ?? "-"}
                              </TableCell>
                              <TableCell>
                                {school.website ? (
                                  <a
                                    href={school.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "settings" && (
                <div className="card-elevated divide-y">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    로그아웃
                  </button>
                  <button
                    onClick={handleDeleteMe}
                    className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    회원 탈퇴
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}