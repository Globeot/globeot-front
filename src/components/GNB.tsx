"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, User, MessageSquare, GraduationCap, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

const navItems = [
  { path: "/community", label: "커뮤니티", icon: MessageSquare },
  { path: "/application-db", label: "지원 랭킹", icon: Trophy },
  { path: "/dispatch-db", label: "학교별 DB", icon: GraduationCap },
];

const GNB = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리
  const pathname = usePathname();
  const router = useRouter();

  // 1. 마운트 시 토큰 확인하여 로그인 상태 업데이트
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  // 2. 로그인/로그아웃 버튼 클릭 핸들러
  const handleAuthClick = (e: React.MouseEvent) => {
    if (isLoggedIn) {
      // 로그아웃 로직
      e.preventDefault();
      const ok = window.confirm("로그아웃 하시겠습니까?");
      if (ok) {
        localStorage.removeItem("accessToken"); // 토큰 삭제
        setIsLoggedIn(false);
        setMobileOpen(false);
        router.push("/");
        router.refresh();
      }
    } else {
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container px-4 md:px-8 flex h-14 items-center justify-between sm:h-16 mx-auto max-w-7xl">
        <Link href="/" className="flex items-center gap-2.5 font-medium tracking-tight text-foreground">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold shadow-sm">글</span>
          <span className="hidden sm:inline text-[18px] font-bold">글로벗</span>
        </Link>

        {/* 데스크톱 메뉴 */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative px-4 py-2 text-[15px] font-medium rounded-md transition-colors ${
                  isActive
                    ? "text-primary bg-accent/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 데스크톱 로그인/로그아웃 & 마이페이지 */}
        <div className="hidden md:flex items-center gap-3">
          <Link href={isLoggedIn ? "#" : "/login"} onClick={handleAuthClick}>
            <Button variant="outline" size="sm" className="h-9 px-4 text-[14px]">
              {isLoggedIn ? "로그아웃" : "로그인"}
            </Button>
          </Link>
          <Link href="/mypage">
            <Button size="sm" className="bg-primary text-primary-foreground text-[14px] font-medium shadow-sm">
              <User className="mr-0.5 h-4 w-4" />
              마이페이지
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="메뉴 열기"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t bg-card"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-primary bg-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}

              {/* 모바일 하단 버튼부 */}
              <div className="mt-3 pt-3 border-t flex flex-col gap-2">
                <Link href={isLoggedIn ? "#" : "/login"} onClick={handleAuthClick}>
                  <Button variant="outline" className="w-full">
                    {isLoggedIn ? "로그아웃" : "로그인"}
                  </Button>
                </Link>
                <Link href="/mypage" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-primary text-primary-foreground">
                    마이페이지
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default GNB;