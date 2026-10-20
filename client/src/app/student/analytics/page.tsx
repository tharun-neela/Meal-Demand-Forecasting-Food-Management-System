"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
} from "recharts";
import styles from "./analytics.module.css";

// --- DATASETS ---

// 1. Weekly & Monthly Meal Access Trends (Line Chart)
const WEEKLY_ACCESS_DATA = [
  { label: "Mon", accessCount: 4, prevAccessCount: 3, attendancePct: 96 },
  { label: "Tue", accessCount: 4, prevAccessCount: 4, attendancePct: 98 },
  { label: "Wed", accessCount: 3, prevAccessCount: 3, attendancePct: 92 },
  { label: "Thu", accessCount: 4, prevAccessCount: 3, attendancePct: 99 },
  { label: "Fri", accessCount: 4, prevAccessCount: 3, attendancePct: 95 },
  { label: "Sat", accessCount: 3, prevAccessCount: 2, attendancePct: 88 },
  { label: "Sun", accessCount: 3, prevAccessCount: 2, attendancePct: 94 },
];

const MONTHLY_ACCESS_DATA = [
  { label: "Week 1", accessCount: 20, prevAccessCount: 18, attendancePct: 89 },
  { label: "Week 2", accessCount: 22, prevAccessCount: 19, attendancePct: 92 },
  { label: "Week 3", accessCount: 24, prevAccessCount: 21, attendancePct: 95 },
  { label: "Week 4", accessCount: 26, prevAccessCount: 22, attendancePct: 98 },
];

// 2. Breakfast vs Lunch vs Dinner Usage (Grouped Bar Chart)
const THIS_WEEK_MEAL_COMPARISON = [
  { day: "Mon", breakfast: 1350, lunch: 1890, dinner: 1720 },
  { day: "Tue", breakfast: 1420, lunch: 1950, dinner: 1780 },
  { day: "Wed", breakfast: 1380, lunch: 1910, dinner: 1850 },
  { day: "Thu", breakfast: 1460, lunch: 1980, dinner: 1810 },
  { day: "Fri", breakfast: 1390, lunch: 1840, dinner: 1690 },
  { day: "Sat", breakfast: 1150, lunch: 1620, dinner: 1540 },
  { day: "Sun", breakfast: 1210, lunch: 1710, dinner: 1630 },
];

const LAST_WEEK_MEAL_COMPARISON = [
  { day: "Mon", breakfast: 1280, lunch: 1790, dinner: 1640 },
  { day: "Tue", breakfast: 1310, lunch: 1820, dinner: 1690 },
  { day: "Wed", breakfast: 1290, lunch: 1800, dinner: 1710 },
  { day: "Thu", breakfast: 1340, lunch: 1860, dinner: 1730 },
  { day: "Fri", breakfast: 1300, lunch: 1750, dinner: 1610 },
  { day: "Sat", breakfast: 1080, lunch: 1540, dinner: 1460 },
  { day: "Sun", breakfast: 1140, lunch: 1620, dinner: 1520 },
];

// 3. Daily Waste Composition Donut Chart Dataset by Day
interface WasteShare {
  name: string;
  weightKg: number;
  color: string;
}

