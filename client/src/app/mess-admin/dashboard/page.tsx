"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { getMenuForDate, parseMealTimingRange } from "../../student/menu/menuData";
import {
  DiningHall,
  DEFAULT_DINING_HALLS,
  loadDiningHalls,
} from "../dining-halls/diningHallsData";
import PerformanceProfiler from "../../../components/PerformanceProfiler";

// Calculate center X coordinate for dining hall bar in SVG chart (viewBox width 760, plot 65 to 740, center 402.5)
function getBarCenterX(index: number, count: number): number {
  if (count <= 1) return 402.5;
  const spacing = Math.min(115, 540 / Math.max(count - 1, 1));
  const startX = 402.5 - ((count - 1) * spacing) / 2;
  return startX + index * spacing;
}

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

// Pre-computed Donut SVG Paths (computed once instead of every animation frame)
const DONUT_CX = 105;
const DONUT_CY = 105;
const DONUT_R_OUTER = 88;
const DONUT_R_INNER = 58;
const ORANGE_PATH = describeDonutArc(DONUT_CX, DONUT_CY, DONUT_R_INNER, DONUT_R_OUTER, 0.05, 179.95);
const WHITE_PATH = describeDonutArc(DONUT_CX, DONUT_CY, DONUT_R_INNER, DONUT_R_OUTER, 180.05, 287.95);
const BLUE_PATH = describeDonutArc(DONUT_CX, DONUT_CY, DONUT_R_INNER, DONUT_R_OUTER, 288.05, 359.95);

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

