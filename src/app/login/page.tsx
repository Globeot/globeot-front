"use client";
import { useState } from "react";
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

  //로그인 state
  const [isSendingCode, setIsSendingCode] = useState(false); //인증코드 보내는 중?
  const [emailError, setEmailError] = useState(""); //메일양식 에러

  const [otpError, setOtpError] = useState(""); //인증번호 관련

  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isCheckingNickname, setIsCheckingNickname] = useState(false); //닉네임 확인중?
  const [isNicknameChecked, setIsNicknameChecked] = useState(false); //닉네임 중복확인 (추후)

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setPasswordConfirm("");
    setOtp("");
    setNickname("");
    setStage("");
    setSignupStep(1);
    setEmailError("");
    setIsNicknameChecked(false);
    setOtpError("");
  };

  //메일검증 메소드
  const isValidEwhaEmail = (value: string) => {
    const trimmed = value.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return false;

    return trimmed.endsWith("@ewha.ac.kr") || trimmed.endsWith("@ewhain.net");
  };
  //*회원가입 1단계
  //인증번호 발송
  const handleSendVerificationCode = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    //검증
    if (!trimmedEmail) {
      setEmailError("학교 이메일을 입력해 주세요.");
      alert("학교 이메일을 입력해 주세요.");
      return;
    }

    if (!isValidEwhaEmail(trimmedEmail)) {
      setEmailError(
        "@ewha.ac.kr 또는 @ewhain.net 이메일만 사용할 수 있습니다.",
      );
      alert("@ewha.ac.kr 또는 @ewhain.net 이메일만 사용할 수 있습니다.");
      return;
    }

    try {
      setEmailError("");
      setIsSendingCode(true);

      const response = await fetch("@", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.message || "인증번호 발송에 실패했습니다.";
        setEmailError(message);
        alert(message);
        return;
      }

      alert("인증번호가 이메일로 발송되었습니다.");
      setSignupStep(2);
    } catch (error) {
      console.error(error);
      setEmailError("서버와 통신 중 오류가 발생했습니다.");
      alert("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsSendingCode(false);
    }
  };
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNumbers = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(onlyNumbers);
    setOtpError("");
  };
  //*회원가입 2단계
  //인증번호 검증 (미완 - 백엔드)
  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError("인증번호를 입력해 주세요.");
      alert("인증번호를 입력해 주세요.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("인증번호는 숫자 6자리여야 합니다.");
      alert("인증번호는 숫자 6자리여야 합니다.");
      return;
    }
    //추후 백엔드 붙일 예정
    try {
      setOtpError("");
      await new Promise((resolve) => setTimeout(resolve, 500));

      alert("이메일 인증이 완료되었습니다.");
      setSignupStep(3);
    } catch (error) {
      console.error(error);
      setOtpError("인증 확인 중 오류가 발생했습니다.");
      alert("인증 확인 중 오류가 발생했습니다.");
    }
  };

  //*회원가입 3단계
  //중복아이디 검증 (미완)
  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    try {
      setIsCheckingNickname(true);

      // (추후 중복확인 - 백엔드)

      await new Promise((resolve) => setTimeout(resolve, 500));

      alert("사용 가능한 닉네임입니다. (임시)");
      setIsNicknameChecked(true);
    } catch (error) {
      console.error(error);
      alert("닉네임 확인 중 오류가 발생했습니다.");
    } finally {
      setIsCheckingNickname(false);
    }
  };
  //회원가입
  const handleSignup = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해 주세요.");
      return;
    }

    if (!isNicknameChecked) {
      alert("닉네임 중복확인을 해주세요.");
      return;
    }

    if (!password) {
      alert("비밀번호를 입력해 주세요.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("비밀번호는 8자 이상, 영문+숫자 조합이어야 합니다.");
      return;
    }

    if (!passwordConfirm) {
      alert("비밀번호 확인을 입력해 주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!stage) {
      alert("파견 단계를 선택해 주세요.");
      return;
    }

    try {
      //(임시 - 추후 백엔드 붙일 예정)
      const requestBody = {
        email,
        nickname: nickname.trim(),
        password,
        exchangeStage: stage,
      };

      console.log("회원가입 요청 데이터:", requestBody);

      //백엔드 구현 전.

      alert("회원가입 완료!");
      setMode("login");
      resetForm();
    } catch (error) {
      console.error(error);
      alert("회원가입 중 오류가 발생했습니다.");
    }
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                로그인
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                비밀번호를 잊으셨나요?{" "}
                <button className="text-primary hover:underline font-medium">
                  비밀번호 재설정
                </button>
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
                <p className="text-xs text-muted-foreground mt-1">
                  @ewha.ac.kr 또는 @ewhain.net 도메인만 허용
                </p>
                {emailError && (
                  <p className="text-sm text-red-500 mt-2">{emailError}</p>
                )}
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSendVerificationCode}
                disabled={isSendingCode}
              >
                {isSendingCode ? "발송 중..." : "인증번호 발송"}
                {!isSendingCode && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          ) : signupStep === 2 ? (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">인증번호 (6자리)</Label>
                {otpError && (
                  <p className="text-sm text-red-500 mt-2">{otpError}</p>
                )}
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  className="mt-1.5 text-center text-lg tracking-[0.5em] font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  5분 이내에 입력해 주세요
                </p>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleVerifyOtp}
              >
                인증 확인
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">닉네임</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    placeholder="닉네임을 입력해 주세요"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setIsNicknameChecked(false);
                    }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckNickname}
                    disabled={isCheckingNickname}
                    className="shrink-0"
                  >
                    {isCheckingNickname ? "확인 중..." : "중복확인"}
                  </Button>
                </div>
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
                <Label className="text-sm font-medium">비밀번호 확인</Label>
                <Input
                  type="password"
                  placeholder="비밀번호를 다시 입력해 주세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="mt-1.5"
                />
                {passwordConfirm && password !== passwordConfirm && (
                  <p className="text-sm text-red-500 mt-2">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
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
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSignup}
              >
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
                onClick={() => {
                  setMode("signup");
                  resetForm();
                }}
                className="text-primary font-semibold hover:underline"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  resetForm();
                }}
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
