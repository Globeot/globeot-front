"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { ArrowLeft, Bold, Italic, List, ListOrdered, ImageIcon, Heading2, Search, ChevronDown, Upload, X } from "lucide-react";
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

  return (
    <div className="flex flex-wrap gap-1 border-b p-2 bg-muted/20">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive("heading", { level: 2 }))}>
        <Heading2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive("bold"))}>
        <Bold className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive("italic"))}>
        <Italic className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive("bulletList"))}>
        <List className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive("orderedList"))}>
        <ListOrdered className="h-4 w-4" />
      </button>
    </div>
  );
};

const SchoolAutocomplete = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = query ? allSchools.filter((s) => s.toLowerCase().includes(query.toLowerCase())) : allSchools;
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="학교명 검색..." value={query} onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }} onFocus={() => setOpen(true)} className="pl-9" />
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-md max-h-48 overflow-y-auto">
          {filtered.map((s) => (
            <button key={s} onClick={() => { setQuery(s); onChange(s); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"> {s} </button>
          ))}
        </div>
      )}
    </div>
  );
};

const TopicDropdown = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors">
        {value || "주제 선택 *"} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-card border rounded-lg shadow-md min-w-[140px] py-1">
          {topicOptions.map((t) => (
            <button key={t} onClick={() => { onChange(t); setOpen(false); }} className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${value === t ? "text-primary font-medium" : "text-foreground"}`}> {t} </button>
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
  
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    
    if (images.length + newFiles.length > 5) {
      alert("최대 5장까지만 업로드 가능합니다.");
      return;
    }

    setImages(prev => [...prev, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "내용을 입력하세요..." }), Image],
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose prose-sm max-w-none min-h-[450px] p-4 focus:outline-none" } },
  });

  const canSubmit = title.trim() && stage && region && type && (type !== "info" || topic) && editor && !editor.isEmpty;

  const handleSubmit = () => {
    if (!canSubmit) return;
    router.push("/community");
  };

  return (
    <div className="py-6 sm:py-10 bg-background min-h-screen">
      <div className="container-tight max-w-3xl mx-auto px-4">
        <button
          onClick={() => router.push("/community")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> 목록으로
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">글쓰기</h1>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
             <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">상태 *</label>
                <div className="flex flex-wrap gap-2">
                  {stageOptions.map((s) => (
                    <button key={s.value} onClick={() => setStage(s.value)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${stage === s.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}> {s.label} </button>
                  ))}
                </div>
             </div>
             <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">지역 *</label>
                <div className="flex flex-wrap gap-2">
                  {regionOptions.map((r) => (
                    <button key={r} onClick={() => setRegion(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${region === r ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}> {r} </button>
                  ))}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
             <div className="space-y-3">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">유형 *</label>
                <div className="flex flex-wrap gap-2">
                  {typeOptions.map((t) => (
                    <button key={t.value} onClick={() => { setType(t.value); if (t.value !== "info") setTopic(""); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${type === t.value ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}> {t.label} </button>
                  ))}
                </div>
             </div>
             {type === "info" && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">주제 *</label>
                  <TopicDropdown value={topic} onChange={setTopic} />
                </div>
             )}
          </div>

          <div className="space-y-3 pb-6 border-b">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">학교 (선택)</label>
            <SchoolAutocomplete value={school} onChange={setSchool} />
          </div>

          <Input
            placeholder="제목을 입력하세요 *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg h-14 bg-background border border-input pl-5 focus-visible:ring-1 focus-visible:ring-primary"
          />

          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            {editor && <MenuBar editor={editor} />}
            <EditorContent editor={editor} />
          </div>

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
                    <button 
                      type="button"
                      onClick={() => {
                        setImages(images.filter((_, i) => i !== idx));
                        setPreviews(previews.filter((_, i) => i !== idx));
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-8">
            <Button variant="outline" onClick={() => router.push("/community")} className="px-8"> 취소 </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit} className="bg-primary px-8 shadow-lg shadow-primary/20"> 게시하기 </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityWritePage;