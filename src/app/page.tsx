"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Globe, Trophy } from "lucide-react";
import { Button } from "../components/ui/button";

const features = [
  {
    icon: Trophy,
    title: "지원 랭킹",
    description: "성적표를 제출하고 환산 점수 기반 랭킹을 확인하세요.",
    link: "/application-db",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: MessageSquare,
    title: "Q&A 커뮤니티",
    description: "배정 전·파견 중·파견 후, 단계별 맞춤 정보를 주고받는 공간.",
    link: "/community",
    color: "bg-accent text-accent-foreground",
  },
  {
    icon: Globe,
    title: "학교 탐색 DB",
    description:
      "지역별, 점수대별 학교를 비교하고 나에게 맞는 학교를 찾아보세요.",
    link: "/dispatch-db",
    color: "bg-secondary text-secondary-foreground",
  },
];

const stageAnim = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/30 py-16 sm:py-24">
        <div className="container px-4 md:px-6 text-center mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground mb-6">
              교환·방문학생을 위한 통합 플랫폼
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-foreground mb-4">
              교환학생 준비,
              <br />
              <span className="text-primary">글로벗과 함께하세요</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              점수 계산부터 커뮤니티까지. 흩어져 있던 정보를 하나로 모아
              <br className="hidden sm:block" />
              효율적인 교환학생 준비를 도와드립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/application-db">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  지원 랭킹
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/community">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  커뮤니티 둘러보기
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
              핵심 기능
            </h2>
            <p className="text-muted-foreground">
              교환학생 준비의 모든 단계를 지원합니다
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stageAnim}
              >
                <Link href={feat.link} className="block h-full">
                  <div className="border rounded-xl p-6 h-full hover:shadow-lg transition-all group cursor-pointer bg-card">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${feat.color} mb-4`}
                    >
                      <feat.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container px-4 md:px-6 mx-auto max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-10">
            당신의 단계는?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                label: "배정 전",
                emoji: "📑",
                desc: "학교 탐색, 점수 계산, 서류 준비",
                badge: "status-badge-pre",
              },
              {
                label: "파견 중",
                emoji: "🌍",
                desc: "현지 정보, 중고거래, 여행 동행",
                badge: "status-badge-abroad",
              },
              {
                label: "파견 후",
                emoji: "🛬",
                desc: "학점 이전, 경험 공유, 후기 작성",
                badge: "status-badge-returned",
              },
            ].map((stage, i) => (
              <motion.div
                key={stage.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stageAnim}
                className="card-elevated p-6 text-center shadow-sm bg-background border rounded-xl"
              >
                <div className="text-4xl mb-3">{stage.emoji}</div>
                <span className={`${stage.badge} font-medium`}>
                  {stage.label}
                </span>
                <p className="text-sm text-muted-foreground mt-3">
                  {stage.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
