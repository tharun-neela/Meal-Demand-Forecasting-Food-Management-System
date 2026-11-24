"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import styles from "./feedback.module.css";
import {
  StudentFeedback,
  FeedbackStatus,
  loadFeedbacks,
  saveFeedbacks,
  FEEDBACK_STORAGE_KEY,
} from "./feedbackData";
import { loadDiningHalls } from "../dining-halls/diningHallsData";
import { FeedbackCard } from "./FeedbackCard";
import PerformanceProfiler from "@/components/PerformanceProfiler";

const FeedbackDetailsModal = dynamic(() => import("./FeedbackDetailsModal"), {
  ssr: false,
});

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [diningHalls, setDiningHalls] = useState<{ id: string; name: string }[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedHall, setSelectedHall] = useState<string>("all");
  const [selectedMeal, setSelectedMeal] = useState<string>("all");
  const [selectedRating, setSelectedRating] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Modal state
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    feedback: StudentFeedback | null;
    mode: "view" | "reply";
  }>({
    isOpen: false,
    feedback: null,
    mode: "view",
  });

  // Load feedbacks & dining halls on mount
  useEffect(() => {
    setFeedbacks(loadFeedbacks());
    const halls = loadDiningHalls();
    setDiningHalls(halls.map((h) => ({ id: h.id, name: h.name })));

    // Cross-tab sync for real-time student submissions
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === FEEDBACK_STORAGE_KEY) {
        setFeedbacks(loadFeedbacks());
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update feedbacks helper with persistence
  const updateFeedbacksList = useCallback((updatedList: StudentFeedback[]) => {
    setFeedbacks(updatedList);
    saveFeedbacks(updatedList);
  }, []);

  // Handlers
  const handleStatusChange = useCallback(
    (id: string, newStatus: FeedbackStatus) => {
      setFeedbacks((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        );
        saveFeedbacks(updated);
        return updated;
      });
    },
    []
  );

  const handleToggleFlag = useCallback((id: string) => {
    setFeedbacks((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, isFlagged: !item.isFlagged } : item
      );
      saveFeedbacks(updated);
      return updated;
    });
  }, []);

  const handleOpenReply = useCallback((feedback: StudentFeedback) => {
    setActiveModal({
      isOpen: true,
      feedback,
      mode: "reply",
    });
  }, []);

  const handleViewDetails = useCallback((feedback: StudentFeedback) => {
    setActiveModal({
      isOpen: true,
      feedback,
      mode: "view",
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setActiveModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleSubmitReply = useCallback(
    (feedbackId: string, replyText: string, newStatus: FeedbackStatus) => {
      setFeedbacks((prev) => {
        const now = new Date();
        const timeStr = `Today, ${now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
        const updated = prev.map((item) =>
          item.id === feedbackId
            ? {
                ...item,
                adminReply: replyText,
                repliedAt: timeStr,
                status: newStatus,
              }
            : item
        );
        saveFeedbacks(updated);
        return updated;
      });
    },
    []
  );

  // Top KPI calculations
  const stats = useMemo(() => {
    const total = feedbacks.length;
    if (total === 0) {
      return { avgRating: "0.0", total: 0, positiveRate: "0%", pendingAction: 0 };
    }

    const ratingSum = feedbacks.reduce((acc, f) => acc + f.overallRating, 0);
    const avg = (ratingSum / total).toFixed(1);

    const positiveCount = feedbacks.filter((f) => f.overallRating >= 4).length;
    const posRate = `${Math.round((positiveCount / total) * 100)}%`;

    const pending = feedbacks.filter(
      (f) => f.status === "pending" || f.isFlagged
    ).length;

    return {
      avgRating: avg,
      total,
      positiveRate: posRate,
      pendingAction: pending,
    };
  }, [feedbacks]);

  // Filtered & Sorted Feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .filter((item) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.studentName.toLowerCase().includes(q);
          const matchId = item.studentId.toLowerCase().includes(q);
          const matchComment = item.comments.toLowerCase().includes(q);
          const matchDishes = Object.keys(item.dishRatings || {}).some((d) =>
            d.toLowerCase().includes(q)
          );
          const matchTags = item.selectedTags.some((t) =>
            t.toLowerCase().includes(q)
          );
          if (!matchName && !matchId && !matchComment && !matchDishes && !matchTags) {
            return false;
          }
        }

        // Dining Hall filter
        if (selectedHall !== "all" && item.hallId !== selectedHall) {
          return false;
        }

        // Meal filter
        if (selectedMeal !== "all" && item.mealType !== selectedMeal) {
          return false;
        }

        // Rating filter
        if (selectedRating !== "all") {
          if (selectedRating === "5" && item.overallRating !== 5) return false;
          if (selectedRating === "4" && item.overallRating !== 4) return false;
          if (selectedRating === "3" && item.overallRating !== 3) return false;
          if (selectedRating === "1-2" && item.overallRating > 2) return false;
        }

        // Status filter
        if (selectedStatus !== "all") {
          if (selectedStatus === "flagged" && !item.isFlagged) return false;
          if (selectedStatus !== "flagged" && item.status !== selectedStatus)
            return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "highest") return b.overallRating - a.overallRating;
        if (sortBy === "lowest") return a.overallRating - b.overallRating;
        if (sortBy === "oldest") return a.id.localeCompare(b.id);
        // default newest
        return b.id.localeCompare(a.id);
      });
  }, [
    feedbacks,
    searchQuery,
    selectedHall,
    selectedMeal,
    selectedRating,
    selectedStatus,
    sortBy,
  ]);

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    if (filteredFeedbacks.length === 0) return;

    const headers = [
      "ID",
      "Date",
      "Student Name",
      "Student ID",
      "Hostel",
      "Dining Hall",
      "Meal Type",
      "Meal Name",
      "Overall Rating",
      "Tags",
      "Comments",
      "Status",
      "Admin Response",
    ];

    const rows = filteredFeedbacks.map((f) => [
      `"${f.id}"`,
      `"${f.dateKey} (${f.dayOfWeek})"`,
      `"${f.studentName.replace(/"/g, '""')}"`,
      `"${f.studentId}"`,
      `"${f.studentHostel}"`,
      `"${f.hallName}"`,
      `"${f.mealType}"`,
      `"${f.mealName.replace(/"/g, '""')}"`,
      f.overallRating,
      `"${f.selectedTags.join(", ")}"`,
      `"${(f.comments || "").replace(/"/g, '""')}"`,
      `"${f.status}"`,
      `"${(f.adminReply || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Student_Feedbacks_Export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredFeedbacks]);

  return (
    <PerformanceProfiler id="MessAdminFeedbackPage">
      <div className={styles.pageContainer}>
        {/* Top 4 KPI Summary Cards */}
        <section className={styles.statsGrid}>
          {/* 1. Overall Avg Rating */}
          <div className={styles.statCard}>
            <div className={styles.statIconBox} style={{ backgroundColor: "#fef3c7", color: "#d97706" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Average Rating</span>
              <span className={styles.statValue}>{stats.avgRating} <span style={{ fontSize: "1rem", color: "#94a3b8" }}>/ 5.0</span></span>
              <span className={styles.statSubtext}>From {stats.total} total reviews</span>
            </div>
          </div>

          {/* 2. Total Feedbacks */}
          <div className={styles.statCard}>
            <div className={styles.statIconBox} style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Total Reviews</span>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statSubtext}>Across all dining halls</span>
            </div>
          </div>

          {/* 3. Satisfaction Rate */}
          <div className={styles.statCard}>
            <div className={styles.statIconBox} style={{ backgroundColor: "#dcfce7", color: "#16a34a" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Positive Sentiment</span>
              <span className={styles.statValue}>{stats.positiveRate}</span>
              <span className={styles.statSubtext}>Rated 4 or 5 stars</span>
            </div>
          </div>

          {/* 4. Action Required / Open Concerns */}
          <div className={styles.statCard}>
            <div className={styles.statIconBox} style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Action Required</span>
              <span className={styles.statValue}>{stats.pendingAction}</span>
              <span className={styles.statSubtext}>Pending review or flagged</span>
            </div>
          </div>
        </section>

        {/* Toolbar: Search, Filters & Meal Tabs */}
        <section className={styles.toolbarCard}>
          <div className={styles.toolbarTopRow}>
            {/* Search Input */}
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search by student name, roll no, dish, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className={styles.filterControlsRow}>
              {/* Dining Hall */}
              <select
                className={styles.filterSelect}
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                aria-label="Filter by Dining Hall"
              >
                <option value="all">All Dining Halls</option>
                {diningHalls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>

              {/* Rating */}
              <select
                className={styles.filterSelect}
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                aria-label="Filter by Star Rating"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3">3 Stars (Average)</option>
                <option value="1-2">1-2 Stars (Poor / Complaints)</option>
              </select>

              {/* Status */}
              <select
                className={styles.filterSelect}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                aria-label="Filter by Status"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="flagged">Flagged / Urgent</option>
              </select>

              {/* Sort By */}
              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort by"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>

              {/* Export CSV */}
              <button
                type="button"
                className={styles.btnExport}
                onClick={handleExportCSV}
                title="Export filtered records to CSV spreadsheet"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Meal Type Quick Filter Chips */}
          <div className={styles.mealTabsRow}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", marginRight: "0.25rem" }}>
              Meal Service:
            </span>
            {[
              { id: "all", label: "All Meals" },
              { id: "breakfast", label: "Breakfast" },
              { id: "lunch", label: "Lunch" },
              { id: "snacks", label: "Snacks" },
              { id: "dinner", label: "Dinner" },
            ].map((meal) => {
              const count =
                meal.id === "all"
                  ? feedbacks.length
                  : feedbacks.filter((f) => f.mealType === meal.id).length;
              return (
                <button
                  key={meal.id}
                  type="button"
                  className={`${styles.mealTab} ${
                    selectedMeal === meal.id ? styles.mealTabActive : ""
                  }`}
                  onClick={() => setSelectedMeal(meal.id)}
                >
                  <span>{meal.label}</span>
                  <span className={styles.mealTabCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Feedback List Section */}
        <section className={styles.feedbackListSection}>
          <div className={styles.feedbackListHeader}>
            <span className={styles.resultCount}>
              Showing <strong>{filteredFeedbacks.length}</strong> of {feedbacks.length} student reviews
            </span>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <h3 className={styles.emptyStateTitle}>No student feedbacks match your filters</h3>
              <p className={styles.emptyStateText}>
                Try adjusting your search query, clearing rating filters, or selecting a different dining hall.
              </p>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedHall("all");
                  setSelectedMeal("all");
                  setSelectedRating("all");
                  setSelectedStatus("all");
                }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredFeedbacks.map((item) => (
              <FeedbackCard
                key={item.id}
                feedback={item}
                onStatusChange={handleStatusChange}
                onToggleFlag={handleToggleFlag}
                onOpenReply={handleOpenReply}
                onViewDetails={handleViewDetails}
              />
            ))
          )}
        </section>

        {/* Modal Dialog */}
        {activeModal.isOpen && activeModal.feedback && (
          <FeedbackDetailsModal
            feedback={activeModal.feedback}
            mode={activeModal.mode}
            onClose={handleCloseModal}
            onSubmitReply={handleSubmitReply}
          />
        )}
      </div>
    </PerformanceProfiler>
  );
}
