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

interface DispatchEntry {
  semester: string;
  score: number;
}

interface CommunityPost {
  articleId: number;
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

const levelToLabel = (level?: string | null) => {
  if (level === "HIGHEST") return "최상";
  if (level === "HIGH") return "상";
  if (level === "MEDIUM") return "중";
  if (level === "LOW") return "하";
  return "-";
};

const POSTS_PER_PAGE = 5;
const ENTRIES_PER_PAGE = 5;
const ISEP_SCHOOL_ID = "26";

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

  const isIsepPage = schoolId === ISEP_SCHOOL_ID;

  const handleGoBack = () => {
    router.push(fromPage ? `/dispatch-db?page=${fromPage}` : "/dispatch-db");
  };

  useEffect(() => {
    if (!schoolId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (isIsepPage) {
          const historyRes = await api.get(`/schools/${schoolId}/history`);
          const historyData = historyRes.data?.result || historyRes.data || [];

          setSchool(null);
          setEntries(historyData);
          setPosts([]);
          setIsBookmarked(false);
          return;
        }

        const [detailRes, historyRes] = await Promise.all([
          api.get(`/schools/${schoolId}`),
          api.get(`/schools/${schoolId}/history`),
        ]);

        const schoolData = detailRes.data?.result || detailRes.data;
        const historyData = historyRes.data?.result || historyRes.data || [];

        setSchool(schoolData);
        setEntries(historyData);
        setIsBookmarked(schoolData?.isFavorite || false);

        try {
          const articleRes = await api.get(`/schools/${schoolId}/articles`);
          setPosts(articleRes.data?.result || articleRes.data || []);
        } catch {
          setPosts([]);
        }
      } catch {
        if (!isIsepPage) {
          setSchool(null);
        }

        setEntries([]);
        setPosts([]);
      } finally {
        setIsLoading(false);
        setPostPage(1);
        setEntryPage(1);
      }
    };

    fetchData();
  }, [schoolId, isIsepPage]);

  const toggleFavorite = async () => {
    if (!school) return;

    try {
      if (isBookmarked) {
        await api.delete(`/schools/${schoolId}/favorite`);
        setIsBookmarked(false);
      } else {
        await api.post(`/schools/${schoolId}/favorite`);
        setIsBookmarked(true);
      }
    } catch {
      // 무음 실패 처리
    }
  };

  if (isLoading) return <div className="py-20 text-center">로딩 중...</div>;

  if (!isIsepPage && !school) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground mb-4">
          학교 정보를 찾을 수 없습니다.
        </p>
        <Button variant="outline" onClick={handleGoBack}>
          파견 DB로 돌아가기
        </Button>
      </div>
    );
  }

  const safeEntries = Array.isArray(entries) ? entries : [];
  const hasScore = safeEntries.length > 0;

  const totalEntryPages = Math.max(
    1,
    Math.ceil(safeEntries.length / ENTRIES_PER_PAGE),
  );

  const pagedEntries = safeEntries.slice(
    (entryPage - 1) * ENTRIES_PER_PAGE,
    entryPage * ENTRIES_PER_PAGE,
  );

  const avgScore = hasScore
    ? (
        safeEntries.reduce((sum, e) => sum + e.score, 0) / safeEntries.length
      ).toFixed(1)
    : null;
  const maxScore = hasScore
    ? Math.max(...safeEntries.map((e) => e.score))
    : null;
  const minScore = hasScore
    ? Math.min(...safeEntries.map((e) => e.score))
    : null;

  if (isIsepPage) {
    return (
      <div className="py-10">
        <div className="container-tight">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
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

          <h2 className="font-bold mb-3">📊 과거 합격 점수 이력</h2>

          <div className="card-elevated mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>학기</TableHead>
                  <TableHead className="text-right">환산 점수</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {safeEntries.length > 0 ? (
                  pagedEntries.map((e, idx) => (
                    <TableRow key={`${e.semester}-${idx}`}>
                      <TableCell>{e.semester}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {e.score}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center text-muted-foreground py-6"
                    >
                      과거 배정 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {safeEntries.length > 0 && totalEntryPages > 1 && (
            <div className="mb-8 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={entryPage <= 1}
                onClick={() => setEntryPage((prev) => Math.max(prev - 1, 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <span className="flex min-w-[52px] items-center justify-center text-base font-medium text-muted-foreground">
                {entryPage} / {totalEntryPages}
              </span>

              <Button
                type="button"
                variant="outline"
                disabled={entryPage >= totalEntryPages}
                onClick={() =>
                  setEntryPage((prev) => Math.min(prev + 1, totalEntryPages))
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentSchool = school as SchoolInfo;

  const safePosts = Array.isArray(posts) ? posts : [];
  const totalPostPages = Math.max(
    1,
    Math.ceil(safePosts.length / POSTS_PER_PAGE),
  );
  const pagedPosts = safePosts.slice(
    (postPage - 1) * POSTS_PER_PAGE,
    postPage * POSTS_PER_PAGE,
  );

  const livingCostLabel =
    currentSchool.monthlyCostLevel === "HIGH"
      ? "최상"
      : currentSchool.monthlyCostLevel === "MEDIUM"
        ? "상"
        : "중";
  const travelAccessLabel = levelToLabel(currentSchool.travelAccessLevel);

  const livingCostColor =
    livingCostLabel === "최상"
      ? "bg-red-100 text-red-700"
      : livingCostLabel === "상"
        ? "bg-orange-100 text-orange-700"
        : livingCostLabel === "중"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700";

  return (
    <div className="py-10">
      <div className="container-tight">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          파견 DB로
        </button>

        <div className="mb-8">
          <div className="flex justify-center">
            <img
              src={currentSchool.imgUrl}
              alt={currentSchool.name}
              className="max-h-[420px] w-auto max-w-full rounded-3xl object-contain shadow-md"
            />
          </div>

          <p className="mx-auto mt-2 max-w-5xl text-right text-[10px] text-muted-foreground">
            *Images from Wikimedia Commons
          </p>
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">{currentSchool.name}</h1>
            </div>

            <div className="flex items-center text-sm text-muted-foreground gap-1">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="card-elevated p-4">
            <GraduationCap className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">유명한 전공</p>

            <div className="flex flex-wrap gap-1 mt-1">
              {Array.isArray(currentSchool.popularMajors) &&
                currentSchool.popularMajors.map((m) => (
                  <span
                    key={m}
                    className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full"
                  >
                    {m}
                  </span>
                ))}
            </div>
          </div>

          <div className="card-elevated p-4">
            <Plane className="h-4 w-4 text-primary mb-1" />

            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs text-muted-foreground">여행접근성</p>

              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
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

            <p className="text-xs text-muted-foreground mt-0.5">
              {currentSchool.travelAccess}
            </p>
          </div>

          <div className="card-elevated p-4">
            <DollarSign className="h-4 w-4 text-primary mb-1" />

            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-xs text-muted-foreground">예상 월 생활비</p>

              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${livingCostColor}`}
              >
                {livingCostLabel}
              </span>
            </div>

            <p className="text-sm font-semibold">{currentSchool.monthlyCost}</p>
          </div>

          <div className="card-elevated p-4">
            <Users className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">국제학생 비율</p>
            <p className="text-sm font-semibold">
              {currentSchool.internationalStudentRatio}%
            </p>
          </div>

          <div className="card-elevated p-4">
            <Heart className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">버디 프로그램</p>
            <p className="text-sm font-semibold">
              {currentSchool.buddyProgram}
            </p>
          </div>

          <div className="card-elevated p-4">
            <ExternalLink className="h-4 w-4 text-primary mb-1" />
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

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-elevated p-4 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">평균 점수</p>
            <p className="text-lg font-bold">{avgScore ?? "-"}</p>
          </div>

          <div className="card-elevated p-4 text-center">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">최고 점수</p>
            <p className="text-lg font-bold">{maxScore ?? "-"}</p>
          </div>

          <div className="card-elevated p-4 text-center">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">최저 점수</p>
            <p className="text-lg font-bold">{minScore ?? "-"}</p>
          </div>
        </div>

        <h2 className="font-bold mb-3">📊 과거 배정 이력</h2>

        <div className="card-elevated mb-8">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>학기</TableHead>
                <TableHead className="text-right">환산 점수</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {safeEntries.length > 0 ? (
                pagedEntries.map((e, idx) => (
                  <TableRow key={`${e.semester}-${idx}`}>
                    <TableCell>{e.semester}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {e.score}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="text-center text-muted-foreground py-6"
                  >
                    과거 배정 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {safeEntries.length > 0 && totalEntryPages > 1 && (
          <div className="mb-8 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={entryPage <= 1}
              onClick={() => setEntryPage((prev) => Math.max(prev - 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <span className="flex min-w-[52px] items-center justify-center text-base font-medium text-muted-foreground">
              {entryPage} / {totalEntryPages}
            </span>

            <Button
              type="button"
              variant="outline"
              disabled={entryPage >= totalEntryPages}
              onClick={() =>
                setEntryPage((prev) => Math.min(prev + 1, totalEntryPages))
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}

        <h2 className="font-bold mb-3">💬 관련 커뮤니티 글</h2>

        <div className="space-y-2 mb-4">
          {pagedPosts.length > 0 ? (
            pagedPosts.map((post) => (
              <Link
                key={post.articleId}
                href={`/community/${post.articleId}`}
                className="card-elevated p-4 flex justify-between block"
              >
                <div>
                  <span className={stageBadgeMap[post.exchangeStatus]}>
                    {stageLabelMap[post.exchangeStatus]}
                  </span>

                  <h3 className="text-sm font-semibold mt-1">{post.title}</h3>
                </div>

                <div className="text-right text-xs text-muted-foreground">
                  <p>{post.nickname}</p>
                  <p>{new Date(post.createdAt).toLocaleDateString()}</p>
                  <p>💬 {post.commentCount}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-2">아직 관련 글이 없습니다.</p>
              <Link
                href="/community/write"
                className="text-primary underline text-sm"
              >
                첫 글 작성하기
              </Link>
            </div>
          )}
        </div>

        {totalPostPages > 1 && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={postPage <= 1}
              onClick={() => setPostPage((prev) => Math.max(prev - 1, 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <span className="flex min-w-[52px] items-center justify-center text-base font-medium text-muted-foreground">
              {postPage} / {totalPostPages}
            </span>

            <Button
              type="button"
              variant="outline"
              disabled={postPage >= totalPostPages}
              onClick={() =>
                setPostPage((prev) => Math.min(prev + 1, totalPostPages))
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl p-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
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
