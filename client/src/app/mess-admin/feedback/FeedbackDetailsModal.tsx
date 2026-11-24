"use client";

import React, { useState } from "react";
import styles from "./feedback.module.css";
import { StudentFeedback, FeedbackStatus } from "./feedbackData";

interface FeedbackDetailsModalProps {
  feedback: StudentFeedback;
  mode: "view" | "reply";
  onClose: () => void;
  onSubmitReply: (feedbackId: string, replyText: string, newStatus: FeedbackStatus) => void;
}

export default function FeedbackDetailsModal({
  feedback,
  mode,
  onClose,
  onSubmitReply,
}: FeedbackDetailsModalProps) {
  const [replyText, setReplyText] = useState<string>(feedback.adminReply || "");
  const [replyStatus, setReplyStatus] = useState<FeedbackStatus>(
    feedback.status === "pending" ? "reviewed" : feedback.status
  );
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onSubmitReply(feedback.id, replyText.trim(), replyStatus);
    onClose();
  };

  const dishNames = Object.keys(feedback.dishRatings || {});

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h3 className={styles.modalTitle}>
              {mode === "reply" ? "Reply to Student Feedback" : "Feedback Details"}
            </h3>
            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
              {feedback.hallName} • {feedback.mealName} ({feedback.mealType})
            </span>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {/* Student Info Bar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", padding: "0.85rem 1rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div>
              <div style={{ fontWeight: 750, color: "#0f172a", fontSize: "0.95rem" }}>
                {feedback.studentName}{" "}
                <span style={{ fontFamily: "monospace", fontSize: "0.8rem", background: "#e2e8f0", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>
                  {feedback.studentId}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                {feedback.studentHostel}
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#64748b" }}>
              <div>{feedback.submittedAt}</div>
              <div style={{ fontWeight: 600, color: "#ea580c" }}>{feedback.dayOfWeek}</div>
            </div>
          </div>

          {/* Overall Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e293b" }}>
              Overall Meal Rating:
            </span>
            <span style={{ color: "#f59e0b", fontSize: "1.2rem" }}>
              {"★".repeat(feedback.overallRating)}
              <span style={{ color: "#cbd5e1" }}>{"★".repeat(5 - feedback.overallRating)}</span>
            </span>
            <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem" }}>
              {feedback.overallRating}.0 / 5.0
            </span>
          </div>

          {/* Quick Tags */}
          {feedback.selectedTags && feedback.selectedTags.length > 0 && (
            <div className={styles.tagsRow}>
              {feedback.selectedTags.map((t) => (
                <span key={t} className={styles.tagChip}>
                  ✓ {t}
                </span>
              ))}
            </div>
          )}

          {/* Student Comments */}
          {feedback.comments && (
            <div style={{ background: "#ffffff", border: "1.5px solid #e2e8f0", borderRadius: "12px", padding: "0.9rem 1.1rem" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                Student Remarks
              </div>
              <p style={{ margin: 0, fontSize: "0.92rem", color: "#1e293b", lineHeight: 1.5 }}>
                "{feedback.comments}"
              </p>
            </div>
          )}

          {/* Dish Ratings */}
          {dishNames.length > 0 && (
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 750, color: "#334155", marginBottom: "0.5rem" }}>
                Individual Dish Ratings ({dishNames.length} dishes)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                {dishNames.map((dish) => {
                  const rating = feedback.dishRatings[dish];
                  const comment = feedback.dishComments[dish];
                  return (
                    <div
                      key={dish}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.6rem 0.85rem",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 650, color: "#0f172a" }}>{dish}</div>
                        {comment && (
                          <div style={{ fontSize: "0.75rem", color: "#64748b", fontStyle: "italic" }}>
                            "{comment}"
                          </div>
                        )}
                      </div>
                      <div style={{ color: "#f59e0b", fontSize: "0.9rem", flexShrink: 0 }}>
                        {"★".repeat(rating)}
                        <span style={{ color: "#cbd5e1" }}>{"★".repeat(5 - rating)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attached Photos */}
          {feedback.photos && feedback.photos.length > 0 && (
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 750, color: "#334155", marginBottom: "0.5rem" }}>
                Student Uploaded Photos ({feedback.photos.length})
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {feedback.photos.map((p) => (
                  <img
                    key={p.id}
                    src={p.dataUrl}
                    alt={p.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedPhoto(p.dataUrl)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Photo Lightbox Preview */}
          {selectedPhoto && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.85)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
              }}
              onClick={() => setSelectedPhoto(null)}
            >
              <img
                src={selectedPhoto}
                alt="Enlarged food photo"
                style={{ maxWidth: "90%", maxHeight: "85%", borderRadius: "12px", objectFit: "contain" }}
              />
            </div>
          )}

          {/* Admin Reply Section / Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 750, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {feedback.adminReply ? "Edit Administrator Response" : "Write Official Response to Student"}
            </label>

            <textarea
              className={styles.replyTextarea}
              placeholder="e.g., Thank you for the feedback. Kitchen staff has been notified regarding the seasoning..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>
                  Update Status to:
                </span>
                <select
                  className={styles.filterSelect}
                  style={{ padding: "0.35rem 1.6rem 0.35rem 0.6rem", fontSize: "0.8rem" }}
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value as FeedbackStatus)}
                >
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <button type="submit" className={styles.btnPrimary}>
                Save & Post Response
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
