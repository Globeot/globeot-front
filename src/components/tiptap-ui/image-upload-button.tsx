"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";

export function ImageUploadButton({
  onUpload,
  accept = "image/*",
  label = "파일 업로드",
}: {
  onUpload: (file: File) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-sm flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log("파일 선택됨:", file);
            onUpload(file);
            e.target.value = ""; // 🔥 핵심 (이거 없으면 안바뀜)
          }
        }}
      />
    </>
  );
}
