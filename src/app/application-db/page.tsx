"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Upload, ImageIcon, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";

import { gpaToPercentile } from "./gpaData";
import { ImageUploadButton } from "../../components/tiptap-ui/image-upload-button";

/* ── 희망학교 선택 UI ── */
const SchoolAutocomplete = ({
  rank,
  required,
  value,
  onChange,
  exclude,
}: {
  rank: number;
  required: boolean;
  value: string;
  onChange: (v: string) => void;
  exclude: string[];
}) => {
  //학교 검색
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const available = allSchools.filter((s) => !exclude.includes(s));
  const suggestions = query
    ? available.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : available;

  //학교 선택
  const select = (s: string) => {
    setQuery(s);
    onChange(s);
    setOpen(false);
  };

  const clear = () => {
    setQuery("");
    onChange("");
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap shrink-0 w-14">
        {rank}순위{required ? " *" : ""}
      </span>
      <div className="relative flex-1" ref={ref}>
        <Input
          placeholder="학교 검색..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value) onChange("");
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        {value && (
          <button
            onClick={clear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-md max-h-[180px] overflow-y-auto py-1">
            {suggestions.map((s) => (
              <button
                key={s}
                onMouseDown={() => select(s)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

type ExamType = "toefl" | "ielts";

//‼️
const allSchools = [
  "뮌헨대학교",
  "소르본대학교",
  "UCLA",
  "바르셀로나대학교",
  "도쿄대학교",
  "UCL",
  "베를린자유대학교",
  "하이델베르크대학교",
  "옥스퍼드대학교",
  "케임브리지대학교",
];

const semesterOptions = ["2027-2", "2027-1"] as const;

/* ── ranking page 제출 ── */
const ApplicationDBPage = () => {
  const router = useRouter();

  /* 환산계산기 state */
  const [examType, setExamType] = useState<ExamType>("toefl");
  const [gpa, setGpa] = useState("");
  const [reading, setReading] = useState("");
  const [listening, setListening] = useState("");
  const [speaking, setSpeaking] = useState("");
  const [writing, setWriting] = useState("");
  const [calcResult, setCalcResult] = useState<number | null>(null);

  /* 업로드 state */
  const [certFile, setCertFile] = useState<File | null>(null);
  const [scoreFile, setScoreFile] = useState<File | null>(null);
  const [applySemester, setApplySemester] = useState("");
  const [schoolChoices, setSchoolChoices] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
  ]);

  const ieltsToToefl: Record<number, number> = {
    9: 30,
    8.5: 28,
    8: 27,
    7.5: 25,
    7: 22,
    6.5: 19,
    6: 16,
    5.5: 12,
    5: 8,
    4.5: 4,
    4: 0,
  };

  const calculate = () => {
    const g = parseFloat(gpa);
    let r = parseFloat(reading);
    let l = parseFloat(listening);
    let s = parseFloat(speaking);
    let w = parseFloat(writing);

    if ([g, r, l, s, w].some(isNaN)) return;
    if (g > 4.3 || g < 0) return;

    // IELTS -> TOEFL 변환
    if (examType === "ielts") {
      r = ieltsToToefl[r];
      l = ieltsToToefl[l];
      s = ieltsToToefl[s];
      w = ieltsToToefl[w];

      if ([r, l, s, w].some((v) => v === undefined)) return;
    }

    //백분위
    const gpaKey = g.toFixed(2);
    const percentile = gpaToPercentile[gpaKey] || 0;
    const gpaScore = percentile / 2;

    // 영어 영역별 가중치
    const readingScore = (r / 30) * 10;
    const listeningScore = (l / 30) * 10;
    const speakingScore = (s / 30) * 15;
    const writingScore = (w / 30) * 15;

    const finalScore =
      gpaScore + readingScore + listeningScore + speakingScore + writingScore;
    setCalcResult(Math.round(finalScore * 100) / 100);
  };

  const calcValid = [gpa, reading, listening, speaking, writing].every(
    (v) => v !== "",
  );

  const canSubmitTranscript =
    certFile &&
    scoreFile &&
    applySemester &&
    schoolChoices[0] &&
    calcResult !== null;

  //‼️제출+페이지 넘어감
  const handleTranscriptSubmit = () => {
    if (!canSubmitTranscript) return;
    router.push("/application-db/ranking");
  };

  const updateSchoolChoice = (index: number, value: string) => {
    const next = [...schoolChoices];
    next[index] = value;
    setSchoolChoices(next);
  };

  /* ─── Application form ─── */
  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight max-w-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              지원 랭킹
            </h1>
          </div>
          <p className="text-muted-foreground text-sm mb-8">
            지원 인증을 완료하면 환산 점수 기반 랭킹을 확인할 수 있어요
          </p>
        </div>

        {/* 점수계산기 */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-foreground mb-4">
            1. 환산 점수 계산
          </h2>
          <div className="flex gap-2 mb-4">
            {(["toefl", "ielts"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setExamType(type);
                  setCalcResult(null);
                }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  examType === type
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="card-elevated p-5 space-y-4">
            <div>
              <Label className="text-sm font-medium">GPA (4.3 만점)</Label>
              <div className="flex items-center gap-3 mt-1.5">
                <Input
                  type="number"
                  min={0}
                  max={4.3}
                  step={0.01}
                  placeholder="예: 3.85"
                  value={gpa}
                  onChange={(e) => {
                    const val = Number(e.target.value);

                    if (val > 4.3) return;
                    if (val < 0) return;

                    setGpa(e.target.value);
                  }}
                  className="w-1/2"
                />
                {gpa && !isNaN(parseFloat(gpa)) && (
                  <span className="text-sm text-muted-foreground">
                    백분위 점수:{" "}
                    <span className="font-semibold text-foreground">
                      {gpaToPercentile[parseFloat(gpa).toFixed(2)] !== undefined
                        ? gpaToPercentile[parseFloat(gpa).toFixed(2)].toFixed(1)
                        : "환산 불가"}
                    </span>
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Reading",
                  value: reading,
                  setter: setReading,
                  max: examType === "toefl" ? 30 : 9,
                },
                {
                  label: "Listening",
                  value: listening,
                  setter: setListening,
                  max: examType === "toefl" ? 30 : 9,
                },
                {
                  label: "Speaking",
                  value: speaking,
                  setter: setSpeaking,
                  max: examType === "toefl" ? 30 : 9,
                },
                {
                  label: "Writing",
                  value: writing,
                  setter: setWriting,
                  max: examType === "toefl" ? 30 : 9,
                },
              ].map((f) => (
                <div key={f.label}>
                  <Label className="text-sm font-medium">
                    {f.label} (0~{f.max})
                  </Label>
                  {examType === "ielts" ? (
                    <select
                      value={f.value}
                      onChange={(e) => f.setter(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1.5"
                    >
                      <option value="">선택</option>
                      {Array.from({ length: 19 }, (_, i) => i * 0.5).map(
                        (v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ),
                      )}
                    </select>
                  ) : (
                    <Input
                      type="number"
                      min={0}
                      max={f.max}
                      step={1}
                      placeholder={`0~${f.max}`}
                      value={f.value}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val > f.max) return;
                        if (val < 0) return;
                        f.setter(e.target.value);
                      }}
                      className="mt-1.5"
                    />
                  )}
                </div>
              ))}
            </div>
            <Button
              className="w-full"
              disabled={!calcValid}
              onClick={calculate}
            >
              계산하기
            </Button>
          </div>

          {calcResult !== null && (
            <div className="mt-4 card-elevated p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">
                나의 환산 점수
              </p>
              <p className="text-3xl font-extrabold text-primary">
                {calcResult}
              </p>
              <p className="text-xs text-muted-foreground mt-1">/ 100점 만점</p>
            </div>
          )}
        </section>

       {/* 인증 */}
<section className="mb-8">
  <h2 className="text-base font-bold text-foreground mb-4">
    2. 지원 인증
  </h2>

  <div className="card-elevated p-5 space-y-4">
    {/* 유레카 지원 확정 캡쳐본 */}
    <div>
      <Label className="text-sm font-medium mb-1.5 block">
        <ImageIcon className="inline h-4 w-4 mr-1" />
        유레카 지원 확정 캡쳐본 (이미지)
      </Label>

      {/* ✅ files[0]을 추출하여 setCertFile에 저장 */}
      <ImageUploadButton 
        onUpload={(files) => setCertFile(files[0])} 
        allowPdf={false} // 유레카는 이미지만
      />
    </div>

    {/* 어학성적표 */}
    <div>
      <Label className="text-sm font-medium mb-1.5 block">
        <Upload className="inline h-4 w-4 mr-1" />
        어학성적표 (PDF 또는 이미지)
      </Label>

      {/* ✅ 중복되었던 setScoreFile 확인 및 allowPdf 유지 */}
      <ImageUploadButton 
        onUpload={(files) => setScoreFile(files[0])} 
        allowPdf={true} 
      />
    </div>
  </div>
</section>

        {/* 학기 & 희망 학교 */}
        <section className="mb-8">
          <h2 className="text-base font-bold text-foreground mb-4">
            3. 지원 학기 & 희망 학교
          </h2>
          <div className="card-elevated p-5 space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                지원 학기
              </Label>
              <div className="flex flex-wrap gap-2">
                {semesterOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setApplySemester(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      applySemester === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                <Trophy className="inline h-4 w-4 mr-1" />
                희망 학교 (1~5순위)
              </Label>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <SchoolAutocomplete
                    key={i}
                    rank={i + 1}
                    required={i === 0}
                    value={schoolChoices[i]}
                    onChange={(v) => updateSchoolChoice(i, v)}
                    exclude={schoolChoices.filter(
                      (s, idx) => idx !== i && s !== "",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <Button
          className="w-full"
          size="lg"
          disabled={!canSubmitTranscript}
          onClick={handleTranscriptSubmit}
        >
          <Upload className="h-4 w-4 mr-2" />
          제출하기
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-3">
          ※ 제출 후 랭킹 테이블을 확인할 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default ApplicationDBPage;
