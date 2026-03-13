"use client";

import { useState } from "react";
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

interface RankEntry {
  id: number;
  semester: string;
  score: number;
  gpa: number;
  exam: string;
  schools: string[];
  isMe?: boolean;
}

const mockRanking: RankEntry[] = [
  {
    id: 1,
    semester: "2027-2",
    score: 92.5,
    gpa: 95,
    exam: "TOEFL",
    schools: ["뮌헨대학교", "베를린자유대학교", "하이델베르크대학교"],
  },
  {
    id: 2,
    semester: "2027-2",
    score: 89.3,
    gpa: 90,
    exam: "TOEFL",
    schools: ["UCLA", "UCL"],
  },
  {
    id: 999,
    semester: "2027-2",
    score: 88.2,
    gpa: 89,
    exam: "TOEFL",
    schools: ["소르본대학교", "뮌헨대학교", "바르셀로나대학교"],
    isMe: true,
  },
  {
    id: 3,
    semester: "2027-2",
    score: 87.1,
    gpa: 88,
    exam: "IELTS",
    schools: ["소르본대학교", "바르셀로나대학교", "뮌헨대학교"],
  },
  {
    id: 4,
    semester: "2027-1",
    score: 85.4,
    gpa: 85,
    exam: "TOEFL",
    schools: ["도쿄대학교"],
  },
  {
    id: 5,
    semester: "2027-1",
    score: 83.2,
    gpa: 82,
    exam: "IELTS",
    schools: ["UCL", "옥스퍼드대학교", "케임브리지대학교"],
  },
  {
    id: 6,
    semester: "2027-1",
    score: 80.8,
    gpa: 80,
    exam: "TOEFL",
    schools: ["바르셀로나대학교", "소르본대학교"],
  },
  {
    id: 7,
    semester: "2027-2",
    score: 78.5,
    gpa: 76,
    exam: "IELTS",
    schools: ["뮌헨대학교"],
  },
  {
    id: 8,
    semester: "2027-2",
    score: 75.1,
    gpa: 73,
    exam: "TOEFL",
    schools: ["UCLA", "도쿄대학교", "UCL"],
  },
];

const semesterOptions = ["2027-2", "2027-1"] as const;
type SemesterFilter = "all" | "2027-2" | "2027-1";

export default function RankingPage() {
  const router = useRouter();
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>("all");
  const [schoolSearch, setSchoolSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = [...mockRanking]
    .filter((e) => {
      if (semesterFilter !== "all" && e.semester !== semesterFilter)
        return false;
      if (schoolSearch && !e.schools.some((s) => s.includes(schoolSearch)))
        return false;
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  const me = filtered.find((e) => e.isMe);
  const totalCount = filtered.length;

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

        {me && (
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
                    {me.rank}위
                    <span className="text-sm font-medium text-muted-foreground ml-1.5">
                      / {totalCount}명
                    </span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">환산 점수</p>
                <p className="text-2xl font-extrabold text-primary">
                  {me.score}
                </p>
                <p className="text-[10px] text-muted-foreground">/ 100점</p>
              </div>
            </div>

            {me.schools.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-1.5">
                {me.schools.map((s, i) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium"
                  >
                    <GraduationCap className="h-3 w-3" />
                    {i + 1}순위 {s}
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

          {me && (
            <div className="text-sm text-muted-foreground">
              상위{" "}
              <span className="font-semibold text-primary">
                {Math.round((me.rank / totalCount) * 100)}%
              </span>
            </div>
          )}
        </div>

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
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              조건에 맞는 데이터가 없습니다
            </div>
          ) : (
            filtered.map((entry) => {
              const isMe = entry.isMe;
              const isExpanded = expandedId === entry.id;

              return (
                <div
                  key={entry.id}
                  className={`card-elevated p-4 transition-colors cursor-pointer ${
                    isMe
                      ? "border-primary/40 bg-primary/[0.04] ring-1 ring-primary/20"
                      : ""
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
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
                        {isMe && (
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
                          {entry.exam}
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
                          {entry.schools[0] ?? "—"}
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
                        {entry.schools.map((s, i) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full text-foreground"
                          >
                            <span className="text-[10px] font-bold text-muted-foreground">
                              {i + 1}
                            </span>
                            {s}
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
