"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./menu.module.css";
import {
  CalculatedDateInfo,
  getMenuForDate,
  getUpcomingWeekDays,
  formatDateKey,
  getMealLiveStatus,
  getOverallMessStatus,
} from "./menuData";

// Safe deterministic anchor for SSR
const INITIAL_DATE = new Date(2026, 9, 18);

export default function StudentMenuPage() {
  const router = useRouter();
  // Today's anchor date
  const [todayAnchor, setTodayAnchor] = useState<Date>(INITIAL_DATE);
  const [todayDate, setTodayDate] = useState<Date>(INITIAL_DATE);

  // Day-based slide offset: 0 = starts with today, +1 = starts from tomorrow, -1 = starts yesterday, etc.
  const [dayOffset, setDayOffset] = useState<number>(0);

  // Selected date key (automatically defaults to today)
  const [selectedDateKey, setSelectedDateKey] = useState<string>("2026-10-18");

  // Current local time in minutes since midnight (0..1439). Initialized to null to support safe SSR prerendering
  const [currentMinutes, setCurrentMinutes] = useState<number | null>(null);

  // Native date input ref for opening calendar picker
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Ref and accumulator for wheel scrolling over dates
  const carouselRef = useRef<HTMLDivElement>(null);
  const wheelAcc = useRef<number>(0);
  const lastWheelTime = useRef<number>(0);

  // Read real client device date on mount and track live clock
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      const clientToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const key = formatDateKey(clientToday);

      setTodayDate(clientToday);
      setTodayAnchor(clientToday);
      setSelectedDateKey(key);
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };

    updateTimeAndDate();

    // Check periodically for live status updates or midnight rollover
    window.addEventListener("focus", updateTimeAndDate);
    const timer = setInterval(updateTimeAndDate, 15000);
    return () => {
      window.removeEventListener("focus", updateTimeAndDate);
      clearInterval(timer);
    };
  }, []);

  // State to track expanded category details for each meal
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({
    breakfast: true,
    lunch: true,
    snacks: true,
    dinner: true,
  });

  const toggleMealDetails = (mealId: string) => {
    setExpandedMeals((prev) => ({
      ...prev,
      [mealId]: !prev[mealId],
    }));
  };

  // Generate EXACTLY 7 DAYS for the current sliding window
  const current7Days: CalculatedDateInfo[] = useMemo(() => {
    const startDate = new Date(todayAnchor.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    return getUpcomingWeekDays(startDate, 7, todayDate);
  }, [todayAnchor, dayOffset, todayDate]);

  // Date range display label (e.g. "18 Oct – 24 Oct 2026")
  const dateRangeLabel = useMemo(() => {
    if (current7Days.length === 0) return "";
    const first = current7Days[0];
    const last = current7Days[current7Days.length - 1];
    return `${first.dayOfMonth} ${first.monthName} – ${last.dayOfMonth} ${last.monthName} ${last.year}`;
  }, [current7Days]);

  // Interactive calendar popover state
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [calendarViewYear, setCalendarViewYear] = useState<number>(2026);
  const [calendarViewMonth, setCalendarViewMonth] = useState<number>(9); // 0-indexed (9 = October)
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on click outside
  useEffect(() => {
    if (!isCalendarOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isCalendarOpen]);

  // Calendar month navigation
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calendarViewMonth === 0) {
      setCalendarViewMonth(11);
      setCalendarViewYear((y) => y - 1);
    } else {
      setCalendarViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (calendarViewMonth === 11) {
      setCalendarViewMonth(0);
      setCalendarViewYear((y) => y + 1);
    } else {
      setCalendarViewMonth((m) => m + 1);
    }
  };

  // Calendar days grid computation
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(calendarViewYear, calendarViewMonth, 1).getDay();
    const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();
    return { firstDayOfWeek, daysInMonth };
  }, [calendarViewYear, calendarViewMonth]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Toggle calendar popover
  const handleToggleCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCalendarOpen((prev) => !prev);
    const [y, m] = selectedDateKey.split("-").map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      setCalendarViewYear(y);
      setCalendarViewMonth(m - 1);
    }
  };

  // Selecting a date from calendar popover
  const handleSelectDateFromCalendar = (dayNumber: number) => {
    const chosenDate = new Date(calendarViewYear, calendarViewMonth, dayNumber);
    const chosenKey = formatDateKey(chosenDate);
    setSelectedDateKey(chosenKey);

    // Calculate diff in days relative to todayAnchor
    const diffDays = Math.round(
      (chosenDate.getTime() - todayAnchor.getTime()) / (24 * 60 * 60 * 1000)
    );

    // Shift 7-day strip so chosen date is visible in view
    if (diffDays < dayOffset || diffDays > dayOffset + 6) {
      setDayOffset(diffDays);
    }

    setIsCalendarOpen(false);
  };

  // Slide day-by-day using side arrow buttons (DOES NOT auto-select date)
  const handleSlideByDays = (days: number) => {
    setDayOffset((prev) => prev + days);
  };

  // Jump to today
  const handleJumpToToday = () => {
    setDayOffset(0);
    const now = new Date();
    const clientToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayAnchor(clientToday);
    setTodayDate(clientToday);
    setSelectedDateKey(formatDateKey(clientToday));
    setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
  };

  // Scroll wheel on dates: moves dates according to scroll speed
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 3) return;

      e.preventDefault();

      const now = performance.now();
      const timeDelta = now - lastWheelTime.current;
      lastWheelTime.current = now;

      // Speed detection
      const absDelta = Math.abs(delta);
      const speed = timeDelta > 0 ? (absDelta / timeDelta) * 10 : absDelta;

      let step = 1;
      if (speed > 80 || absDelta > 160) {
        step = 3; // High speed: move 3 days
      } else if (speed > 40 || absDelta > 75) {
        step = 2; // Medium speed: move 2 days
      } else {
        step = 1; // Slow: move 1 day
      }

      wheelAcc.current += delta;
      const THRESHOLD = 45;

      if (Math.abs(wheelAcc.current) >= THRESHOLD) {
        const direction = wheelAcc.current > 0 ? 1 : -1;
        wheelAcc.current = 0;
        setDayOffset((prev) => prev + direction * step);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Find currently selected day info
  const selectedDayInfo: CalculatedDateInfo = useMemo(() => {
    const found = current7Days.find((d) => d.dateKey === selectedDateKey);
    if (found) return found;
    // Fallback if user selected a date in another offset
    const [y, m, d] = selectedDateKey.split("-").map(Number);
    return getMenuForDate(new Date(y, m - 1, d), todayDate);
  }, [current7Days, selectedDateKey, todayDate]);

  const { dayMenu, isToday, dayOfWeek } = selectedDayInfo;

  // Live status for overall mess and individual meal services
  const mealList = useMemo(() => [
    dayMenu.meals.breakfast,
    dayMenu.meals.lunch,
    dayMenu.meals.snacks,
    dayMenu.meals.dinner,
  ], [dayMenu]);

  const overallStatus = useMemo(() => {
    if (currentMinutes === null) return { status: "closed" as const, label: "Mess is Closed" };
    return getOverallMessStatus(mealList, currentMinutes, isToday);
  }, [mealList, currentMinutes, isToday]);

  const breakfastStatus = useMemo(() => {
    if (currentMinutes === null) return { status: "closed" as const, label: "Mess is Closed", badgeType: "closed" as const };
    return getMealLiveStatus(dayMenu.meals.breakfast.timing, currentMinutes, isToday);
  }, [dayMenu.meals.breakfast.timing, currentMinutes, isToday]);

  const lunchStatus = useMemo(() => {
    if (currentMinutes === null) return { status: "closed" as const, label: "Mess is Closed", badgeType: "closed" as const };
    return getMealLiveStatus(dayMenu.meals.lunch.timing, currentMinutes, isToday);
  }, [dayMenu.meals.lunch.timing, currentMinutes, isToday]);

  const snacksStatus = useMemo(() => {
    if (currentMinutes === null) return { status: "closed" as const, label: "Mess is Closed", badgeType: "closed" as const };
    return getMealLiveStatus(dayMenu.meals.snacks.timing, currentMinutes, isToday);
  }, [dayMenu.meals.snacks.timing, currentMinutes, isToday]);

  const dinnerStatus = useMemo(() => {
    if (currentMinutes === null) return { status: "closed" as const, label: "Mess is Closed", badgeType: "closed" as const };
    return getMealLiveStatus(dayMenu.meals.dinner.timing, currentMinutes, isToday);
  }, [dayMenu.meals.dinner.timing, currentMinutes, isToday]);

  // Stack ordering: When a meal is ongoing today, it comes to the top of the stack!
  const orderedMeals = useMemo(() => {
    const rawMeals = [
      { key: "breakfast", data: dayMenu.meals.breakfast, status: breakfastStatus },
      { key: "lunch", data: dayMenu.meals.lunch, status: lunchStatus },
      { key: "snacks", data: dayMenu.meals.snacks, status: snacksStatus },
      { key: "dinner", data: dayMenu.meals.dinner, status: dinnerStatus },
    ];

    if (!isToday || currentMinutes === null) {
      return rawMeals;
    }

    const ongoingIdx = rawMeals.findIndex((m) => m.status.status === "ongoing");
    if (ongoingIdx > 0) {
      const ongoingMeal = rawMeals[ongoingIdx];
      const remainingMeals = rawMeals.filter((_, idx) => idx !== ongoingIdx);
      return [ongoingMeal, ...remainingMeals];
    }

    return rawMeals;
  }, [dayMenu, breakfastStatus, lunchStatus, snacksStatus, dinnerStatus, isToday, currentMinutes]);

  return (
    <div className={styles.menuContainer}>
      {/* 7-Day Window Selector with Sleek Flanking Side Arrow Buttons (< and >) */}
      <section className={styles.daySelectorSection} aria-label="Select Menu Day">
        <div ref={carouselRef} className={styles.dayCarouselContainer}>
          <button
            type="button"
            className={`${styles.daySlideArrowBtn} ${styles.daySlideArrowLeft}`}
            onClick={() => handleSlideByDays(-1)}
            title="Slide back 1 day"
            aria-label="Previous day"
            id="day-carousel-prev-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* 7-DAY GRID: FITS 100% IN SCREEN WIDTH WITHOUT OVERFLOW */}
          <div className={styles.dayGrid7}>
            {current7Days.map((day) => {
              const isSelected = day.dateKey === selectedDateKey;
              return (
                <button
                  key={day.dateKey}
                  type="button"
                  className={`${styles.dayPill} ${isSelected ? styles.dayPillActive : ""}`}
                  onClick={() => setSelectedDateKey(day.dateKey)}
                  aria-pressed={isSelected}
                >
                  <span className={styles.dayPillName}>{day.dayShort}</span>
                  <span className={styles.dayPillNumber}>{day.dayOfMonth}</span>
                  <span className={styles.dayPillTag}>
                    {day.isToday ? "Today" : `Wk ${day.weekNumber}`}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className={`${styles.daySlideArrowBtn} ${styles.daySlideArrowRight}`}
            onClick={() => handleSlideByDays(1)}
            title="Slide forward 1 day"
            aria-label="Next day"
            id="day-carousel-next-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Selected Day's Meals */}
      <section className={styles.mealsSection} aria-label="Daily Meal Services">
        <div className={styles.mealsHeaderRow}>
          <div className={styles.mealsHeaderLeft}>
            <h2 className={styles.mealsSectionTitle}>
              {isToday ? "Today's Meals" : `${dayOfWeek}'s Meals`} &bull; {dayMenu.title}
            </h2>

            {isToday && (
              <span className={`${styles.overallStatusBadge} ${styles["overallStatus_" + overallStatus.status]}`}>
                {overallStatus.status === "ongoing" && <span className={styles.statusPulseDot} />}
                {overallStatus.label}
              </span>
            )}

            {/* Prominent Small Date Icon & Interactive Calendar Dropdown */}
            <div ref={calendarRef} className={styles.datePickerTriggerWrapper}>
              <button
                type="button"
                className={styles.datePickerBtn}
                onClick={handleToggleCalendar}
                title="Click to select a date from calendar"
                id="menu-date-picker-trigger"
                aria-expanded={isCalendarOpen}
              >
                <span className={styles.calendarIconWrapper}>
                  <svg
                    className={styles.calendarIcon}
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="8" cy="14" r="1.2" fill="currentColor" />
                    <circle cx="12" cy="14" r="1.2" fill="currentColor" />
                    <circle cx="16" cy="14" r="1.2" fill="currentColor" />
                    <circle cx="8" cy="18" r="1.2" fill="currentColor" />
                    <circle cx="12" cy="18" r="1.2" fill="currentColor" />
                    <circle cx="16" cy="18" r="1.2" fill="currentColor" />
                  </svg>
                </span>
                <span className={styles.datePickerRangeLabel}>{dateRangeLabel}</span>
                <svg
                  className={`${styles.datePickerChevron} ${isCalendarOpen ? styles.datePickerChevronOpen : ""}`}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Interactive Calendar Popover */}
              {isCalendarOpen && (
                <div className={styles.calendarPopover} id="menu-calendar-popover">
                  <div className={styles.calendarNavHeader}>
                    <button
                      type="button"
                      className={styles.calendarNavBtn}
                      onClick={handlePrevMonth}
                      title="Previous Month"
                    >
                      &lsaquo;
                    </button>
                    <span className={styles.calendarMonthTitle}>
                      {monthNames[calendarViewMonth]} {calendarViewYear}
                    </span>
                    <button
                      type="button"
                      className={styles.calendarNavBtn}
                      onClick={handleNextMonth}
                      title="Next Month"
                    >
                      &rsaquo;
                    </button>
                  </div>

                  <div className={styles.calendarWeekDaysRow}>
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  <div className={styles.calendarDaysGrid}>
                    {Array.from({ length: calendarDays.firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className={styles.calendarEmptyCell} />
                    ))}
                    {Array.from({ length: calendarDays.daysInMonth }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateObj = new Date(calendarViewYear, calendarViewMonth, dayNum);
                      const key = formatDateKey(dateObj);
                      const isSelected = key === selectedDateKey;
                      const isTodayDate = key === formatDateKey(todayDate);

                      return (
                        <button
                          key={key}
                          type="button"
                          className={`${styles.calendarDayCell} ${
                            isSelected ? styles.calendarDayCellActive : ""
                          } ${isTodayDate ? styles.calendarDayCellToday : ""}`}
                          onClick={() => handleSelectDateFromCalendar(dayNum)}
                          title={`${dayNum} ${monthNames[calendarViewMonth]} ${calendarViewYear}${
                            isTodayDate ? " (Today)" : ""
                          }`}
                        >
                          {dayNum}
                        </button>
                      );
                    })}
                  </div>

                  <div className={styles.calendarFooter}>
                    <button
                      type="button"
                      className={styles.calendarTodayBtn}
                      onClick={() => {
                        handleJumpToToday();
                        setIsCalendarOpen(false);
                      }}
                    >
                      Today ({formatDateKey(todayDate)})
                    </button>
                    <button
                      type="button"
                      className={styles.calendarCloseBtn}
                      onClick={() => setIsCalendarOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {dayOffset !== 0 && (
              <button
                type="button"
                className={styles.todayResetBadgeBtn}
                onClick={handleJumpToToday}
                title="Jump back to today"
              >
                Today
              </button>
            )}
          </div>
          <span className={styles.mealCountBadge}>4 meal services planned</span>
        </div>

        <div className={styles.mealCardsList}>
          {orderedMeals.map(({ key, data, status }) => {
            const isOngoing = status.status === "ongoing";
            const isExpanded = !!expandedMeals[key];

            return (
              <article
                key={key}
                className={`${styles.mealCard} ${isOngoing ? styles.mealCardOngoing : ""}`}
                onClick={() => router.push("/student/access-meal")}
                title="Click to access meal"
              >
                {/* Blank Photo Canvas - Strictly No Photo, Elegant Neutral Container */}
                <div className={styles.blankPhotoCard} aria-hidden="true">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className={styles.blankPhotoIcon}
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="m21 15-5-5L5 21" />
                  </svg>
                </div>

                <div className={styles.mealContent}>
                  <div className={styles.mealTopBar}>
                    <div className={styles.mealTitleGroup}>
                      <h3 className={styles.mealName}>{data.name}</h3>
                      {isToday && currentMinutes !== null && (
                        <span className={`${styles.mealStatusBadge} ${styles["mealStatus_" + status.status]}`}>
                          {isOngoing && <span className={styles.statusPulseDot} />}
                          {status.label}
                        </span>
                      )}
                    </div>
                    <span className={styles.timingBadge}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {data.timing}
                    </span>
                  </div>

                  <p className={styles.highlightText}>{data.highlight}</p>

                  <button
                    type="button"
                    className={styles.categoriesToggleBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMealDetails(key);
                    }}
                  >
                    <span>{isExpanded ? "Hide Items Breakdown" : "View Full Thali Items"}</span>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      style={{
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div
                      className={styles.categoriesGrid}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {[...data.sections]
                        .sort((a, b) => {
                          const aIsNorth = a.category.toLowerCase().includes("north");
                          const bIsNorth = b.category.toLowerCase().includes("north");
                          const aIsSouth = a.category.toLowerCase().includes("south");
                          const bIsSouth = b.category.toLowerCase().includes("south");
                          if (aIsNorth && bIsSouth) return -1;
                          if (aIsSouth && bIsNorth) return 1;
                          return 0;
                        })
                        .map((sec) => (
                        <div key={sec.category} className={styles.categoryCard}>
                          <span className={styles.categoryTitle}>{sec.category}</span>
                          <ul className={styles.categoryItemList}>
                            {sec.items.map((item, idx) => (
                              <li key={idx} className={styles.categoryItem}>
                                <span className={styles.categoryBullet} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
