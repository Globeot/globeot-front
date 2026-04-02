"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Medal,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  ArrowLeft,
  Users,
} from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import api from "../../../lib/api";

interface SchoolInfo {
  schoolName: string;
  schoolId: number;
  priority: number;
}

interface RankingListDto {
  rank: number;
  score: number;
  gpa: number;
  testType: string;
  semester: string;
  schools: SchoolInfo[];
  isMine: boolean;
}

interface MyRankDto {
  myRank: number;
  totalApplicants: number;
  myScore: number;
  mySchoolRankings: {
    schoolId: number;
    schoolName: string;
    priority: number;
  }[];
}

const semesterOptions = ["2027-2", "2027-1"] as const;
type SemesterFilter = "all" | "2027-2" | "2027-1";

export default function RankingPage() {
  const router = useRouter();

  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>("all");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [rankings, setRankings] = useState<RankingListDto[]>([]);
  const [myInfo, setMyInfo] = useState<MyRankDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);

        const params: any = {};
        if (semesterFilter !== "all") params.semester = semesterFilter;
        if (schoolSearch) params.schoolName = schoolSearch;

        const [myRes, rankRes] = await Promise.all([
          api.get("/application"),
          api.get("/application/rankings", { params }),
        ]);

        setMyInfo(myRes.data);
        setRankings(rankRes.data);
      } catch (err) {
        console.error("랭킹 데이터 로딩 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchRankings, 500);
    return () => clearTimeout(timer);
  }, [semesterFilter, schoolSearch]);

  const totalCount = rankings.length;

  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight">
        <div className="mb-1 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 -ml-2"
            onClick={() => router.push("/application-db")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            지원 랭킹
          </h1>
        </div>
        <p className="text-muted-foreground text-sm mb-6 ml-9">
          환산 점수 기준 전체 랭킹 · 참고용 데이터입니다
        </p>

        {myInfo && (
          <div className="card-elevated p-5 mb-6 border-l-4 border-l-primary bg-primary/[0.03]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Medal className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    나의 순위
                  </p>
                  <p className="text-2xl font-extrabold text-foreground">
                    {myInfo.myRank}위
                    <span className="text-sm font-medium text-muted-foreground ml-1.5">
                      / {myInfo.totalApplicants}명
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">환산 점수</p>
                <p className="text-2xl font-extrabold text-primary">
                  {myInfo.myScore}
                </p>
                <p className="text-[10px] text-muted-foreground">/ 100점</p>
              </div>
            </div>

            {myInfo.mySchoolRankings.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-1.5">
                {myInfo.mySchoolRankings
                  .sort((a, b) => a.priority - b.priority)
                  .map((s) => (
                    <span
                      key={s.schoolId}
                      className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                    >
                      <GraduationCap className="h-3 w-3" />
                      {s.priority}순위 {s.schoolName}
                    </span>
                  ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              전체{" "}
              <span className="font-semibold text-foreground">
                {totalCount}
              </span>
              명
            </span>
          </div>
        </div>

        {/* 필터 섹션 */}
        <div className="space-y-3 mb-5">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground self-center mr-1">
              학기
            </span>
            {(["all", ...semesterOptions] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSemesterFilter(s as SemesterFilter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  semesterFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s === "all" ? "전체" : s}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="학교명으로 검색..."
              value={schoolSearch}
              onChange={(e) => setSchoolSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">
              로딩 중...
            </div>
          ) : rankings.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              조건에 맞는 데이터가 없습니다
            </div>
          ) : (
            rankings.map((entry, index) => {
              const isExpanded = expandedId === index;

              return (
                <div
                  key={index}
                  className={`card-elevated p-4 transition-colors cursor-pointer ${
                    entry.isMine
                      ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                      : ""
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : index)}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-9 text-center">
                      {entry.rank <= 3 ? (
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-100 text-yellow-700"
                              : entry.rank === 2
                                ? "bg-gray-100 text-gray-600"
                                : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {entry.rank}
                        </span>
                      ) : (
                        <span className="text-sm font-semibold text-muted-foreground">
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-foreground">
                          {entry.score}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          점
                        </span>
                        {entry.isMine && (
                          <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                            나
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          GPA {entry.gpa}%
                        </span>
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">
                          {entry.testType}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {entry.semester}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] text-muted-foreground">
                          1순위
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {entry.schools.find((s) => s.priority === 1)
                            ?.schoolName ?? "—"}
                        </p>
                      </div>

                      {entry.schools.length > 1 &&
                        (isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ))}
                    </div>
                  </div>

                  {isExpanded && entry.schools.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        희망 학교
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.schools
                          .sort((a, b) => a.priority - b.priority)
                          .map((s, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full text-foreground"
                            >
                              <span className="text-[10px] font-bold text-muted-foreground">
                                {s.priority}
                              </span>
                              {s.schoolName}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          ※ 본 데이터는 참고용이며, 실제 배정 결과와 다를 수 있습니다.
        </p>
      </div>
    </div>
  );
}
