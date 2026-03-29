'use client';
// CommunityPage.tsx
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ShoppingBag, Users, HelpCircle, BookOpen, ChevronDown, FileText, Home, Wallet, Wifi, ShieldCheck, GraduationCap, Compass, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

type StageFilter = "pre_assign" | "pre_depart" | "abroad" | "returned";
type TypeFilter = "question" | "trade" | "companion" | "info" | "all";
type TopicFilter = "all" | "행정·비자" | "주거" | "재정" | "통신" | "보험·의료" | "학업" | "생활·적응" | "기타";

interface MockPost {
  id: number;
  title: string;
  stage: StageFilter;
  region: string;
  type: TypeFilter;
  topic?: TopicFilter;
  school?: string;
  author: string;
  date: string;
  comments: number;
  tradeDone?: boolean;
}

const mockPosts: MockPost[] = [
  { id: 1, title: "독일 뮌헨대 기숙사 신청 방법 아시는 분?", stage: "pre_depart", region: "유럽", type: "question", topic: "주거", school: "뮌헨대학교", author: "민지", date: "2026.02.20", comments: 5 },
  { id: 2, title: "파리 원룸 짐 정리 물품 팝니다", stage: "abroad", region: "유럽", type: "trade", school: "소르본대학교", author: "수빈", date: "2026.02.19", comments: 3, tradeDone: true },
  { id: 3, title: "바르셀로나 3월 여행 동행 구합니다", stage: "abroad", region: "유럽", type: "companion", school: "바르셀로나대학교", author: "하연", date: "2026.02.18", comments: 8 },
  { id: 4, title: "UCLA 수강신청 팁 공유합니다", stage: "pre_assign", region: "북미", type: "question", topic: "학업", school: "UCLA", author: "지은", date: "2026.02.17", comments: 12 },
  { id: 5, title: "도쿄대 비자 서류 질문이요!", stage: "pre_depart", region: "아시아", type: "question", topic: "행정·비자", school: "도쿄대학교", author: "채원", date: "2026.02.16", comments: 2 },
  { id: 6, title: "런던 한인마트 근처 물품 교환해요", stage: "abroad", region: "유럽", type: "trade", school: "UCL", author: "소연", date: "2026.02.15", comments: 1 },
  { id: 7, title: "귀국 후 학점 이전 절차 정리합니다", stage: "returned", region: "유럽", type: "info", topic: "학업", author: "예진", date: "2026.02.14", comments: 9 },
  { id: 8, title: "귀국 후 역적응 극복 팁 공유해요", stage: "returned", region: "북미", type: "info", topic: "생활·적응", author: "서윤", date: "2026.02.13", comments: 6 },
  { id: 9, title: "독일 학생비자 신청 절차 총정리", stage: "pre_depart", region: "유럽", type: "info", topic: "행정·비자", author: "예진", date: "2026.02.22", comments: 4 },
  { id: 10, title: "유럽 현지 유심 vs eSIM 비교", stage: "abroad", region: "유럽", type: "info", topic: "통신", author: "하연", date: "2026.02.18", comments: 7 },
  { id: 11, title: "미국 유학생 보험 가입 가이드", stage: "pre_depart", region: "북미", type: "info", topic: "보험·의료", author: "지은", date: "2026.02.17", comments: 3 },
];

const typeIcon: Record<string, React.ReactNode> = {
  question: <HelpCircle className="h-3.5 w-3.5" />,
  trade: <ShoppingBag className="h-3.5 w-3.5" />,
  companion: <Users className="h-3.5 w-3.5" />,
  info: <BookOpen className="h-3.5 w-3.5" />,
};

const typeLabel: Record<string, string> = {
  question: "질문",
  trade: "중고거래",
  companion: "동행",
  info: "정보",
};

const topicOptions: TopicFilter[] = ["all", "행정·비자", "주거", "재정", "통신", "보험·의료", "학업", "생활·적응", "기타"];

const topicIconMap: Record<string, React.ReactNode> = {
  "행정·비자": <FileText className="h-3 w-3" />,
  "주거": <Home className="h-3 w-3" />,
  "재정": <Wallet className="h-3 w-3" />,
  "통신": <Wifi className="h-3 w-3" />,
  "보험·의료": <ShieldCheck className="h-3 w-3" />,
  "학업": <GraduationCap className="h-3 w-3" />,
  "생활·적응": <Compass className="h-3 w-3" />,
  "기타": <MoreHorizontal className="h-3 w-3" />,
};

const stageLabelMap: Record<string, string> = {
  pre_assign: "배정 전",
  pre_depart: "파견 전",
  abroad: "파견 중",
  returned: "파견 후",
};