const DAILY_WASTE_RECORDS: Record<string, { totalKg: number; breakdown: WasteShare[] }> = {
  today: {
    totalKg: 38.4,
    breakdown: [
      { name: "Breakfast Waste", weightKg: 7.6, color: "#f59e0b" },
      { name: "Lunch Waste", weightKg: 17.2, color: "#ef4444" },
      { name: "Snacks Waste", weightKg: 4.2, color: "#06b6d4" },
      { name: "Dinner Waste", weightKg: 9.4, color: "#8b5cf6" },
    ],
  },
  yesterday: {
    totalKg: 44.2,
    breakdown: [
      { name: "Breakfast Waste", weightKg: 9.1, color: "#f59e0b" },
      { name: "Lunch Waste", weightKg: 20.3, color: "#ef4444" },
      { name: "Snacks Waste", weightKg: 4.8, color: "#06b6d4" },
      { name: "Dinner Waste", weightKg: 10.0, color: "#8b5cf6" },
    ],
  },
  sunday: {
    totalKg: 51.5,
    breakdown: [
      { name: "Breakfast Waste", weightKg: 11.2, color: "#f59e0b" },
      { name: "Lunch Waste", weightKg: 23.4, color: "#ef4444" },
      { name: "Snacks Waste", weightKg: 5.4, color: "#06b6d4" },
      { name: "Dinner Waste", weightKg: 11.5, color: "#8b5cf6" },
    ],
  },
  saturday: {
    totalKg: 47.8,
    breakdown: [
      { name: "Breakfast Waste", weightKg: 10.5, color: "#f59e0b" },
      { name: "Lunch Waste", weightKg: 21.8, color: "#ef4444" },
      { name: "Snacks Waste", weightKg: 4.9, color: "#06b6d4" },
      { name: "Dinner Waste", weightKg: 10.6, color: "#8b5cf6" },
    ],
  },
};

// 4. Taste Improvement & Feedback Trends (Line Chart)
const WEEKLY_TASTE_DATA = [
  { label: "Mon", tasteRating: 4.10, qualityScore: 82 },
  { label: "Tue", tasteRating: 4.25, qualityScore: 85 },
  { label: "Wed", tasteRating: 4.40, qualityScore: 88 },
  { label: "Thu", tasteRating: 4.55, qualityScore: 91 },
  { label: "Fri", tasteRating: 4.65, qualityScore: 93 },
  { label: "Sat", tasteRating: 4.72, qualityScore: 95 },
  { label: "Sun", tasteRating: 4.80, qualityScore: 97 },
];

const MONTHLY_TASTE_DATA = [
  { label: "May", tasteRating: 3.85, qualityScore: 76 },
  { label: "Jun", tasteRating: 4.05, qualityScore: 80 },
  { label: "Jul", tasteRating: 4.20, qualityScore: 84 },
  { label: "Aug", tasteRating: 4.42, qualityScore: 89 },
  { label: "Sep", tasteRating: 4.60, qualityScore: 93 },
  { label: "Oct", tasteRating: 4.80, qualityScore: 97 },
];

