"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import styles from "./history.module.css";

export interface MealHistoryItem {
  id: string;
  mealType: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
  status: "Approved" | "Not Approved" | "Fraud";
  dateFormatted: string; // e.g. "August 18,"
  timeFormatted: string; // e.g. "08:15 AM"
  rawDate: string; // "2026-08-18"
  messHall: string; // "BH-01", "BH-02", "Central Mess", "GH-01", etc.
  token: string; // "Token #8812"
}

// Historical records faithfully replicating the reference figure
const REFERENCE_HISTORICAL_RECORDS: MealHistoryItem[] = [
  {
    id: "rec-1",
    mealType: "Breakfast",
    status: "Approved",
    dateFormatted: "August 18,",
    timeFormatted: "08:15 AM",
    rawDate: "2026-08-18",
    messHall: "BH-01",
    token: "Token #8812",
  },
  {
    id: "rec-2",
    mealType: "Lunch",
    status: "Not Approved",
    dateFormatted: "June 22,",
    timeFormatted: "12:45 PM",
    rawDate: "2026-06-22",
    messHall: "BH-02",
    token: "Token #8813",
  },
  {
    id: "rec-3",
    mealType: "Dinner",
    status: "Approved",
    dateFormatted: "May 11,",
    timeFormatted: "07:30 PM",
    rawDate: "2026-05-11",
    messHall: "Central Mess",
    token: "Token #8814",
  },
  {
    id: "rec-4",
    mealType: "Breakfast",
    status: "Fraud",
    dateFormatted: "April 20,",
    timeFormatted: "08:30 AM",
    rawDate: "2026-04-20",
    messHall: "BH-03",
    token: "Token #8815",
  },
  {
    id: "rec-5",
    mealType: "Lunch",
    status: "Approved",
    dateFormatted: "April 18,",
    timeFormatted: "01:15 PM",
    rawDate: "2026-04-18",
    messHall: "GH-01",
    token: "Token #8816",
  },
  {
    id: "rec-6",
    mealType: "Dinner",
    status: "Not Approved",
    dateFormatted: "March 8,",
    timeFormatted: "08:00 PM",
    rawDate: "2026-03-08",
    messHall: "Central Mess",
    token: "Token #8817",
  },
  {
    id: "rec-7",
    mealType: "Snacks",
    status: "Approved",
    dateFormatted: "March 2,",
    timeFormatted: "04:30 PM",
    rawDate: "2026-03-02",
    messHall: "BH-02",
    token: "Token #8818",
  },
  {
    id: "rec-8",
    mealType: "Dinner",
    status: "Approved",
    dateFormatted: "Feb 19,",
    timeFormatted: "07:45 PM",
    rawDate: "2026-02-19",
    messHall: "GH-02",
    token: "Token #8819",
  },
  // Additional pages records
  {
    id: "rec-9",
    mealType: "Breakfast",
    status: "Approved",
    dateFormatted: "Feb 10,",
    timeFormatted: "08:20 AM",
    rawDate: "2026-02-10",
    messHall: "BH-01",
    token: "Token #8820",
  },
  {
    id: "rec-10",
    mealType: "Lunch",
    status: "Approved",
    dateFormatted: "Jan 28,",
    timeFormatted: "12:50 PM",
    rawDate: "2026-01-28",
    messHall: "BH-02",
    token: "Token #8821",
  },
  {
    id: "rec-11",
    mealType: "Dinner",
    status: "Not Approved",
    dateFormatted: "Jan 22,",
    timeFormatted: "08:15 PM",
    rawDate: "2026-01-22",
    messHall: "Central Mess",
    token: "Token #8822",
  },
  {
    id: "rec-12",
    mealType: "Snacks",
    status: "Approved",
    dateFormatted: "Jan 16,",
    timeFormatted: "05:10 PM",
    rawDate: "2026-01-16",
    messHall: "BH-03",
    token: "Token #8823",
  },
  {
    id: "rec-13",
    mealType: "Breakfast",
    status: "Approved",
    dateFormatted: "Jan 12,",
    timeFormatted: "08:45 AM",
    rawDate: "2026-01-12",
    messHall: "GH-01",
    token: "Token #8824",
  },
  {
    id: "rec-14",
    mealType: "Lunch",
    status: "Approved",
    dateFormatted: "Jan 05,",
    timeFormatted: "01:20 PM",
    rawDate: "2026-01-05",
    messHall: "BH-01",
    token: "Token #8825",
  },
  {
    id: "rec-15",
    mealType: "Dinner",
    status: "Approved",
    dateFormatted: "Jan 02,",
    timeFormatted: "07:55 PM",
    rawDate: "2026-01-02",
    messHall: "Central Mess",
    token: "Token #8826",
  },
  {
    id: "rec-16",
    mealType: "Breakfast",
    status: "Not Approved",
    dateFormatted: "Dec 30,",
    timeFormatted: "09:05 AM",
    rawDate: "2025-12-30",
    messHall: "BH-02",
    token: "Token #8827",
  },
];

