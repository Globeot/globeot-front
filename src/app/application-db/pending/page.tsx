"use client";

import { useRouter } from "next/navigation";
import { Clock, CheckCircle2, ArrowRight, Home } from "lucide-react";
import { Button } from "../../../components/ui/button";

export default function ApplicationPendingPage() {
  const router = useRouter();

  return (
    <div className="py-20 sm:py-32">
      <div className="container-tight max-w-md text-center">
        <div className="relative mx-auto w-20 h-20 mb-8">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-full h-full bg-white border-2 border-primary rounded-full shadow-sm">
            <Clock className="h-10 w-10 text-primary" />
          </div>
          <CheckCircle2 className="absolute -right-1 -bottom-1 h-7 w-7 text-green-500 bg-white rounded-full p-0.5" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-3">
          지원서 제출 완료!
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-10">
          회원님의 소중한 지원 데이터가 성공적으로 접수되었습니다.
          <br />
          관리자가 증빙 이미지를 확인한 후(영업일 기준 1~2일),
          <br />
          <span className="font-semibold text-foreground">
            최종 승인이 완료되면 랭킹 보드에 반영됩니다.
          </span>
        </p>

        <div className="space-y-3">
          <Button
            className="w-full py-6 text-base font-bold"
            onClick={() => router.push("/dispatch-db")}
          >
            학교별 DB 먼저 구경하기
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            className="w-full py-6 text-sm font-medium"
            onClick={() => router.push("/")}
          >
            <Home className="mr-2 h-4 w-4" />
            메인 화면으로
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground mt-8">
          ※ 허위 사실 기재 시 서비스 이용이 제한될 수 있습니다.
        </p>
      </div>
    </div>
  );
}
