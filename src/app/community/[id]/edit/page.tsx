"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  ArrowLeft,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  FileText,
  Home,
  Wallet,
  Wifi,
  ShieldCheck,
  GraduationCap,
  Compass,
  MoreHorizontal,
  Save,
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Separator } from "../../../../components/ui/separator";
import {
  getArticleDetail,
  updateArticle,
  type RegionType,
  type ArticleType,
  type ExchangeStatus,
} from "../../../../lib/article";

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

const stageOptions = [
  { value: "pre_assign", label: "배정 전" },
  { value: "pre_depart", label: "파견 전" },
  { value: "abroad", label: "파견 중" },
  { value: "returned", label: "파견 후" },
];

const regionOptions = ["유럽", "북미", "아시아", "오세아니아", "기타"];

const typeOptions = [
  { value: "question", label: "질문" },
  { value: "info", label: "정보" },
  { value: "trade", label: "중고거래" },
  { value: "companion", label: "동행" },
];

const topicOptions: TopicFilter[] = [
  "행정·비자",
  "주거",
  "재정",
  "통신",
  "보험·의료",
  "학업",
  "생활·적응",
  "기타",
];

const typeLabel: Record<string, string> = {
  question: "질문",
  trade: "중고거래",
  companion: "동행",
  info: "정보",
};

const stageLabelMap: Record<StageFilter, string> = {
  pre_assign: "배정 전",
  pre_depart: "파견 전",
  abroad: "파견 중",
  returned: "파견 후",
};

const stageBadgeMap: Record<StageFilter, string> = {
  pre_assign: "status-badge-pre",
  pre_depart: "status-badge-pre",
  abroad: "status-badge-abroad",
  returned: "status-badge-returned",
};

const topicIconMap: Record<TopicFilter, React.ReactNode> = {
  "행정·비자": <FileText className="h-3 w-3" />,
  "주거": <Home className="h-3 w-3" />,
  "재정": <Wallet className="h-3 w-3" />,
  "통신": <Wifi className="h-3 w-3" />,
  "보험·의료": <ShieldCheck className="h-3 w-3" />,
  "학업": <GraduationCap className="h-3 w-3" />,
  "생활·적응": <Compass className="h-3 w-3" />,
  "기타": <MoreHorizontal className="h-3 w-3" />,
};

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btn = (active: boolean) =>
    `p-2 rounded-lg transition-colors flex items-center justify-center ${
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-muted"
    }`;

  return (
    <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/20">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={btn(editor.isActive("heading", { level: 1 }))}
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive("heading", { level: 3 }))}
      >
        <Heading3 className="h-4 w-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1 my-auto" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
      >
        <Italic className="h-4 w-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1 my-auto" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
      >
        <List className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
      >
        <ListOrdered className="h-4 w-4" />
      </button>
    </div>
  );
};

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("ko-KR");
}

