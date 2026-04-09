"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  travelAccessLevel: "HIGH" | "MEDIUM" | "LOW";
  monthlyCost: string;
  monthlyCostLevel: "HIGH" | "MEDIUM" | "LOW";
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

const levelToLabel = (level: string) => {
  if (level === "HIGH") return "상";
  if (level === "MEDIUM") return "중";
  if (level === "LOW") return "하";
  return "중";
};

const POSTS_PER_PAGE = 5;

export default function SchoolDetailPage() {
  const params = useParams<{ schoolId: string }>();
  const router = useRouter();
  const schoolId = params.schoolId;

  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [entries, setEntries] = useState<DispatchEntry[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [detailRes, historyRes, articleRes] = await Promise.all([
          api.get(`/schools/${schoolId}`),
          api.get(`/schools/${schoolId}/history`),
          api.get(`/schools/${schoolId}/articles`),
        ]);

        setSchool(detailRes.data.result || detailRes.data);
        setEntries(historyRes.data.result || historyRes.data || []);
        setPosts(articleRes.data.result || articleRes.data || []);

        const schoolData = detailRes.data.result || detailRes.data;
        setIsBookmarked(schoolData?.isFavorite || false);
      } catch (err) {
        console.error("상세 정보 로딩 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [schoolId]);

  const toggleFavorite = async () => {
    try {
      if (isBookmarked) {
        await api.delete(`/schools/${schoolId}/favorite`);
        setIsBookmarked(false);
      } else {
        await api.post(`/schools/${schoolId}/favorite`);
        setIsBookmarked(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="py-20 text-center">로딩 중...</div>;

  if (!school) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground mb-4">
          학교 정보를 찾을 수 없습니다.
        </p>
        <Button variant="outline" onClick={() => router.push("/dispatch-db")}>
          파견 DB로 돌아가기
        </Button>
      </div>
    );
  }

  const safeEntries = Array.isArray(entries) ? entries : [];
  const hasScore = safeEntries.length > 0;
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
    school.monthlyCostLevel === "HIGH"
      ? "최상"
      : school.monthlyCostLevel === "MEDIUM"
        ? "상"
        : "중";
  const travelAccessLabel = levelToLabel(school.travelAccessLevel);

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
          onClick={() => router.push("/dispatch-db")}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          파견 DB로
        </button>

        <div className="mb-6">
          <div className="rounded-xl overflow-hidden aspect-[2/1]">
            <img
              src={school.imgUrl}
              alt={school.name}
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-[10px] text-muted-foreground mt-1 text-right">
            *Images from Wikimedia Commons
          </p>
        </div>

        <div className="flex justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">{school.name}</h1>
            </div>

            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <MapPin className="h-4 w-4" />
              {school.city}, {school.country}
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
              {Array.isArray(school.popularMajors) &&
                school.popularMajors.map((m) => (
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
                  travelAccessLabel === "상"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {travelAccessLabel}
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-0.5">
              {school.travelAccess}
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

            <p className="text-sm font-semibold">{school.monthlyCost}</p>
          </div>

          <div className="card-elevated p-4">
            <Users className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">국제학생 비율</p>
            <p className="text-sm font-semibold">
              {school.internationalStudentRatio}%
            </p>
          </div>

          <div className="card-elevated p-4">
            <Heart className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">버디 프로그램</p>
            <p className="text-sm font-semibold">{school.buddyProgram}</p>
          </div>

          <div className="card-elevated p-4">
            <ExternalLink className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">
              공식 교환학생 사이트
            </p>

            <a
              href={school.officialSite}
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
                safeEntries.map((e, idx) => (
                  <TableRow key={idx}>
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
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={postPage <= 1}
              onClick={() => setPostPage(postPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              {postPage} / {totalPostPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={postPage >= totalPostPages}
              onClick={() => setPostPage(postPage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
