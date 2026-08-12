"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  TrendingUp,
  BarChart3,
  DollarSign,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Plane,
  Users,
  Heart,
} from "lucide-react";

import { Button } from "../../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import api from "../../../lib/api";
import { trackEvent } from "../../../lib/gtag";

interface DispatchEntry {
  semester: string;
  score: number;
}

interface CommunityPost {
  articleId: number;
  schoolId?: number;
  title: string;
  nickname: string;
  createdAt: string;
  commentCount: number;
  exchangeStatus: string;
}

interface SchoolInfo {
  schoolId: number;
  imgUrl: string;
  name: string;
  city: string;
  country: string;
  popularMajors: string[];
  travelAccess: string;
  travelAccessLevel: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | null;
  monthlyCost: string;
  monthlyCostLevel: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | null;
  internationalStudentRatio: number;
  buddyProgram: string;
  officialSite: string;
  isFavorite: boolean;
}

interface HistorySectionProps {
  title: string;
  entries: DispatchEntry[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

interface CommunitySectionProps {
  posts: CommunityPost[];
  currentPage: number;
  onPageChange: (page: number) => void;
}

const stageLabelMap: Record<string, string> = {
  APPLYING: "배정 전",
  PRE_DEPARTURE: "파견 전",
  ABROAD: "파견 중",
  RETURNED: "파견 후",
};

const stageBadgeMap: Record<string, string> = {
  APPLYING: "status-badge-pre",
  PRE_DEPARTURE: "status-badge-pre",
  ABROAD: "status-badge-abroad",
  RETURNED: "status-badge-returned",
};

const POSTS_PER_PAGE = 5;
const ENTRIES_PER_PAGE = 5;

const API_PAGE_SIZE = 100;

const ISEP_SCHOOL_ID = "26";

const levelToLabel = (level?: string | null) => {
  if (level === "HIGHEST") return "최상";
  if (level === "HIGH") return "상";
  if (level === "MEDIUM") return "중";
  if (level === "LOW") return "하";

  return "-";
};

function extractContent<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const responseData = data as {
    result?: unknown;
    content?: unknown;
  };

  const result = responseData.result ?? responseData;

  if (Array.isArray(result)) {
    return result as T[];
  }

  if (!result || typeof result !== "object") {
    return [];
  }

  const content = (result as { content?: unknown }).content;

  return Array.isArray(content) ? (content as T[]) : [];
}

function extractSchool(data: unknown): SchoolInfo | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const responseData = data as {
    result?: unknown;
  };

  const result = responseData.result ?? responseData;

  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }

  return result as SchoolInfo;
}

