"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { searchSchools } from "../lib/article";

export type SchoolValue = { id?: number | string; name: string };

const SchoolAutocomplete = ({
  value,
  onChange,
}: {
  value: SchoolValue | null;
  onChange: (v: SchoolValue | null) => void;
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [schools, setSchools] = useState<SchoolValue[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();
  const hasExactMatch = schools.some(
    (s) => s.name.trim().toLowerCase() === trimmedQuery.toLowerCase(),
  );

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const fetchSchools = async () => {
      if (!trimmedQuery) {
        setSchools([]);
        return;
      }

      try {
        const data = await searchSchools(trimmedQuery.toLowerCase());
        setSchools(data.result ?? []);
      } catch (err) {
        console.error("학교 검색 실패:", err);
        setSchools([]);
      }
    };

    const timer = setTimeout(fetchSchools, 300);
    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  return (
    <div ref={ref} className="relative">
      <div className="flex min-h-[40px] w-full items-center gap-1.5 rounded-md border px-2 py-1">
        {!value ? (
          <>
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="학교 검색..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </>
        ) : (
          <div className="flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs text-primary">
            <span>{value.name}</span>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setQuery("");
                setSchools([]);
                setOpen(false);
              }}
              className="text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {!value && open && (
        <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-card shadow-md">
          {schools.map((s) => (
            <button
              key={String(s.id)}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-primary/5"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary">
                🎓
              </span>
              <span className="truncate font-normal">{s.name}</span>
            </button>
          ))}

          {trimmedQuery && !hasExactMatch && (
            <button
              type="button"
              onClick={() => {
                onChange({ name: trimmedQuery });
                setOpen(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-2 border-t bg-emerald-50/70 px-2.5 py-1.5 text-left text-xs text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700">
                ✎
              </span>
              <span className="truncate font-normal">
                직접 입력한 학교 사용: {trimmedQuery}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SchoolAutocomplete;