// Custom High-Contrast Tooltip Component
function CustomChartTooltip({ active, payload, label, unit = "" }: any) {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <div className={styles.tooltipLabel}>{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className={styles.tooltipRow}>
            <span style={{ display: "flex", alignItems: "center" }}>
              <span className={styles.tooltipDot} style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
              <span className={styles.tooltipName}>{entry.name}:</span>
            </span>
            <span className={styles.tooltipValue}>
              {entry.value} {unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function MealAnalyticsPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Filter state for Chart 1: Meal Access Trend
  const [accessTimeframe, setAccessTimeframe] = useState<"weekly" | "monthly">("weekly");

  // Filter state for Chart 2: Grouped Bar Chart
  const [mealComparisonPeriod, setMealComparisonPeriod] = useState<"thisWeek" | "lastWeek">("thisWeek");

  // Filter state for Chart 3: Donut Chart Selected Day
  const [selectedWasteDay, setSelectedWasteDay] = useState<string>("today");

  // Filter state for Chart 4: Taste Trend
  const [tasteTimeframe, setTasteTimeframe] = useState<"weekly" | "monthly">("weekly");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const accessData = accessTimeframe === "weekly" ? WEEKLY_ACCESS_DATA : MONTHLY_ACCESS_DATA;
  const mealComparisonData = mealComparisonPeriod === "thisWeek" ? THIS_WEEK_MEAL_COMPARISON : LAST_WEEK_MEAL_COMPARISON;
  const currentWasteRecord = DAILY_WASTE_RECORDS[selectedWasteDay] || DAILY_WASTE_RECORDS.today;
  const tasteData = tasteTimeframe === "weekly" ? WEEKLY_TASTE_DATA : MONTHLY_TASTE_DATA;

  return (
    <div className={styles.analyticsContainer}>

      {/* Part 1: Top KPI Summary Metrics Bar */}
      <div className={styles.kpiGrid}>
        {/* KPI 1 */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#fff7ed", color: "#ea580c" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <span className={styles.kpiBadgeGreen}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              +14.2% Rising
            </span>
          </div>
          <div>
            <div className={styles.kpiValue}>86 Meals</div>
            <div className={styles.kpiLabel}>Total Meals Consumed</div>
          </div>
          <div className={styles.kpiSubtext}>+11 more check-ins than last month</div>
        </div>

        {/* KPI 2 */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <span className={styles.kpiBadgeBlue}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              94.5% Active
            </span>
          </div>
          <div>
            <div className={styles.kpiValue}>94.5%</div>
            <div className={styles.kpiLabel}>Meal Attendance Rate</div>
          </div>
          <div className={styles.kpiSubtext}>Highest consistency in Boys Hostel 1</div>
        </div>

        {/* KPI 3 */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className={styles.kpiBadgeGreen}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="18 15 12 9 6 15" />
              </svg>
              +0.70 Stars
            </span>
          </div>
          <div>
            <div className={styles.kpiValue}>4.8 / 5.0</div>
            <div className={styles.kpiLabel}>Food Taste Rating</div>
          </div>
          <div className={styles.kpiSubtext}>Up from 4.10 following menu upgrades</div>
        </div>

        {/* KPI 4 */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiTopRow}>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#fef2f2", color: "#dc2626" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </div>
            <span className={styles.kpiBadgeGreen} style={{ color: "#059669" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              -18.4% Drop
            </span>
          </div>
          <div>
            <div className={styles.kpiValue}>38.4 kg</div>
            <div className={styles.kpiLabel}>Daily Mess Waste</div>
          </div>
          <div className={styles.kpiSubtext}>Reduced from 47.1 kg avg. daily baseline</div>
        </div>
      </div>

      {/* Part 2: Weekly / Monthly Meal Access Trend (Line Chart - Req 3) */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitleCol}>
            <h2 className={styles.chartTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f36f21" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              Meal Access Trend &bull; Rising Usage Analysis
            </h2>
            <p className={styles.chartSubtitle}>
              Shows whether your meal attendance and student check-ins are rising or falling across {accessTimeframe === "weekly" ? "the current week" : "the current month"}
            </p>
          </div>

          <div className={styles.toggleControlsGroup}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${accessTimeframe === "weekly" ? styles.toggleBtnActive : ""}`}
              onClick={() => setAccessTimeframe("weekly")}
              id="trend-weekly-btn"
            >
              Weekly View
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${accessTimeframe === "monthly" ? styles.toggleBtnActive : ""}`}
              onClick={() => setAccessTimeframe("monthly")}
              id="trend-monthly-btn"
            >
              Monthly View
            </button>
          </div>
        </div>

        <div className={styles.chartCanvasArea}>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={310}>
              <LineChart data={accessData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="accessLineGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f36f21" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f36f21" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  domain={[0, accessTimeframe === "weekly" ? 5 : 30]}
                />
                <Tooltip content={<CustomChartTooltip unit="Meals" />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: "#334155", fontSize: "0.82rem", fontWeight: 600 }}>{value}</span>}
                />
                {/* Secondary Reference / Comparison Line */}
                <Line
                  type="monotone"
                  dataKey="prevAccessCount"
                  name="Previous Period"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: "#94a3b8" }}
                />
                {/* Primary High-Contrast Line */}
                <Line
                  type="monotone"
                  dataKey="accessCount"
                  name="Current Access (Rising)"
                  stroke="#f36f21"
                  strokeWidth={3.5}
                  dot={{ r: 5, fill: "#f36f21", strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 7, fill: "#ea580c", strokeWidth: 3, stroke: "#ffffff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 310, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              Loading interactive trend graph...
            </div>
          )}
        </div>

        <div className={styles.legendBar}>
          <div className={styles.legendItem}>
            <span className={styles.legendIndicator} style={{ backgroundColor: "#f36f21" }} />
            <span>Active Attendance: <strong>Rising steadily</strong> (Peak: Thu at 99%)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIndicator} style={{ backgroundColor: "#94a3b8" }} />
            <span>Baseline Comparison: +14.2% increase above previous timeline</span>
          </div>
        </div>
      </div>

      {/* Part 3: Two-Column Section (Grouped Bar Chart & Donut Chart - Req 4 & 5) */}
      <div className={styles.twoColGrid}>
        {/* Left Column: Breakfast vs Lunch vs Dinner Usage (Req 4) */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleCol}>
              <h2 className={styles.chartTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Breakfast vs. Lunch vs. Dinner Usage
              </h2>
              <p className={styles.chartSubtitle}>
                Grouped comparison of meal sessions across weekdays
              </p>
            </div>

            <div className={styles.toggleControlsGroup}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${mealComparisonPeriod === "thisWeek" ? styles.toggleBtnActive : ""}`}
                onClick={() => setMealComparisonPeriod("thisWeek")}
                id="bar-this-week-btn"
              >
                This Week
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${mealComparisonPeriod === "lastWeek" ? styles.toggleBtnActive : ""}`}
                onClick={() => setMealComparisonPeriod("lastWeek")}
                id="bar-last-week-btn"
              >
                Last Week
              </button>
            </div>
          </div>

          <div className={styles.chartCanvasArea}>
            {isMounted ? (
              <ResponsiveContainer width="100%" height={290}>
                <BarChart data={mealComparisonData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: "#e2e8f0" }}
                  />
                  <Tooltip content={<CustomChartTooltip unit="Students" />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="rect"
                    formatter={(value) => <span style={{ color: "#334155", fontSize: "0.8rem", fontWeight: 600 }}>{value}</span>}
                  />
                  {/* Breakfast - High Contrast Amber Gold */}
                  <Bar
                    dataKey="breakfast"
                    name="Breakfast"
                    fill="#f59e0b"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={22}
                  />
                  {/* Lunch - High Contrast Teal Cyan */}
                  <Bar
                    dataKey="lunch"
                    name="Lunch"
                    fill="#06b6d4"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={22}
                  />
                  {/* Dinner - High Contrast Royal Indigo */}
                  <Bar
                    dataKey="dinner"
                    name="Dinner"
                    fill="#6366f1"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 290, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
                Loading meal comparison chart...
              </div>
            )}
          </div>

          <div className={styles.legendBar}>
            <div className={styles.legendItem}>
              <span className={styles.legendIndicator} style={{ backgroundColor: "#06b6d4" }} />
              <span>Lunch has the highest student volume (~1,950 peak daily attendance)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Waste Composition Donut Chart (Req 5) */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitleCol}>
              <h2 className={styles.chartTitle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                Daily Waste Composition
              </h2>
              <p className={styles.chartSubtitle}>
                Meal share of selected day&apos;s total mess food waste
              </p>
            </div>

            {/* Interactive Day Selector */}
            <select
              className={styles.daySelect}
              value={selectedWasteDay}
              onChange={(e) => setSelectedWasteDay(e.target.value)}
              id="waste-day-select"
              aria-label="Select day for waste composition"
            >
              <option value="today">Today (Tue, Oct 20)</option>
              <option value="yesterday">Yesterday (Mon, Oct 19)</option>
              <option value="sunday">Sunday (Oct 18)</option>
              <option value="saturday">Saturday (Oct 17)</option>
            </select>
          </div>

          <div className={styles.donutLayout}>
            {/* Donut Chart with Centered Total Number */}
            <div className={styles.donutCenterBox}>
              {isMounted ? (
                <PieChart width={220} height={220}>
                  <Pie
                    data={currentWasteRecord.breakdown}
                    dataKey="weightKg"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={68}
                    outerRadius={98}
                    paddingAngle={3}
                  >
                    {currentWasteRecord.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip unit="kg" />} />
                </PieChart>
              ) : (
                <div style={{ width: 220, height: 220 }} />
              )}
              {/* Centered Total Stat Overlay */}
              <div className={styles.donutCenterText}>
                <div className={styles.donutTotalNumber}>{currentWasteRecord.totalKg}</div>
                <div className={styles.donutTotalLabel}>kg Total Waste</div>
              </div>
            </div>

            {/* Side Legend & Percentage Breakdown */}
            <div className={styles.donutLegendList}>
              {currentWasteRecord.breakdown.map((item) => {
                const pct = Math.round((item.weightKg / currentWasteRecord.totalKg) * 100);
                return (
                  <div key={item.name} className={styles.donutLegendItem}>
                    <div className={styles.donutLegendLeft}>
                      <span className={styles.donutColorBox} style={{ backgroundColor: item.color }} />
                      <span>{item.name.replace(" Waste", "")}</span>
                    </div>
                    <div className={styles.donutLegendRight}>
                      <span>{item.weightKg} kg</span>
                      <span className={styles.donutSharePercent}>({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.legendBar}>
            <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
              💡 <strong>Action:</strong> Lunch generates {Math.round((currentWasteRecord.breakdown[1].weightKg / currentWasteRecord.totalKg) * 100)}% of waste. Portion self-selection has reduced bread waste by 22%.
            </span>
          </div>
        </div>
      </div>

      {/* Part 4: Food Taste & Quality Improvement Trend (Line Chart - Req 6) */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitleCol}>
            <h2 className={styles.chartTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Food Taste Improvement &amp; Student Feedback Trend
            </h2>
            <p className={styles.chartSubtitle}>
              Continuous taste rating progression out of 5 stars, showing the measurable quality jump following student feedback
            </p>
          </div>

          <div className={styles.toggleControlsGroup}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${tasteTimeframe === "weekly" ? styles.toggleBtnActive : ""}`}
              onClick={() => setTasteTimeframe("weekly")}
              id="taste-weekly-btn"
            >
              Weekly (Day-by-Day)
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${tasteTimeframe === "monthly" ? styles.toggleBtnActive : ""}`}
              onClick={() => setTasteTimeframe("monthly")}
              id="taste-monthly-btn"
            >
              Monthly (Semester Trend)
            </button>
          </div>
        </div>

        <div className={styles.chartCanvasArea}>
          {isMounted ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tasteData} margin={{ top: 20, right: 25, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  domain={[3.5, 5.0]}
                  ticks={[3.5, 4.0, 4.5, 5.0]}
                />
                <Tooltip content={<CustomChartTooltip unit="★" />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: "#334155", fontSize: "0.82rem", fontWeight: 600 }}>{value}</span>}
                />
                {/* Target Benchmark Line at 4.5 */}
                <ReferenceLine
                  y={4.5}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  label={{
                    value: "Target: 4.5 ★",
                    fill: "#059669",
                    position: "insideTopLeft",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                {/* Food Taste Rating Line - High Contrast Emerald Green */}
                <Line
                  type="monotone"
                  dataKey="tasteRating"
                  name="Taste Score (out of 5.0)"
                  stroke="#10b981"
                  strokeWidth={3.8}
                  dot={{ r: 5, fill: "#10b981", strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 7, fill: "#047857", strokeWidth: 3, stroke: "#ffffff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              Loading taste improvement trend...
            </div>
          )}
        </div>

        <div className={styles.legendBar}>
          <div className={styles.legendItem}>
            <span className={styles.legendIndicator} style={{ backgroundColor: "#10b981" }} />
            <span>Taste Score Growth: <strong>+0.70 Stars</strong> (from 4.10 to 4.80 ★ this month)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.legendIndicator} style={{ backgroundColor: "#059669" }} />
            <span>Exceeds Target Benchmark of 4.5 ★ by +0.30 stars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
