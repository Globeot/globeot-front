"use client";

import { useState } from "react";
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

interface DispatchEntry {
  id: number;
  semester: string;
  convertedScore: number;
}

interface CommunityPost {
  id: number;
  title: string;
  author: string;
  date: string;
  comments: number;
  stage: "pre" | "abroad" | "returned";
}

interface SchoolInfo {
  country: string;
  city: string;
  photo: string;
  website: string;
  famousMajors: string[];
  travelAccess: string;
  travelAccessDesc: string;
  internationalRatio: string;
  livingCost: string;
  livingCostLevel: "최상" | "상" | "중" | "하";
  buddyProgram: string;
  exchangeWebsite: string;
  entries: DispatchEntry[];
  communityPosts: CommunityPost[];
}

const allData: Record<string, SchoolInfo> = {
  UCLA: {
    country: "미국",
    city: "로스앤젤레스",
    photo:
      "https://images.unsplash.com/photo-1580982324076-d95230f6e024?w=800&h=400&fit=crop",
    website: "https://www.ucla.edu",
    famousMajors: ["영화학", "경영학", "컴퓨터공학", "심리학"],
    travelAccess: "중",
    travelAccessDesc: "미 서부 거점, 국내선 풍부",
    internationalRatio: "12%",
    livingCost: "$1,200–2,000/월",
    livingCostLevel: "최상",
    buddyProgram: "Dashew Center 프로그램",
    exchangeWebsite: "https://www.ucla.edu/exchange",
    entries: [
      { id: 3, semester: "2025-1", convertedScore: 89.3 },
      { id: 8, semester: "2024-2", convertedScore: 80.0 },
    ],
    communityPosts: [
      {
        id: 4,
        title: "UCLA 수강신청 팁 공유합니다",
        author: "지은",
        date: "2026.02.17",
        comments: 12,
        stage: "pre",
      },
    ],
  },

  뮌헨대학교: {
    country: "독일",
    city: "뮌헨",
    photo:
      "https://images.unsplash.com/photo-1575650772339-75dba4caa0a6?w=800&h=400&fit=crop",
    website: "https://www.lmu.de",
    famousMajors: ["경영학", "법학", "의학", "물리학"],
    travelAccess: "상",
    travelAccessDesc: "유럽 중심부, 기차/항공 접근성 우수",
    internationalRatio: "15%",
    livingCost: "€800–1,200/월",
    livingCostLevel: "중",
    buddyProgram: "ESN 있음",
    exchangeWebsite: "https://www.lmu.de/en/workspace-for-students/exchange/",
    entries: [
      { id: 1, semester: "2025-2", convertedScore: 92.5 },
      { id: 7, semester: "2024-2", convertedScore: 81.8 },
    ],
    communityPosts: [
      {
        id: 1,
        title: "독일 뮌헨대 기숙사 신청 방법 아시는 분?",
        author: "민지",
        date: "2026.02.20",
        comments: 5,
        stage: "pre",
      },
      {
        id: 10,
        title: "뮌헨대 수강신청 꿀팁 공유",
        author: "서윤",
        date: "2026.01.15",
        comments: 8,
        stage: "abroad",
      },
    ],
  },
};

const stageLabelMap: Record<string, string> = {
  pre: "배정 전",
  abroad: "파견 중",
  returned: "파견 후",
};

const stageBadgeMap: Record<string, string> = {
  pre: "status-badge-pre",
  abroad: "status-badge-abroad",
  returned: "status-badge-returned",
};

const POSTS_PER_PAGE = 5;

export default function SchoolDetailPage() {
  const params = useParams<{ schoolName: string }>();
  const router = useRouter();

  const schoolName = params.schoolName;
  const decoded = decodeURIComponent(schoolName || "");
  const school = allData[decoded];

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [postPage, setPostPage] = useState(1);

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

  const entries = school.entries;

  const avgScore =
    entries.reduce((sum, e) => sum + e.convertedScore, 0) / entries.length;

  const maxScore = Math.max(...entries.map((e) => e.convertedScore));
  const minScore = Math.min(...entries.map((e) => e.convertedScore));

  const totalPostPages = Math.max(
    1,
    Math.ceil(school.communityPosts.length / POSTS_PER_PAGE),
  );

  const pagedPosts = school.communityPosts.slice(
    (postPage - 1) * POSTS_PER_PAGE,
    postPage * POSTS_PER_PAGE,
  );

  const livingCostColor =
    school.livingCostLevel === "최상"
      ? "bg-red-100 text-red-700"
      : school.livingCostLevel === "상"
        ? "bg-orange-100 text-orange-700"
        : school.livingCostLevel === "중"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700";

  return (
    <div className="py-10">
      <div className="container-tight">
        {/* Back */}
        <button
          onClick={() => router.push("/dispatch-db")}
          className="flex items-center gap-1 text-sm text-muted-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          파견 DB로
        </button>

        {/* Photo */}
        <div className="rounded-xl overflow-hidden mb-6 aspect-[2/1]">
          <img
            src={school.photo}
            alt={decoded}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
        <div className="flex justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">{decoded}</h1>
            </div>

            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <MapPin className="h-4 w-4" />
              {school.city}, {school.country}
            </div>
          </div>

          <Button
            variant={isBookmarked ? "default" : "outline"}
            size="icon"
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Heart
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
            />
          </Button>
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="card-elevated p-4">
            <Plane className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">여행 접근성</p>
            <span className="text-sm font-semibold">{school.travelAccess}</span>
            <p className="text-xs">{school.travelAccessDesc}</p>
          </div>

          <div className="card-elevated p-4">
            <DollarSign className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">월 생활비</p>
            <span className={`text-xs px-2 py-1 rounded ${livingCostColor}`}>
              {school.livingCostLevel}
            </span>
            <p className="text-sm font-semibold">{school.livingCost}</p>
          </div>

          <div className="card-elevated p-4">
            <Users className="h-4 w-4 text-primary mb-1" />
            <p className="text-xs text-muted-foreground">국제학생 비율</p>
            <p className="text-sm font-semibold">{school.internationalRatio}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card-elevated p-4 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">평균 점수</p>
            <p className="text-lg font-bold">{avgScore.toFixed(1)}</p>
          </div>

          <div className="card-elevated p-4 text-center">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">최고 점수</p>
            <p className="text-lg font-bold">{maxScore}</p>
          </div>

          <div className="card-elevated p-4 text-center">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">최저 점수</p>
            <p className="text-lg font-bold">{minScore}</p>
          </div>
        </div>

        {/* History */}
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
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.semester}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {e.convertedScore}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Community */}
        <h2 className="font-bold mb-3">💬 관련 커뮤니티 글</h2>

        <div className="space-y-2 mb-4">
          {pagedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/community/${post.id}`}
              className="card-elevated p-4 flex justify-between block"
            >
              <div>
                <span className={stageBadgeMap[post.stage]}>
                  {stageLabelMap[post.stage]}
                </span>

                <h3 className="text-sm font-semibold mt-1">{post.title}</h3>
              </div>

              <div className="text-right text-xs text-muted-foreground">
                <p>{post.author}</p>
                <p>{post.date}</p>
                <p>💬 {post.comments}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}

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
