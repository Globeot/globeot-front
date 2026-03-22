'use client';
// CommunityWritePage.tsx
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { ArrowLeft, Bold, Italic, List, ListOrdered, ImageIcon, Heading2, Search, ChevronDown } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const stageOptions = [
  { value: "pre_assign", label: "배정 전" },
  { value: "pre_depart", label: "파견 전" },
  { value: "abroad", label: "파견 중" },
  { value: "returned", label: "파견 후" },
];

const regionOptions = ["유럽", "북미", "아시아", "오세아니아", "기타"];

const allSchools = [
  "뮌헨대학교", "소르본대학교", "UCLA", "바르셀로나대학교", "도쿄대학교", "UCL",
  "베를린자유대학교", "하이델베르크대학교", "옥스퍼드대학교", "케임브리지대학교",
];

const typeOptions = [
  { value: "question", label: "질문" },
  { value: "info", label: "정보" },
  { value: "trade", label: "중고거래" },
  { value: "companion", label: "동행" },
];

const topicOptions = ["행정·비자", "주거", "재정", "통신", "보험·의료", "학업", "생활·적응", "기타"];

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `p-2 rounded-lg transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`;

  const addImage = () => {
    const url = window.prompt("이미지 URL을 입력하세요");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 border-b p-2">
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))}>
        <Heading2 className="h-4 w-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>
        <Bold className="h-4 w-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>
        <Italic className="h-4 w-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>
        <List className="h-4 w-4" />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}>
        <ListOrdered className="h-4 w-4" />
      </button>
      <button onClick={addImage} className={btnClass(false)}>
        <ImageIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

const SchoolAutocomplete = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query
    ? allSchools.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : allSchools;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="학교명 검색..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="pl-9"
        />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-md max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); onChange(s); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && query && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-md p-3 text-sm text-muted-foreground">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
};

const TopicDropdown = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
      >
        {value || "주제 선택 *"}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-card border rounded-lg shadow-md min-w-[140px] py-1">
          {topicOptions.map((t) => (
            <button
              key={t}
              onClick={() => { onChange(t); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                value === t ? "text-primary font-medium" : "text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CommunityWritePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [topic, setTopic] = useState("");
  const [school, setSchool] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "내용을 입력하세요..." }),
      Image,
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none",
      },
    },
  });

  const canSubmit = title.trim() && stage && region && type && (type !== "info" || topic) && editor && !editor.isEmpty;

  const handleSubmit = () => {
    if (!canSubmit) return;
    router.push("/community");
  };

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

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">글쓰기</h1>

          <div className="space-y-4 mb-6">
            {/* Row 1: 상태 + 지역 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">상태 *</label>
                <div className="flex flex-wrap gap-2">
                  {stageOptions.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStage(s.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        stage === s.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">지역 *</label>
                <div className="flex flex-wrap gap-2">
                  {regionOptions.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRegion(r)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        region === r
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: 유형 + 주제 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">유형 *</label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => { setType(t.value); if (t.value !== "info") setTopic(""); }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        type === t.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {type === "info" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">주제 *</label>
                  <TopicDropdown value={topic} onChange={setTopic} />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">학교 (선택)</label>
              <SchoolAutocomplete value={school} onChange={setSchool} />
            </div>
          </div>

          <Input
            placeholder="제목을 입력하세요 *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4 text-base font-medium"
          />

          <div className="card-elevated overflow-hidden mb-6">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => router.push("/community")}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              게시하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityWritePage;
