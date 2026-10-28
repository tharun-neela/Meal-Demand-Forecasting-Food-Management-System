"use client";

import { useState, useEffect, useMemo } from "react";
import styles from "./history.module.css";

interface MealHistoryRecord {
  id: string;
  mealName: "Breakfast" | "Lunch" | "Evening Snacks" | "Dinner";
  messHall: string;
  timestamp: string;
  dateKey: string;
  tokenCode: string;
  verified: boolean;
}

const STORAGE_KEY = "student_meal_attendance_records";

export default function MealHistoryPage() {
  const [records, setRecords] = useState<MealHistoryRecord[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeReceipt, setActiveReceipt] = useState<MealHistoryRecord | null>(null);

  // Load real verified attendance records created by scanner on Access Meal page
  // Automatically purges old mock data so the history starts completely empty
  useEffect(() => {
    try {
      // Clear previously stored mock/sample attendance records
      const resetKey = "meal_attendance_cleared_v1";
      if (!localStorage.getItem(resetKey)) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(resetKey, "true");
        setRecords([]);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const liveScans = JSON.parse(stored);
        if (Array.isArray(liveScans) && liveScans.length > 0) {
          const formattedLive: MealHistoryRecord[] = liveScans.map((item: any) => ({
            id: item.id || `att-${Date.now()}`,
            mealName: (item.mealName as any) || "Dinner",
            messHall: item.messHall || "Boys Hostel 1 • Mess Hall 07",
            timestamp: item.timestamp || "Today",
            dateKey: item.dateKey || new Date().toISOString().split("T")[0],
            tokenCode: item.qrPayload ? `#${item.qrPayload}` : "#BH1M07",
            verified: true,
          }));

          setRecords(formattedLive);
        } else {
          setRecords([]);
        }
      } else {
        setRecords([]);
      }
    } catch {
      setRecords([]);
    }
  }, []);

  const handleClearAllRecords = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setRecords([]);
  };

  // Compute exact count for each type of meal
  const mealCounts = useMemo(() => {
    const counts = {
      all: records.length,
      breakfast: 0,
      lunch: 0,
      snacks: 0,
      dinner: 0,
    };

    records.forEach((r) => {
      const name = r.mealName.toLowerCase();
      if (name.includes("breakfast")) {
        counts.breakfast += 1;
      } else if (name.includes("lunch")) {
        counts.lunch += 1;
      } else if (name.includes("snack")) {
        counts.snacks += 1;
      } else if (name.includes("dinner")) {
        counts.dinner += 1;
      }
    });

    return counts;
  }, [records]);

  // Dynamic KPI Card for the selected meal type
  const selectedCountInfo = useMemo(() => {
    switch (selectedMealType) {
      case "breakfast":
        return {
          label: "Breakfast Check-ins",
          count: mealCounts.breakfast,
          subtext: `${mealCounts.breakfast} breakfast meal${mealCounts.breakfast === 1 ? "" : "s"} consumed`,
          icon: "☀️",
          bg: "#fef3c7",
          color: "#d97706",
        };
      case "lunch":
        return {
          label: "Lunch Check-ins",
          count: mealCounts.lunch,
          subtext: `${mealCounts.lunch} lunch meal${mealCounts.lunch === 1 ? "" : "s"} consumed`,
          icon: "🍛",
          bg: "#eff6ff",
          color: "#2563eb",
        };
      case "evening snacks":
        return {
          label: "Evening Snacks Check-ins",
          count: mealCounts.snacks,
          subtext: `${mealCounts.snacks} snack${mealCounts.snacks === 1 ? "" : "s"} consumed`,
          icon: "☕",
          bg: "#fdf4ff",
          color: "#c026d3",
        };
      case "dinner":
        return {
          label: "Dinner Check-ins",
          count: mealCounts.dinner,
          subtext: `${mealCounts.dinner} dinner meal${mealCounts.dinner === 1 ? "" : "s"} consumed`,
          icon: "🍽️",
          bg: "#fff7ed",
          color: "#ea580c",
        };
      case "all":
      default:
        return {
          label: "Total Meals Consumed",
          count: mealCounts.all,
          subtext: `${mealCounts.all} total verified attendance check-ins`,
          icon: "📋",
          bg: "#fff7ed",
          color: "#ea580c",
        };
    }
  }, [selectedMealType, mealCounts]);

  // Filter records by clicked meal type and search query
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Meal filter
      if (selectedMealType !== "all" && r.mealName.toLowerCase() !== selectedMealType.toLowerCase()) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesMeal = r.mealName.toLowerCase().includes(q);
        const matchesHall = r.messHall.toLowerCase().includes(q);
        const matchesToken = r.tokenCode.toLowerCase().includes(q);
        const matchesTime = r.timestamp.toLowerCase().includes(q);
        if (!matchesMeal && !matchesHall && !matchesToken && !matchesTime) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedMealType, searchQuery]);

  // Helper for meal icon styling
  const getMealVisual = (mealName: string) => {
    switch (mealName.toLowerCase()) {
      case "breakfast":
        return { bg: "#fef3c7", color: "#d97706", icon: "☀️" };
      case "lunch":
        return { bg: "#eff6ff", color: "#2563eb", icon: "🍛" };
      case "evening snacks":
        return { bg: "#fdf4ff", color: "#c026d3", icon: "☕" };
      case "dinner":
      default:
        return { bg: "#fff7ed", color: "#ea580c", icon: "🍽️" };
    }
  };

  return (
    <div className={styles.historyContainer}>
      {/* KPI Summary Cards (3 cards, with dynamically updating clicked meal count) */}
      <div className={styles.kpiGrid}>
        {/* Dynamic Card 1: Count of the currently selected meal */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>{selectedCountInfo.label}</span>
            <div
              className={styles.kpiIconWrapper}
              style={{ backgroundColor: selectedCountInfo.bg, color: selectedCountInfo.color }}
            >
              <span>{selectedCountInfo.icon}</span>
            </div>
          </div>
          <div className={styles.kpiValue}>{selectedCountInfo.count} Meals</div>
          <span className={styles.kpiSubtext}>{selectedCountInfo.subtext}</span>
        </div>

        {/* Card 2: Attendance Consistency */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Attendance Consistency</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue}>96.2%</div>
          <span className={styles.kpiSubtext}>Top 5% in Boys Hostel 1</span>
        </div>

        {/* Card 3: Primary Mess Hall */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Primary Mess Hall</span>
            <div className={styles.kpiIconWrapper} style={{ backgroundColor: "#ecfdf5", color: "#059669" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>
          <div className={styles.kpiValue} style={{ fontSize: "1.35rem", paddingTop: "0.2rem" }}>
            BH-1 • Hall 07
          </div>
          <span className={styles.kpiSubtext}>Active Assigned Student Mess</span>
        </div>
      </div>

      {/* Filter Tabs with exact count for each meal type */}
      <div className={styles.filterBar}>
        <div className={styles.mealFilterTabs}>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${selectedMealType === "all" ? styles.filterTabBtnActive : ""}`}
            onClick={() => setSelectedMealType("all")}
          >
            <span>All Services</span>
            <span className={styles.filterTabCountPill}>{mealCounts.all}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${selectedMealType === "breakfast" ? styles.filterTabBtnActive : ""}`}
            onClick={() => setSelectedMealType("breakfast")}
          >
            <span>Breakfast</span>
            <span className={styles.filterTabCountPill}>{mealCounts.breakfast}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${selectedMealType === "lunch" ? styles.filterTabBtnActive : ""}`}
            onClick={() => setSelectedMealType("lunch")}
          >
            <span>Lunch</span>
            <span className={styles.filterTabCountPill}>{mealCounts.lunch}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${selectedMealType === "evening snacks" ? styles.filterTabBtnActive : ""}`}
            onClick={() => setSelectedMealType("evening snacks")}
          >
            <span>Evening Snacks</span>
            <span className={styles.filterTabCountPill}>{mealCounts.snacks}</span>
          </button>
          <button
            type="button"
            className={`${styles.filterTabBtn} ${selectedMealType === "dinner" ? styles.filterTabBtnActive : ""}`}
            onClick={() => setSelectedMealType("dinner")}
          >
            <span>Dinner</span>
            <span className={styles.filterTabCountPill}>{mealCounts.dinner}</span>
          </button>
        </div>

        <div className={styles.searchCol} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchInputIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search check-ins, token #, date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search meal history"
            />
          </div>
          {records.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllRecords}
              title="Delete all meal records"
              style={{
                padding: "0.5rem 0.85rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#ef4444",
                background: "#fef2f2",
                border: "1px solid #fee2e2",
                borderRadius: "8px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              Clear Records
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderRow}>
          <span>Meal Service</span>
          <span>Date & Time</span>
          <span>Mess Location</span>
          <span>Token / Receipt</span>
          <span style={{ textAlign: "right" }}>Status</span>
        </div>

        <div className={styles.recordsList}>
          {filteredRecords.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <p className={styles.emptyTitle}>No meal records found</p>
              <p className={styles.emptyText}>
                {selectedMealType === "all"
                  ? "You have no meal attendance check-ins recorded yet."
                  : `No check-in records found for ${selectedMealType} (${mealCounts[selectedMealType === "evening snacks" ? "snacks" : (selectedMealType as "breakfast" | "lunch" | "dinner")] || 0} recorded).`}
              </p>
            </div>
          ) : (
            filteredRecords.map((item) => {
              const visual = getMealVisual(item.mealName);

              return (
                <div
                  key={item.id}
                  className={styles.recordRow}
                  onClick={() => setActiveReceipt(item)}
                  title="Click to view full verified attendance receipt"
                >
                  <div className={styles.mealCol}>
                    <div className={styles.mealTypeIconBox} style={{ backgroundColor: visual.bg, color: visual.color }}>
                      <span style={{ fontSize: "1.1rem" }}>{visual.icon}</span>
                    </div>
                    <div className={styles.mealInfoGroup}>
                      <span className={styles.mealNameText}>{item.mealName}</span>
                    </div>
                  </div>

                  <div className={styles.timeCol}>
                    <span className={styles.timestampMain}>{item.timestamp}</span>
                    <span className={styles.dateSubtext}>{item.dateKey}</span>
                  </div>

                  <div className={styles.locationCol}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{item.messHall}</span>
                  </div>

                  <div>
                    <span className={styles.tokenCol}>{item.tokenCode}</span>
                  </div>

                  <div className={styles.statusCol}>
                    <span className={styles.verifiedPill}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Verified
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Verified Receipt Modal */}
      {activeReceipt && (
        <div className={styles.modalBackdrop} onClick={() => setActiveReceipt(null)}>
          <div className={styles.receiptCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.receiptHeader}>
              <div className={styles.receiptTitleGroup}>
                <svg className={styles.receiptIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <h3 className={styles.receiptTitle}>Verified Attendance Receipt</h3>
              </div>
              <button
                type="button"
                className={styles.receiptCloseBtn}
                onClick={() => setActiveReceipt(null)}
                aria-label="Close modal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.receiptBody}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Student Name</span>
                <span className={styles.receiptValue}>Tharun Neela</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Registration No.</span>
                <span className={styles.receiptValue}>12204567</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Service</span>
                <span className={styles.receiptValue}>{activeReceipt.mealName}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Check-in Time</span>
                <span className={styles.receiptValue}>{activeReceipt.timestamp}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Mess Location</span>
                <span className={styles.receiptValue}>{activeReceipt.messHall}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Digital Token</span>
                <span className={styles.receiptValue} style={{ color: "#0284c7", fontFamily: "monospace" }}>
                  {activeReceipt.tokenCode}
                </span>
              </div>

              <div className={styles.receiptStamp}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>OFFICIALLY VERIFIED & RECORDED AT TURNSTILE</span>
              </div>
            </div>

            <div className={styles.receiptFooter}>
              <button
                type="button"
                className={styles.dismissBtn}
                onClick={() => setActiveReceipt(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
