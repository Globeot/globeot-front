"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

export function ImageUploadButton({
  onUpload,
}: {
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file);
  };

  const removeImage = () => {
    setPreview(null);
  };

  return (
    <div className="w-full">
      {/* 업로드 영역 */}
      {!preview ? (
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition
          ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 bg-muted/30"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <UploadCloud className="mx-auto mb-3 h-8 w-8 text-primary" />

          <p className="text-sm font-medium">
            <span className="text-primary underline">Click to upload</span> or
            drag and drop
          </p>

          <p className="text-xs text-muted-foreground mt-1">
            이미지 파일만 업로드 가능
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      ) : (
        /* 업로드 후 미리보기 */
        <div className="relative rounded-xl overflow-hidden border">
          <img
            src={preview}
            alt="preview"
            className="w-full max-h-[300px] object-cover"
          />

          {/* 삭제 버튼 */}
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
