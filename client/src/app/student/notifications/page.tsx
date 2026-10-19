"use client";

import { useState, useEffect } from "react";
import styles from "./notifications.module.css";
import {
  type NotificationCategory,
  type NotificationItem,
  type NotificationTypeMeta,
  NOTIFICATION_TYPES_SPEC,
  getStoredNotifications,
  saveStoredNotifications,
} from "./notificationData";

export type { NotificationCategory, NotificationItem, NotificationTypeMeta };
export { NOTIFICATION_TYPES_SPEC };

export function NotificationCategoryIcon({ category }: { category: NotificationCategory }) {
  switch (category) {
    case "menu":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2v20" />
          <path d="M21 7V2a5 5 0 0 0-5 5v3a2 2 0 0 0 2 2h3" />
          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
          <path d="M7 2v20" />
        </svg>
      );
    case "timing":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "attendance":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "announcement":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 11 18-5v12L3 13v-2z" />
          <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
        </svg>
      );
    case "feedback":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "waste":
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Sync notifications from shared storage on mount and storage events
  useEffect(() => {
    setNotifications(getStoredNotifications());

    const handleSync = () => {
      setNotifications(getStoredNotifications());
    };

    window.addEventListener("notificationsUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("notificationsUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Reset category filter to "all" when sidebar / nav Notifications link is clicked
  useEffect(() => {
    const handleResetCategory = () => {
      setActiveFilter("all");
    };

    window.addEventListener("resetNotificationsCategory", handleResetCategory);
    return () => {
      window.removeEventListener("resetNotificationsCategory", handleResetCategory);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    const next = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(next);
    saveStoredNotifications(next);
  };

  const markAsRead = (id: string) => {
    const next = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    setNotifications(next);
    saveStoredNotifications(next);
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === "unread") return !item.isRead;
    if (activeFilter === "menu") return item.category === "menu";
    if (activeFilter === "timing") return item.category === "timing";
    if (activeFilter === "attendance") return item.category === "attendance";
    if (activeFilter === "announcement") return item.category === "announcement";
    if (activeFilter === "feedback") return item.category === "feedback";
    if (activeFilter === "waste") return item.category === "waste";
    return true;
  });

  return (
    <div className={styles.notificationsWrapper}>
      {/* Top Controls: Filter Tabs & Mark All As Read Action */}
      <div className={styles.topControlRow}>
        <div className={styles.filterTabs}>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === "all" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === "unread" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("unread")}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === "menu" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("menu")}
          >
            Menu
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === "timing" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("timing")}
          >
            Meal Timings
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === "attendance" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("attendance")}
          >
            Attendance
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === "announcement" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("announcement")}
          >
            Announcements
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === "feedback" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("feedback")}
          >
            Feedback & Complaints
          </button>
          <button
            type="button"
            className={`${styles.filterTab} ${activeFilter === "waste" ? styles.filterTabActive : ""}`}
            onClick={() => setActiveFilter("waste")}
          >
            Food Waste
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className={styles.markReadBtn}
            onClick={markAllAsRead}
            id="mark-all-read-btn"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications Feed */}
      <div className={styles.notificationsList}>
        {filteredNotifications.length === 0 ? (
          <div className={styles.emptyState}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <p className={styles.emptyStateTitle}>No notifications found</p>
            <p className={styles.emptyStateText}>You have no notifications under this category right now.</p>
          </div>
        ) : (
          filteredNotifications.map((item) => {
            const specMeta = NOTIFICATION_TYPES_SPEC.find((s) => s.category === item.category);

            return (
              <article
                key={item.id}
                className={`${styles.notificationCard} ${!item.isRead ? styles.notificationCardUnread : styles.notificationCardRead}`}
                onClick={() => {
                  if (!item.isRead) {
                    markAsRead(item.id);
                  }
                }}
                title={!item.isRead ? "Click to mark as read" : undefined}
              >
                <div
                  className={`${styles.cardIconCol} ${styles["icon_" + item.category]}`}
                  style={{
                    backgroundColor: specMeta?.iconBg,
                    borderColor: specMeta?.iconBorder,
                    color: specMeta?.iconColor,
                  }}
                >
                  <NotificationCategoryIcon category={item.category} />
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.cardTopRow}>
                    <div className={styles.cardTitleCluster}>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      {!item.isRead && <span className={styles.unreadDot} title="Unread notification" />}
                    </div>
                    <span className={styles.cardTime}>{item.time}</span>
                  </div>

                  <p className={styles.cardBody}>{item.body}</p>

                  <div className={styles.cardFooter}>
                    <span className={`${styles.categoryTag} ${styles["tag_" + item.category]}`}>
                      {specMeta ? specMeta.name : item.category}
                    </span>
                    {!item.isRead ? (
                      <span className={styles.readToggleHint}>
                        Mark as read
                      </span>
                    ) : (
                      <span className={styles.readStatusBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
