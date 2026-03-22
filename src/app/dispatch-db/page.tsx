"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

interface DispatchEntry {
  id: number;
  country: string;
  city: string;
  school: string;
  convertedScore: number;
  travelAccess: string;
  livingCost: string;
  website: string;
}

//‼️목업데이터
const mockData: DispatchEntry[] = [
  {
    id: 1,
    country: "독일",
    city: "뮌헨",
    school: "뮌헨대학교",
    convertedScore: 92.5,
    travelAccess: "상",
    livingCost: "€800–1,200",
    website: "https://www.lmu.de",
  },
  {
    id: 2,
    country: "프랑스",
    city: "파리",
    school: "소르본대학교",
    convertedScore: 90.1,
    travelAccess: "상",
    livingCost: "€900–1,400",
    website: "https://www.sorbonne-universite.fr",
  },
  {
    id: 3,
    country: "미국",
    city: "로스앤젤레스",
    school: "UCLA",
    convertedScore: 89.3,
    travelAccess: "중",
    livingCost: "$1,200–2,000",
    website: "https://www.ucla.edu",
  },
  {
    id: 4,
    country: "스페인",
    city: "바르셀로나",
    school: "바르셀로나대학교",
    convertedScore: 87.1,
    travelAccess: "상",
    livingCost: "€700–1,100",
    website: "https://www.ub.edu",
  },
  {
    id: 5,
    country: "일본",
    city: "도쿄",
    school: "도쿄대학교",
    convertedScore: 85.4,
    travelAccess: "중",
    livingCost: "¥80,000–120,000",
    website: "https://www.u-tokyo.ac.jp",
  },
  {
    id: 6,
    country: "영국",
    city: "런던",
    school: "UCL",
    convertedScore: 83.2,
    travelAccess: "상",
    livingCost: "£1,000–1,600",
    website: "https://www.ucl.ac.uk",
  },
];

const scoreRanges = [
  { label: "전체", min: 0, max: 100 },
  { label: "90–94", min: 90, max: 94 },
  { label: "85–89", min: 85, max: 89 },
  { label: "80–84", min: 80, max: 84 },
  { label: "75–79", min: 75, max: 79 },
  { label: "70–74", min: 70, max: 74 },
];

const PAGE_SIZE = 20;

export default function DispatchDBPage() {
  const router = useRouter();

  const [schoolSearch, setSchoolSearch] = useState("");
  const [scoreRange, setScoreRange] = useState(scoreRanges[0]);
  const [page, setPage] = useState(1);

  //‼️검색창+필터링 결과
  const filtered = mockData.filter((entry) => {
    if (
      schoolSearch &&
      !entry.school.includes(schoolSearch) &&
      !entry.country.includes(schoolSearch) &&
      !entry.city.includes(schoolSearch)
    ) {
      return false;
    }

    if (
      scoreRange.label !== "전체" &&
      (entry.convertedScore < scoreRange.min ||
        entry.convertedScore > scoreRange.max + 0.99)
    ) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

        {/* 검색 */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

            <Input
              placeholder="학교명, 국가, 도시 검색..."
              value={schoolSearch}
              onChange={(e) => {
                setSchoolSearch(e.target.value);
                setPage(1);
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
                  setPage(1);
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
              {paged.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground text-sm"
                  >
                    검색 결과가 없습니다
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      <button
                        //‼️ 서버 검색
                        onClick={() => {
                          setSchoolSearch(entry.country);
                          setPage(1);
                        }}
                        className="hover:text-primary hover:underline"
                      >
                        {entry.country}
                      </button>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      <button
                        //‼️ 서버 검색
                        onClick={() => {
                          setSchoolSearch(entry.city);
                          setPage(1);
                        }}
                        className="hover:text-primary hover:underline"
                      >
                        {entry.city}
                      </button>
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() =>
                          router.push(
                            `/dispatch-db/${encodeURIComponent(entry.school)}`,
                          )
                        }
                        //‼️ 해당 학교 데이터
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {entry.school}
                      </button>
                    </TableCell>

                    <TableCell className="font-semibold">
                      {entry.convertedScore}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          entry.travelAccess === "상"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {entry.travelAccess}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {entry.livingCost}
                    </TableCell>

                    <TableCell>
                      <a
                        href={entry.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 페이지네이션 */}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
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
