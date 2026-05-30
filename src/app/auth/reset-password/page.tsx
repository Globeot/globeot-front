"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../../../components/ui/card";
import api from "../../../lib/api";

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!PASSWORD_RULE.test(password)) {
      setError("비밀번호는 8자 이상, 영문+숫자 조합이어야 합니다.");
      return;
    }

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!token) {
      setError("유효한 토큰이 없습니다.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/reset-password", { token, password });
      setError(null);

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err: any) {
      console.error(err);

      if (err?.response?.status === 400) {
        setError(err?.response?.data?.message || "유효하지 않은 요청입니다.");
      } else if (err?.response?.status === 410) {
        setError("토큰이 만료되었거나 유효하지 않습니다. 다시 요청해 주세요.");
      } else {
        setError(err?.response?.data?.message || "요청 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>비밀번호 재설정</CardTitle>
            <CardDescription>새 비밀번호를 입력하고 변경하세요.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">
                  새 비밀번호
                </label>
                <Input
                  placeholder="8자 이상, 영문+숫자 조합"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  비밀번호 확인
                </label>
                <Input
                  placeholder="비밀번호를 다시 입력하세요"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <CardFooter className="px-0">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "변경 중..." : "비밀번호 변경"}
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}