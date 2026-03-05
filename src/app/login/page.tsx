"use client";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type AuthMode = "login" | "signup";
type SignupStep = 1 | 2 | 3;

const LoginPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [nickname, setNickname] = useState("");
  const [stage, setStage] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setOtp("");
    setNickname("");
    setStage("");
    setSignupStep(1);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-extrabold mb-4">
            E
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "로그인" : "회원가입"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login"
              ? "EwhaAbroad에 오신 것을 환영합니다"
              : signupStep === 1
              ? "학교 이메일로 인증해 주세요"
              : signupStep === 2
              ? "이메일로 전송된 인증번호를 입력해 주세요"
              : "프로필 정보를 입력해 주세요"}
          </p>
        </div>

        <div className="card-elevated p-6">
          {mode === "login" ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">이메일</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@ewha.ac.kr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">비밀번호</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                로그인
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                비밀번호를 잊으셨나요?{" "}
                <button className="text-primary hover:underline font-medium">비밀번호 재설정</button>
              </p>
            </div>
          ) : signupStep === 1 ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">학교 이메일</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@ewha.ac.kr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">@ewha.ac.kr 또는 @ewhain.net 도메인만 허용</p>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setSignupStep(2)}
              >
                인증번호 발송
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : signupStep === 2 ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">인증번호 (6자리)</Label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1.5 text-center text-lg tracking-[0.5em] font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">5분 이내에 입력해 주세요</p>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setSignupStep(3)}
              >
                인증 확인
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">닉네임</Label>
                <Input
                  placeholder="닉네임을 입력해 주세요"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">비밀번호</Label>
                <Input
                  type="password"
                  placeholder="8자 이상, 영문+숫자 조합"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">파견 단계</Label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[
                    { value: "PRE_ASSIGN", label: "배정 전" },
                    { value: "PRE_DEPART", label: "파견 전" },
                    { value: "ABROAD", label: "파견 중" },
                    { value: "RETURNED", label: "파견 후" },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStage(s.value)}
                      className={`py-2.5 rounded-lg text-xs font-semibold transition-colors ${
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
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                가입 완료
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "login" ? (
            <>
              계정이 없으신가요?{" "}
              <button
                onClick={() => { setMode("signup"); resetForm(); }}
                className="text-primary font-semibold hover:underline"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <button
                onClick={() => { setMode("login"); resetForm(); }}
                className="text-primary font-semibold hover:underline"
              >
                로그인
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