function HistorySection({
  title,
  entries,
  currentPage,
  onPageChange,
}: HistorySectionProps) {
  const totalPages = Math.max(1, Math.ceil(entries.length / ENTRIES_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedEntries = entries.slice(
    (safeCurrentPage - 1) * ENTRIES_PER_PAGE,
    safeCurrentPage * ENTRIES_PER_PAGE,
  );

  return (
    <>
      <h2 className="mb-3 font-bold">{title}</h2>

      <div className="card-elevated mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>학기</TableHead>
              <TableHead className="text-right">환산 점수</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pagedEntries.length > 0 ? (
              pagedEntries.map((entry, index) => (
                <TableRow key={`${entry.semester}-${index}`}>
                  <TableCell>{entry.semester}</TableCell>

                  <TableCell className="text-right font-semibold">
                    {entry.score}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="py-6 text-center text-muted-foreground"
                >
                  과거 배정 데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {entries.length > 0 && totalPages > 1 && (
        <div className="mb-8 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={safeCurrentPage <= 1}
            onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <span className="flex min-w-[52px] items-center justify-center text-base font-medium text-muted-foreground">
            {safeCurrentPage} / {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            disabled={safeCurrentPage >= totalPages}
            onClick={() =>
              onPageChange(Math.min(safeCurrentPage + 1, totalPages))
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}

function CommunitySection({
  posts,
  currentPage,
  onPageChange,
}: CommunitySectionProps) {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedPosts = posts.slice(
    (safeCurrentPage - 1) * POSTS_PER_PAGE,
    safeCurrentPage * POSTS_PER_PAGE,
  );

  return (
    <>
      <h2 className="mb-3 font-bold">💬 관련 커뮤니티 글</h2>

      <div className="mb-4 space-y-2">
        {pagedPosts.length > 0 ? (
          pagedPosts.map((post) => {
            const stageLabel =
              stageLabelMap[post.exchangeStatus] ?? post.exchangeStatus;

            const stageBadge =
              stageBadgeMap[post.exchangeStatus] ?? "status-badge-pre";

            return (
              <Link
                key={post.articleId}
                href={`/community/${post.articleId}`}
                className="card-elevated flex justify-between p-4"
              >
                <div>
                  <span className={stageBadge}>{stageLabel}</span>

                  <h3 className="mt-1 text-sm font-semibold">{post.title}</h3>
                </div>

                <div className="text-right text-xs text-muted-foreground">
                  <p>{post.nickname}</p>

                  <p>{new Date(post.createdAt).toLocaleDateString("ko-KR")}</p>

                  <p>💬 {post.commentCount}</p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            <p className="mb-2">아직 관련 글이 없습니다.</p>

            <Link
              href="/community/write"
              className="text-sm text-primary underline"
            >
              첫 글 작성하기
            </Link>
          </div>
        )}
      </div>

      {posts.length > 0 && totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={safeCurrentPage <= 1}
            onClick={() => onPageChange(Math.max(safeCurrentPage - 1, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <span className="flex min-w-[52px] items-center justify-center text-base font-medium text-muted-foreground">
            {safeCurrentPage} / {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            disabled={safeCurrentPage >= totalPages}
            onClick={() =>
              onPageChange(Math.min(safeCurrentPage + 1, totalPages))
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
}

function SchoolDetailPageContent() {
  const params = useParams<{ schoolId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const schoolId = params.schoolId;
  const fromPage = searchParams.get("fromPage");

  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [entries, setEntries] = useState<DispatchEntry[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [entryPage, setEntryPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const isIsepPage = schoolId === ISEP_SCHOOL_ID;

  const handleGoBack = () => {
    router.push(fromPage ? `/dispatch-db?page=${fromPage}` : "/dispatch-db");
  };

  useEffect(() => {
    if (!schoolId) {
      return;
    }

    let isCancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setEntryPage(1);
      setPostPage(1);
      setImageError(false);

      const historyRequest = api.get(`/schools/${schoolId}/history`, {
        params: {
          page: 0,
          size: API_PAGE_SIZE,
        },
      });

      const articleRequest = api.get(`/schools/${schoolId}/articles`, {
        params: {
          page: 0,
          size: API_PAGE_SIZE,
        },
      });

      try {
        if (isIsepPage) {
          const [historyResult, articleResult] = await Promise.allSettled([
            historyRequest,
            articleRequest,
          ]);

          if (isCancelled) {
            return;
          }

          setSchool(null);
          setIsBookmarked(false);

          if (historyResult.status === "fulfilled") {
            setEntries(extractContent<DispatchEntry>(historyResult.value.data));
          } else {
            console.error(
              "ISEP 과거 배정 이력 로딩 실패:",
              historyResult.reason,
            );
            setEntries([]);
          }

          if (articleResult.status === "fulfilled") {
            setPosts(extractContent<CommunityPost>(articleResult.value.data));
          } else {
            console.error(
              "ISEP 관련 커뮤니티 글 로딩 실패:",
              articleResult.reason,
            );
            setPosts([]);
          }

          return;
        }

        const [detailResult, historyResult, articleResult] =
          await Promise.allSettled([
            api.get(`/schools/${schoolId}`),
            historyRequest,
            articleRequest,
          ]);

        if (isCancelled) {
          return;
        }

        if (detailResult.status === "rejected") {
          throw detailResult.reason;
        }

        const schoolData = extractSchool(detailResult.value.data);

        if (!schoolData) {
          throw new Error("학교 상세 응답 형식이 올바르지 않습니다.");
        }

        setSchool(schoolData);
        setIsBookmarked(schoolData.isFavorite ?? false);

        if (historyResult.status === "fulfilled") {
          setEntries(extractContent<DispatchEntry>(historyResult.value.data));
        } else {
          console.error("과거 배정 이력 로딩 실패:", historyResult.reason);
          setEntries([]);
        }

        if (articleResult.status === "fulfilled") {
          setPosts(extractContent<CommunityPost>(articleResult.value.data));
        } else {
          console.error("관련 커뮤니티 글 로딩 실패:", articleResult.reason);
          setPosts([]);
        }
      } catch (error) {
        console.error("학교 상세 정보 로딩 실패:", error);

        if (!isCancelled) {
          setSchool(null);
          setEntries([]);
          setPosts([]);
          setIsBookmarked(false);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [schoolId, isIsepPage]);

  const toggleFavorite = async () => {
    if (!school) {
      return;
    }

    try {
      if (isBookmarked) {
        await api.delete(`/schools/${schoolId}/favorite`);

        trackEvent("remove_from_wishlist", {
          item_id: schoolId,
          item_name: school.name,
        });

        setIsBookmarked(false);
      } else {
        await api.post(`/schools/${schoolId}/favorite`);

        trackEvent("add_to_wishlist", {
          item_id: schoolId,
          item_name: school.name,
        });

        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("즐겨찾기 변경 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-muted-foreground">로딩 중...</div>
    );
  }

  if (!isIsepPage && !school) {
    return (
      <div className="py-10 text-center">
        <p className="mb-4 text-muted-foreground">
          학교 정보를 찾을 수 없습니다.
        </p>

        <Button variant="outline" onClick={handleGoBack}>
          파견 DB로 돌아가기
        </Button>
      </div>
    );
  }

  const safeEntries = Array.isArray(entries) ? entries : [];
  const safePosts = Array.isArray(posts) ? posts : [];

  const validScores = safeEntries
    .map((entry) => Number(entry.score))
    .filter((score) => Number.isFinite(score));

  const hasScore = validScores.length > 0;

  const avgScore = hasScore
    ? (
        validScores.reduce((sum, score) => sum + score, 0) / validScores.length
      ).toFixed(1)
    : null;

  const maxScore = hasScore ? Math.max(...validScores) : null;
  const minScore = hasScore ? Math.min(...validScores) : null;

  if (isIsepPage) {
    return (
      <div className="py-10">
        <div className="container-tight">
          <button
            type="button"
            onClick={handleGoBack}
            className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            학교별 DB로
          </button>

          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-primary" />

              <h1 className="text-4xl font-bold">ISEP</h1>
            </div>

            <a
              href="https://www.isepstudyabroad.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              ISEP 공식 사이트
              <ExternalLink className="h-4 w-4" />
            </a>

            <p className="mt-8 text-muted-foreground">
              ISEP은 학교 지정 없이 카테고리로 선발되며, 배정 후 학교가
              결정됩니다.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="card-elevated p-6 text-center">
              <TrendingUp className="mx-auto mb-2 h-5 w-5 text-primary" />

              <p className="text-sm text-muted-foreground">평균 환산 점수</p>

              <p className="text-2xl font-bold">{avgScore ?? "-"}</p>
            </div>

            <div className="card-elevated p-6 text-center">
              <BarChart3 className="mx-auto mb-2 h-5 w-5 text-primary" />

              <p className="text-sm text-muted-foreground">최고 환산 점수</p>

              <p className="text-2xl font-bold">{maxScore ?? "-"}</p>
            </div>

            <div className="card-elevated p-6 text-center">
              <BarChart3 className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />

              <p className="text-sm text-muted-foreground">최저 환산 점수</p>

              <p className="text-2xl font-bold">{minScore ?? "-"}</p>
            </div>
          </div>

          <HistorySection
            title="📊 과거 합격 점수 이력"
            entries={safeEntries}
            currentPage={entryPage}
            onPageChange={setEntryPage}
          />

          <CommunitySection
            posts={safePosts}
            currentPage={postPage}
            onPageChange={setPostPage}
          />
        </div>
      </div>
    );
  }

  const currentSchool = school as SchoolInfo;

  const livingCostLabel =
    currentSchool.monthlyCostLevel === "HIGHEST"
      ? "최상"
      : currentSchool.monthlyCostLevel === "HIGH"
        ? "상"
        : currentSchool.monthlyCostLevel === "MEDIUM"
          ? "중"
          : currentSchool.monthlyCostLevel === "LOW"
            ? "하"
            : "-";

  const travelAccessLabel = levelToLabel(currentSchool.travelAccessLevel);

  const livingCostColor =
    livingCostLabel === "최상"
      ? "bg-red-100 text-red-700"
      : livingCostLabel === "상"
        ? "bg-orange-100 text-orange-700"
        : livingCostLabel === "중"
          ? "bg-yellow-100 text-yellow-700"
          : livingCostLabel === "하"
            ? "bg-green-100 text-green-700"
            : "bg-muted text-muted-foreground";

  return (
    <div className="py-10">
      <div className="container-tight">
        <button
          type="button"
          onClick={handleGoBack}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          파견 DB로
        </button>

        {currentSchool.imgUrl && !imageError && (
          <div className="mb-8">
            <div className="flex justify-center">
              <img
                src={currentSchool.imgUrl}
                alt={currentSchool.name}
                onError={() => setImageError(true)}
                className="max-h-[420px] w-auto max-w-full rounded-3xl object-contain shadow-md"
              />
            </div>

            <p className="mx-auto mt-2 max-w-5xl text-right text-[10px] text-muted-foreground">
              *Images from Wikimedia Commons
            </p>
          </div>
        )}

        <div className="mb-6 flex justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />

              <h1 className="text-3xl font-bold">{currentSchool.name}</h1>
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {currentSchool.city}, {currentSchool.country}
            </div>
          </div>

          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="icon"
            onClick={toggleFavorite}
          >
            <Heart
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </Button>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="card-elevated p-4">
            <GraduationCap className="mb-1 h-4 w-4 text-primary" />

            <p className="text-xs text-muted-foreground">유명한 전공</p>

            <div className="mt-1 flex flex-wrap gap-1">
              {Array.isArray(currentSchool.popularMajors) &&
                currentSchool.popularMajors.map((major) => (
                  <span
                    key={major}
                    className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
                  >
                    {major}
                  </span>
                ))}
            </div>
          </div>

          <div className="card-elevated p-4">
            <Plane className="mb-1 h-4 w-4 text-primary" />

            <div className="mb-0.5 flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground">여행접근성</p>

              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
                  travelAccessLabel === "최상"
                    ? "bg-blue-100 text-blue-700"
                    : travelAccessLabel === "상"
                      ? "bg-green-100 text-green-700"
                      : travelAccessLabel === "중"
                        ? "bg-yellow-100 text-yellow-700"
                        : travelAccessLabel === "하"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-muted text-muted-foreground"
                }`}
              >
                {travelAccessLabel}
              </span>
            </div>

            <p className="mt-0.5 text-xs text-muted-foreground">
              {currentSchool.travelAccess}
            </p>
          </div>

          <div className="card-elevated p-4">
            <DollarSign className="mb-1 h-4 w-4 text-primary" />

            <div className="mb-0.5 flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground">예상 월 생활비</p>

              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${livingCostColor}`}
              >
                {livingCostLabel}
              </span>
            </div>

            <p className="text-sm font-semibold">{currentSchool.monthlyCost}</p>
          </div>

          <div className="card-elevated p-4">
            <Users className="mb-1 h-4 w-4 text-primary" />

            <p className="text-xs text-muted-foreground">국제학생 비율</p>

            <p className="text-sm font-semibold">
              {currentSchool.internationalStudentRatio}%
            </p>
          </div>

          <div className="card-elevated p-4">
            <Heart className="mb-1 h-4 w-4 text-primary" />

            <p className="text-xs text-muted-foreground">버디 프로그램</p>

            <p className="text-sm font-semibold">
              {currentSchool.buddyProgram}
            </p>
          </div>

          <div className="card-elevated p-4">
            <ExternalLink className="mb-1 h-4 w-4 text-primary" />

            <p className="text-xs text-muted-foreground">
              공식 교환학생 사이트
            </p>

            <a
              href={currentSchool.officialSite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary hover:underline"
            >
              바로가기 ↗
            </a>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="card-elevated p-4 text-center">
            <TrendingUp className="mx-auto mb-1 h-4 w-4 text-primary" />

            <p className="text-xs text-muted-foreground">평균 점수</p>

            <p className="text-lg font-bold">{avgScore ?? "-"}</p>
          </div>

          <div className="card-elevated p-4 text-center">
            <BarChart3 className="mx-auto mb-1 h-4 w-4 text-primary" />

            <p className="text-xs text-muted-foreground">최고 점수</p>

            <p className="text-lg font-bold">{maxScore ?? "-"}</p>
          </div>

          <div className="card-elevated p-4 text-center">
            <BarChart3 className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />

            <p className="text-xs text-muted-foreground">최저 점수</p>

            <p className="text-lg font-bold">{minScore ?? "-"}</p>
          </div>
        </div>

        <HistorySection
          title="📊 과거 배정 이력"
          entries={safeEntries}
          currentPage={entryPage}
          onPageChange={setEntryPage}
        />

        <CommunitySection
          posts={safePosts}
          currentPage={postPage}
          onPageChange={setPostPage}
        />
      </div>
    </div>
  );
}

export default function SchoolDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-muted-foreground">
          로딩 중...
        </div>
      }
    >
      <SchoolDetailPageContent />
    </Suspense>
  );
}
