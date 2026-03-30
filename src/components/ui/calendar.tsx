"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { ko } from "date-fns/locale"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ ...props }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date())

  const handlePrev = () => {
    const prev = new Date(currentMonth)
    prev.setMonth(prev.getMonth() - 1)
    setCurrentMonth(prev)
  }

  const handleNext = () => {
    const next = new Date(currentMonth)
    next.setMonth(next.getMonth() + 1)
    setCurrentMonth(next)
  }

  // 헤더에 들어갈 글씨를 "0000년 0월" 형식으로 가공
  const getMonthStr = (date: Date, addMonth = 0) => {
    const d = new Date(date)
    d.setMonth(d.getMonth() + addMonth)
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월`
  }

  return (
    <div
      style={{
        boxSizing: "border-box",
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        width: "max-content",
        margin: "0 auto",
      }}
    >
      {/* 🔥 [해결의 핵심] 
        화살표와 글씨들을 통째로 묶어서 무조건 한 줄로 만드는 Flex 박스입니다.
      */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between", /* 화살표를 양 끝으로 */
          alignItems: "center", /* 💡 세로축을 완벽히 일치시켜 같은 높이로 정렬 */
          height: "40px",
          marginBottom: "15px",
          position: "relative",
          width: "100%",
        }}
      >
        {/* 1. 왼쪽 화살표 */}
        <button
          onClick={handlePrev}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <ChevronLeft style={{ width: "16px", height: "16px", color: "#6b7280" }} />
        </button>

        {/* 2. 중앙의 년/월 글씨들 (이 박스 역시 세로 중앙 정렬) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '120px', /* 💡 왼쪽 달력과 오른쪽 달력의 중앙(수요일) 위에 오도록 여백 조절 */
          fontSize: '18px',
          fontWeight: 500,
          color: '#111827',
          whiteSpace: 'nowrap',
        }}>
          <span>{getMonthStr(currentMonth, 0)}</span>
          <span>{getMonthStr(currentMonth, 1)}</span>
        </div>

        {/* 3. 오른쪽 화살표 */}
        <button
          onClick={handleNext}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <ChevronRight style={{ width: "16px", height: "16px", color: "#6b7280" }} />
        </button>
      </div>

      <style>{`
        /* 라이브러리가 본문에 기본으로 생성하는 지저분한 타이틀 구역은 완전히 숨깁니다. */
        .rdp-caption, .rdp-month_caption, .rdp-nav {
          display: none !important;
        }

        .rdp,
        .rdp-root {
          box-sizing: border-box;
          margin: 0 !important;
          /* react-day-picker 색상은 내부 CSS 변수(--rdp-*)로 결정 */
          --rdp-accent-color: var(--color-primary) !important;
          --rdp-accent-background-color: var(--color-accent) !important;
          --rdp-today-color: var(--color-primary) !important;
          --rdp-range_middle-color: var(--color-accent-foreground) !important;
          --rdp-range_start-color: var(--color-primary-foreground) !important;
          --rdp-range_end-color: var(--color-primary-foreground) !important;
        }

        /* 두 달 가로 배치 */
        .rdp-months {
          display: flex !important;
          flex-direction: row !important;
          gap: 30px !important;
        }

        .rdp-month {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
        }

        /* 요일 */
        .rdp-weekdays {
          display: grid !important;
          grid-template-columns: repeat(7, 36px) !important;
          justify-items: center !important;
          margin-bottom: 6px !important;
        }

        /* 날짜 */
        .rdp-week {
          display: grid !important;
          grid-template-columns: repeat(7, 36px) !important;
          justify-items: center !important;
          margin-bottom: 4px !important;
        }

        .rdp-weekday {
          font-size: 12px !important;
          color: #6b7280 !important;
          font-weight: 500 !important;
          width: 36px !important;
        }

        .rdp-day {
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          color: #374151 !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          border: none !important;
          background: transparent !important;
        }

        .rdp-day:hover {
          background: #f3f4f6 !important;
        }

        .rdp-day_selected {
          background: var(--color-primary) !important;
          color: var(--color-primary-foreground) !important;
          font-weight: 600 !important;
        }

        .rdp-day_today {
          border: 1px solid var(--color-primary) !important;
          color: var(--color-primary) !important;
          font-weight: 600 !important;
        }

        .rdp-day_outside {
          color: #d1d5db !important;
          opacity: 0.5 !important;
        }

        .rdp-day_disabled {
          color: #d1d5db !important;
          cursor: not-allowed !important;
          opacity: 0.3 !important;
        }
      `}</style>

      {/* 핵심 DayPicker */}
      <DayPicker
        showOutsideDays
        numberOfMonths={2}
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        locale={ko}
        {...props}
      />
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }