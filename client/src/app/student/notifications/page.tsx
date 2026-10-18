"use client";

import { useState } from "react";
import styles from "./notifications.module.css";

export type NotificationCategory =
  | "menu"
  | "timing"
  | "attendance"
  | "announcement"
  | "feedback"
  | "waste";

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
}

export interface NotificationTypeMeta {
  category: NotificationCategory;
  name: string;
  description: string;
  sampleTitle: string;
  sampleBody: string;
  iconBg: string;
  iconBorder: string;
  iconColor: string;
}

export const NOTIFICATION_TYPES_SPEC: NotificationTypeMeta[] = [
  {
    category: "menu",
    name: "Menu",
    description: "Inform students when a new menu is published or an existing menu changes.",
    sampleTitle: "Today's lunch menu is published!",
    sampleBody: "Rice, dal, roti and paneer curry. Check the full menu before lunch.",
    iconBg: "#fff7ed",
    iconBorder: "#fed7aa",
    iconColor: "#ea580c",
  },
  {
    category: "timing",
    name: "Meal Timings",
    description: "Remind students shortly before a meal service starts.",
    sampleTitle: "Lunch starts in 15 minutes",
    sampleBody: "Lunch service is scheduled from 12:00 PM to 2:00 PM.",
    iconBg: "#eff6ff",
    iconBorder: "#bfdbfe",
    iconColor: "#2563eb",
  },
  {
    category: "attendance",
    name: "Attendance",
    description: "Confirm that a student's meal attendance was recorded, or alert them if a record needs attention.",
    sampleTitle: "Lunch attendance recorded",
    sampleBody: "Your attendance for today's lunch has been recorded successfully.",
    iconBg: "#f0fdf4",
    iconBorder: "#bbf7d0",
    iconColor: "#16a34a",
  },
  {
    category: "announcement",
    name: "Announcements",
    description: "Share temporary closures, changed timings, maintenance updates, or special meal arrangements.",
    sampleTitle: "Dinner timing updated",
    sampleBody: "Today's dinner service will begin at 7:30 PM instead of 7:00 PM.",
    iconBg: "#faf5ff",
    iconBorder: "#e9d5ff",
    iconColor: "#9333ea",
  },
  {
    category: "feedback",
    name: "Feedback & Complaints",
    description: "Inform students when their feedback or complaint receives a response or changes status.",
    sampleTitle: "Complaint status updated",
    sampleBody: "Your complaint about lunch quality has been reviewed by the mess manager.",
    iconBg: "#fefce8",
    iconBorder: "#fef08a",
    iconColor: "#d97706",
  },
  {
    category: "waste",
    name: "Food Waste",
    description: "Share occasional updates about food-waste reduction initiatives or ask students to provide feedback on meals.",
    sampleTitle: "Help us reduce food waste",
    sampleBody: "Today's menu is available. Check the dishes planned for each meal and share your feedback afterward.",
    iconBg: "#ecfdf5",
    iconBorder: "#a7f3d0",
    iconColor: "#059669",
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "menu",
    title: "Today's lunch menu is published!",
    body: "Rice, dal, roti and paneer curry. Check the full menu before lunch.",
    time: "10 mins ago",
    isRead: false,
  },
  {
    id: "notif-2",
    category: "timing",
    title: "Lunch starts in 15 minutes",
    body: "Lunch service is scheduled from 12:00 PM to 2:00 PM.",
    time: "25 mins ago",
    isRead: false,
  },
  {
    id: "notif-3",
    category: "attendance",
    title: "Lunch attendance recorded",
    body: "Your attendance for today's lunch has been recorded successfully.",
    time: "Today, 12:42 PM",
    isRead: false,
  },
  {
    id: "notif-4",
    category: "announcement",
    title: "Dinner timing updated",
    body: "Today's dinner service will begin at 7:30 PM instead of 7:00 PM.",
    time: "2 hours ago",
    isRead: true,
  },
  {
    id: "notif-5",
    category: "feedback",
    title: "Complaint status updated",
    body: "Your complaint about lunch quality has been reviewed by the mess manager.",
    time: "Yesterday, 4:15 PM",
    isRead: true,
  },
  {
    id: "notif-6",
    category: "waste",
    title: "Help us reduce food waste",
    body: "Today's menu is available. Check the dishes planned for each meal and share your feedback afterward.",
    time: "Yesterday, 9:00 AM",
    isRead: true,
  },
  {
    id: "notif-7",
    category: "menu",
    title: "Sunday Special Dinner Menu Released",
    body: "Chef special Paneer Butter Masala, Veg Dum Biryani, and Hot Gulab Jamun scheduled for Sunday 7:30 PM at BH-4 Central Mess.",
    time: "2 days ago",
    isRead: true,
  },
  {
    id: "notif-8",
    category: "attendance",
    title: "Breakfast attendance recorded",
    body: "Your attendance for today's breakfast at Counter 2 has been recorded successfully.",
    time: "2 days ago",
    isRead: true,
  },
];

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
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
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
                className={`${styles.notificationCard} ${!item.isRead ? styles.notificationCardUnread : ""}`}
                onClick={() => toggleReadStatus(item.id)}
                title="Click to toggle read / unread status"
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
                    <span className={styles.readToggleHint}>
                      {item.isRead ? "Mark as unread" : "Mark as read"}
                    </span>
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