function mapStageFromApi(value?: string): StageFilter {
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

function mapTypeFromApi(value?: string): "question" | "trade" | "companion" | "info" {
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

function mapTopicFromApi(value?: string): TopicFilter | undefined {
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

function mapRegionFromApi(value?: string): string {
  const regionMap: Record<string, string> = {
    EUROPE: "유럽",
    AMERICA: "북미",
    ASIA: "아시아",
    OCEANIA: "오세아니아",
    ETC: "기타",
  };

  return regionMap[value ?? ""] ?? value ?? "기타";
}

function mapTopicToApi(value: string): string {
  const map: Record<string, string> = {
    "행정·비자": "VISA",
    "주거": "HOUSING",
    "재정": "FINANCE",
    "통신": "COMMUNICATION",
    "보험·의료": "MEDICAL",
    "학업": "STUDY",
    "생활·적응": "LIFE",
    "기타": "ETC",
  };
  return map[value] ?? "ETC";
}

function mapRegionToApi(value: string): RegionType {
  const map: Record<string, RegionType> = {
    유럽: "EUROPE",
    북미: "AMERICA",
    아시아: "ASIA",
    오세아니아: "OCEANIA",
    기타: "ETC",
  };
  return map[value] ?? "ETC";
}

function mapTypeToApi(value: string): ArticleType {
  const map: Record<string, ArticleType> = {
    question: "QUESTION",
    info: "INFO",
    trade: "TRADE",
    companion: "COMPANION",
  };
  return map[value] ?? "QUESTION";
}

function mapStageToApi(value: string): ExchangeStatus {
  const map: Record<string, ExchangeStatus> = {
    pre_assign: "APPLYING",
    pre_depart: "PRE_DEPARTURE",
    abroad: "ABROAD",
    returned: "RETURNED",
  };
  return map[value] ?? "APPLYING";
}

export default function CommunityEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [stage, setStage] = useState<StageFilter>("pre_assign");
  const [region, setRegion] = useState("");
  const [type, setType] = useState<"question" | "trade" | "companion" | "info">("question");
  const [topic, setTopic] = useState<TopicFilter | "">("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contentLength, setContentLength] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "내용은 10자 이상 입력해주세요.",
        showOnlyWhenEditable: true,
      }),
      Image,
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "max-w-none min-h-[450px] p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const pureText = editor.getText().replace(/\n/g, "").replace(/\s+/g, "").trim();
      setContentLength(pureText.length);
    },
  });

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id || !editor) return;

      try {
        setLoading(true);
        const detailData = await getArticleDetail(String(id));
        const article = detailData.result;

        setTitle(article.title ?? "");
        setStage(mapStageFromApi(article.exchangeStatus));
        setRegion(mapRegionFromApi(article.region));
        setType(mapTypeFromApi(article.type));
        setTopic(mapTopicFromApi(article.topic) ?? "");
        setAuthor(article.authorNickname ?? "익명");
        setDate(formatDate(article.createdAt));
        setViews(article.viewCount ?? 0);
        setComments(article.commentCount ?? 0);

        editor.commands.setContent(article.content ?? "");

        const plain = (article.content ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, "").trim();
        setContentLength(plain.length);
      } catch (error) {
        console.error("게시글 수정용 데이터 조회 실패:", error);
        alert("게시글 정보를 불러오지 못했습니다.");
        router.push("/community");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, editor, router]);

  const isQuestionOrInfo = type === "question" || type === "info";

  const isBaseInfoValid = !!(stage && region && type);
  const isTopicValid = !isQuestionOrInfo || !!topic;
  const isTitleValid = title.trim().length > 0;
  const isContentValid = contentLength >= 10;

  const canSubmit =
    isBaseInfoValid &&
    isTopicValid &&
    isTitleValid &&
    isContentValid &&
    !submitting;

  const previewHtml = useMemo(() => editor?.getHTML() ?? "", [editor, contentLength]);

  const handleSubmit = async () => {
    if (!id || !editor || !canSubmit) return;

    try {
      setSubmitting(true);

      const requestBody = {
        title: title.trim(),
        content: editor.getHTML(),
        region: mapRegionToApi(region),
        type: mapTypeToApi(type),
        exchangeStatus: mapStageToApi(stage),
        topic: isQuestionOrInfo && topic ? mapTopicToApi(topic) : "ETC",
      };

      console.log("게시글 수정 요청 body:", requestBody);

      await updateArticle(String(id), requestBody);

      alert("게시글이 수정되었습니다.");
      router.push(`/community/${id}`);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      alert("게시글 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10">
        <div className="container-tight text-center text-muted-foreground">
          게시글 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight">
        <button
          onClick={() => router.push(`/community/${id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          상세로
        </button>

        <article
          className={`card-elevated p-5 sm:p-6 ${
            isQuestionOrInfo ? "border-l-[3px] border-l-primary/50 bg-primary/[0.03]" : ""
          }`}
        >
          <div className="flex items-center gap-2 mb-3.5 flex-wrap">
            <span className={stageBadgeMap[stage]}>
              {stageLabelMap[stage]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {typeLabel[type]}
            </span>
            {isQuestionOrInfo && topic && (
              <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                {topicIconMap[topic]}
                {topic}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {region}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                상태 *
              </label>
              <div className="flex flex-wrap gap-2">
                {stageOptions.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStage(s.value as StageFilter)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      stage === s.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                지역 *
              </label>
              <div className="flex flex-wrap gap-2">
                {regionOptions.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      region === r
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                유형 *
              </label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setType(t.value as "question" | "trade" | "companion" | "info");
                      if (t.value !== "info" && t.value !== "question") {
                        setTopic("");
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      type === t.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {isQuestionOrInfo && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  주제 *
                </label>
                <div className="flex flex-wrap gap-2">
                  {topicOptions.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        topic === t
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Input
            placeholder="제목을 입력하세요 *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg h-14 bg-background border border-input pl-5 focus-visible:ring-1 focus-visible:ring-primary mb-3"
          />

          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{author}</span>
              <Separator orientation="vertical" className="h-3" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>조회 {views}</span>
              <span>💬 {comments}</span>
            </div>
          </div>

          <Separator className="mb-5" />

          <div className="rounded-xl border bg-card overflow-hidden shadow-sm mb-6">
            {editor && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => router.push(`/community/${id}`)}
            >
              취소
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              <Save className="h-4 w-4 mr-1.5" />
              {submitting ? "수정 중..." : "수정 완료"}
            </Button>
          </div>
        </article>
      </div>

      <style>{`
        .ProseMirror h1 { font-size: 2em !important; font-weight: 700 !important; margin: 0.67em 0 !important; display: block !important; }
        .ProseMirror h2 { font-size: 1.5em !important; font-weight: 700 !important; margin: 0.75em 0 !important; display: block !important; }
        .ProseMirror h3 { font-size: 1.25em !important; font-weight: 600 !important; margin: 0.83em 0 !important; display: block !important; }
        .ProseMirror ul { list-style-type: disc !important; padding-left: 1.5em !important; margin: 0.5em 0 !important; }
        .ProseMirror ol { list-style-type: decimal !important; padding-left: 1.5em !important; margin: 0.5em 0 !important; }
        .ProseMirror li { display: list-item !important; margin: 0.25em 0 !important; }
        .ProseMirror strong { font-weight: 700 !important; }
        .ProseMirror em { font-style: italic !important; }
        .ProseMirror:focus { outline: none; }

        .ProseMirror p.is-editor-empty:first-child::before {
          color: #cbd5e1 !important;
          font-size: 0.875rem !important;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-style: normal !important;
          font-weight: 400 !important;
        }

        .article-content h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; display: block; }
        .article-content h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0; display: block; }
        .article-content h3 { font-size: 1.25em; font-weight: 600; margin: 0.83em 0; display: block; }
        .article-content ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
        .article-content ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
        .article-content li { display: list-item; margin: 0.25em 0; }
        .article-content strong { font-weight: 700; }
        .article-content em { font-style: italic; }
      `}</style>
    </div>
  );
}