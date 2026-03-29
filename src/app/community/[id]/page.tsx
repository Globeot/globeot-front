'use client';
// CommunityDetailPage.tsx
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, Flag, Trash2, Edit2, Send, CornerDownRight, FileText, Home, Wallet, Wifi, ShieldCheck, GraduationCap, Compass, MoreHorizontal } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Separator } from "../../../components/ui/separator";

type StageFilter = "pre_assign" | "pre_depart" | "abroad" | "returned";
type TopicFilter = "행정·비자" | "주거" | "재정" | "통신" | "보험·医疗" | "학업" | "생활·적응" | "기타";

interface Comment {
  id: number;
  author: string;
  content: string;
  date: string;
  parentId?: number;
}

const mockPost = {
  id: 1,
  title: "독일 뮌헨대 기숙사 신청 방법 아시는 분?",
  content:
    "안녕하세요! 2026년 1학기에 뮌헨대로 교환 예정인데, 기숙사 신청 절차가 궁금합니다.\n\n기숙사 종류가 여러 개라고 들었는데 어떤 걸 추천하시나요? Studentenwerk 기숙사랑 사설 기숙사 중에 고민하고 있어요.\n\n경험 있으신 분 공유해주시면 감사하겠습니다!",
  stage: "pre_depart" as StageFilter,
  region: "유럽",
  type: "question",
  topic: "주거" as TopicFilter,
  author: "민지",
  date: "2026.02.20",
  views: 128,
  comments: 5,
};

const mockComments: Comment[] = [
  { id: 1, author: "수빈", content: "저는 Studentenwerk 기숙사 갔었는데 가격이 훨씬 저렴해요! 다만 신청이 빨라야 해요.", date: "2026.02.20" },
  { id: 2, author: "하연", content: "저도 궁금합니다! 기숙사 신청 시기가 언제쯤인가요?", date: "2026.02.20" },
  { id: 3, author: "민지", content: "보통 합격 통보 받고 바로 신청하는 게 좋대요!", date: "2026.02.21", parentId: 2 },
  { id: 4, author: "지은", content: "사설 기숙사도 나쁘지 않아요. 시설이 더 좋은 편이에요.", date: "2026.02.21" },
  { id: 5, author: "채원", content: "뮌헨은 주거 구하기 정말 어렵다고 들었어요. 기숙사가 맞을 것 같아요.", date: "2026.02.22" },
];

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
  "보험·医疗": <ShieldCheck className="h-3 w-3" />,
  "학업": <GraduationCap className="h-3 w-3" />,
  "생활·적응": <Compass className="h-3 w-3" />,
  "기타": <MoreHorizontal className="h-3 w-3" />,
};

const CommunityDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [comments, setComments] = useState(mockComments);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const post = mockPost;
  const isQuestionOrInfo = post.type === "question" || post.type === "info";

  const isCommentEmpty = !commentText.trim();

  const handleSubmitComment = () => {
    if (isCommentEmpty) return;

    const newComment: Comment = {
      id: comments.length + 1,
      author: "나",
      content: commentText,
      date: "2026.02.22",
      parentId: replyTo ?? undefined,
    };
    setComments([...comments, newComment]);
    setCommentText("");
    setReplyTo(null);
  };

  const topLevelComments = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: number) => comments.filter((c) => c.parentId === parentId);

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

        {/* 게시글 영역 */}
        <article className={`card-elevated p-5 sm:p-6 ${
          isQuestionOrInfo ? "border-l-[3px] border-l-primary/50 bg-primary/[0.03]" : ""
        }`}>
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

          <h1 className="text-lg sm:text-2xl font-bold text-foreground mb-3">{post.title}</h1>

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

          <div className="text-sm sm:text-base text-foreground leading-relaxed whitespace-pre-line mb-8">
            {post.content}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="rounded-full"
            >
              <Bookmark className={`h-4 w-4 mr-1.5 ${isBookmarked ? "fill-current" : ""}`} />
              {isBookmarked ? "스크랩됨" : "스크랩"}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full">
              <Flag className="h-4 w-4 mr-1.5 text-destructive" />
              신고
            </Button>
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full">
              <Edit2 className="h-4 w-4 mr-1.5" />
              수정
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive rounded-full hover:bg-destructive/10">
              <Trash2 className="h-4 w-4 mr-1.5" />
              삭제
            </Button>
          </div>
        </article>

        {/* 댓글 영역 */}
        <div className="mt-8">
          <h2 className="text-base font-bold text-foreground mb-5">댓글 {comments.length}</h2>

          <div className="space-y-3">
            {topLevelComments.map((comment) => (
              <div key={comment.id}>
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
                  <div key={reply.id} className="ml-6 mt-2 card-elevated p-4 border-l-2 border-primary/20 bg-muted/30">
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
                      disabled={isCommentEmpty}
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
              onChange={(e) => { if (replyTo === null) setCommentText(e.target.value); }}
              onKeyDown={(e) => { if (replyTo === null && e.key === "Enter") handleSubmitComment(); }}
              className="bg-muted/50 border-none"
            />
            <Button 
              onClick={() => { if (replyTo === null) handleSubmitComment(); }} 
              disabled={replyTo !== null || isCommentEmpty} // 💡 대댓글 모드이거나 비어있으면 비활성화
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