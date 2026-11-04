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
    title: "Dinner Menu Update:",
    body: "Special Feast Tonight! Paneer Butter Masala, Jeera Rice, and Gulab Jamun added for all.",
    time: "Just Now",
    isRead: false,
  },
  {
    id: "notif-2",
    category: "timing",
    title: "Attention Students:",
    body: "Weekend mess timings updated. Breakfast: 8:00 AM–10:00 AM, Lunch: 12:30 PM–2:30 PM.",
    time: "30 min ago",
    isRead: true,
  },
  {
    id: "notif-3",
    category: "feedback",
    title: "Resolve Complaint:",
    body: "Your report regarding water dispenser in Hostel-02 mess has been addressed and fixed.",
    time: "2 days ago",
    isRead: false,
  },
  {
    id: "notif-4",
    category: "waste",
    title: "Food Waste Alert:",
    body: "35kg of food was wasted yesterday in the Central Mess. Let's do our part to avoid wasting food.",
    time: "5 days ago",
    isRead: true,
  },
  {
    id: "notif-5",
    category: "menu",
    title: "Special Request Status:",
    body: "Mess menu suggestions from the student council have been approved for next week's menu.",
    time: "07 Feb, 2026",
    isRead: true,
  },
  {
    id: "notif-6",
    category: "timing",
    title: "IMPORTANT:",
    body: "Guest meals can now be booked via the portal. Register at least 2 hours before standard mess hours.",
    time: "01 Feb, 2026",
    isRead: false,
  },
  {
    id: "notif-7",
    category: "menu",
    title: "Weekly Menu Change:",
    body: "Chinese night moved from Thursday to Friday. Check the updated schedule on the Mess Board.",
    time: "28 Jan, 2026",
    isRead: true,
  },
  {
    id: "notif-8",
    category: "announcement",
    title: "Mess Fee Deadline:",
    body: "Last date to pay the hostel mess advance for the next month is 31st January without fine.",
    time: "27 Jan, 2026",
    isRead: true,
  },
  {
    id: "notif-9",
    category: "timing",
    title: "Maintenance Notice:",
    body: "Central Mess will be closed for monthly pest control this Sunday. Alternate seating at BH-01 & GH-02.",
    time: "26 Jan, 2026",
    isRead: false,
  },
  {
    id: "notif-10",
    category: "feedback",
    title: "Service Status:",
    body: "Feedback form for Mess caterer performance is active. Submit your responses before the end of the week.",
    time: "28 Jan, 2026",
    isRead: true,
  },
  {
    id: "notif-11",
    category: "waste",
    title: "Daily Waste Report:",
    body: "Central kitchen recorded 18% reduction in plate waste this week. Let's do our part to avoid wasting food.",
    time: "22 Jan, 2026",
    isRead: false,
  },
  {
    id: "notif-12",
    category: "menu",
    title: "Breakfast Special:",
    body: "South Indian filter coffee counter opened near Counter 3 for morning service.",
    time: "20 Jan, 2026",
    isRead: true,
  },
  {
    id: "notif-13",
    category: "announcement",
    title: "Hygiene Audit Passed:",
    body: "State food safety officer certified Boys Hostel mess hygiene grade A+ during surprise inspection.",
    time: "18 Jan, 2026",
    isRead: false,
  },
  {
    id: "notif-14",
    category: "menu",
    title: "Festival Celebration:",
    body: "Special festive lunch scheduled for Republic Day. Check menu details in the dining tab.",
    time: "15 Jan, 2026",
    isRead: false,
  },
  {
    id: "notif-15",
    category: "attendance",
    title: "Attendance Verification:",
    body: "Your dinner QR scan at BH-01 counter was verified and recorded with Token #8812.",
    time: "12 Jan, 2026",
    isRead: true,
  },
  {
    id: "notif-16",
    category: "feedback",
    title: "Menu Feedback Addressed:",
    body: "Brown rice option added to daily lunch service following high student council demand.",
    time: "10 Jan, 2026",
    isRead: false,
  },
  {
    id: "notif-17",
    category: "timing",
    title: "Evening Snacks Update:",
    body: "Evening tea and hot samosas will be served today from 5:00 PM to 6:30 PM.",
    time: "08 Jan, 2026",
    isRead: true,
  },
  {
    id: "notif-18",
    category: "menu",
    title: "Nutrition Council Notice:",
    body: "Sprouts and boiled eggs corner permanently added to morning breakfast counter.",
    time: "05 Jan, 2026",
    isRead: false,
  },
  {
    id: "notif-19",
    category: "announcement",
    title: "Mess Rebate Credited:",
    body: "Your official mess rebate for 4 days approved leave has been adjusted in this month's billing.",
    time: "03 Jan, 2026",
    isRead: false,
  },
  {
    id: "notif-20",
    category: "announcement",
    title: "New Year Mess Welcome:",
    body: "Welcome back students! Mess operations have resumed normal semester operating hours.",
    time: "01 Jan, 2026",
    isRead: true,
  },
];

export const NOTIFICATIONS_STORAGE_KEY = "lpu_student_notifications_v5";

export function getStoredNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (raw !== null) {
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
