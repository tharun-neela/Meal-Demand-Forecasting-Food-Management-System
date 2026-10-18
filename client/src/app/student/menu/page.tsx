"use client";

import { useState, useMemo, useEffect } from "react";
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
  // Today's anchor date
  const [todayAnchor, setTodayAnchor] = useState<Date>(INITIAL_DATE);
  const [todayDate, setTodayDate] = useState<Date>(INITIAL_DATE);

  // 7-day sliding page offset: 0 = current 7 days starting from today, 1 = next 7 days, -1 = prev 7 days
  const [slideOffset, setSlideOffset] = useState<number>(0);

  // Selected date key (automatically defaults to today)
  const [selectedDateKey, setSelectedDateKey] = useState<string>("2026-10-18");

  // Current local time in minutes since midnight (0..1439). Initialized to null to support safe SSR prerendering
  const [currentMinutes, setCurrentMinutes] = useState<number | null>(null);

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
    const startDate = new Date(todayAnchor.getTime() + slideOffset * 7 * 24 * 60 * 60 * 1000);
    return getUpcomingWeekDays(startDate, 7, todayDate);
  }, [todayAnchor, slideOffset, todayDate]);

  // Date range display label (e.g. "18 Oct – 24 Oct 2026")
  const dateRangeLabel = useMemo(() => {
    if (current7Days.length === 0) return "";
    const first = current7Days[0];
    const last = current7Days[current7Days.length - 1];
    return `${first.dayOfMonth} ${first.monthName} – ${last.dayOfMonth} ${last.monthName} ${last.year}`;
  }, [current7Days]);

  // Handle sliding right (Next 7 days)
  const handleSlideNext = () => {
    const nextOffset = slideOffset + 1;
    setSlideOffset(nextOffset);
    // Auto-select the first day of the new 7-day window
    const newStartDate = new Date(todayAnchor.getTime() + nextOffset * 7 * 24 * 60 * 60 * 1000);
    const newDayInfo = getMenuForDate(newStartDate, todayDate);
    setSelectedDateKey(newDayInfo.dateKey);
  };

  // Handle sliding left (Previous 7 days)
  const handleSlidePrev = () => {
    const prevOffset = slideOffset - 1;
    setSlideOffset(prevOffset);
    // Auto-select the first day of the new 7-day window
    const newStartDate = new Date(todayAnchor.getTime() + prevOffset * 7 * 24 * 60 * 60 * 1000);
    const newDayInfo = getMenuForDate(newStartDate, todayDate);
    setSelectedDateKey(newDayInfo.dateKey);
  };

  // Jump to today
  const handleJumpToToday = () => {
    setSlideOffset(0);
    const now = new Date();
    const clientToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    setTodayAnchor(clientToday);
    setTodayDate(clientToday);
    setSelectedDateKey(formatDateKey(clientToday));
    setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
  };

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
      {/* 7-Day Window Selector with Slide Controls */}
      <section className={styles.daySelectorSection} aria-label="Select Menu Day">
        <div className={styles.selectorHeaderRow}>
          {/* Slide Left / Right Controls */}
          <div className={styles.sliderControls}>
            {slideOffset !== 0 && (
              <button
                type="button"
                className={styles.todayJumpBtn}
                onClick={handleJumpToToday}
                title="Jump back to current week"
              >
                Today
              </button>
            )}

            <button
              type="button"
              className={styles.slideNavBtn}
              onClick={handleSlidePrev}
              title="Slide to Previous 7 Days"
              aria-label="Previous 7 Days"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Prev</span>
            </button>

            <span className={styles.dateRangeBadge}>
              {dateRangeLabel}
            </span>

            <button
              type="button"
              className={styles.slideNavBtn}
              onClick={handleSlideNext}
              title="Slide to Next 7 Days"
              aria-label="Next 7 Days"
            >
              <span>Next</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

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
      </section>

      {/* 4. Selected Day's Meals */}
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
                    onClick={() => toggleMealDetails(key)}
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
                    <div className={styles.categoriesGrid}>
                      {data.sections.map((sec) => (
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
