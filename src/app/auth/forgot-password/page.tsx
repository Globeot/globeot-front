"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { trackEvent } from "../../../lib/gtag";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!isValidSchoolEmail(email)) {
      setError("학교 이메일(@ewha.ac.kr 또는 @ewhain.net)만 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });

      setMessage(
        "입력한 이메일로 임시 비밀번호가 발급되었습니다. 임시 비밀번호로 로그인한 뒤 마이페이지에서 비밀번호를 변경해 주세요.",
      );

      trackEvent("password_reset_request");

      setError(null);
    } catch (err: any) {
      console.error(err);

      if (err?.response?.status === 429) {
        setError("요청 횟수가 많습니다. 잠시 후 다시 시도해 주세요.");
      } else {
        setError(
          err?.response?.data?.message || "요청 중 오류가 발생했습니다.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const isValidSchoolEmail = (value: string) => {
    const v = value.trim().toLowerCase();
    if (!v) return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(v)) return false;

    return v.endsWith("@ewha.ac.kr") || v.endsWith("@ewhain.net");
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-extrabold mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            비밀번호 찾기
          </h1>
          <p className="text-sm text-muted-foreground">
            가입한 학교 이메일로 임시 비밀번호를 발급받을 수 있습니다.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="sr-only">임시 비밀번호 발급</CardTitle>
            <CardDescription className="sr-only">
              학교 이메일로 임시 비밀번호 발송
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">이메일</label>
                <Input
                  placeholder="example@ewha.ac.kr"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  가입 시 사용한 학교 이메일을 입력해 주세요. (@ewha.ac.kr /
                  @ewhain.net)
                </p>

                {touched && email && !isValidSchoolEmail(email) && (
                  <p className="text-sm text-destructive mt-2">
                    학교 이메일만 입력해 주세요.
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && <p className="text-sm text-success">{message}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isValidSchoolEmail(email)}
              >
                {loading ? "전송 중..." : "임시 비밀번호 보내기"}
              </Button>
            </form>

            <div className="text-center mt-4 space-y-2">
              <p className="text-xs text-muted-foreground">
                이메일은 가입 시 사용한 학교 이메일만 사용할 수 있습니다.
              </p>

              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:underline"
              >
                ← 로그인으로 돌아가기
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
