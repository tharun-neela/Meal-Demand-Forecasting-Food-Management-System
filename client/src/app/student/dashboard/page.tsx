"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { getMenuForDate, parseMealTimingRange } from "../menu/menuData";

// Helper for calculating exact SVG donut arc paths
function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: Number((cx + radius * Math.cos(angleInRadians)).toFixed(3)),
    y: Number((cy + radius * Math.sin(angleInRadians)).toFixed(3)),
  };
}

function describeDonutArc(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number
) {
  const p1 = polarToCartesian(cx, cy, rOuter, startAngle);
  const p2 = polarToCartesian(cx, cy, rOuter, endAngle);
  const p3 = polarToCartesian(cx, cy, rInner, endAngle);
  const p4 = polarToCartesian(cx, cy, rInner, startAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M ${p1.x} ${p1.y} A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y} Z`;
}

interface WasteItem {
  name: string;
  weightKg: number;
  percentage: number;
  color: string;
  stroke: string;
  dotColor: string;
  dotBorder?: string;
  timing: string;
}

// Daily meal waste breakdown (Breakfast, Lunch, Snack, Dinner)
const DAILY_WASTE_DATA: WasteItem[] = [
  {
    name: "Breakfast",
    weightKg: 16.6,
    percentage: 20,
    color: "#2563eb", // Blue
    stroke: "#ffffff",
    dotColor: "#2563eb",
    timing: "07:30 AM - 10:00 AM",
  },
  {
    name: "Lunch",
    weightKg: 24.9,
    percentage: 30,
    color: "#fbf6ee", // White / Cream
    stroke: "#e2e8f0",
    dotColor: "#fbf6ee",
    dotBorder: "1.5px solid #94a3b8",
    timing: "12:00 PM - 02:30 PM",
  },
  {
    name: "Snack",
    weightKg: 0,
    percentage: 0,
    color: "#c026d3", // Snack purple
    stroke: "#ffffff",
    dotColor: "#c026d3",
    timing: "04:30 PM - 06:00 PM",
  },
  {
    name: "Dinner",
    weightKg: 41.5,
    percentage: 50,
    color: "#f36f21", // Orange
    stroke: "#ffffff",
    dotColor: "#f36f21",
    timing: "07:30 PM - 10:00 PM",
  },
];

interface AttendanceRecord {
  id: string;
  mealName: string;
  messHall: string;
  timestamp: string;
  dateKey: string;
  qrPayload?: string;
  tokenCode?: string;
  verified?: boolean;
}

interface HeatmapDay {
  dateKey: string; // YYYY-MM-DD
  dateObj: Date;
  dayOfWeek: number;
  count: number; // 0 to 4
  meals: string[];
  isFuture: boolean;
  isToday: boolean;
  isOutOfBounds: boolean;
  formattedDate: string;
  shortDate: string;
}

interface MonthMarker {
  label: string;
  weekIndex: number;
}

interface HistoryItem {
  id: string;
  type: "approved" | "rejected" | "fraud";
  titlePrefix: string;
  highlightText: string;
  titleSuffix: string;
  timestamp: string;
}

// Default recent history records faithfully replicating the reference UI
const DEFAULT_RECENT_HISTORY: HistoryItem[] = [
  {
    id: "hist-1",
    type: "approved",
    titlePrefix: "Meal verified and ",
    highlightText: "Approved",
    titleSuffix: "",
    timestamp: "28-12-2018 12:34 PM",
  },
  {
    id: "hist-2",
    type: "rejected",
    titlePrefix: "Meal access ",
    highlightText: "Not Approved",
    titleSuffix: "",
    timestamp: "26-11-2018 08:47 PM",
  },
  {
    id: "hist-3",
    type: "fraud",
    titlePrefix: "",
    highlightText: "Fraud Detected",
    titleSuffix: " on meal card",
    timestamp: "24-11-2018 11:13 PM",
  },
  {
    id: "hist-4",
    type: "approved",
    titlePrefix: "Meal verified and ",
    highlightText: "Approved",
    titleSuffix: "",
    timestamp: "31-12-2017 09:22 AM",
  },
  {
    id: "hist-5",
    type: "rejected",
    titlePrefix: "Meal access ",
    highlightText: "Not Approved",
    titleSuffix: "",
    timestamp: "06-09-2017 12:39 PM",
  },
];

const STORAGE_KEY = "student_meal_attendance_records";
const STUDENT_FIRST_NAME = "Tharun";

function getShortCategoryLabel(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes("north")) return "North";
  if (lower.includes("south")) return "South";
  if (lower.includes("bread")) return "Breads";
  if (lower.includes("dessert")) return "Dessert";
  if (lower.includes("snack")) return "Snacks";
  if (lower.includes("beverage") || lower.includes("tea") || lower.includes("coffee")) return "Beverages";
  if (lower.includes("curd") || lower.includes("raita")) return "Curd";
  if (lower.includes("healthy") || lower.includes("continental")) return "Healthy";
  return category;
}

// Deterministic baseline past attendance for Tharun across the calendar year
function getHistoricalMealAttendance(date: Date): { count: number; meals: string[] } {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  const dayOfWeek = date.getDay();

  // Semester break in June / early July: lower attendance
  if (m === 5 || (m === 6 && d <= 15)) {
    const val = (y * 31 + m * 7 + d * 13) % 10;
    if (val < 6) return { count: 0, meals: [] };
    if (val < 8) return { count: 1, meals: ["Breakfast"] };
    return { count: 2, meals: ["Breakfast", "Dinner"] };
  }

  // Regular college days with Tharun's 96% mess consistency
  const hash = (y * 365 + m * 31 + d * 17 + dayOfWeek * 7) % 100;
  if (hash < 12) {
    return { count: 0, meals: [] };
  } else if (hash < 25) {
    return { count: 1, meals: ["Breakfast"] };
  } else if (hash < 48) {
    return { count: 2, meals: ["Breakfast", "Lunch"] };
  } else if (hash < 76) {
    return { count: 3, meals: ["Breakfast", "Lunch", "Dinner"] };
  } else {
    return { count: 4, meals: ["Breakfast", "Lunch", "Evening Snacks", "Dinner"] };
  }
}

export default function StudentDashboardPage() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  // Year Selection: 2026 (Current Year) and 2025 (Past Year)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Suggest a Dish form state
  const [suggestMealType, setSuggestMealType] = useState<string>("");
  const [suggestMess, setSuggestMess] = useState<string>("");
  const [suggestDishName, setSuggestDishName] = useState<string>("");
  const [suggestReason, setSuggestReason] = useState<string>("");
  const [suggestSubmitted, setSuggestSubmitted] = useState<boolean>(false);

  const handleSuggestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestDishName.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem("student_dish_suggestions") || "[]");
      const newEntry = {
        id: Date.now().toString(),
        mealType: suggestMealType || "General",
        mess: suggestMess || "Central Mess",
        dishName: suggestDishName.trim(),
        reason: suggestReason.trim(),
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("student_dish_suggestions", JSON.stringify([newEntry, ...existing]));
    } catch {
      // ignore storage error
    }

    setSuggestSubmitted(true);
    setSuggestMealType("");
    setSuggestMess("");
    setSuggestDishName("");
    setSuggestReason("");

    setTimeout(() => {
      setSuggestSubmitted(false);
    }, 3500);
  };

  const handleSuggestCancel = () => {
    setSuggestMealType("");
    setSuggestMess("");
    setSuggestDishName("");
    setSuggestReason("");
  };

  // Hovered tooltip state for the heatmap
  const [hoveredCell, setHoveredCell] = useState<{
    dateStr: string;
    shortDate: string;
    count: number;
    meals: string[];
    x: number;
    y: number;
  } | null>(null);

  const scrollWrapperRef = useRef<HTMLDivElement>(null);

  // Food Waste Donut Chart interactive state
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [wasteCount, setWasteCount] = useState<number>(83);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1100;
    let animId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setWasteCount(Math.round(ease * 83));
      if (progress < 1) animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, []);

  // SVG Geometry for Daily Food Wastage Donut Chart
  const donutCx = 105;
  const donutCy = 105;
  const donutROuter = 88;
  const donutRInner = 58;

  // Donut slices:
  // 1. Dinner (Orange) on the right side: 0° to 180° (50%)
  const orangePath = describeDonutArc(donutCx, donutCy, donutRInner, donutROuter, 0.05, 179.95);
  // 2. Lunch (White) on the bottom-left: 180° to 288° (30%)
  const whitePath = describeDonutArc(donutCx, donutCy, donutRInner, donutROuter, 180.05, 287.95);
  // 3. Breakfast (Blue) on the top-left: 288° to 360° (20%)
  const bluePath = describeDonutArc(donutCx, donutCy, donutRInner, donutROuter, 288.05, 359.95);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsYearDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync real attendance records from shared storage
  const syncAttendanceRecords = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecords(parsed);
          return;
        }
      }
      setRecords([]);
    } catch {
      setRecords([]);
    }
  }, []);

  useEffect(() => {
    // Sync the real clock immediately on client mount
    setCurrentDate(new Date());

    // Keep local clock in sync every minute
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    syncAttendanceRecords();

    window.addEventListener("mealAttendanceUpdated", syncAttendanceRecords);
    window.addEventListener("storage", syncAttendanceRecords);

    return () => {
      clearInterval(timer);
      window.removeEventListener("mealAttendanceUpdated", syncAttendanceRecords);
      window.removeEventListener("storage", syncAttendanceRecords);
    };
  }, [syncAttendanceRecords]);

  // Real-time calculation of greeting, time of day, and relevant meal
  const greetingData = useMemo(() => {
    if (!currentDate) {
      return {
        timeSalutation: "Welcome",
        fullQuestion: "Ready to access your mess meal?",
      };
    }

    const hour = currentDate.getHours();
    const todayStr = currentDate.toISOString().split("T")[0];

    // Determine relevant meal & salutation based on real clock time
    let timeSalutation = "Good morning";
    let mealKey: "breakfast" | "lunch" | "snacks" | "dinner" = "breakfast";
    let questionUnconsumed = "Had your breakfast?";
    let questionConsumed = "How was your breakfast today?";

    if (hour >= 4 && hour < 12) {
      timeSalutation = "Good morning";
      mealKey = "breakfast";
      questionUnconsumed = "Had your breakfast?";
      questionConsumed = "How was your breakfast today?";
    } else if (hour >= 12 && hour < 17) {
      timeSalutation = "Good afternoon";
      mealKey = "lunch";
      questionUnconsumed = "Had your lunch?";
      questionConsumed = "How was your lunch today?";
    } else if (hour >= 17 && hour < 19) {
      timeSalutation = "Good evening";
      mealKey = "snacks";
      questionUnconsumed = "Had your evening snacks?";
      questionConsumed = "How were your evening snacks today?";
    } else if (hour >= 19 && hour <= 23) {
      timeSalutation = "Good evening";
      mealKey = "dinner";
      questionUnconsumed = "Had your dinner?";
      questionConsumed = "How was your dinner today?";
    } else {
      timeSalutation = "Good evening";
      mealKey = "dinner";
      questionUnconsumed = "Had your dinner tonight?";
      questionConsumed = "How was your dinner tonight?";
    }

    // Check if the student has real verified attendance for this meal today
    const hadMeal = records.some((r) => {
      const isDateMatch =
        r.dateKey === todayStr ||
        (r.timestamp && r.timestamp.toLowerCase().includes("today"));
      const isMealMatch =
        r.mealName && r.mealName.toLowerCase().includes(mealKey);
      return isDateMatch && isMealMatch && r.verified !== false;
    });

    const fullQuestion = hadMeal ? questionConsumed : questionUnconsumed;

    return {
      timeSalutation,
      fullQuestion,
    };
  }, [currentDate, records]);

  // Real-time calculation of today's current meal type, open status, and dishes
  const currentMealInfo = useMemo(() => {
    if (!currentDate) return null;

    const hour = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const currentMinutes = hour * 60 + minutes;

    // Get today's menu from the mess schedule
    const menuInfo = getMenuForDate(currentDate);
    const dayMeals = menuInfo.dayMenu.meals;

    // Determine current meal type based on hour
    let mealId: "breakfast" | "lunch" | "snacks" | "dinner" = "dinner";

    if (currentMinutes < 630) {
      // 12:00 AM - 10:30 AM
      mealId = "breakfast";
    } else if (currentMinutes < 990) {
      // 10:30 AM - 04:30 PM
      mealId = "lunch";
    } else if (currentMinutes < 1140) {
      // 04:30 PM - 07:00 PM
      mealId = "snacks";
    } else {
      // 07:00 PM - 11:59 PM (e.g. 7:30 to 9:30 PM Dinner window)
      mealId = "dinner";
    }

    const mealService = dayMeals[mealId];

    // Check if mess is currently open during this meal's service window
    const range = parseMealTimingRange(mealService.timing);
    let isMessOpen = false;
    if (range) {
      isMessOpen = currentMinutes >= range.startMinutes && currentMinutes <= range.endMinutes;
    }

    return {
      mealId,
      mealName: mealService.name,
      timing: mealService.timing,
      isMessOpen,
      sections: mealService.sections,
    };
  }, [currentDate]);

  // Check if the current active meal was accessed today by Tharun
  const isCurrentMealAccessed = useMemo(() => {
    if (!currentDate || !currentMealInfo) return false;
    const todayStr = currentDate.toISOString().split("T")[0];
    return records.some((r) => {
      const isDateMatch =
        r.dateKey === todayStr ||
        (r.timestamp && r.timestamp.toLowerCase().includes("today"));
      const isMealMatch =
        r.mealName &&
        r.mealName.toLowerCase().includes(currentMealInfo.mealId);
      return isDateMatch && isMealMatch && r.verified !== false;
    });
  }, [records, currentDate, currentMealInfo]);

  // Show "Give Feedback" button during active mess duration if current meal was accessed
  const showFeedbackBtn = Boolean(currentMealInfo && isCurrentMealAccessed && currentMealInfo.isMessOpen);

  // Active greeting question headline
  const greetingHeadlineQuestion = useMemo(() => {
    if (showFeedbackBtn && currentMealInfo) {
      return `How was your ${currentMealInfo.mealName} today?`;
    }
    return greetingData.fullQuestion;
  }, [showFeedbackBtn, currentMealInfo, greetingData.fullQuestion]);

  // Recent meal history list (prioritizing live verified scans, backed by reference history)
  const recentHistoryList = useMemo<HistoryItem[]>(() => {
    const liveItems: HistoryItem[] = records
      .filter((r) => r.verified !== false)
      .map((r) => {
        let displayTime = r.timestamp;
        if (displayTime.toLowerCase().includes("today")) {
          const timePart = displayTime.replace(/Today,?\s*/i, "").trim();
          if (currentDate) {
            const d = String(currentDate.getDate()).padStart(2, "0");
            const m = String(currentDate.getMonth() + 1).padStart(2, "0");
            const y = currentDate.getFullYear();
            displayTime = `${d}-${m}-${y} ${timePart}`;
          }
        }
        return {
          id: r.id,
          type: "approved",
          titlePrefix: "Meal verified and ",
          highlightText: "Approved",
          titleSuffix: "",
          timestamp: displayTime,
        };
      });

    return [...liveItems, ...DEFAULT_RECENT_HISTORY].slice(0, 5);
  }, [records, currentDate]);

  // Compute full calendar from Jan 1 to Dec 31 for selectedYear
  const { weeks, monthMarkers } = useMemo(() => {
    const year = selectedYear;
    const now = currentDate || new Date(year, 0, 1);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = currentDate ? today.toISOString().split("T")[0] : "";

    // Align grid: first column starts on the Sunday of the week containing Jan 1
    const startJan1 = new Date(year, 0, 1);
    const startDayOfWeek = startJan1.getDay(); // 0 is Sun
    const gridStart = new Date(year, 0, 1);
    gridStart.setDate(gridStart.getDate() - startDayOfWeek);

    // Final column ends on the Saturday of the week containing Dec 31
    const endDec31 = new Date(year, 11, 31);
    const endDayOfWeek = endDec31.getDay();
    const gridEnd = new Date(year, 11, 31);
    gridEnd.setDate(gridEnd.getDate() + (6 - endDayOfWeek));

    const weeksList: HeatmapDay[][] = [];
    const markers: MonthMarker[] = [];
    const recordedMonths = new Set<number>();

    const curr = new Date(gridStart);
    let weekIdx = 0;

    while (curr <= gridEnd) {
      const daysInWeek: HeatmapDay[] = [];

      for (let d = 0; d < 7; d++) {
        const dateObj = new Date(curr);
        const y = dateObj.getFullYear();
        const m = dateObj.getMonth();
        const dt = dateObj.getDate();
        const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(dt).padStart(2, "0")}`;

        const isOutOfBounds = y !== year;
        const isToday = Boolean(currentDate && y === currentDate.getFullYear() && dateKey === todayStr);
        const isFuture = Boolean(currentDate && (y > currentDate.getFullYear() || (y === currentDate.getFullYear() && dateObj > today)));

        let count = 0;
        let meals: string[] = [];

        if (!isOutOfBounds && !isFuture) {
          const matchingRecords = records.filter((r) => {
            return r.dateKey === dateKey || (isToday && r.timestamp && r.timestamp.toLowerCase().includes("today"));
          });

          if (matchingRecords.length > 0) {
            const uniqueMeals = new Set<string>();
            matchingRecords.forEach((r) => {
              const name = (r.mealName || "").toLowerCase();
              if (name.includes("breakfast")) uniqueMeals.add("Breakfast");
              else if (name.includes("lunch")) uniqueMeals.add("Lunch");
              else if (name.includes("snack")) uniqueMeals.add("Evening Snacks");
              else if (name.includes("dinner")) uniqueMeals.add("Dinner");
            });
            count = Math.min(uniqueMeals.size, 4);
            meals = Array.from(uniqueMeals);
          } else if (isToday) {
            count = 0;
            meals = [];
          } else {
            const hist = getHistoricalMealAttendance(dateObj);
            count = hist.count;
            meals = hist.meals;
          }
        }

        // Record month marker (Jan to Dec) at the exact week column where day 1 of month m appears
        if (!isOutOfBounds && !recordedMonths.has(m)) {
          recordedMonths.add(m);
          markers.push({
            label: dateObj.toLocaleDateString("en-IN", { month: "short" }),
            weekIndex: weekIdx,
          });
        }

        const formattedDate = dateObj.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });

        const shortDate = `${dateObj.getDate()} ${dateObj.toLocaleDateString("en-US", { month: "short" })}`;

        daysInWeek.push({
          dateKey,
          dateObj,
          dayOfWeek: d,
          count,
          meals,
          isFuture,
          isToday,
          isOutOfBounds,
          formattedDate,
          shortDate,
        });

        curr.setDate(curr.getDate() + 1);
      }

      weeksList.push(daysInWeek);
      weekIdx++;
    }

    return { weeks: weeksList, monthMarkers: markers };
  }, [selectedYear, currentDate, records]);

  // Handle cell hover to display tooltip
  const handleCellHover = (day: HeatmapDay, e: React.MouseEvent<HTMLDivElement>) => {
    if (day.isOutOfBounds || !scrollWrapperRef.current) return;
    const containerRect = scrollWrapperRef.current.getBoundingClientRect();
    const targetRect = e.currentTarget.getBoundingClientRect();

    const x = targetRect.left - containerRect.left + targetRect.width / 2 + scrollWrapperRef.current.scrollLeft;
    const y = targetRect.top - containerRect.top;

    setHoveredCell({
      dateStr: day.formattedDate,
      shortDate: day.shortDate,
      count: day.count,
      meals: day.meals,
      x,
      y,
    });
  };

  const handleCellLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className={styles.dashboardContainer} suppressHydrationWarning>
      {/* Greeting Card - Dynamic action: Access Meal -> Give Feedback when accessed during meal */}
      <Link
        href={showFeedbackBtn ? "/student/feedback" : "/student/access-meal"}
        className={styles.greetingHeroCard}
        aria-label={showFeedbackBtn ? "Click to give meal feedback" : "Click to access meal"}
      >
        <h1 className={styles.greetingHeadline}>
          <span className={styles.greetingSalutation}>{greetingData.timeSalutation}, </span>
          <span className={styles.greetingStudentName}>{STUDENT_FIRST_NAME}</span>
          <span className={styles.greetingPunctuation}>! </span>
          <span className={styles.greetingQuestion}>{greetingHeadlineQuestion}</span>
        </h1>

        {showFeedbackBtn ? (
          <div className={styles.greetingFeedbackPill}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Give Feedback</span>
            <svg
              className={styles.greetingActionArrow}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        ) : (
          <div className={styles.greetingActionPill}>
            <span>Access Meal</span>
            <svg
              className={styles.greetingActionArrow}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        )}
      </Link>

      {/* GitHub-style Heatmap Card (Jan to Dec with Year Selector & Bottom Legend) */}
      <section className={styles.heatmapCard} aria-label="Meal Attendance Heatmap">
        {/* Small Heading & Year Dropdown */}
        <div className={styles.heatmapHeader}>
          <h3 className={styles.heatmapTitle}>Meal Attendance Activity</h3>

          {/* Top Year Dropdown: Current Year (2026) & Past Year (2025) */}
          <div className={styles.yearDropdownWrapper} ref={dropdownRef}>
            <button
              type="button"
              className={styles.yearDropdownBtn}
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              aria-expanded={isYearDropdownOpen}
              aria-label="Select calendar year"
            >
              <span>{selectedYear === 2026 ? "2026 (Current)" : "2025"}</span>
              <span
                className={styles.yearChevron}
                style={{
                  transform: isYearDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </button>

            {isYearDropdownOpen && (
              <div className={styles.yearDropdownMenu}>
                <button
                  type="button"
                  className={`${styles.yearDropdownItem} ${selectedYear === 2026 ? styles.yearDropdownItemActive : ""}`}
                  onClick={() => {
                    setSelectedYear(2026);
                    setIsYearDropdownOpen(false);
                  }}
                >
                  <span>2026 (Current)</span>
                  {selectedYear === 2026 && <span>✓</span>}
                </button>
                <button
                  type="button"
                  className={`${styles.yearDropdownItem} ${selectedYear === 2025 ? styles.yearDropdownItemActive : ""}`}
                  onClick={() => {
                    setSelectedYear(2025);
                    setIsYearDropdownOpen(false);
                  }}
                >
                  <span>2025 (Past Year)</span>
                  {selectedYear === 2025 && <span>✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap Grid (Jan to Dec, without weekday labels on the left) */}
        <div className={styles.heatmapScrollArea} ref={scrollWrapperRef}>
          <div className={styles.heatmapInner}>
            <div className={styles.weeksGrid}>
              {weeks.map((week, wIdx) => (
                <div key={`week-${wIdx}`} className={styles.weekCol}>
                  {week.map((day, dIdx) => {
                    if (day.isOutOfBounds) {
                      return (
                        <div
                          key={`empty-${wIdx}-${dIdx}`}
                          className={styles.cell}
                          style={{ visibility: "hidden", pointerEvents: "none" }}
                        />
                      );
                    }

                    const countCls =
                      day.count === 4
                        ? styles.cell4
                        : day.count === 3
                        ? styles.cell3
                        : day.count === 2
                        ? styles.cell2
                        : day.count === 1
                        ? styles.cell1
                        : styles.cell0;

                    return (
                      <div
                        key={day.dateKey}
                        className={`${styles.cell} ${countCls}`}
                        onMouseEnter={(e) => handleCellHover(day, e)}
                        onMouseMove={(e) => handleCellHover(day, e)}
                        onMouseLeave={handleCellLeave}
                        aria-label={`${day.formattedDate}: ${day.count} meals accessed`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Months Row Along the Bottom (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec) */}
            <div className={styles.monthsRow}>
              {monthMarkers.map((m) => {
                const leftPercent = (m.weekIndex / weeks.length) * 100;
                return (
                  <span
                    key={`${m.label}-${m.weekIndex}`}
                    className={styles.monthLabel}
                    style={{ left: `${leftPercent}%` }}
                  >
                    {m.label}
                  </span>
                );
              })}
            </div>

            {/* Minimalist Floating Cell Date Badge (e.g. 30 Oct) */}
            {hoveredCell && (
              <div
                className={styles.tooltipBubble}
                style={{
                  left: `${hoveredCell.x}px`,
                  top: `${hoveredCell.y}px`,
                }}
              >
                <span>{hoveredCell.shortDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap Footer: Less to More Stroke Legend at the Bottom */}
        <div className={styles.heatmapFooter}>
          <div className={styles.heatmapLegend}>
            <span className={styles.legendText}>Less</span>
            <span className={`${styles.legendCell} ${styles.cell0}`} title="0 meals: White empty cell" />
            <span className={`${styles.legendCell} ${styles.cell1}`} title="1 meal: Very light" />
            <span className={`${styles.legendCell} ${styles.cell2}`} title="2 meals: Light orange stroke" />
            <span className={`${styles.legendCell} ${styles.cell3}`} title="3 meals: Light orange stroke" />
            <span className={`${styles.legendCell} ${styles.cell4}`} title="4 meals: Thick orange stroke" />
            <span className={styles.legendText}>More</span>
          </div>
        </div>
      </section>

      {/* Bottom Section: Left Column (Today's Menu + Recent Meal History) & Right Column (Food Wastage) */}
      <div className={styles.bottomRow}>
        <div className={styles.leftColumn}>
          {currentMealInfo ? (
            <section className={styles.todayMenuCard} aria-label="Today's Meal Menu">
              {/* Header Row */}
              <div className={styles.todayMenuHeader}>
                <div className={styles.todayMenuMeta}>
                  <span className={styles.todayMenuSub}>TODAY&apos;S MENU</span>
                  <h2 className={styles.todayMenuHeading}>{currentMealInfo.mealName}</h2>
                  <span className={styles.todayMenuTiming}>{currentMealInfo.timing}</span>
                </div>

                {currentMealInfo.isMessOpen ? (
                  <span className={styles.messOpenBadge}>
                    <span className={styles.pulseDot} />
                    Mess is open
                  </span>
                ) : (
                  <span className={styles.messClosedBadge}>
                    Mess is closed
                  </span>
                )}
              </div>

              <div className={styles.menuDivider} />

              {/* Dishes Sections Representation matching reference UI layout */}
              <div className={styles.menuSectionsContainer}>
                {currentMealInfo.sections.length >= 4 &&
                currentMealInfo.sections[2].items.length <= 2 &&
                currentMealInfo.sections[3].items.length <= 1 ? (
                  <>
                    {/* Section 0: e.g. North Indian */}
                    <div className={styles.sectionBlock}>
                      <h4 className={styles.sectionTitle}>
                        {currentMealInfo.sections[0].category.toUpperCase()}
                      </h4>
                      <div className={styles.dishCardsGrid3}>
                        {currentMealInfo.sections[0].items.map((dish) => (
                          <div key={dish} className={styles.dishCard}>
                            <div className={styles.dishCardTop}>
                              <span className={styles.dishCategoryPill}>
                                {getShortCategoryLabel(currentMealInfo.sections[0].category)}
                              </span>
                            </div>
                            <div className={styles.dishCardBottom}>
                              <span className={styles.dishCardTitle}>{dish}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Section 1: e.g. South Indian */}
                    <div className={styles.sectionBlock}>
                      <h4 className={styles.sectionTitle}>
                        {currentMealInfo.sections[1].category.toUpperCase()}
                      </h4>
                      <div className={styles.dishCardsGrid3}>
                        {currentMealInfo.sections[1].items.map((dish) => (
                          <div key={dish} className={styles.dishCard}>
                            <div className={styles.dishCardTop}>
                              <span className={styles.dishCategoryPill}>
                                {getShortCategoryLabel(currentMealInfo.sections[1].category)}
                              </span>
                            </div>
                            <div className={styles.dishCardBottom}>
                              <span className={styles.dishCardTitle}>{dish}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Split Row for Sections 2 & 3: Breads & Accompaniments (Left) + Dessert (Right) */}
                    <div className={styles.splitRowGroup}>
                      <div className={styles.splitColLeft}>
                        <h4 className={styles.sectionTitle}>
                          {currentMealInfo.sections[2].category.toUpperCase()}
                        </h4>
                        <div className={styles.dishCardsGrid2}>
                          {currentMealInfo.sections[2].items.map((dish) => (
                            <div key={dish} className={styles.dishCard}>
                              <div className={styles.dishCardTop}>
                                <span className={styles.dishCategoryPill}>
                                  {getShortCategoryLabel(currentMealInfo.sections[2].category)}
                                </span>
                              </div>
                              <div className={styles.dishCardBottom}>
                                <span className={styles.dishCardTitle}>{dish}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={styles.splitColRight}>
                        <h4 className={styles.sectionTitle}>
                          {currentMealInfo.sections[3].category.toUpperCase()}
                        </h4>
                        <div className={styles.dishCardsGrid1}>
                          {currentMealInfo.sections[3].items.map((dish) => (
                            <div key={dish} className={styles.dishCard}>
                              <div className={styles.dishCardTop}>
                                <span className={styles.dishCategoryPill}>
                                  {getShortCategoryLabel(currentMealInfo.sections[3].category)}
                                </span>
                              </div>
                              <div className={styles.dishCardBottom}>
                                <span className={styles.dishCardTitle}>{dish}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  currentMealInfo.sections.map((sec) => (
                    <div key={sec.category} className={styles.sectionBlock}>
                      <h4 className={styles.sectionTitle}>{sec.category.toUpperCase()}</h4>
                      <div className={styles.dishCardsGrid3}>
                        {sec.items.map((dish) => (
                          <div key={dish} className={styles.dishCard}>
                            <div className={styles.dishCardTop}>
                              <span className={styles.dishCategoryPill}>
                                {getShortCategoryLabel(sec.category)}
                              </span>
                            </div>
                            <div className={styles.dishCardBottom}>
                              <span className={styles.dishCardTitle}>{dish}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          ) : (
            <section className={styles.todayMenuCard} aria-label="Today's Meal Menu Loading">
              <div className={styles.todayMenuHeader}>
                <div className={styles.todayMenuMeta}>
                  <span className={styles.todayMenuSub}>TODAY&apos;S MENU</span>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.skeletonTiming} />
                </div>
                <div className={styles.skeletonBadge} />
              </div>

              <div className={styles.menuDivider} />

              <div className={styles.menuSectionsContainer}>
                <div className={styles.sectionBlock}>
                  <div className={styles.skeletonSectionHeader} />
                  <div className={styles.dishCardsGrid3}>
                    <div className={`${styles.dishCard} ${styles.skeletonDishCard}`} />
                    <div className={`${styles.dishCard} ${styles.skeletonDishCard}`} />
                    <div className={`${styles.dishCard} ${styles.skeletonDishCard}`} />
                  </div>
                </div>
                <div className={styles.sectionBlock}>
                  <div className={styles.skeletonSectionHeader} />
                  <div className={styles.dishCardsGrid3}>
                    <div className={`${styles.dishCard} ${styles.skeletonDishCard}`} />
                    <div className={`${styles.dishCard} ${styles.skeletonDishCard}`} />
                    <div className={`${styles.dishCard} ${styles.skeletonDishCard}`} />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Bottom Cards Row: Recent Meal History + Suggest a Dish */}
          <div className={styles.bottomCardsRow}>
            {/* Recent Meal History Card */}
            <section className={styles.recentHistoryCard} aria-label="Recent Meal History">
              <div className={styles.recentHistoryHeader}>
                <h3 className={styles.recentHistoryTitle}>Recent Meal History</h3>
                <Link href="/student/history" className={styles.recentHistoryViewAll}>
                  View All
                </Link>
              </div>

              <div className={styles.recentHistoryList}>
                {recentHistoryList.map((item) => (
                  <div key={item.id} className={styles.recentHistoryItem}>
                    <div
                      className={`${styles.historyIconCircle} ${
                        item.type === "approved"
                          ? styles.iconApproved
                          : item.type === "rejected"
                          ? styles.iconRejected
                          : styles.iconFraud
                      }`}
                    >
                      {item.type === "approved" && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                      {item.type === "rejected" && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      )}
                      {item.type === "fraud" && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      )}
                    </div>

                    <div className={styles.historyItemContent}>
                      <div className={styles.historyItemTitle}>
                        <span>{item.titlePrefix}</span>
                        <span className={styles.highlightBlue}>{item.highlightText}</span>
                        <span>{item.titleSuffix}</span>
                      </div>
                      <div className={styles.historyItemDate}>{item.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Suggest a Dish Card (Faithfully replicating reference UI with Orange Submit Button) */}
            <section className={styles.suggestDishCard} aria-label="Suggest a Dish">
              <div className={styles.suggestHeader}>
                <div className={styles.suggestHeaderMeta}>
                  <h3 className={styles.suggestTitle}>Suggest a Dish</h3>
                  <p className={styles.suggestSubtitle}>Help mess administration improve the menu.</p>
                </div>
                <div className={styles.suggestIllustrationWrapper}>
                  {/* Food bowl vector illustration matching reference design */}
                  <svg
                    width="52"
                    height="52"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.suggestIllustration}
                    aria-hidden="true"
                  >
                    {/* Sparkle top left */}
                    <path
                      d="M12 14C12 17 9 19 6 19C9 19 12 21 12 24C12 21 15 19 18 19C15 19 12 17 12 14Z"
                      fill="#f59e0b"
                    />
                    {/* Sparkle tiny right */}
                    <path
                      d="M56 12C56 14 54 15 52 15C54 15 56 16 56 18C56 16 58 15 60 15C58 15 56 14 56 12Z"
                      fill="#f59e0b"
                      opacity="0.8"
                    />
                    {/* Spoon */}
                    <path
                      d="M48 10L36 26"
                      stroke="#94a3b8"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <ellipse
                      cx="50"
                      cy="11"
                      rx="4.5"
                      ry="3"
                      transform="rotate(-40 50 11)"
                      fill="#cbd5e1"
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    {/* Bowl Shadow */}
                    <ellipse cx="32" cy="56" rx="22" ry="4" fill="#f1f5f9" />
                    {/* Food heap inside bowl */}
                    <ellipse cx="32" cy="30" rx="19" ry="10" fill="#f59e0b" />
                    {/* Rice / curry layers */}
                    <path
                      d="M14 30C14 24 22 21 32 21C42 21 50 24 50 30C50 33 42 36 32 36C22 36 14 33 14 30Z"
                      fill="#fbbf24"
                    />
                    <path
                      d="M17 31C20 25 26 23 34 23C42 23 47 26 47 31C44 34 38 35 32 35C24 35 19 33 17 31Z"
                      fill="#f59e0b"
                    />
                    {/* Garnishes / green peas */}
                    <circle cx="27" cy="27" r="2.2" fill="#16a34a" />
                    <circle cx="35" cy="28" r="2.5" fill="#22c55e" />
                    <circle cx="31" cy="31" r="2" fill="#15803d" />
                    <circle cx="41" cy="29" r="1.8" fill="#16a34a" />
                    {/* Bowl Body */}
                    <path
                      d="M12 30C12 43 20 52 32 52C44 52 52 43 52 30H12Z"
                      fill="#ffffff"
                      stroke="#334155"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    {/* Bowl base */}
                    <path
                      d="M24 52H40V54C40 55.1 39.1 56 38 56H26C24.9 56 24 55.1 24 54V52Z"
                      fill="#e2e8f0"
                      stroke="#334155"
                      strokeWidth="2"
                    />
                    {/* Bowl rim outline */}
                    <ellipse
                      cx="32"
                      cy="30"
                      rx="20"
                      ry="6.5"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="2.5"
                    />
                  </svg>
                </div>
              </div>

              <form onSubmit={handleSuggestSubmit} className={styles.suggestForm}>
                <div className={styles.suggestRow2Col}>
                  <div className={styles.suggestFieldGroup}>
                    <label className={styles.suggestLabel} htmlFor="suggest-meal-type">
                      Meal Type
                    </label>
                    <div className={styles.suggestSelectWrapper}>
                      <select
                        id="suggest-meal-type"
                        className={styles.suggestSelect}
                        value={suggestMealType}
                        onChange={(e) => setSuggestMealType(e.target.value)}
                      >
                        <option value="">Select Meal</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Evening Snacks">Evening Snacks</option>
                        <option value="Dinner">Dinner</option>
                      </select>
                      <svg
                        className={styles.suggestSelectChevron}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  <div className={styles.suggestFieldGroup}>
                    <label className={styles.suggestLabel} htmlFor="suggest-mess">
                      Mess
                    </label>
                    <div className={styles.suggestSelectWrapper}>
                      <select
                        id="suggest-mess"
                        className={styles.suggestSelect}
                        value={suggestMess}
                        onChange={(e) => setSuggestMess(e.target.value)}
                      >
                        <option value="">Select Mess</option>
                        <option value="BH-01">BH-01</option>
                        <option value="BH-02">BH-02</option>
                        <option value="BH-03">BH-03</option>
                        <option value="Central Mess">Central Mess</option>
                        <option value="GH-01">GH-01</option>
                        <option value="GH-02">GH-02</option>
                      </select>
                      <svg
                        className={styles.suggestSelectChevron}
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className={styles.suggestFieldGroup}>
                  <label className={styles.suggestLabel} htmlFor="suggest-dish">
                    Your Dish Recommendation
                  </label>
                  <input
                    id="suggest-dish"
                    type="text"
                    required
                    className={styles.suggestInput}
                    placeholder="e.g., Paneer Butter Masala, Biryani"
                    value={suggestDishName}
                    onChange={(e) => setSuggestDishName(e.target.value)}
                  />
                </div>

                <div className={styles.suggestFieldGroup}>
                  <label className={styles.suggestLabel} htmlFor="suggest-reason">
                    Brief reason (optional)
                  </label>
                  <textarea
                    id="suggest-reason"
                    rows={2}
                    className={styles.suggestTextarea}
                    placeholder="Why should we add it?"
                    value={suggestReason}
                    onChange={(e) => setSuggestReason(e.target.value)}
                  />
                </div>

                {suggestSubmitted && (
                  <div className={styles.suggestSuccessBanner}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#047857"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Thank you! Your dish recommendation was submitted.</span>
                  </div>
                )}

                <div className={styles.suggestFooter}>
                  <span className={styles.suggestNote}>Suggestions are reviewed.</span>
                  <div className={styles.suggestActions}>
                    <button type="submit" className={styles.suggestSubmitBtn}>
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={handleSuggestCancel}
                      className={styles.suggestCancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </div>
      </div>

      {/* Right Side: Daily Food Wastage Donut Card */}
      <div className={styles.wastageCardWrapper}>
          <div className={styles.wastageCard}>
            <h3 className={styles.wastageCardTitle}>Daily Food Wastage</h3>

            <div className={styles.chartContainer}>
              <svg
                viewBox="0 0 210 210"
                className={styles.donutSvg}
                role="img"
                aria-label="Daily food wastage donut chart showing 83kg across Dinner, Lunch, and Breakfast"
              >
                {/* Dinner Slice: Orange (50%) on Right */}
                <path
                  d={orangePath}
                  fill="#f36f21"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className={styles.donutSegment}
                  onMouseEnter={() => setHoveredSlice("Dinner")}
                  onMouseLeave={() => setHoveredSlice(null)}
                  style={{
                    opacity: hoveredSlice && hoveredSlice !== "Dinner" ? 0.6 : 1,
                  }}
                >
                  <title>Dinner: 41.5 kg (50%)</title>
                </path>

                {/* Lunch Slice: White/Cream (30%) on Bottom-Left */}
                <path
                  d={whitePath}
                  fill="#fbf6ee"
                  stroke="#e2e8f0"
                  strokeWidth="2.5"
                  className={styles.donutSegment}
                  onMouseEnter={() => setHoveredSlice("Lunch")}
                  onMouseLeave={() => setHoveredSlice(null)}
                  style={{
                    opacity: hoveredSlice && hoveredSlice !== "Lunch" ? 0.6 : 1,
                  }}
                >
                  <title>Lunch: 24.9 kg (30%)</title>
                </path>

                {/* Breakfast Slice: Blue (20%) on Top-Left */}
                <path
                  d={bluePath}
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className={styles.donutSegment}
                  onMouseEnter={() => setHoveredSlice("Breakfast")}
                  onMouseLeave={() => setHoveredSlice(null)}
                  style={{
                    opacity: hoveredSlice && hoveredSlice !== "Breakfast" ? 0.6 : 1,
                  }}
                >
                  <title>Breakfast: 16.6 kg (20%)</title>
                </path>
              </svg>

              {/* Centered Total Weight */}
              <div className={styles.chartCenterOverlay}>
                <span className={styles.centerNumber}>{wasteCount}</span>
                <span className={styles.centerUnit}>kg</span>
              </div>
            </div>

            <p className={styles.subtitleNote}>
              Daily mess food waste reduced by 14% today!
            </p>

            <button
              type="button"
              className={styles.moreInfoBtn}
              onClick={() => setShowInfoModal(true)}
            >
              More Information
            </button>

            {/* Legend Breakdown */}
            <div className={styles.legendList}>
              {DAILY_WASTE_DATA.map((item) => (
                <div
                  key={item.name}
                  className={styles.legendItem}
                  onMouseEnter={() => item.percentage > 0 && setHoveredSlice(item.name)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className={styles.legendLeft}>
                    <span
                      className={styles.legendDot}
                      style={{
                        backgroundColor: item.dotColor,
                        border: item.dotBorder || "none",
                      }}
                    />
                    <span className={styles.legendLabel}>{item.name}</span>
                  </div>
                  <div className={styles.legendRight}>
                    <span className={styles.legendKg}>{item.weightKg} kg</span>
                    <span className={styles.legendPercent}>{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Zero Food Waste Awareness Banner */}
            <div className={styles.wasteAwarenessCard}>
              <div className={styles.awarenessHeader}>
                <span className={styles.awarenessBadge}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Every Grain Matters
                </span>
                <h4 className={styles.awarenessTitle}>Don&apos;t Waste Food</h4>
              </div>

              <p className={styles.awarenessQuote}>
                &ldquo;The food you waste today can fulfill the hunger of an empty stomach. Thousands go to bed without a single meal.&rdquo;
              </p>

              <div className={styles.awarenessTipBox}>
                <span className={styles.awarenessTipIcon} aria-hidden="true">🍲</span>
                <div className={styles.awarenessTipText}>
                  <strong>Take Little &bull; Refill Frequently:</strong> Put small portions on your plate first. Mess meals are unlimited &mdash; you can always refill as much as you want!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal Dialog when clicking "More Information" */}
      {showInfoModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowInfoModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Daily Food Wastage Breakdown</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowInfoModal(false)}
                aria-label="Close dialog"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.modalDetailRows}>
              {DAILY_WASTE_DATA.map((item) => (
                <div key={item.name} className={styles.modalDetailItem}>
                  <div className={styles.modalDetailLeft}>
                    <span
                      className={styles.legendDot}
                      style={{
                        backgroundColor: item.dotColor,
                        border: item.dotBorder || "none",
                      }}
                    />
                    <div>
                      <div className={styles.modalDetailTitle}>{item.name}</div>
                      <div className={styles.modalDetailTiming}>{item.timing}</div>
                    </div>
                  </div>
                  <div className={styles.modalDetailRight}>
                    <div className={styles.modalDetailWeight}>{item.weightKg} kg</div>
                    <div className={styles.modalDetailPercent}>
                      {item.percentage > 0 ? `${item.percentage}% of daily total` : "Zero waste logged"}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.modalFooterNote}>
              📍 <strong>Mess Location:</strong> Boys Hostel 1 • Central Kitchen Hall 07
              <br />
              Total recorded waste today: <strong>83 kg</strong> (Reduced from 96.5 kg daily baseline).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
