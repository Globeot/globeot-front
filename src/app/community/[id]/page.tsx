"use client";
// CommunityDetailPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Flag,
  Trash2,
  Edit2,
  Send,
  CornerDownRight,
  FileText,
  Home,
  Wallet,
  Wifi,
  ShieldCheck,
  GraduationCap,
  Compass,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";
import {
  createArticleComment,
  deleteArticle,
  getArticleComments,
  getArticleDetail,
  scrapArticle,
  unscrapArticle,
  reportArticle,
  type CommentItem,
} from "../../../lib/article";

type StageFilter = "pre_assign" | "pre_depart" | "abroad" | "returned";
type TopicFilter =
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
  content: string;
  stage: StageFilter;
  region: string;
  type: "question" | "trade" | "companion" | "info";
  topic?: TopicFilter;
  author: string;
  date: string;
  views: number;
  comments: number;
  isScraped?: boolean;
  isAuthor?: boolean;
};

type UiComment = {
  id: number | string;
  author: string;
  content: string;
  date: string;
  parentId?: number | string;
};

const typeLabel: Record<string, string> = {
  question: "질문",
  trade: "중고거래",
  companion: "동행",
  info: "정보",
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

function mapType(value?: string): "question" | "trade" | "companion" | "info" {
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

function toUiComment(comment: CommentItem): UiComment {
  return {
    id: comment.id,
    author: comment.authorNickname ?? "익명",
    content: comment.content,
    date: formatDate(comment.createdAt),
    parentId: comment.parentId ?? undefined,
  };
}

const CommunityDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [post, setPost] = useState<UiPost | null>(null);
  const [comments, setComments] = useState<UiComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError("");

        const [detailData, commentData] = await Promise.all([
          getArticleDetail(String(id)),
          getArticleComments(String(id)),
        ]);

        const article = detailData.result;

        const mappedPost: UiPost = {
          id: article.id,
          title: article.title,
          content: article.content,
          stage: mapStage(article.exchangeStatus),
          region: mapRegion(article.region),
          type: mapType(article.type),
          topic: mapTopic(article.topic),
          author: article.authorNickname ?? "익명",
          date: formatDate(article.createdAt),
          views: article.viewCount ?? 0,
          comments: article.commentCount ?? 0,
          isScraped: article.isScrapped ?? article.scrapped ?? false,
          isAuthor: article.isAuthor ?? article.author ?? false,
        };

        setPost(mappedPost);
        setIsBookmarked(!!(article.isScrapped ?? article.scrapped));
        setComments((commentData.result ?? []).map(toUiComment));
      } catch (err) {
        console.error("게시글 상세 조회 실패:", err);
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !id) return;

    try {
      setCommentSubmitting(true);

      await createArticleComment(String(id), {
        content: commentText.trim(),
        parentId: replyTo ?? undefined,
      });

      const commentData = await getArticleComments(String(id));
      const nextComments = (commentData.result ?? []).map(toUiComment);

      setComments(nextComments);
      setCommentText("");
      setReplyTo(null);

      setPost((prev) =>
        prev ? { ...prev, comments: nextComments.length } : prev
      );
    } catch (err) {
      console.error("댓글 작성 실패:", err);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleToggleScrap = async () => {
    if (!id) return;

    try {
      if (isBookmarked) {
        await unscrapArticle(String(id));
        setIsBookmarked(false);
        setPost((prev) => (prev ? { ...prev, isScraped: false } : prev));
      } else {
        await scrapArticle(String(id));
        setIsBookmarked(true);
        setPost((prev) => (prev ? { ...prev, isScraped: true } : prev));
      }
    } catch (err) {
      console.error("스크랩 처리 실패:", err);
      alert("스크랩 처리에 실패했습니다.");
    }
  };

  const handleDeleteArticle = async () => {
    if (!id) return;
    const ok = window.confirm("이 게시글을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await deleteArticle(String(id));
      alert("게시글이 삭제됐습니다.");
      router.push("/community");
    } catch (err) {
      console.error("게시글 삭제 실패:", err);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const topLevelComments = useMemo(
    () => comments.filter((c) => !c.parentId),
    [comments]
  );

  const getReplies = (parentId: number | string) =>
    comments.filter((c) => c.parentId === parentId);

  if (loading) {
    return (
      <div className="py-10">
        <div className="container-tight text-center text-muted-foreground">
          게시글 불러오는 중...
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-10">
        <div className="container-tight text-center text-destructive">
          {error || "게시글을 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

const handleReportArticle = async () => {
  if (!id) return;

  const ok = window.confirm("이 게시글을 신고하시겠습니까?");
  if (!ok) return;

  try {
    console.log("신고 요청 articleId:", String(id));
    console.log("accessToken 존재 여부:", !!localStorage.getItem("accessToken"));

    await reportArticle(String(id));
    alert("게시글을 신고했습니다.");
  } catch (err) {
    console.error("게시글 신고 실패:", err);
    alert(
      err instanceof Error
        ? err.message
        : "게시글 신고에 실패했습니다."
    );
  }
};

  const isQuestionOrInfo = post.type === "question" || post.type === "info";
  const isCommentEmpty = !commentText.trim();

  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight">
        <button
          onClick={() => router.push("/community")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          목록으로
        </button>

        <article
          className={`card-elevated p-5 sm:p-6 ${
            isQuestionOrInfo ? "border-l-[3px] border-l-primary/50 bg-primary/[0.03]" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-3.5 flex-wrap">
            <span className={stageBadgeMap[post.stage]}>
              {stageLabelMap[post.stage]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
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

          

          <h1 className="text-lg sm:text-2xl font-bold text-foreground mb-3">
            {post.title}
          </h1>

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{post.author}</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>조회 {post.views}</span>
              <span>💬 {post.comments}</span>
            </div>
          </div>

          <Separator className="mb-5" />

<div 
  className="article-content text-sm sm:text-base text-foreground leading-relaxed mb-8 max-w-none"
  dangerouslySetInnerHTML={{ __html: post.content }} 
/>

<style>{`
  .article-content h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; display: block; }
  .article-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0; display: block; }
  .article-content h3 { font-size: 1.25em; font-weight: 600; margin: 0.83em 0; display: block; }

  .article-content ul {
    list-style-type: disc;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  .article-content ol {
    list-style-type: decimal;
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  .article-content li {
    display: list-item;
    margin: 0.25em 0;
  }

  .article-content strong {
    font-weight: 700;
  }

  .article-content em {
    font-style: italic;
  }
`}</style>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleToggleScrap}
              className="rounded-full"
            >
              <Bookmark className={`h-4 w-4 mr-1.5 ${isBookmarked ? "fill-current" : ""}`} />
              {isBookmarked ? "스크랩됨" : "스크랩"}
            </Button>

           <Button
  variant="outline"
  size="sm"
  className="rounded-full"
  onClick={handleReportArticle}
>
  <Flag className="h-4 w-4 mr-1.5 text-destructive" />
  신고
</Button>
<div className="flex-1" />

  {post.isAuthor && (
    <>
<Button
  variant="ghost"
  size="sm"
  className="text-muted-foreground rounded-full"
  onClick={() => {
    if (!id) return;
    router.push(`/community/${id}/edit`);
  }}
>
  <Edit2 className="h-4 w-4 mr-1.5" />
  수정
</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive rounded-full hover:bg-destructive/10"
                  onClick={handleDeleteArticle}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  삭제
                </Button>
              </>
            )}
          </div>
        </article>

        <div className="mt-8">
          <h2 className="text-base font-bold text-foreground mb-5">댓글 {comments.length}</h2>

          <div className="space-y-3">
            {topLevelComments.map((comment) => (
              <div key={String(comment.id)}>
                <div className="card-elevated p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{comment.date}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{comment.content}</p>
                  <button
                    onClick={() => {
                      setReplyTo(replyTo === comment.id ? null : comment.id);
                      setCommentText("");
                    }}
                    className="text-xs text-primary mt-2.5 hover:underline font-medium"
                  >
                    답글 달기
                  </button>
                </div>

                {getReplies(comment.id).map((reply) => (
                  <div
                    key={String(reply.id)}
                    className="ml-6 mt-2 card-elevated p-4 border-l-2 border-primary/20 bg-muted/30"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{reply.author}</span>
                      <span className="text-xs text-muted-foreground">{reply.date}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{reply.content}</p>
                  </div>
                ))}

                {replyTo === comment.id && (
                  <div className="ml-6 mt-2 flex gap-2">
                    <Input
                      placeholder={`${comment.author}님에게 답글 입력...`}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
                      className="text-sm bg-card"
                    />
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      className="shrink-0"
                      disabled={isCommentEmpty || commentSubmitting}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-5 bg-card p-3 rounded-xl border shadow-sm">
            <Input
              placeholder={replyTo !== null ? "답글을 입력하세요..." : "댓글을 입력하세요..."}
              value={replyTo === null ? commentText : ""}
              onChange={(e) => {
                if (replyTo === null) setCommentText(e.target.value);
              }}
              onKeyDown={(e) => {
                if (replyTo === null && e.key === "Enter") handleSubmitComment();
              }}
              className="bg-muted/50 border-none"
            />
            <Button
              onClick={() => {
                if (replyTo === null) handleSubmitComment();
              }}
              disabled={replyTo !== null || isCommentEmpty || commentSubmitting}
              className="shrink-0"
            >
              <Send className="h-4 w-4 mr-1.5" />
              등록
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailPage;