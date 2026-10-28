"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import styles from "./analytics.module.css";

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

// Daily meal waste breakdown in order: (Breakfast, Lunch, Snack, Dinner)
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
    color: "#fbf6ee", // White / Soft Cream from sample pic
    stroke: "#e2e8f0",
    dotColor: "#fbf6ee",
    dotBorder: "1.5px solid #94a3b8",
    timing: "12:00 PM - 02:30 PM",
  },
  {
    name: "Snack",
    weightKg: 0,
    percentage: 0,
    color: "#c026d3", // Snack signature purple
    stroke: "#ffffff",
    dotColor: "#c026d3",
    timing: "04:30 PM - 06:00 PM",
  },
  {
    name: "Dinner",
    weightKg: 41.5,
    percentage: 50,
    color: "#f36f21", // Website signature orange
    stroke: "#ffffff",
    dotColor: "#f36f21",
    timing: "07:30 PM - 10:00 PM",
  },
];

const TOTAL_WASTE_KG = 83;

// ============================================================
// MONTHLY MEAL ACCESS DATASET (12 Months, 4 Grouped Sessions)
// ============================================================
interface MonthlyMealRecord {
  month: string;
  fullName: string;
  breakfast: number;
  lunch: number;
  snacks: number;
  dinner: number;
}

const MONTHLY_MEAL_ACCESS_DATA: MonthlyMealRecord[] = [
  { month: "Jan", fullName: "January", breakfast: 30, lunch: 29, snacks: 24, dinner: 28 },
  { month: "Feb", fullName: "February", breakfast: 26, lunch: 27, snacks: 20, dinner: 26 },
  { month: "Mar", fullName: "March", breakfast: 29, lunch: 30, snacks: 25, dinner: 29 },
  { month: "Apr", fullName: "April", breakfast: 28, lunch: 29, snacks: 22, dinner: 28 },
  { month: "May", fullName: "May", breakfast: 18, lunch: 20, snacks: 14, dinner: 19 },
  { month: "Jun", fullName: "June", breakfast: 5, lunch: 6, snacks: 4, dinner: 6 },
  { month: "Jul", fullName: "July", breakfast: 12, lunch: 15, snacks: 10, dinner: 14 },
  { month: "Aug", fullName: "August", breakfast: 29, lunch: 31, snacks: 26, dinner: 30 },
  { month: "Sep", fullName: "September", breakfast: 28, lunch: 30, snacks: 25, dinner: 29 },
  { month: "Oct", fullName: "October", breakfast: 27, lunch: 28, snacks: 23, dinner: 28 },
  { month: "Nov", fullName: "November", breakfast: 29, lunch: 30, snacks: 26, dinner: 30 },
  { month: "Dec", fullName: "December", breakfast: 22, lunch: 24, snacks: 18, dinner: 22 },
];

