"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import { ko } from "date-fns/locale";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import {
  ArrowLeft, Bold, Italic, List, ListOrdered, ImageIcon,
  Heading1, Heading2, Heading3, Search, ChevronDown, Upload, X, Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Card, CardContent } from "../../../components/ui/card";

import { addDays } from "date-fns";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";

const stageOptions = [
  { value: "pre_assign", label: "배정 전" },
  { value: "pre_depart", label: "파견 전" },
  { value: "abroad",     label: "파견 중" },
  { value: "returned",   label: "파견 후" },
];
const regionOptions = ["유럽", "북미", "아시아", "오세아니아", "기타"];
const defaultSchools = [
  "뮌헨대학교", "소르본대학교", "UCLA", "바르셀로나대학교", "도쿄대학교", "UCL",
  "베를린자유대학교", "하이델베르크대학교", "옥스퍼드대학교", "케임브리지대학교",
];
const typeOptions = [
  { value: "question", label: "질문" },
  { value: "info",     label: "정보" },
  { value: "trade",    label: "중고거래" },
  { value: "companion",label: "동행" },
];
const topicOptions = ["행정·비자", "주거", "재정", "통신", "보험·의료", "학업", "생활·적응", "기타"];

/* ───────────── MenuBar ───────────── */
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;
  const btn = (active: boolean) =>
    `p-2 rounded-lg transition-colors flex items-center justify-center ${
      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
    }`;
  return (
    <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/20">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btn(editor.isActive("heading", { level: 1 }))}><Heading1 className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}><Heading2 className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}><Heading3 className="h-4 w-4" /></button>
      <div className="w-px h-6 bg-border mx-1 my-auto" />
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}><Bold className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><Italic className="h-4 w-4" /></button>
      <div className="w-px h-6 bg-border mx-1 my-auto" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}><List className="h-4 w-4" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}><ListOrdered className="h-4 w-4" /></button>
    </div>
  );
};

