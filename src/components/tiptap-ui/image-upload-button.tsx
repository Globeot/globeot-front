"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

export function ImageUploadButton({
  onUpload,
  allowPdf = false,
  multiple = false,
}: {
  onUpload: (file: File[]) => void;
  allowPdf?: boolean;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);

    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      return isImage || (allowPdf && isPdf);
    });

    if (validFiles.length === 0) {
      alert(allowPdf ? "이미지 또는 PDF 파일만 가능합니다." : "이미지 파일만 가능합니다.");
      return;
    }

    // ✅ 단일 업로드 모드에서만 내부 미리보기 갱신
    if (!multiple) {
      const file = validFiles[0];
      if (file.type.startsWith("image/")) {
        setPreview(URL.createObjectURL(file));
        setFileName(null);
      } else {
        setPreview(null);
        setFileName(file.name);
      }
    }

    onUpload(validFiles);
    if (inputRef.current) inputRef.current.value = ""; // 재업로드 가능하게 초기화
  };

  const removeFile = () => {
    setPreview(null);
    setFileName(null);
  };

  // ✅ 다중 업로드 모드이거나, 아직 파일이 없을 때만 업로드 UI 노출
  const showUploadUI = multiple || (!preview && !fileName);

  return (
    <div className="w-full space-y-3">
      {showUploadUI && (
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition cursor-pointer
          ${dragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 bg-muted/30"}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <UploadCloud className="mx-auto mb-3 h-8 w-8 text-primary" />
          <p className="text-sm font-medium">
            <span className="text-primary underline cursor-pointer hover:text-primary/80 transition-colors">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {allowPdf ? "이미지 또는 PDF 가능" : "이미지 파일만 가능"}
            {multiple && " (최대 5장)"}
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple={multiple}
            accept={allowPdf ? "image/*,application/pdf" : "image/*"}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* ✅ 단일 업로드 전용 미리보기 (랭킹 페이지용) */}
      {!multiple && (preview || fileName) && (
        <div className="relative rounded-xl overflow-hidden border bg-muted/10 p-2">
          {preview ? (
            <img src={preview} alt="preview" className="w-full max-h-[200px] object-contain mx-auto" />
          ) : (
            <div className="py-8 text-center text-sm font-medium text-muted-foreground">
              📄 {fileName}
            </div>
          )}
          <button
            onClick={removeFile}
            className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}