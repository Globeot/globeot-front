"use client";
// CommunityPage.tsx
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  Users,
  HelpCircle,
  BookOpen,
  ChevronDown,
  FileText,
  Home,
  Wallet,
  Wifi,
  ShieldCheck,
  GraduationCap,
  Compass,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { getArticles, type ArticleItem } from "../../lib/article";

type StageFilter = "pre_assign" | "pre_depart" | "abroad" | "returned";
type TypeFilter = "question" | "trade" | "companion" | "info" | "all";
type TopicFilter =
  | "all"
  | "행정·비자"
  | "주거"
  | "재정"
  | "통신"
  | "보험·의료"
  | "학업"
  | "생활·적응"
  | "기타";

type UiPost = {
  id: number | string;
  title: string;
  stage: StageFilter;
  region: string;
  type: Exclude<TypeFilter, "all">;
  topic?: TopicFilter;
  school?: string;
  author: string;
  date: string;
  comments: number;
  tradeDone?: boolean;
};

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

const topicOptions: TopicFilter[] = [
  "all",
  "행정·비자",
  "주거",
  "재정",
  "통신",
  "보험·의료",
  "학업",
  "생활·적응",
  "기타",
];

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

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("ko-KR");
}

function mapStage(value?: string): StageFilter {
  switch (value) {
    case "APPLYING":
      return "pre_assign";
    case "PRE_DEPARTURE":
      return "pre_depart";
    case "ABROAD":
      return "abroad";
    case "RETURNED":
      return "returned";
    default:
      return "pre_assign";
  }
}

function mapType(value?: string): Exclude<TypeFilter, "all"> {
  switch (value) {
    case "QUESTION":
      return "question";
    case "INFO":
      return "info";
    case "TRADE":
      return "trade";
    case "COMPANION":
      return "companion";
    default:
      return "question";
  }
}

function mapTopic(value?: string): TopicFilter | undefined {
  if (!value) return undefined;

  const topicMap: Record<string, TopicFilter> = {
    VISA: "행정·비자",
    HOUSING: "주거",
    FINANCE: "재정",
    COMMUNICATION: "통신",
    MEDICAL: "보험·의료",
    STUDY: "학업",
    LIFE: "생활·적응",
    ETC: "기타",

    "행정·비자": "행정·비자",
    주거: "주거",
    재정: "재정",
    통신: "통신",
    "보험·의료": "보험·의료",
    학업: "학업",
    "생활·적응": "생활·적응",
    기타: "기타",
  };

  return topicMap[value];
}

function mapRegion(value?: string): string {
  const regionMap: Record<string, string> = {
    EUROPE: "유럽",
    AMERICA: "북미",
    ASIA: "아시아",
    OCEANIA: "오세아니아",
  };

  return regionMap[value ?? ""] ?? value ?? "기타";
}

function toUiPost(article: ArticleItem): UiPost {
  return {
    id: article.id,
    title: article.title ?? "제목 없음",
    stage: mapStage(article.exchangeStatus),
    region: mapRegion(article.region),
    type: mapType(article.type),
    topic: mapTopic(article.topic),
    school: undefined,
    author: article.authorNickname ?? "익명",
    date: formatDate(article.createdAt),
    comments: article.commentCount ?? 0,
    tradeDone: article.articleStatus === "CLOSED",
  };
}

const CommunityPage = () => {
  const router = useRouter();

  const [stageFilter, setStageFilter] = useState<StageFilter | "all">("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [topicFilter, setTopicFilter] = useState<TopicFilter>("all");
  const [topicOpen, setTopicOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [posts, setPosts] = useState<UiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getArticles(currentPage - 1, postsPerPage);
        const content = data.result?.content ?? [];

        setPosts(content.map(toUiPost));
        setTotalPages(data.result?.totalPages ?? 1);
      } catch (err) {
        console.error("게시글 목록 조회 실패:", err);
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage]);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (stageFilter !== "all" && p.stage !== stageFilter) return false;

      if (regionFilter !== "all") {
        const regionMap: Record<string, string> = {
          europe: "유럽",
          america: "북미",
          asia: "아시아",
          oceania: "오세아니아",
        };
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
  }, [posts, stageFilter, regionFilter, typeFilter, topicFilter, searchQuery]);

  const currentPosts = filtered;

  const handleFilterChange = (setter: Function, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">커뮤니티</h1>
          <p className="text-muted-foreground text-sm mb-6">
            교환학생들의 질문, 정보, 중고거래, 동행 모집 공간
          </p>
        </div>

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
                {r === "all"
                  ? "전체"
                  : r === "europe"
                    ? "유럽"
                    : r === "america"
                      ? "북미"
                      : r === "asia"
                        ? "아시아"
                        : "오세아니아"}
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
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${topicOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {topicOpen && (
                  <div className="absolute z-50 top-full left-0 mt-1 bg-card border rounded-lg shadow-md min-w-[140px] py-1">
                    {topicOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          handleFilterChange(setTopicFilter, c);
                          setTopicOpen(false);
                        }}
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
                  setCurrentPage(1);
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

        <div className="space-y-2 mb-6">
          {loading && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              게시글 불러오는 중...
            </div>
          )}

          {!loading && error && (
            <div className="py-16 text-center text-destructive text-sm">{error}</div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground text-sm">
              게시글이 없습니다.
            </div>
          )}

          {!loading &&
            !error &&
            currentPosts.map((post) => {
              const isInfo = post.type === "info";

              return (
                <div
                  key={String(post.id)}
                  className={`card-elevated p-4 cursor-pointer hover:border-primary/30 transition-colors ${
                    isInfo ? "border-l-[3px] border-l-green-500 bg-emerald-50/30" : ""
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
                        {isInfo && post.topic && (
                          <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                            {topicIconMap[post.topic]}
                            {post.topic}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {post.region}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-semibold truncate ${
                          post.tradeDone ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {post.title}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {post.author} · {post.date}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">💬 {post.comments}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

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