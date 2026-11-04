"use client";

import { useState, useEffect } from "react";
import styles from "./notifications.module.css";
import {
  type NotificationItem,
  getStoredNotifications,
  saveStoredNotifications,
} from "./notificationData";

type FilterTab =
  | "all"
  | "unread"
  | "menu"
  | "timing"
  | "feedback"
  | "waste"
  | "announcement";

interface TabItem {
  id: FilterTab;
  label: string;
}

const TABS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "menu", label: "Menu" },
  { id: "timing", label: "Meal Timings" },
  { id: "feedback", label: "Feedbacks & Complaints" },
  { id: "waste", label: "Food Waste" },
  { id: "announcement", label: "Announcements" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

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

  // Reset tab to "all" when sidebar / nav Notifications link is clicked
  useEffect(() => {
    const handleResetCategory = () => {
      setActiveTab("all");
    };

    window.addEventListener("resetNotificationsCategory", handleResetCategory);
    return () => {
      window.removeEventListener("resetNotificationsCategory", handleResetCategory);
    };
  }, []);

  // Calculate notification count per tab
  const getTabCount = (tabId: FilterTab): number => {
    switch (tabId) {
      case "all":
        return notifications.length;
      case "unread":
        return notifications.filter((n) => !n.isRead).length;
      case "menu":
        return notifications.filter((n) => n.category === "menu").length;
      case "timing":
        return notifications.filter((n) => n.category === "timing").length;
      case "feedback":
        return notifications.filter((n) => n.category === "feedback").length;
      case "waste":
        return notifications.filter((n) => n.category === "waste").length;
      case "announcement":
        return notifications.filter(
          (n) => n.category === "announcement" || n.category === "attendance"
        ).length;
    }
  };

  // Mark notification as read (never mark back as unread on click)
  const handleMarkAsRead = (id: string) => {
    const target = notifications.find((n) => n.id === id);
    if (!target || target.isRead) return; // Do not mark unread if already read!

    const next = notifications.map((n) => {
      if (n.id === id) {
        return { ...n, isRead: true };
      }
      return n;
    });
    setNotifications(next);
    saveStoredNotifications(next);
  };

  const displayedNotifications = notifications.filter((item) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !item.isRead;
    if (activeTab === "menu") return item.category === "menu";
    if (activeTab === "timing") return item.category === "timing";
    if (activeTab === "feedback") return item.category === "feedback";
    if (activeTab === "waste") return item.category === "waste";
    if (activeTab === "announcement") {
      return item.category === "announcement" || item.category === "attendance";
    }
    return true;
  });

  return (
    <div className={styles.notificationsContainer}>
      <div className={styles.notificationsCard}>
        {/* Top Tab Bar with counts: All | Unread | Menu | Meal Timings | Feedbacks & Complaints | Food Waste | Announcements */}
        <div className={styles.tabRow} role="tablist">
          {TABS.map((tab) => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabButton} ${isActive ? styles.tabButtonActive : ""}`}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={isActive}
                role="tab"
              >
                <span
                  className={`${styles.tabBadge} ${
                    isActive ? styles.tabBadgeActive : styles.tabBadgeMuted
                  }`}
                >
                  {count}
                </span>
                <span
                  className={`${styles.tabText} ${
                    isActive ? styles.tabTextActive : styles.tabTextMuted
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Notifications List matching reference UI */}
        <div className={styles.notificationsList}>
          {displayedNotifications.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateTitle}>No notifications found</p>
              <p className={styles.emptyStateText}>
                {activeTab === "unread"
                  ? "You\u2019re all caught up! All notifications have been read."
                  : `There are no notifications in ${
                      TABS.find((t) => t.id === activeTab)?.label || "this category"
                    } right now.`}
              </p>
            </div>
          ) : (
            displayedNotifications.map((item) => (
              <div
                key={item.id}
                className={`${styles.notificationRow} ${
                  !item.isRead ? styles.rowUnread : styles.rowRead
                }`}
                onClick={() => {
                  if (!item.isRead) {
                    handleMarkAsRead(item.id);
                  }
                }}
                onKeyDown={(e) => {
                  if (!item.isRead && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    handleMarkAsRead(item.id);
                  }
                }}
                role={!item.isRead ? "button" : undefined}
                tabIndex={!item.isRead ? 0 : undefined}
                title={!item.isRead ? "Click to mark as read" : undefined}
              >
                <div className={styles.dotCol}>
                  <span
                    className={`${styles.statusDot} ${
                      !item.isRead ? styles.dotUnread : styles.dotRead
                    }`}
                  />
                </div>

                <div className={styles.messageCol}>
                  <p className={styles.messageText}>
                    {item.title ? (
                      <span className={styles.messageTitle}>{item.title} </span>
                    ) : null}
                    {item.body}
                  </p>
                </div>

                <div className={styles.timeCol}>
                  <span className={styles.timeText}>{item.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