interface KpiItem {
  id: string;
  icon: React.ReactNode;
  iconClass: string;
  subText: string;
  value: string | number;
  label: string;
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

const DAILY_WASTE_DATA: WasteItem[] = [
  {
    name: "Breakfast",
    weightKg: 49.6,
    percentage: 20,
    color: "#2563eb",
    stroke: "#ffffff",
    dotColor: "#2563eb",
    timing: "07:30 AM – 09:30 AM",
  },
  {
    name: "Lunch",
    weightKg: 74.4,
    percentage: 30,
    color: "#fbf6ee",
    stroke: "#e2e8f0",
    dotColor: "#fbf6ee",
    dotBorder: "1.5px solid #94a3b8",
    timing: "11:30 AM – 03:00 PM",
  },
  {
    name: "Evening Snacks",
    weightKg: 0,
    percentage: 0,
    color: "#c026d3",
    stroke: "#ffffff",
    dotColor: "#c026d3",
    timing: "05:00 PM – 06:30 PM",
  },
  {
    name: "Dinner",
    weightKg: 124.0,
    percentage: 50,
    color: "#f36f21",
    stroke: "#ffffff",
    dotColor: "#f36f21",
    timing: "07:30 PM – 09:30 PM",
  },
];

const CAPACITY_GRID_TICKS = [
  { value: 3000, y: 40 },
  { value: 2500, y: 83 },
  { value: 2000, y: 126 },
  { value: 1500, y: 169 },
  { value: 1000, y: 212 },
  { value: 500, y: 255 },
  { value: 0, y: 298 },
];

/* -------------------------------------------------------------
   MEMOIZED SUBCOMPONENTS (React.memo to eliminate re-renders)
------------------------------------------------------------- */

// 1. KPI Cards Grid
const KpiGridSection = memo(function KpiGridSection({ kpiItems }: { kpiItems: KpiItem[] }) {
  return (
    <div className={styles.kpiGrid}>
      {kpiItems.map((kpi) => (
        <div key={kpi.id} className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <div className={`${styles.kpiIconWrapper} ${kpi.iconClass}`}>
              {kpi.icon}
            </div>
            <span className={styles.kpiSubBadge}>{kpi.subText}</span>
          </div>
          <div className={styles.kpiBottom}>
            <span className={styles.kpiValue}>{kpi.value}</span>
            <span className={styles.kpiLabel}>{kpi.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
});

// 2. Today's Menu Section
const TodayMenuSection = memo(function TodayMenuSection({
  currentMealInfo,
}: {
  currentMealInfo: ReturnType<typeof getMenuForDate> extends infer T ? any : any;
}) {
  if (!currentMealInfo) {
    return (
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
        <div className={styles.skeletonCards}>
          <div className={styles.skeletonDish} />
          <div className={styles.skeletonDish} />
          <div className={styles.skeletonDish} />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.todayMenuCard} aria-label="Today's Meal Menu">
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
          <span className={styles.messClosedBadge}>Mess is closed</span>
        )}
      </div>

      <div className={styles.menuDivider} />

      <div className={styles.menuSectionsContainer}>
        {currentMealInfo.sections.map((sec: any) => (
          <div key={sec.category} className={styles.sectionBlock}>
            <h4 className={styles.sectionTitle}>{sec.category.toUpperCase()}</h4>
            <div className={styles.dishCardsGrid}>
              {sec.items.map((dish: string) => (
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
        ))}
      </div>
    </section>
  );
});

// 3. Mess Capacity & Enrollment Bar Chart
interface CapacityBarChartProps {
  diningHalls: DiningHall[];
  activeHallId: string;
  onSelectHall: (id: string) => void;
}

const CapacityBarChart = memo(function CapacityBarChart({
  diningHalls,
  activeHallId,
  onSelectHall,
}: CapacityBarChartProps) {
  const activeHallIndex = useMemo(() => {
    if (diningHalls.length === 0) return -1;
    const idx = diningHalls.findIndex((h) => h.id === activeHallId);
    return idx >= 0 ? idx : 0;
  }, [diningHalls, activeHallId]);

  const activeHall = activeHallIndex >= 0 ? diningHalls[activeHallIndex] : null;
  const activeCx = activeHall ? getBarCenterX(activeHallIndex, diningHalls.length) : 402.5;
  const activeCapTopY = activeHall ? 298 - (Math.min(activeHall.capacity, 3000) / 3000) * 258 : 298;

  return (
    <section className={styles.capacityCard} aria-label="Mess Capacity and Enrollment Bar Chart">
      <div className={styles.capacityHeader}>
        <h3 className={styles.capacityTitle}>Mess Capacity &amp; Enrollment</h3>
        <div className={styles.capacityLegendGroup}>
          <div className={styles.capacityLegendBadge}>
            <span className={styles.legendOrangePill} />
            <span className={styles.legendBadgeText}>Registered Students</span>
          </div>
          <div className={styles.capacityLegendBadge}>
            <span className={styles.legendGrayPill} />
            <span className={styles.legendBadgeText}>Capacity Limit</span>
          </div>
        </div>
      </div>

      <div className={styles.capacityChartWrapper}>
        <svg
          viewBox="0 0 760 360"
          className={styles.capacitySvg}
          role="img"
          aria-label="Mess Capacity and Enrollment bar chart across dining halls"
        >
          {/* Horizontal Dotted Gridlines & Y-Axis Labels */}
          {CAPACITY_GRID_TICKS.map((tick) => (
            <g key={tick.value}>
              <text
                x="45"
                y={tick.y + 4}
                fill="#64748b"
                fontSize="12.5"
                fontWeight="500"
                textAnchor="end"
                fontFamily="inherit"
              >
                {tick.value}
              </text>
              <line
                x1="65"
                y1={tick.y}
                x2="740"
                y2={tick.y}
                stroke="#cbd5e1"
                strokeWidth="1.2"
                strokeDasharray="4 4"
              />
            </g>
          ))}

          {/* Bars */}
          {diningHalls.length === 0 ? (
            <text
              x="402.5"
              y="170"
              fill="#64748b"
              fontSize="14"
              fontWeight="500"
              textAnchor="middle"
              fontFamily="inherit"
            >
              No dining halls found.
            </text>
          ) : (
            diningHalls.map((hall, idx) => {
              const cx = getBarCenterX(idx, diningHalls.length);
              const capClamped = Math.min(hall.capacity, 3000);
              const regClamped = Math.min(hall.registered, 3000);
              const capHeight = (capClamped / 3000) * 258;
              const regHeight = (regClamped / 3000) * 258;
              const capY = 298 - capHeight;
              const regY = 298 - regHeight;
              const isHovered = activeHall?.id === hall.id;

              return (
                <g
                  key={hall.id}
                  className={styles.barColumn}
                  onMouseEnter={() => onSelectHall(hall.id)}
                >
                  <rect
                    x={cx - 38}
                    y={25}
                    width="76"
                    height="295"
                    fill="transparent"
                    cursor="pointer"
                  />
                  <rect
                    x={cx - 10}
                    y={capY}
                    width="20"
                    height={Math.max(capHeight, 0)}
                    rx="10"
                    ry="10"
                    fill={isHovered ? "#cbd5e1" : "#dbe2ea"}
                    className={styles.barCapacity}
                  />
                  <rect
                    x={cx - 7}
                    y={regY}
                    width="14"
                    height={Math.max(regHeight, 0)}
                    rx="7"
                    ry="7"
                    fill="#f36f21"
                    className={styles.barRegistered}
                    style={{
                      filter: isHovered ? "brightness(1.08)" : "none",
                    }}
                  />
                  <text
                    x={cx}
                    y="328"
                    fill={isHovered ? "#ea580c" : "#0f172a"}
                    fontSize="12.5"
                    fontWeight={isHovered ? "750" : "600"}
                    textAnchor="middle"
                    fontFamily="inherit"
                  >
                    {hall.name}
                  </text>
                </g>
              );
            })
          )}

          {/* Tooltip Overlay */}
          {activeHall && (
            <g className={styles.chartTooltipGroup}>
              <rect
                x={activeCx - 64}
                y={Math.max(12, activeCapTopY - 58)}
                width="128"
                height="48"
                rx="8"
                fill="#0f172a"
                style={{ filter: "drop-shadow(0 6px 14px rgba(15, 23, 42, 0.28))" }}
              />
              <polygon
                points={`${activeCx - 6},${Math.max(12, activeCapTopY - 58) + 48} ${activeCx},${Math.max(12, activeCapTopY - 58) + 55} ${activeCx + 6},${Math.max(12, activeCapTopY - 58) + 48}`}
                fill="#0f172a"
              />
              <text
                x={activeCx - 52}
                y={Math.max(12, activeCapTopY - 58) + 19}
                fill="#94a3b8"
                fontSize="11.5"
                fontWeight="500"
                fontFamily="inherit"
              >
                Capacity:{" "}
                <tspan fill="#ffffff" fontWeight="700">
                  {activeHall.capacity.toLocaleString()}
                </tspan>
              </text>
              <text
                x={activeCx - 52}
                y={Math.max(12, activeCapTopY - 58) + 37}
                fill="#94a3b8"
                fontSize="11.5"
                fontWeight="500"
                fontFamily="inherit"
              >
                Registered:{" "}
                <tspan fill="#ffffff" fontWeight="700">
                  {activeHall.registered.toLocaleString()}
                </tspan>
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
});

// 4. Food Wastage Donut Card (Decoupled so fast counter doesn't re-render entire page)
interface WastageDonutCardProps {
  wasteCount: number;
  hoveredSlice: string | null;
  onHoverSlice: (slice: string | null) => void;
}

const WastageDonutCard = memo(function WastageDonutCard({
  wasteCount,
  hoveredSlice,
  onHoverSlice,
}: WastageDonutCardProps) {
  return (
    <div className={styles.wastageCard}>
      <div className={styles.wastageHeaderGroup}>
        <h3 className={styles.wastageCardTitle}>Total Food Wastage</h3>
        <span className={styles.wastageScopeBadge}>Across All Dining Halls</span>
      </div>

      <div className={styles.chartContainer}>
        <svg
          viewBox="0 0 210 210"
          className={styles.donutSvg}
          role="img"
          aria-label="Total food wastage donut chart across all dining halls showing 248kg across Dinner, Lunch, and Breakfast"
        >
          {/* Dinner Slice */}
          <path
            d={ORANGE_PATH}
            fill="#f36f21"
            stroke="#ffffff"
            strokeWidth="2.5"
            className={styles.donutSegment}
            onMouseEnter={() => onHoverSlice("Dinner")}
            onMouseLeave={() => onHoverSlice(null)}
            style={{
              opacity: hoveredSlice && hoveredSlice !== "Dinner" ? 0.6 : 1,
            }}
          >
            <title>Dinner: 124.0 kg (50%)</title>
          </path>

          {/* Lunch Slice */}
          <path
            d={WHITE_PATH}
            fill="#fbf6ee"
            stroke="#cbd5e1"
            strokeWidth="2.5"
            className={styles.donutSegment}
            onMouseEnter={() => onHoverSlice("Lunch")}
            onMouseLeave={() => onHoverSlice(null)}
            style={{
              opacity: hoveredSlice && hoveredSlice !== "Lunch" ? 0.6 : 1,
            }}
          >
            <title>Lunch: 74.4 kg (30%)</title>
          </path>

          {/* Breakfast Slice */}
          <path
            d={BLUE_PATH}
            fill="#2563eb"
            stroke="#ffffff"
            strokeWidth="2.5"
            className={styles.donutSegment}
            onMouseEnter={() => onHoverSlice("Breakfast")}
            onMouseLeave={() => onHoverSlice(null)}
            style={{
              opacity: hoveredSlice && hoveredSlice !== "Breakfast" ? 0.6 : 1,
            }}
          >
            <title>Breakfast: 49.6 kg (20%)</title>
          </path>
        </svg>

        {/* Centered Total Weight */}
        <div className={styles.chartCenterOverlay}>
          <span className={styles.centerNumber}>{wasteCount}</span>
          <span className={styles.centerUnit}>kg</span>
        </div>
      </div>

      <p className={styles.subtitleNote}>
        Daily mess food waste reduced by 14% across all 6 halls today!
      </p>

      {/* Prefetch enabled Link for instant navigation */}
      <Link
        href="/mess-admin/waste-management"
        prefetch={true}
        className={styles.moreInfoBtn}
      >
        More Information
      </Link>

      {/* Legend Breakdown */}
      <div className={styles.legendList}>
        {DAILY_WASTE_DATA.map((item) => (
          <div
            key={item.name}
            className={styles.legendItem}
            onMouseEnter={() => item.percentage > 0 && onHoverSlice(item.name)}
            onMouseLeave={() => onHoverSlice(null)}
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
    </div>
  );
});

/* -------------------------------------------------------------
   MAIN DASHBOARD COMPONENT
------------------------------------------------------------- */

export default function DashboardPage() {
  const [diningHalls, setDiningHalls] = useState<DiningHall[]>(DEFAULT_DINING_HALLS);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [wasteCount, setWasteCount] = useState<number>(248);
  const [activeHallId, setActiveHallId] = useState<string>("bh-01");

  useEffect(() => {
    // Initial sync with stored dining halls
    setDiningHalls(loadDiningHalls());

    const handleSync = () => {
      setDiningHalls(loadDiningHalls());
    };

    window.addEventListener("diningHallsUpdated", handleSync);
    window.addEventListener("storage", handleSync);

    setCurrentDate(new Date());

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    // Smooth counter animation for total wastage
    let startTimestamp: number | null = null;
    const duration = 1200;
    let animId: number;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setWasteCount(Math.round(ease * 248));
      if (progress < 1) animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("diningHallsUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
      clearInterval(timer);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Real-time calculation of today's current meal type, open status, and dishes
  const currentMealInfo = useMemo(() => {
    if (!currentDate) return null;

    const hour = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const currentMinutes = hour * 60 + minutes;

    const menuInfo = getMenuForDate(currentDate);
    const dayMeals = menuInfo.dayMenu.meals;

    let mealId: "breakfast" | "lunch" | "snacks" | "dinner" = "dinner";
    if (currentMinutes < 630) {
      mealId = "breakfast";
    } else if (currentMinutes < 990) {
      mealId = "lunch";
    } else if (currentMinutes < 1140) {
      mealId = "snacks";
    } else {
      mealId = "dinner";
    }

    const mealService = dayMeals[mealId];
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

  // Memoized KPI metrics
  const kpiItems: KpiItem[] = useMemo(() => {
    const totalStudents = diningHalls.reduce((sum, h) => sum + (h.registered || 0), 0);
    const totalStaff = diningHalls.reduce((sum, h) => sum + (h.staff || 0), 0);
    const activeHallsCount = diningHalls.filter((h) => h.status === "Active").length;

    return [
      {
        id: "students",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
        iconClass: styles.kpiIconBlue,
        subText: "Across all dining halls",
        value: totalStudents.toLocaleString(),
        label: "Total Students",
      },
      {
        id: "staff",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        ),
        iconClass: styles.kpiIconPurple,
        subText: "Active on duty",
        value: totalStaff.toLocaleString(),
        label: "Total Kitchen Staff",
      },
      {
        id: "dining-halls",
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 3l9 7H3l9-7z" />
          </svg>
        ),
        iconClass: styles.kpiIconGreen,
        subText: `Active (${activeHallsCount}/${diningHalls.length})`,
        value: activeHallsCount.toString(),
        label: "Working Dining Halls",
      },
    ];
  }, [diningHalls]);

  const handleSelectHall = useCallback((id: string) => {
    setActiveHallId(id);
  }, []);

  const handleHoverSlice = useCallback((slice: string | null) => {
    setHoveredSlice(slice);
  }, []);

  return (
    <PerformanceProfiler id="DashboardPage">
      <div className={styles.dashboardContainer} suppressHydrationWarning>
        {/* Welcome Greeting Pill */}
        <div className={styles.greetingPill}>
          <span className={styles.greetingText}>Welcome back, Neeraj!</span>
          <span className={styles.wavingHand} role="img" aria-label="Waving hand">👋</span>
        </div>

        {/* 3 KPI Cards (Memoized) */}
        <KpiGridSection kpiItems={kpiItems} />

        {/* 2-Column Section */}
        <div className={styles.mainContentRow}>
          {/* Left Column: Today's Current Menu + Capacity Chart */}
          <div className={styles.leftColumn}>
            <TodayMenuSection currentMealInfo={currentMealInfo} />
            <CapacityBarChart
              diningHalls={diningHalls}
              activeHallId={activeHallId}
              onSelectHall={handleSelectHall}
            />
          </div>

          {/* Right Column: Total Food Wastage Donut Card */}
          <div className={styles.rightColumn}>
            <WastageDonutCard
              wasteCount={wasteCount}
              hoveredSlice={hoveredSlice}
              onHoverSlice={handleHoverSlice}
            />
          </div>
        </div>
      </div>
    </PerformanceProfiler>
  );
}
