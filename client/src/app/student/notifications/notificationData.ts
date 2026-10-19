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

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
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

export const NOTIFICATIONS_STORAGE_KEY = "lpu_student_notifications";

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(items: NotificationItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("notificationsUpdated"));
  } catch {
    // ignore
  }
}

export function getUnreadCount(items?: NotificationItem[]): number {
  const list = items || getStoredNotifications();
  return list.filter((n) => !n.isRead).length;
}
