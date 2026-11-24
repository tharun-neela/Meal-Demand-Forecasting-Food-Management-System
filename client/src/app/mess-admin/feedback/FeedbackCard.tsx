"use client";

import React, { useState } from "react";
import styles from "./feedback.module.css";
import { StudentFeedback, FeedbackStatus } from "./feedbackData";

interface FeedbackCardProps {
  feedback: StudentFeedback;
  onStatusChange: (id: string, status: FeedbackStatus) => void;
  onToggleFlag: (id: string) => void;
  onOpenReply: (feedback: StudentFeedback) => void;
  onViewDetails: (feedback: StudentFeedback) => void;
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"}
      stroke={filled ? "#f59e0b" : "#cbd5e1"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function FeedbackCardComponent({
  feedback,
  onStatusChange,
  onToggleFlag,
  onOpenReply,
  onViewDetails,
}: FeedbackCardProps) {
  const [showDishes, setShowDishes] = useState<boolean>(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getMealBadgeClass = (meal: string) => {
    switch (meal) {
      case "breakfast":
        return styles.mealBreakfast;
      case "lunch":
        return styles.mealLunch;
      case "snacks":
        return styles.mealSnacks;
      case "dinner":
        return styles.mealDinner;
      default:
        return styles.mealLunch;
    }
  };

  const isCriticalTag = (tag: string) => {
    return tag.includes("Cold") || tag.includes("Spicy") || tag.includes("Seasoning") || tag.includes("Uncooked");
  };

  const dishNames = Object.keys(feedback.dishRatings || {});

  return (
    <div
      className={`${styles.feedbackCard} ${feedback.isFlagged ? styles.feedbackCardFlagged : ""}`}
    >
      {/* Top Meta Row */}
      <div className={styles.cardTopRow}>
        <div className={styles.studentMetaGroup}>
          <div className={styles.studentAvatar} aria-hidden="true">
            {getInitials(feedback.studentName)}
          </div>
          <div>
            <div className={styles.studentNameRow}>
              <h4 className={styles.studentName}>{feedback.studentName}</h4>
              <span className={styles.studentIdBadge}>{feedback.studentId}</span>
            </div>
            <p className={styles.hostelText}>{feedback.studentHostel}</p>
          </div>
        </div>

        <div className={styles.badgesGroup}>
          <span className={styles.hallBadge}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {feedback.hallName}
          </span>

          <span className={`${styles.mealBadge} ${getMealBadgeClass(feedback.mealType)}`}>
            {feedback.mealType}
          </span>

          <span className={styles.timeText}>{feedback.submittedAt}</span>
        </div>
      </div>

      {/* Rating & Meal Name */}
      <div className={styles.ratingRow}>
        <div className={styles.starDisplay}>
          <div className={styles.starsGroup}>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon key={star} filled={star <= feedback.overallRating} />
            ))}
          </div>
          <span className={styles.numericRating}>
            {feedback.overallRating.toFixed(1)} / 5.0
          </span>
        </div>

        <span className={styles.mealNameLabel}>{feedback.mealName}</span>
      </div>

      {/* Tags Row */}
      {feedback.selectedTags && feedback.selectedTags.length > 0 && (
        <div className={styles.tagsRow}>
          {feedback.selectedTags.map((tag) => (
            <span
              key={tag}
              className={`${styles.tagChip} ${
                isCriticalTag(tag) ? styles.tagChipCritical : styles.tagChipPositive
              }`}
            >
              {isCriticalTag(tag) ? "⚠️ " : "✨ "}
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Student Comment */}
      {feedback.comments && (
        <div className={styles.commentBox}>
          <p style={{ margin: 0 }}>"{feedback.comments}"</p>
        </div>
      )}

      {/* Photos Thumbnail Row */}
      {feedback.photos && feedback.photos.length > 0 && (
        <div className={styles.photosRow}>
          {feedback.photos.map((photo) => (
            <img
              key={photo.id}
              src={photo.dataUrl}
              alt={photo.name}
              className={styles.photoThumb}
              onClick={() => onViewDetails(feedback)}
              title="Click to zoom in"
            />
          ))}
        </div>
      )}

      {/* Dish Breakdown Collapsible */}
      {dishNames.length > 0 && (
        <div className={styles.dishesBreakdownSection}>
          <button
            type="button"
            className={styles.dishesHeader}
            onClick={() => setShowDishes((prev) => !prev)}
          >
            <span>
              Dish Ratings ({dishNames.length} items rated)
            </span>
            <span style={{ fontSize: "0.75rem", color: "#ea580c" }}>
              {showDishes ? "Hide ▲" : "Show Breakdown ▼"}
            </span>
          </button>

          {showDishes && (
            <div className={styles.dishesGrid}>
              {dishNames.map((dish) => {
                const r = feedback.dishRatings[dish];
                const c = feedback.dishComments[dish];
                return (
                  <div key={dish} className={styles.dishChip}>
                    <div className={styles.dishTopLine}>
                      <span className={styles.dishName} title={dish}>
                        {dish}
                      </span>
                      <span className={styles.dishStars}>
                        {"★".repeat(r)}
                        <span style={{ color: "#cbd5e1" }}>{"★".repeat(5 - r)}</span>
                      </span>
                    </div>
                    {c && <span className={styles.dishCommentText}>"{c}"</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin Reply If Present */}
      {feedback.adminReply && (
        <div className={styles.adminReplyContainer}>
          <div className={styles.adminReplyHeader}>
            <span className={styles.adminReplyTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Mess Administrator Response
            </span>
            {feedback.repliedAt && (
              <span className={styles.adminReplyTime}>{feedback.repliedAt}</span>
            )}
          </div>
          <p className={styles.adminReplyBody}>{feedback.adminReply}</p>
        </div>
      )}

      {/* Footer Controls */}
      <div className={styles.cardFooter}>
        <div className={styles.statusButtonGroup}>
          <span
            className={`${styles.statusPill} ${
              feedback.status === "resolved"
                ? styles.statusResolved
                : feedback.status === "reviewed"
                ? styles.statusReviewed
                : styles.statusPending
            }`}
          >
            {feedback.status === "resolved"
              ? "✓ Resolved"
              : feedback.status === "reviewed"
              ? "● Reviewed"
              : "⏳ Pending"}
          </span>

          <select
            className={styles.filterSelect}
            style={{ padding: "0.25rem 1.6rem 0.25rem 0.6rem", fontSize: "0.75rem", height: "30px" }}
            value={feedback.status}
            onChange={(e) => onStatusChange(feedback.id, e.target.value as FeedbackStatus)}
          >
            <option value="pending">Mark Pending</option>
            <option value="reviewed">Mark Reviewed</option>
            <option value="resolved">Mark Resolved</option>
          </select>
        </div>

        <div className={styles.footerButtons}>
          <button
            type="button"
            className={`${styles.btnFlag} ${feedback.isFlagged ? styles.btnFlagActive : ""}`}
            onClick={() => onToggleFlag(feedback.id)}
            title={feedback.isFlagged ? "Remove Flag" : "Flag as Important / Complaint"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={feedback.isFlagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => onViewDetails(feedback)}
          >
            View Details
          </button>

          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => onOpenReply(feedback)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {feedback.adminReply ? "Edit Reply" : "Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export const FeedbackCard = React.memo(FeedbackCardComponent);
