'use client';
// MyPage.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, FileText, MessageSquare, Bookmark, Settings, LogOut, GraduationCap, Heart, ExternalLink } from "lucide-react";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

type Tab = "posts" | "comments" | "scraps" | "bookmarks" | "settings";

const MyPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("민지");
  const [stage, setStage] = useState("ABROAD");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "posts", label: "내 글", icon: <FileText className="h-4 w-4" /> },
    { key: "comments", label: "내 댓글", icon: <MessageSquare className="h-4 w-4" /> },
    { key: "scraps", label: "스크랩", icon: <Bookmark className="h-4 w-4" /> },
    { key: "bookmarks", label: "관심 학교", icon: <Heart className="h-4 w-4" /> },
    { key: "settings", label: "설정", icon: <Settings className="h-4 w-4" /> },
  ];

  const mockPosts = [
    { id: 1, title: "독일 뮌헨대 기숙사 후기", date: "2026.02.18", comments: 5, type: "정보" },
    { id: 2, title: "귀국 짐 정리 물품 팝니다", date: "2026.02.15", comments: 3, type: "중고거래", tradeStatus: "판매중" },
  ];

  const mockBookmarkedSchools = [
    { name: "뮌헨대학교", country: "독일", city: "뮌헨", convertedScore: 92.5, travelAccess: "상", livingCost: "€800–1,200", website: "https://www.lmu.de" },
    { name: "UCLA", country: "미국", city: "로스앤젤레스", convertedScore: 89.3, travelAccess: "중", livingCost: "$1,200–2,000", website: "https://www.ucla.edu" },
  ];

  return (
    <div className="py-6 sm:py-10">
      <div className="container-tight max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile Card */}
          <div className="card-elevated p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-accent flex items-center justify-center">
                <User className="h-7 w-7 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">{nickname}</h2>
                <p className="text-sm text-muted-foreground">example@ewha.ac.kr</p>
                <span className="status-badge-abroad mt-1 inline-block">파견 중</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "취소" : "프로필 수정"}
              </Button>
            </div>

            {isEditing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-6 pt-6 border-t space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium">닉네임</Label>
                  <Input value={nickname} onChange={(e) => setNickname(e.target.value)} className="mt-1.5" />
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
                        className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
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
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">저장</Button>
              </motion.div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "posts" && (
            <div className="space-y-2">
              {mockPosts.map((post) => (
                <div
                key={post.id}
                className="card-elevated p-4 flex items-center justify-between cursor-pointer hover:border-primary transition-colors"
                  onClick={() => router.push(`/community/${post.id}`)}
                  >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{post.type}</span>
                      {post.tradeStatus && (
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">{post.tradeStatus}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{post.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{post.date} · 💬 {post.comments}</p>
                  </div>
                  {post.tradeStatus && <Button variant="outline" size="sm">거래완료</Button>}
                </div>
              ))}
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-2">
              {[
                { id: 1, content: "저도 같은 경험 있어요! 기숙사 신청 시 ...", post: "독일 뮌헨대 기숙사 질문", date: "2026.02.19" },
                { id: 2, content: "가격 네고 가능한가요?", post: "파리 원룸 짐 정리 물품", date: "2026.02.17" },
              ].map((comment) => (
                <div key={comment.id} className="card-elevated p-4">
                  <p className="text-sm text-foreground">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    원글: <span className="text-primary">{comment.post}</span> · {comment.date}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "scraps" && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              스크랩한 게시글이 없습니다.
            </div>
          )}

          {activeTab === "bookmarks" && (
            <div>
              {mockBookmarkedSchools.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  관심 등록한 학교가 없습니다.
                </div>
              ) : (
                <div className="card-elevated overflow-hidden">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[12%]">국가</TableHead>
                        <TableHead className="w-[14%]">도시</TableHead>
                        <TableHead className="w-[20%]">학교</TableHead>
                        <TableHead className="w-[14%] text-right">환산 점수</TableHead>
                        <TableHead className="w-[14%]">여행접근성</TableHead>
                        <TableHead className="w-[16%]">예상생활비</TableHead>
                        <TableHead className="w-[10%]">사이트</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockBookmarkedSchools.map((school) => (
                        <TableRow key={school.name}>
                          <TableCell className="text-sm text-muted-foreground">{school.country}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{school.city}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => router.push(`/dispatch-db/${encodeURIComponent(school.name)}`)}
                              className="text-sm font-medium text-primary hover:underline text-left"
                            >
                              {school.name}
                            </button>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">{school.convertedScore}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              school.travelAccess === "상" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>{school.travelAccess}</span>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{school.livingCost}</TableCell>
                          <TableCell>
                            <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="card-elevated divide-y">
              <button className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                <LogOut className="h-4 w-4 text-muted-foreground" />
                로그아웃
              </button>
              <button className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
                <Settings className="h-4 w-4" />
                회원 탈퇴
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MyPage;