// Interactive High-Contrast Tooltip for Grouped Bar Chart
function CustomBarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    const total =
      (data.breakfast || 0) +
      (data.lunch || 0) +
      (data.snacks || 0) +
      (data.dinner || 0);

    return (
      <div className={styles.barTooltipContainer}>
        <div className={styles.barTooltipHeader}>
          <span className={styles.barTooltipMonth}>{data.fullName || label}</span>
          <span className={styles.barTooltipTotal}>{total} Meals Accessed</span>
        </div>
        <div className={styles.barTooltipDivider} />
        <div className={styles.barTooltipRows}>
          <div className={styles.barTooltipRow}>
            <div className={styles.barTooltipLeft}>
              <span
                className={styles.legendColorDot}
                style={{ backgroundColor: "#2563eb" }}
              />
              <span className={styles.barTooltipName}>Breakfast:</span>
            </div>
            <span className={styles.barTooltipVal}>
              <strong>{data.breakfast}</strong> breakfast accessed in {label}
            </span>
          </div>
          <div className={styles.barTooltipRow}>
            <div className={styles.barTooltipLeft}>
              <span
                className={styles.legendColorDot}
                style={{ backgroundColor: "#0f172a" }}
              />
              <span className={styles.barTooltipName}>Lunch:</span>
            </div>
            <span className={styles.barTooltipVal}>
              <strong>{data.lunch}</strong> lunch accessed in {label}
            </span>
          </div>
          <div className={styles.barTooltipRow}>
            <div className={styles.barTooltipLeft}>
              <span
                className={styles.legendColorDot}
                style={{ backgroundColor: "#10b981" }}
              />
              <span className={styles.barTooltipName}>Snacks:</span>
            </div>
            <span className={styles.barTooltipVal}>
              <strong>{data.snacks}</strong> snacks accessed in {label}
            </span>
          </div>
          <div className={styles.barTooltipRow}>
            <div className={styles.barTooltipLeft}>
              <span
                className={styles.legendColorDot}
                style={{ backgroundColor: "#f36f21" }}
              />
              <span className={styles.barTooltipName}>Dinner:</span>
            </div>
            <span className={styles.barTooltipVal}>
              <strong>{data.dinner}</strong> dinner accessed in {label}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export default function MealAnalyticsPage() {
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Grouped bar chart controls
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);

  // Simultaneous rapid count-up state for cards & donut graph
  const [counts, setCounts] = useState({
    accessed: 0,
    missed: 0,
    moneyLost: 0,
    waste: 0,
  });

  useEffect(() => {
    setIsMounted(true);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setCounts({
        accessed: 170,
        missed: 30,
        moneyLost: 1500,
        waste: 83,
      });
      return;
    }

    const duration = 1200; // 1.2s rapid simultaneous counter
    let animationFrameId: number;
    let startTimestamp: number | null = null;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = timestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic: rapid initial surge, smoothly decelerates into final numbers
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounts({
        accessed: Math.round(ease * 170),
        missed: Math.round(ease * 30),
        moneyLost: Math.round(ease * 1500),
        waste: Math.round(ease * 83),
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCounts({
          accessed: 170,
          missed: 30,
          moneyLost: 1500,
          waste: 83,
        });
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // SVG Geometry
  const cx = 105;
  const cy = 105;
  const rOuter = 88;
  const rInner = 58;

  // Donut slices matching reference photo:
  // 1. Dinner (Orange) on the right side: 0° to 180° (50%)
  const orangePath = describeDonutArc(cx, cy, rInner, rOuter, 0.05, 179.95);
  // 2. Lunch (White) on the bottom-left: 180° to 288° (30%)
  const whitePath = describeDonutArc(cx, cy, rInner, rOuter, 180.05, 287.95);
  // 3. Breakfast (Blue) on the top-left: 288° to 360° (20%)
  const bluePath = describeDonutArc(cx, cy, rInner, rOuter, 288.05, 359.95);

  return (
    <div className={styles.analyticsContainer}>
      {/* ============================================================
          LEFT COLUMN: 3 Top Summary Cards (Side by Side with Donut Card)
          ============================================================ */}
      <div className={styles.leftColumn}>
        <section className={styles.topCardsGrid} aria-label="Student meal access summary">
          {/* Card 1: Accessed Meals */}
          <div className={`${styles.topCard} ${styles.heroCard}`}>
            <div className={styles.cardHeaderCol}>
              <h3 className={styles.titleWhite}>Accessed</h3>
              <span className={styles.subLabelWhite}>Mess Provided</span>
            </div>

            <div className={styles.bigNumberRow}>
              <div className={styles.bigNumberWhite}>{counts.accessed}</div>
            </div>
          </div>

          {/* Card 2: Missed Meals */}
          <div className={`${styles.topCard} ${styles.whiteCard}`}>
            <div className={styles.cardHeaderCol}>
              <h3 className={styles.titleDark}>Missed</h3>
              <span className={styles.subLabelDark}>Not Accessed</span>
            </div>

            <div className={styles.bigNumberRow}>
              <div className={styles.bigNumberDark}>{counts.missed}</div>
            </div>
          </div>

          {/* Card 3: Money Lost */}
          <div className={`${styles.topCard} ${styles.whiteCard}`}>
            <div className={styles.cardHeaderCol}>
              <h3 className={styles.titleDark}>Money Lost</h3>
              <span className={styles.subLabelDark}>₹50 / Meal</span>
            </div>

            <div className={styles.bigNumberRow}>
              <div className={styles.bigNumberDark}>₹{counts.moneyLost.toLocaleString("en-IN")}</div>
            </div>
          </div>
        </section>

        {/* ============================================================
            GROUPED BAR CHART: Monthly Meals Accessed (12 Months, 4 Sessions)
            ============================================================ */}
        <div className={styles.yearlyChartCard}>
          {/* Header Row: Title & Controls */}
          <div className={styles.chartHeaderRow}>
            {/* Title with dropdown indicator */}
            <div
              className={styles.chartTitleWrapper}
              onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
              title="Change Academic Year"
            >
              <h2 className={styles.chartMainTitle}>Meals Accessed Yearly</h2>
              <span
                className={styles.chartChevron}
                style={{
                  transform: isYearDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>

              {isYearDropdownOpen && (
                <div
                  className={styles.yearDropdownMenu}
                  onClick={(e) => e.stopPropagation()}
                >
                  {["2024", "2025"].map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      className={`${styles.filterMenuItem} ${selectedYear === yr ? styles.filterMenuItemActive : ""}`}
                      onClick={() => {
                        setSelectedYear(yr);
                        setIsYearDropdownOpen(false);
                      }}
                    >
                      <span>Academic Year {yr}</span>
                      {selectedYear === yr && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Legend Pills & Filter Button */}
            <div className={styles.chartControlsRight}>
              <div className={styles.chartLegendPills}>
                <span className={styles.legendPill}>
                  <span className={styles.legendColorDot} style={{ backgroundColor: "#2563eb" }} />
                  Breakfast
                </span>
                <span className={styles.legendPill}>
                  <span className={styles.legendColorDot} style={{ backgroundColor: "#0f172a" }} />
                  Lunch
                </span>
                <span className={styles.legendPill}>
                  <span className={styles.legendColorDot} style={{ backgroundColor: "#10b981" }} />
                  Snacks
                </span>
                <span className={styles.legendPill}>
                  <span className={styles.legendColorDot} style={{ backgroundColor: "#f36f21" }} />
                  Dinner
                </span>
              </div>

              {/* Filter Dropdown */}
              <div className={styles.filterDropdownWrapper}>
                <button
                  type="button"
                  className={styles.filterBtn}
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  aria-label="Filter sessions"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                  <span>{selectedFilter === "all" ? "Filter" : selectedFilter}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: isFilterOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isFilterOpen && (
                  <div className={styles.filterMenu}>
                    {[
                      { key: "all", label: "All Sessions (4)" },
                      { key: "Breakfast", label: "Breakfast Only" },
                      { key: "Lunch", label: "Lunch Only" },
                      { key: "Snacks", label: "Snacks Only" },
                      { key: "Dinner", label: "Dinner Only" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        className={`${styles.filterMenuItem} ${selectedFilter === opt.key ? styles.filterMenuItemActive : ""}`}
                        onClick={() => {
                          setSelectedFilter(opt.key);
                          setIsFilterOpen(false);
                        }}
                      >
                        <span>{opt.label}</span>
                        {selectedFilter === opt.key && <span>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart Render */}
          {isMounted ? (
            <ResponsiveContainer width="100%" height={295}>
              <BarChart
                data={MONTHLY_MEAL_ACCESS_DATA}
                margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                barGap={3}
                barCategoryGap="26%"
              >
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  domain={[0, 40]}
                  ticks={[0, 10, 20, 30, 40]}
                  dx={-4}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)", radius: 6 }}
                />
                {(selectedFilter === "all" || selectedFilter === "Breakfast") && (
                  <Bar
                    dataKey="breakfast"
                    name="Breakfast"
                    fill="#2563eb"
                    radius={[3.5, 3.5, 0, 0]}
                    maxBarSize={8.5}
                  />
                )}
                {(selectedFilter === "all" || selectedFilter === "Lunch") && (
                  <Bar
                    dataKey="lunch"
                    name="Lunch"
                    fill="#0f172a"
                    radius={[3.5, 3.5, 0, 0]}
                    maxBarSize={8.5}
                  />
                )}
                {(selectedFilter === "all" || selectedFilter === "Snacks") && (
                  <Bar
                    dataKey="snacks"
                    name="Snacks"
                    fill="#10b981"
                    radius={[3.5, 3.5, 0, 0]}
                    maxBarSize={8.5}
                  />
                )}
                {(selectedFilter === "all" || selectedFilter === "Dinner") && (
                  <Bar
                    dataKey="dinner"
                    name="Dinner"
                    fill="#f36f21"
                    radius={[3.5, 3.5, 0, 0]}
                    maxBarSize={8.5}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 295,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                fontSize: "0.85rem",
              }}
            >
              Loading meal attendance trends...
            </div>
          )}
        </div>
      </div>

      {/* ============================================================
          RIGHT COLUMN: Daily Food Wastage Donut Card (Side by Side)
          ============================================================ */}
      <div className={styles.rightColumn}>
        <div className={styles.wastageCard}>
          {/* Card Title */}
          <h2 className={styles.cardTitle}>Daily Food Wastage</h2>

          {/* Donut Chart with Centered Total Weight */}
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

            {/* Centered Total Stat ("Daily Wastage" removed above 83) */}
            <div className={styles.chartCenterOverlay}>
              <span className={styles.centerNumber}>{counts.waste}</span>
              <span className={styles.centerUnit}>kg</span>
            </div>
          </div>

          {/* Subtitle / Context Note */}
          <p className={styles.subtitleNote}>
            Daily mess food waste reduced by 14% today!
          </p>

          {/* More Information Button */}
          <button
            type="button"
            className={styles.moreInfoBtn}
            onClick={() => setShowInfoModal(true)}
            id="more-info-wastage-btn"
          >
            More Information
          </button>

          {/* Legend List at the Bottom - Reordered: (Breakfast, Lunch, Snack, Dinner) */}
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

          {/* Zero Food Waste Awareness & Motivation Banner */}
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
                <strong>Take Little &bull; Refill Frequently:</strong> Put small portions on your plate first. Mess meals are unlimited &mdash; you can always go back and refill as many times as you want!
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
              Total recorded waste today: <strong>{TOTAL_WASTE_KG} kg</strong> (Reduced from 96.5 kg daily baseline).
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