const STORAGE_KEY = "student_meal_attendance_records";
const PAGE_SIZE = 8;

export default function MealHistoryPage() {
  const [liveRecords, setLiveRecords] = useState<MealHistoryItem[]>([]);
  const [selectedMealFilter, setSelectedMealFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isDateOpen, setIsDateOpen] = useState<boolean>(false);
  const [activeReceipt, setActiveReceipt] = useState<MealHistoryItem | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setIsDateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync any real attendance records created by QR scanning
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted: MealHistoryItem[] = parsed.map((item: any, idx: number) => {
            let mealType: "Breakfast" | "Lunch" | "Snacks" | "Dinner" = "Dinner";
            const m = (item.mealName || "").toLowerCase();
            if (m.includes("breakfast")) mealType = "Breakfast";
            else if (m.includes("lunch")) mealType = "Lunch";
            else if (m.includes("snack")) mealType = "Snacks";

            const rawDate = item.dateKey || new Date().toISOString().split("T")[0];
            const dateObj = new Date(rawDate);
            const dateFormatted = !isNaN(dateObj.getTime())
              ? `${dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" })},`
              : "Today,";
            const timePart = item.timestamp?.replace(/Today,?\s*/i, "").trim() || "12:30 PM";

            const tokenNumber = 8811 - idx;
            return {
              id: item.id || `live-${idx}`,
              mealType,
              status: item.verified !== false ? "Approved" : "Not Approved",
              dateFormatted: item.timestamp?.toLowerCase().includes("today") ? "Today," : dateFormatted,
              timeFormatted: timePart,
              rawDate,
              messHall: item.messHall || "BH-01",
              token: item.qrPayload ? `Token #${item.qrPayload.replace(/^#/, "")}` : `Token #${tokenNumber}`,
            };
          });
          setLiveRecords(formatted);
          return;
        }
      }
      setLiveRecords([]);
    } catch {
      setLiveRecords([]);
    }
  }, []);

  // Combine live records at the top with reference historical records
  const allRecords = useMemo(() => {
    return [...liveRecords, ...REFERENCE_HISTORICAL_RECORDS];
  }, [liveRecords]);

  // Apply filters: Meal Type (Breakfast, Lunch, Snacks, Dinner) and optional Date
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // 1. Meal Type filter
      if (selectedMealFilter !== "all") {
        if (rec.mealType.toLowerCase() !== selectedMealFilter.toLowerCase()) {
          return false;
        }
      }
      // 2. Date filter
      if (selectedDate) {
        if (rec.rawDate !== selectedDate) {
          return false;
        }
      }
      return true;
    });
  }, [allRecords, selectedMealFilter, selectedDate]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

  // Current page records slice
  const displayedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  const handlePageSelect = (p: number) => {
    setCurrentPage(p);
  };

  const handleMealFilterSelect = (type: string) => {
    setSelectedMealFilter(type);
    setIsFilterOpen(false);
    setCurrentPage(1);
  };

  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDateOpen(false);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedMealFilter("all");
    setSelectedDate("");
    setCurrentPage(1);
  };

  return (
    <div className={styles.historyContainer}>
      <div className={styles.historyCard}>
        {/* Card Header with Choose Date Button & Filter Button */}
        <div className={styles.cardHeader}>
          <div className={styles.headerActions}>
            {/* 1. Choose Date Pill Button */}
            <div className={styles.actionWrapper} ref={dateRef}>
              <button
                type="button"
                className={`${styles.chooseDateBtn} ${selectedDate ? styles.chooseDateBtnActive : ""}`}
                onClick={() => setIsDateOpen(!isDateOpen)}
                aria-expanded={isDateOpen}
                aria-label="Choose date to filter meal history"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{selectedDate ? selectedDate : "Choose Date"}</span>
              </button>

              {isDateOpen && (
                <div className={styles.dateDropdown}>
                  <label className={styles.dateInputLabel} htmlFor="history-date-picker">
                    Filter by exact date
                  </label>
                  <input
                    id="history-date-picker"
                    type="date"
                    className={styles.dateNativeInput}
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                  />
                  <div className={styles.dateActionRow}>
                    {selectedDate && (
                      <button
                        type="button"
                        className={styles.dateClearBtn}
                        onClick={() => handleDateSelect("")}
                      >
                        Clear Date
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Filter Pill Button (Solid dark button matching figure) */}
            <div className={styles.actionWrapper} ref={filterRef}>
              <button
                type="button"
                className={`${styles.filterBtn} ${selectedMealFilter !== "all" ? styles.filterBtnActive : ""}`}
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-expanded={isFilterOpen}
                aria-label="Filter meals by type"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                <span>
                  {selectedMealFilter === "all" ? "Filter" : `Filter: ${selectedMealFilter}`}
                </span>
              </button>

              {isFilterOpen && (
                <div className={styles.filterDropdown}>
                  <div className={styles.filterDropdownHeader}>Filter by Meal</div>
                  <button
                    type="button"
                    className={`${styles.filterDropdownItem} ${selectedMealFilter === "all" ? styles.filterDropdownItemActive : ""}`}
                    onClick={() => handleMealFilterSelect("all")}
                  >
                    <span>All Meal Types</span>
                    {selectedMealFilter === "all" && <span>✓</span>}
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterDropdownItem} ${selectedMealFilter === "Breakfast" ? styles.filterDropdownItemActive : ""}`}
                    onClick={() => handleMealFilterSelect("Breakfast")}
                  >
                    <span>Breakfast</span>
                    {selectedMealFilter === "Breakfast" && <span>✓</span>}
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterDropdownItem} ${selectedMealFilter === "Lunch" ? styles.filterDropdownItemActive : ""}`}
                    onClick={() => handleMealFilterSelect("Lunch")}
                  >
                    <span>Lunch</span>
                    {selectedMealFilter === "Lunch" && <span>✓</span>}
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterDropdownItem} ${selectedMealFilter === "Snacks" ? styles.filterDropdownItemActive : ""}`}
                    onClick={() => handleMealFilterSelect("Snacks")}
                  >
                    <span>Snacks</span>
                    {selectedMealFilter === "Snacks" && <span>✓</span>}
                  </button>
                  <button
                    type="button"
                    className={`${styles.filterDropdownItem} ${selectedMealFilter === "Dinner" ? styles.filterDropdownItemActive : ""}`}
                    onClick={() => handleMealFilterSelect("Dinner")}
                  >
                    <span>Dinner</span>
                    {selectedMealFilter === "Dinner" && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Filter Notice if any filter applied */}
        {(selectedMealFilter !== "all" || selectedDate) && (
          <div className={styles.activeFilterBanner}>
            <span className={styles.activeFilterText}>
              Showing records for:{" "}
              {selectedMealFilter !== "all" && (
                <>
                  Meal <strong>{selectedMealFilter}</strong>
                </>
              )}
              {selectedMealFilter !== "all" && selectedDate && " • "}
              {selectedDate && (
                <>
                  Date <strong>{selectedDate}</strong>
                </>
              )}
              {" "}({filteredRecords.length} records found)
            </span>
            <button
              type="button"
              className={styles.activeFilterResetBtn}
              onClick={clearAllFilters}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Table representation matching exact columns and formatting */}
        <div className={styles.tableWrapper}>
          <table className={styles.historyTable} aria-label="Meal Attendance Records">
            <thead>
              <tr>
                <th scope="col">Meal type</th>
                <th scope="col">Status</th>
                <th scope="col">Date &amp; time</th>
                <th scope="col">Mess Hall</th>
                <th scope="col">Token</th>
              </tr>
            </thead>
            <tbody>
              {displayedRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    <div className={styles.emptyContent}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <p className={styles.emptyTitle}>No meal records found</p>
                      <p className={styles.emptyText}>
                        No records match the current filter. Try resetting or selecting a different meal type.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedRecords.map((item) => (
                  <tr
                    key={item.id}
                    className={styles.tableRow}
                    onClick={() => setActiveReceipt(item)}
                    title="Click to view verified attendance token receipt"
                  >
                    {/* Column 1: Meal Type */}
                    <td className={styles.mealTypeCell}>{item.mealType}</td>

                    {/* Column 2: Status */}
                    <td>
                      {item.status === "Approved" && (
                        <span className={styles.statusApproved}>
                          <span className={styles.statusSymbol}>+</span> Approved
                        </span>
                      )}
                      {item.status === "Not Approved" && (
                        <span className={styles.statusRejected}>
                          <span className={styles.statusSymbol}>—</span> Not Approved
                        </span>
                      )}
                      {item.status === "Fraud" && (
                        <span className={styles.statusFraud}>
                          <span className={styles.statusSymbol}>—</span> Fraud
                        </span>
                      )}
                    </td>

                    {/* Column 3: Date & time (Two lines) */}
                    <td className={styles.dateTimeCell}>
                      <span className={styles.dateLine}>{item.dateFormatted}</span>
                      <span className={styles.timeLine}>{item.timeFormatted}</span>
                    </td>

                    {/* Column 4: Mess Hall */}
                    <td className={styles.messHallCell}>{item.messHall}</td>

                    {/* Column 5: Token */}
                    <td className={styles.tokenCell}>{item.token}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer faithfully replicating figure */}
        <div className={styles.paginationFooter}>
          {/* Previous Page Arrow */}
          <button
            type="button"
            className={styles.paginationArrow}
            onClick={() => handlePageSelect(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Page numbers: 1 2 3 4 5 ... 99 */}
          <div className={styles.paginationCenter}>
            {[1, 2, 3, 4, 5].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ""}`}
                onClick={() => handlePageSelect(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <span className={styles.pageEllipsis}>...</span>
            <button
              type="button"
              className={`${styles.pageBtn} ${currentPage === 99 ? styles.pageBtnActive : ""}`}
              onClick={() => handlePageSelect(99)}
            >
              99
            </button>
          </div>

          {/* Next Page Arrow */}
          <button
            type="button"
            className={styles.paginationArrow}
            onClick={() => handlePageSelect(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages && totalPages > 1}
            aria-label="Next page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Attendance Token Receipt Modal */}
      {activeReceipt && (
        <div className={styles.modalBackdrop} onClick={() => setActiveReceipt(null)}>
          <div className={styles.receiptCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.receiptHeader}>
              <div className={styles.receiptTitleGroup}>
                <svg
                  className={styles.receiptIcon}
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <h3 className={styles.receiptTitle}>Meal Token Receipt</h3>
              </div>
              <button
                type="button"
                className={styles.receiptCloseBtn}
                onClick={() => setActiveReceipt(null)}
                aria-label="Close dialog"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className={styles.receiptBody}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Token Number:</span>
                <span className={styles.receiptValue}>{activeReceipt.token}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Meal Service:</span>
                <span className={styles.receiptValue}>{activeReceipt.mealType}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Mess Location:</span>
                <span className={styles.receiptValue}>{activeReceipt.messHall}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Check-in Time:</span>
                <span className={styles.receiptValue}>
                  {activeReceipt.dateFormatted} {activeReceipt.timeFormatted}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Access Status:</span>
                <span
                  className={styles.receiptValue}
                  style={{
                    color:
                      activeReceipt.status === "Approved"
                        ? "#10b981"
                        : "#881337",
                  }}
                >
                  {activeReceipt.status === "Approved" ? "✓ Approved" : `✕ ${activeReceipt.status}`}
                </span>
              </div>

              <div className={styles.receiptStamp}>
                <span>🔐</span>
                <span>
                  {activeReceipt.status === "Approved"
                    ? "Official LPU Hostels Mess Attendance Log"
                    : "Mess Security Access Flagged"}
                </span>
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
