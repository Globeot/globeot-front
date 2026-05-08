"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import api from "../../lib/api";

interface DispatchEntry {
  schoolId: number;
  country: string;
  city: string;
  schoolName: string;
  avgScore: number | null;
  travelAccessLevel: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | null;
  monthlyCost: string;
  officialSite: string;
}

const scoreRanges = [
  { label: "전체", min: null, max: null },
  { label: "100–96", min: 96, max: 100 },
  { label: "95–90", min: 90, max: 95 },
  { label: "89–85", min: 85, max: 89 },
  { label: "84–80", min: 80, max: 84 },
  { label: "79–75", min: 75, max: 79 },
  { label: "74–70", min: 70, max: 74 },
  { label: "69 이하", min: 0, max: 69 },
  { label: "점수 없음", min: null, max: null },
];

export default function DispatchDBPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [schoolSearch, setSchoolSearch] = useState("");
  const [scoreRange, setScoreRange] = useState(scoreRanges[0]);
  const [schools, setSchools] = useState<DispatchEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginRequired, setIsLoginRequired] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get("page") || "1");
    return Number.isNaN(page) || page < 1 ? 1 : page;
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (currentPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(currentPage));
    }

    const query = params.toString();
    router.replace(query ? `/dispatch-db?${query}` : "/dispatch-db", {
      scroll: false,
    });
  }, [currentPage]);

  // 학교 목록 불러오기
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setIsLoading(true);

        const params: any = {
          keyword: schoolSearch || null,
          noScoreOnly: scoreRange.label === "점수 없음",
        };

        if (scoreRange.min !== null) params.minScore = scoreRange.min;
        if (scoreRange.max !== null) params.maxScore = scoreRange.max;

        const res = await api.get("/schools", { params });

        setSchools(res.data.result || []);
        setIsLoginRequired(false);
      } catch (err: any) {
        const status = err?.response?.status;

        if (status === 401 || status === 403) {
          setIsLoginRequired(true);
          setSchools([]);
          return;
        }

        console.warn("학교 목록 로딩 실패:", status);
        setIsLoginRequired(false);
        setSchools([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, [schoolSearch, scoreRange]);

  const getTravelAccessUI = (level?: string | null) => {
    switch (level) {
      case "HIGHEST":
        return {
          label: "최상",
          class: "bg-blue-100 text-blue-700",
        };
      case "HIGH":
        return {
          label: "상",
          class: "bg-green-100 text-green-700",
        };
      case "MEDIUM":
        return {
          label: "중",
          class: "bg-yellow-100 text-yellow-700",
        };
      case "LOW":
        return {
          label: "하",
          class: "bg-gray-100 text-gray-700",
        };
      default:
        return {
          label: "-",
          class: "bg-muted text-muted-foreground",
        };
    }
  };

  const totalPages = Math.max(1, Math.ceil(schools.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSchools = schools.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            학교별 DB
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            학교별 과거 합격 점수 데이터 · 학교명 클릭 시 상세 페이지 이동
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="학교명, 국가, 도시 검색..."
              value={schoolSearch}
              onChange={(e) => {
                setSchoolSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground self-center mr-1">
              점수 구간
            </span>
            {scoreRanges.map((range) => (
              <button
                key={range.label}
                onClick={() => {
                  setScoreRange(range);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  scoreRange.label === range.label
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* 테이블 */}
        <div className="card-elevated overflow-hidden">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[12%]">국가</TableHead>
                <TableHead className="w-[14%]">도시</TableHead>
                <TableHead className="w-[20%]">학교</TableHead>
                <TableHead className="w-[14%]">환산 점수</TableHead>
                <TableHead className="w-[14%]">여행접근성</TableHead>
                <TableHead className="w-[16%]">생활비</TableHead>
                <TableHead className="w-[10%]">사이트</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    {" "}
                    로딩 중...{" "}
                  </TableCell>
                </TableRow>
              ) : isLoginRequired ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          로그인한 사용자만 볼 수 있습니다.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          학교별 DB를 확인하려면 먼저 로그인해주세요.
                        </p>
                      </div>

                      <Button onClick={() => router.push("/login")}>
                        로그인하러 가기
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : !Array.isArray(schools) || schools.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSchools.map((entry) => {
                  const accessUI = getTravelAccessUI(entry.travelAccessLevel);
                  return (
                    <TableRow key={entry.schoolId}>
                      <TableCell className="text-sm text-muted-foreground">
                        <button
                          onClick={() => setSchoolSearch(entry.country)}
                          className="hover:text-primary hover:underline"
                        >
                          {entry.country}
                        </button>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <button
                          onClick={() => setSchoolSearch(entry.city)}
                          className="hover:text-primary hover:underline"
                        >
                          {entry.city}
                        </button>
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() =>
                            router.push(
                              `/dispatch-db/${entry.schoolId}?fromPage=${currentPage}`,
                            )
                          }
                          className="text-sm font-medium text-primary hover:underline text-left"
                        >
                          {entry.schoolName}
                        </button>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {entry.avgScore !== null
                          ? entry.avgScore.toFixed(2)
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${accessUI.class}`}
                        >
                          {accessUI.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.monthlyCost}
                      </TableCell>
                      <TableCell>
                        {entry.officialSite && (
                          <a
                            href={
                              entry.officialSite.startsWith("http")
                                ? entry.officialSite
                                : `https://${entry.officialSite}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {!isLoading &&
          !isLoginRequired &&
          schools.length > 0 &&
          totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-8 rounded-md px-2 text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

        <p className="text-xs text-muted-foreground text-center mt-4">
          ※ 본 데이터는 참고용이며, 최종 정보는 학내 공식 사이트를 확인해주세요.
        </p>
      </div>
    </div>
  );
}