const stageBadgeMap: Record<string, string> = {
  pre_assign: "status-badge-pre",
  pre_depart: "status-badge-pre",
  abroad: "status-badge-abroad",
  returned: "status-badge-returned",
};

const CommunityPage = () => {
  const router = useRouter();
  const [stageFilter, setStageFilter] = useState<StageFilter | "all">("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");
  const [topicOpen, setTopicOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10; // 한 페이지에 보일 글의 개수

  // 필터링 및 검색된 전체 게시글
  const filtered = mockPosts.filter((p) => {
    if (stageFilter !== "all" && p.stage !== stageFilter) return false;
    if (regionFilter !== "all") {
      const regionMap: Record<string, string> = { europe: "유럽", america: "북미", asia: "아시아", oceania: "오세아니아" };
      if (p.region !== regionMap[regionFilter]) return false;
    }
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (topicFilter !== "all" && p.topic !== topicFilter) return false;
    
    if (searchQuery) {
      const normalizedQuery = searchQuery.replace(/\s+/g, "").toLowerCase();
      const normalizedTitle = p.title.replace(/\s+/g, "").toLowerCase();
      
      if (!normalizedTitle.includes(normalizedQuery)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil(filtered.length / postsPerPage);
  
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filtered.slice(indexOfFirstPost, indexOfLastPost);

  const handleFilterChange = (setter: Function, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">커뮤니티</h1>
          <p className="text-muted-foreground text-sm mb-6">교환학생들의 질문, 정보, 중고거래, 동행 모집 공간</p>
        </div>

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground self-center mr-1">상태</span>
            {(["all", "pre_assign", "pre_depart", "abroad", "returned"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleFilterChange(setStageFilter, s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  stageFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s === "all" ? "전체" : stageLabelMap[s]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground self-center mr-1">지역</span>
            {(["all", "europe", "america", "asia", "oceania"] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleFilterChange(setRegionFilter, r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  regionFilter === r
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {r === "all" ? "전체" : r === "europe" ? "유럽" : r === "america" ? "북미" : r === "asia" ? "아시아" : "오세아니아"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground self-center mr-1">유형</span>
            {(["all", "question", "info", "trade", "companion"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  handleFilterChange(setTypeFilter, t);
                  if (t !== "question" && t !== "info") setTopicFilter("all"); 
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t === "all" ? "전체" : typeLabel[t]}
              </button>
            ))}
          </div>

          {(typeFilter === "question" || typeFilter === "info") && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground mr-1">주제</span>
              <div className="relative">
                <button
                  onClick={() => setTopicOpen(!topicOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {topicFilter === "all" ? "전체" : topicFilter}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${topicOpen ? "rotate-180" : ""}`} />
                </button>
                {topicOpen && (
                  <div className="absolute z-50 top-full left-0 mt-1 bg-card border rounded-lg shadow-md min-w-[140px] py-1">
                    {topicOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => { handleFilterChange(setTopicFilter, c); setTopicOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                          topicFilter === c ? "text-primary font-medium" : "text-foreground"
                        }`}
                      >
                        {c === "all" ? "전체" : c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="키워드로 검색..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // 검색어가 바뀌면 1페이지로
                }}
                className="pl-9"
              />
            </div>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              onClick={() => router.push("/community/write")}
            >
              ✍ 글쓰기
            </Button>
          </div>
        </div>

        {/* Post List */}
        <div className="space-y-2 mb-6">
          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">게시글이 없습니다.</div>
          )}
          
          {currentPosts.map((post) => {
            const isQuestionOrInfo = post.type === "question" || post.type === "info";
            
            return (
              <div
                key={post.id}
                className={`card-elevated p-4 cursor-pointer hover:border-primary/30 transition-colors ${
                  isQuestionOrInfo ? "border-l-[3px] border-l-primary/50 bg-primary/[0.03]" : ""
                }`}
                onClick={() => router.push(`/community/${post.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={stageBadgeMap[post.stage]}>
                        {stageLabelMap[post.stage]}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {typeIcon[post.type]}
                        {typeLabel[post.type]}
                      </span>
                      {isQuestionOrInfo && post.topic && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                          {topicIconMap[post.topic]}
                          {post.topic}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {post.region}
                      </span>
                    </div>

                    <h3 className={`text-sm font-semibold truncate ${post.tradeDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {post.title}
                    </h3>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{post.author} · {post.date}</p>
                    <p className="text-xs text-muted-foreground mt-1">💬 {post.comments}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이지네이션 UI */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1 mt-6">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`w-8 h-8 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNumber
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CommunityPage;