/* ───────────── SchoolAutocomplete ───────────── */
const SchoolAutocomplete = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [schools, setSchools] = useState(defaultSchools);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = query ? schools.filter((s) => s.toLowerCase().includes(query.toLowerCase())) : schools;
  const canAdd = query.trim() !== "" && !schools.some((s) => s === query.trim());

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center min-h-[40px] w-full border rounded-md bg-background px-2 py-1 gap-1.5 focus-within:ring-1 focus-within:ring-primary">
        {!value && <Search className="h-4 w-4 text-muted-foreground ml-1 flex-shrink-0" />}
        {value && (
          <div className="inline-flex items-center gap-1 bg-muted text-foreground text-xs font-medium px-2 py-1 rounded-md border flex-shrink-0">
            <span>{value}</span>
            <button type="button" onClick={() => { onChange(""); setQuery(""); }} className="p-0.5 hover:bg-muted-foreground/20 rounded-full">
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        )}
        <input
          placeholder={value ? "" : "학교명 검색..."}
          value={query}
          onChange={(e) => { if (!value) setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent border-0 outline-none focus:ring-0 p-0 text-sm min-w-[60px]"
          disabled={!!value}
        />
      </div>
      {!value && open && (query.trim() !== "" || filtered.length > 0) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-md max-h-56 overflow-y-auto">
          {filtered.map((s) => (
            <button key={s} type="button" onClick={() => { onChange(s); setOpen(false); setQuery(""); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted">{s}</button>
          ))}
          {canAdd && (
            <button type="button" onClick={() => { const n = query.trim(); setSchools(p => [...p, n]); onChange(n); setOpen(false); setQuery(""); }} className="w-full text-left px-3 py-2.5 text-sm text-primary font-medium hover:bg-muted border-t flex items-center gap-1.5">
              <Plus className="h-4 w-4" /><span>"{query}" 추가하기</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ───────────── TopicDropdown ───────────── */
const TopicDropdown = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border bg-card text-xs font-medium text-foreground hover:bg-muted">
        {value || "주제 선택 *"} <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-card border rounded-md shadow-md min-w-[120px] py-1">
          {topicOptions.map((t) => (
            <button key={t} type="button" onClick={() => { onChange(t); setOpen(false); }} className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-muted ${value === t ? "text-primary font-medium" : "text-foreground"}`}>{t}</button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ───────────── TradeStatusDropdown ───────────── */
const TradeStatusDropdown = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${value ? "bg-emerald-50 border-emerald-500 text-emerald-600" : "bg-card text-foreground hover:bg-muted"}`}>
        {value ? "거래 완료" : "거래 중"} <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-card border rounded-md shadow-md min-w-[100px] py-1">
          <button type="button" onClick={() => { onChange(false); setOpen(false); }} className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-muted ${!value ? "text-primary font-medium" : "text-foreground"}`}>거래 중</button>
          <button type="button" onClick={() => { onChange(true); setOpen(false); }} className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-muted ${value ? "text-emerald-600 font-medium" : "text-foreground"}`}>거래 완료</button>
        </div>
      )}
    </div>
  );
};

/* ───────────── 메인 페이지 ───────────── */
const CommunityWritePage = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [stage, setStage] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState("");
  const [topic, setTopic] = useState("");
  const [school, setSchool] = useState("");
  const [isTradeDone, setIsTradeDone] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [contentLength, setContentLength] = useState(0);

  const handleFile = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 5) { alert("최대 5장까지만 업로드 가능합니다."); return; }
    setImages((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [...prev, ...newFiles.map((f) => URL.createObjectURL(f))]);
  };

  const editor = useEditor({
    extensions: [
      StarterKit, 
      Placeholder.configure({ 
        placeholder: "내용은 10자 이상 입력해주세요.",
        showOnlyWhenEditable: true,
      }), 
      Image
    ],
    immediatelyRender: false,
    editorProps: { attributes: { class: "max-w-none min-h-[450px] p-4 focus:outline-none" } },
    onUpdate: ({ editor }) => {
      const pureText = editor.getText()
        .replace(/\n/g, "")
        .replace(/\s+/g, "")
        .trim();
      setContentLength(pureText.length);
    }
  });

  const isQuestionOrInfo = type === "question" || type === "info";
  
  const isBaseInfoValid = !!(stage && region && type);
  const isTopicValid = !isQuestionOrInfo || !!topic;
  const isDateValid = type !== "companion" || !!(dateRange?.from && dateRange?.to);
  const isTitleValid = title.trim().length > 0;
  
  const isContentValid = contentLength >= 10;

  const canSubmit = isBaseInfoValid && isTopicValid && isDateValid && isTitleValid && isContentValid;

  const handleSubmit = () => {
    if (!canSubmit) return;
    console.log("Submit:", { title, stage, region, type, topic, school, isTradeDone, dateRange, content: editor?.getHTML() });
    router.push("/community");
  };

  return (
    <div className="py-6 sm:py-10 bg-background min-h-screen">
      <div className="container-tight max-w-3xl mx-auto px-4">

        <button onClick={() => router.push("/community")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> 목록으로
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">글쓰기</h1>

        <div className="space-y-4">

          {/* 상태 / 지역 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">상태 *</label>
              <div className="flex flex-wrap gap-2">
                {stageOptions.map((s) => (
                  <button key={s.value} onClick={() => setStage(s.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${stage === s.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{s.label}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">지역 *</label>
              <div className="flex flex-wrap gap-2">
                {regionOptions.map((r) => (
                  <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${region === r ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>

          {/* 유형 / 주제 / 판매상태 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">유형 *</label>
              <div className="flex flex-wrap gap-2">
                {typeOptions.map((t) => (
                  <button key={t.value} onClick={() => { setType(t.value); if (t.value !== "info" && t.value !== "question") setTopic(""); if (t.value !== "trade") setIsTradeDone(false); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${type === t.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{t.label}</button>
                ))}
              </div>
            </div>
            {isQuestionOrInfo && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">주제 *</label>
                <TopicDropdown value={topic} onChange={setTopic} />
              </div>
            )}
            {type === "trade" && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">판매 상태</label>
                <TradeStatusDropdown value={isTradeDone} onChange={setIsTradeDone} />
              </div>
            )}
          </div>

          {/* 동행 희망 기간 */}
          {type === "companion" && (
            <div className="space-y-3 pb-6 border-b">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                동행 희망 기간 *
              </label>
              <Card className="w-full sm:w-auto p-0 border shadow-sm">
                <CardContent className="p-2">
                  <DayPicker
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    
                    /* ───────────── 한국어 및 포맷 변경 ───────────── */
                    locale={ko} 
                    formatters={{
                      formatCaption: (date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`,
                    }}

                    /* ───────────── 덜 볼드체 및 커스텀 클래스 ───────────── */
                    classNames={{
                      caption_label: "text-base font-medium text-foreground", 
                    }}

                    /* ───────────── 인라인 스타일 (여백 및 초록색) ───────────── */
                    styles={{
                      root: {
                        display: "flex",
                        justifyContent: "center",
                        width: "100%",
                        margin: "0 auto",
                      },
                      months: {
                        display: "flex",
                        justifyContent: "center",
                        gap: "2rem",
                        width: "100%",
                      },
                      day_selected: {
                        backgroundColor: "#059669",
                        color: "#ffffff",
                        borderRadius: "50%",
                      },
                      day_range_middle: {
                        backgroundColor: "#ecfdf5",
                        color: "#065f46",
                        borderRadius: "0",
                      },
                      nav_button: {
                        color: "#059669",
                      }
                    }}
                  />
                </CardContent>
              </Card>
              <p className="text-xs text-muted-foreground">달력에서 시작일과 종료일을 연속으로 클릭해 범위를 지정해 주세요.</p>
            </div>
          )}

          {/* 학교 */}
          <div className="space-y-3 pb-6 border-b">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">학교 (선택)</label>
            <SchoolAutocomplete value={school} onChange={setSchool} />
          </div>

          {/* 제목 */}
          <Input
            placeholder="제목을 입력하세요 *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg h-14 bg-background border border-input pl-5 focus-visible:ring-1 focus-visible:ring-primary"
          />

          {/* 에디터 */}
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            {editor && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
            
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

              /* ────────── 캘린더 커스텀 스타일 ────────── */
              .rdp {
                --rdp-cell-size: 32px !important; 
                --rdp-caption-font-size: 14px !important; 
                margin: 0 auto !important;
              }
              .rdp-day {
                font-size: 12px !important; 
              }

              .rdp .rdp-day_selected,
              .rdp .rdp-day_selected:hover,
              .rdp .rdp-day_selected:focus,
              .rdp .rdp-day_selected:active {
                background-color: #059669 !important; 
                color: #ffffff !important;
                opacity: 1 !important;
              }

              .rdp .rdp-day_range_middle,
              .rdp .rdp-day_range_middle:hover {
                background-color: #ecfdf5 !important; 
                color: #065f46 !important; 
                border-radius: 0px !important;
              }

              .rdp .rdp-nav_button {
                color: #059669 !important;
              }

              /* ────────── Tiptap Placeholder 스타일 ────────── */
              .ProseMirror p.is-editor-empty:first-child::before {
                color: #cbd5e1 !important; /* Tailwind slate-300 */
                font-size: 0.875rem !important; /* 14px */
                content: attr(data-placeholder);
                float: left;
                height: 0;
                pointer-events: none;
                font-style: normal !important;
                font-weight: 400 !important; 
              }
              
              .ProseMirror focus p.is-editor-empty:first-child::before {
                color: #e2e8f0 !important; 
              }
            `}</style>
          </div>

          {/* 이미지 첨부 */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ImageIcon className="h-4 w-4 text-primary" />
              이미지 첨부 ({images.length}/5)
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files); }}
              onClick={() => fileInputRef.current?.click()}
              className="group relative border-2 border-dashed border-muted rounded-2xl p-10 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="bg-white p-3 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-foreground">
                <span className="text-emerald-600 underline underline-offset-4 mr-1">Click to upload</span>
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-2">이미지 파일 (JPG, PNG)</p>
              <input type="file" ref={fileInputRef} onChange={(e) => handleFile(e.target.files)} multiple accept="image/*" className="hidden" />
            </div>
            {previews.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {previews.map((src, idx) => (
                  <div key={idx} className="relative group w-24 h-24 rounded-xl overflow-hidden border-2 border-background shadow-md">
                    <img src={src} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImages(images.filter((_, i) => i !== idx)); setPreviews(previews.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-8">
            <Button variant="outline" onClick={() => router.push("/community")} className="px-8">취소</Button>
            <Button onClick={handleSubmit} disabled={!canSubmit} className="bg-primary px-8 shadow-lg shadow-primary/20">게시하기</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityWritePage;