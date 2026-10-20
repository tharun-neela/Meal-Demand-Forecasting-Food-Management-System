"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./student.module.css";
import {
  getStoredNotifications,
  getUnreadCount,
  saveStoredNotifications,
  type NotificationItem,
} from "./notifications/notificationData";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// Consistent Title Case for all navigation items with large 24x24 icons for kitchen staff
const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    label: "Menu",
    href: "/student/menu",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  {
    label: "Access Meal",
    href: "/student/access-meal",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect width="5" height="5" x="3" y="3" rx="1" />
        <rect width="5" height="5" x="16" y="3" rx="1" />
        <rect width="5" height="5" x="3" y="16" rx="1" />
        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
        <path d="M21 21v.01" />
        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
        <path d="M3 12h.01" />
        <path d="M12 3h.01" />
        <path d="M12 16v.01" />
        <path d="M16 12h1" />
        <path d="M21 12v.01" />
        <path d="M12 21v-1" />
      </svg>
    ),
  },
  {
    label: "Meal History",
    href: "/student/history",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    label: "Meal Analytics",
    href: "/student/analytics",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
        <circle cx="19" cy="9" r="1" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    href: "/student/notifications",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    label: "Feedback",
    href: "/student/feedback",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01" />
        <path d="M12 10h.01" />
        <path d="M16 10h.01" />
      </svg>
    ),
  },
  {
    label: "Raise Complaints",
    href: "/student/complaints",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    label: "Change Mess",
    href: "/student/change-mess",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="m16 3 4 4-4 4" />
        <path d="M20 7H4" />
        <path d="m8 21-4-4 4-4" />
        <path d="M4 17h16" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/student/profile",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/student/settings",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

interface SearchOption {
  title: string;
  category: string;
  href: string;
  keywords: string[];
}

const SEARCH_OPTIONS: SearchOption[] = [
  { title: "Weekly Menu", category: "Dining", href: "/student/menu", keywords: ["food", "thali", "breakfast", "lunch", "dinner", "snacks", "menu", "today", "sat", "sun"] },
  { title: "Access Meal (QR)", category: "Dining", href: "/student/access-meal", keywords: ["qr", "token", "scan", "entry", "eat", "coupon", "code"] },
  { title: "Meal History", category: "Records", href: "/student/history", keywords: ["past", "logs", "previous", "attendance", "records", "consumed"] },
  { title: "Meal Analytics", category: "Insights", href: "/student/analytics", keywords: ["stats", "nutrition", "calories", "charts", "consumption"] },
  { title: "Student Dashboard", category: "Overview", href: "/student/dashboard", keywords: ["home", "overview", "summary", "main"] },
  { title: "Notifications", category: "Alerts", href: "/student/notifications", keywords: ["alerts", "updates", "announcements", "bell"] },
  { title: "Mess Feedback", category: "Support", href: "/student/feedback", keywords: ["rating", "review", "taste", "hygiene"] },
  { title: "Raise Complaints", category: "Support", href: "/student/complaints", keywords: ["issue", "report", "grievance", "problem", "ticket"] },
  { title: "Change Mess", category: "Services", href: "/student/change-mess", keywords: ["switch", "transfer", "hostel", "mess change"] },
  { title: "Student Profile", category: "Account", href: "/student/profile", keywords: ["user", "account", "details", "registration", "tharun"] },
  { title: "Settings", category: "Account", href: "/student/settings", keywords: ["preferences", "password", "theme", "config"] },
];



const PAGE_TITLES: Record<string, string> = {
  "/student": "Dashboard",
  "/student/dashboard": "Dashboard",
  "/student/menu": "Menu",
  "/student/access-meal": "Access Meal",
  "/student/history": "Meal History",
  "/student/analytics": "Meal Analytics",
  "/student/notifications": "Notifications",
  "/student/feedback": "Feedback",
  "/student/complaints": "Raise Complaints",
  "/student/change-mess": "Change Mess",
  "/student/profile": "Profile",
  "/student/settings": "Settings",
};

interface SearchItemResult {
  id?: string;
  title: string;
  category: string;
  subtitle?: string;
  href: string;
  type: "page" | "notification";
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [dropdownNotifications, setDropdownNotifications] = useState<NotificationItem[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const pageHeading = PAGE_TITLES[pathname] || "Dashboard";

  // Dynamically sync notifications and unread count with shared storage
  useEffect(() => {
    const syncNotifs = () => {
      const stored = getStoredNotifications();
      const count = stored.filter((n) => !n.isRead).length;
      setUnreadNotificationsCount(count);
      setDropdownNotifications(stored.slice(0, 5));
    };

    syncNotifs();

    window.addEventListener("notificationsUpdated", syncNotifs);
    window.addEventListener("storage", syncNotifs);
    return () => {
      window.removeEventListener("notificationsUpdated", syncNotifs);
      window.removeEventListener("storage", syncNotifs);
    };
  }, [pathname]);

  // Quick search filtering (searches both pages and student notifications)
  const filteredSearchItems: SearchItemResult[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    const matchedPages: SearchItemResult[] = SEARCH_OPTIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
    ).map((item) => ({
      title: item.title,
      category: item.category,
      href: item.href,
      type: "page",
    }));

    const storedNotifs = getStoredNotifications();
    const matchedNotifs: SearchItemResult[] = storedNotifs
      .filter(
        (notif) =>
          notif.title.toLowerCase().includes(q) ||
          notif.body.toLowerCase().includes(q) ||
          notif.category.toLowerCase().includes(q)
      )
      .map((notif) => ({
        id: notif.id,
        title: notif.title,
        category: `Notification • ${notif.category.toUpperCase()}`,
        subtitle: notif.body,
        href: "/student/notifications",
        type: "notification",
      }));

    return [...matchedPages.slice(0, 4), ...matchedNotifs.slice(0, 4)].slice(0, 7);
  }, [searchQuery]);

  const onSelectSearchItem = (targetItem: SearchItemResult) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    setHighlightedIndex(-1);
    if (targetItem.type === "notification" && targetItem.id) {
      const stored = getStoredNotifications();
      const updated = stored.map((n) => (n.id === targetItem.id ? { ...n, isRead: true } : n));
      saveStoredNotifications(updated);
    }
    if (targetItem.href === "/student/notifications" && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("resetNotificationsCategory"));
    }
    router.push(targetItem.href);
  };

  // Handle keyboard navigation (ArrowUp, ArrowDown, Enter) on search suggestions
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen || filteredSearchItems.length === 0) {
      if (e.key === "ArrowDown" && filteredSearchItems.length > 0) {
        setIsSearchOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSearchItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? filteredSearchItems.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetItem = highlightedIndex >= 0 ? filteredSearchItems[highlightedIndex] : filteredSearchItems[0];
      if (targetItem) {
        onSelectSearchItem(targetItem);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Keyboard shortcut Ctrl+K to focus search and Escape to dismiss popups
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === "Escape") {
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdowns on route changes
  useEffect(() => {
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // Authentication guard for student portal
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = () => {
      if (typeof window === "undefined") return;

      const isRemembered = localStorage.getItem("lpu_mess_remember") === "true";
      const token =
        sessionStorage.getItem("lpu_mess_jwt") ||
        (isRemembered ? localStorage.getItem("lpu_mess_jwt") : null);

      if (!token) {
        setIsAuthorized(false);
        document.cookie = "lpu_mess_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        sessionStorage.removeItem("lpu_mess_jwt");
        localStorage.removeItem("lpu_mess_jwt");
        localStorage.removeItem("lpu_mess_remember");
        router.replace("/");
        return;
      }

      // Sync cookie so server/middleware recognizes active session
      document.cookie = `lpu_mess_jwt=${token}; path=/; SameSite=Lax`;
      setIsAuthorized(true);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("lpu_mess_jwt");
      localStorage.removeItem("lpu_mess_jwt");
      localStorage.removeItem("lpu_mess_remember");
      document.cookie = "lpu_mess_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    router.replace("/");
  };

  const handleGoToNotifications = (notificationId?: string) => {
    if (typeof window !== "undefined") {
      const isRemembered = localStorage.getItem("lpu_mess_remember") === "true";
      const token =
        sessionStorage.getItem("lpu_mess_jwt") ||
        (isRemembered ? localStorage.getItem("lpu_mess_jwt") : null);
      if (token) {
        document.cookie = `lpu_mess_jwt=${token}; path=/; SameSite=Lax`;
      }
      if (notificationId) {
        const stored = getStoredNotifications();
        const updated = stored.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n));
        saveStoredNotifications(updated);
      }
      window.dispatchEvent(new CustomEvent("resetNotificationsCategory"));
    }
    setIsNotificationOpen(false);
  };

  return (
    <div className={styles.studentContainer}>
      {!isAuthorized && (
        <div className={styles.authGateOverlay} aria-modal="true" role="dialog">
          <div className={styles.authGateCard}>
            <div className={styles.authGateSpinner} />
            <p className={styles.authGateText}>Verifying student authentication...</p>
          </div>
        </div>
      )}
      {/* Mobile Top App Bar (Visible only on screens < 768px) */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileBrand}>
          <Image
            src="/lpu-round-logo.png"
            alt="LPU Official Logo"
            width={34}
            height={34}
            priority
            className={styles.mobileLogo}
          />
          <div className={styles.mobileBrandInfo}>
            <span className={styles.mobileBrandTitle}>LPU Mess</span>
            <span className={styles.mobileBrandBadge}>Student</span>
          </div>
        </div>

        <button
          onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
          className={styles.mobileMenuBtn}
          id="mobile-student-menu-btn"
          aria-label={isMobileDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileDrawerOpen}
        >
          {isMobileDrawerOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar - Executive Slate Mini-Rail / Mobile Off-Canvas Drawer */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${isMobileDrawerOpen ? styles.mobileDrawerOpen : ""}`}
        aria-label="Student Navigation"
      >
        {/* Sidebar Header with Built-in Toggle Button */}
        <div className={styles.sidebarHeader}>
          {!isCollapsed ? (
            <>
              <div className={styles.brandGroup}>
                <Image
                  src="/lpu-round-logo.png"
                  alt="LPU Official Logo"
                  width={38}
                  height={38}
                  priority
                  className={styles.logoImage}
                />
                <div className={styles.brandText}>
                  <span className={styles.brandTitle}>LPU Mess</span>
                  <span className={styles.brandBadge}>Student Portal</span>
                </div>
              </div>

              {/* Desktop/Tablet Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(true)}
                className={`${styles.toggleBtn} ${styles.desktopOnlyToggle}`}
                id="collapse-student-sidebar"
                aria-label="Collapse to icon rail"
                title="Collapse Sidebar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* Mobile Drawer Close Button */}
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`${styles.toggleBtn} ${styles.mobileOnlyClose}`}
                id="close-mobile-drawer"
                aria-label="Close menu drawer"
                title="Close Menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </>
          ) : (
            <div className={styles.collapsedHeaderContent}>
              <Image
                src="/lpu-round-logo.png"
                alt="LPU Official Logo"
                width={34}
                height={34}
                priority
                className={styles.logoImage}
              />
              <button
                onClick={() => setIsCollapsed(false)}
                className={styles.toggleBtn}
                id="expand-student-sidebar"
                aria-label="Expand Sidebar"
                title="Expand Sidebar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 11 Navigation Slider Items in Title Case */}
        <nav className={styles.navSection}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isNotif = item.href === "/student/notifications";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  if (item.href === "/student/notifications" && typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("resetNotificationsCategory"));
                  }
                }}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                title={item.label}
              >
                <span className={styles.navIcon}>
                  {item.icon}
                  {isCollapsed && !isMobileDrawerOpen && isNotif && unreadNotificationsCount > 0 && (
                    <span className={styles.sidebarCollapsedBadge}>
                      {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                    </span>
                  )}
                </span>
                {(!isCollapsed || isMobileDrawerOpen) && (
                  <>
                    <span className={styles.navLabel}>{item.label}</span>
                    {isNotif && unreadNotificationsCount > 0 && (
                      <span className={styles.sidebarNavBadge}>
                        {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard} title="Tharun Neela">
            <div className={styles.userAvatar}>TN</div>
            {(!isCollapsed || isMobileDrawerOpen) && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>Tharun Neela</span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setIsMobileDrawerOpen(false);
              handleLogout();
            }}
            className={styles.logoutButton}
            id="student-logout-btn"
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {(!isCollapsed || isMobileDrawerOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.contentArea}>
        {/* Top Navigation Bar */}
        <header className={styles.topNavbar}>
          {/* Left: Active Page Heading */}
          <div className={styles.topNavLeft}>
            <h1 className={styles.topNavPageTitle}>{pageHeading}</h1>
          </div>

          {/* Right: Modern Search Bar, Notification Icon, Profile Icon */}
          <div className={styles.topNavRight}>
            {/* 1. Modern Search Bar */}
            <div className={styles.searchBarWrapper}>
              <span className={styles.searchIcon} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search menu, meals, notifications..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    setIsSearchOpen(true);
                  }
                }}
                className={styles.searchInput}
                aria-label="Search meals, services, and pages"
                id="student-top-search-input"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                    setHighlightedIndex(-1);
                  }}
                  className={styles.searchClearBtn}
                  aria-label="Clear search input"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ) : (
                <span className={styles.searchShortcutPill}>Ctrl K</span>
              )}

              {/* Quick Search Dropdown Filter Results */}
              {isSearchOpen && searchQuery.trim().length > 0 && (
                <>
                  <div
                    className={styles.dropdownBackdrop}
                    onClick={() => setIsSearchOpen(false)}
                    aria-hidden="true"
                  />
                  <div className={styles.searchResultsDropdown}>
                    {filteredSearchItems.length > 0 ? (
                      filteredSearchItems.map((item, idx) => (
                        <Link
                          key={item.id ? `${item.href}-${item.id}` : item.href}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectSearchItem(item);
                          }}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`${styles.searchResultItem} ${highlightedIndex === idx ? styles.searchResultItemActive : ""}`}
                        >
                          <span className={styles.searchResultIcon}>
                            {item.type === "notification" ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                              </svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                              </svg>
                            )}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className={styles.searchResultTitle}>{item.title}</div>
                            {item.subtitle ? (
                              <div className={styles.searchResultSnippet}>{item.subtitle}</div>
                            ) : (
                              <div className={styles.searchResultCategory}>{item.category}</div>
                            )}
                          </div>
                          {item.type === "notification" && (
                            <span className={styles.searchResultCategoryBadge}>Notification</span>
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className={styles.noSearchResults}>
                        No matches found for &ldquo;{searchQuery}&rdquo;
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* 2. Notification Icon Button & Dropdown */}
            <div className={styles.navActionGroup}>
              <button
                type="button"
                onClick={() => {
                  setIsNotificationOpen(!isNotificationOpen);
                  setIsProfileOpen(false);
                  setIsSearchOpen(false);
                }}
                className={styles.notificationBtn}
                id="top-notification-btn"
                aria-label="View notifications"
                aria-expanded={isNotificationOpen}
                title={unreadNotificationsCount > 0 ? `Notifications (${unreadNotificationsCount} unread)` : "Notifications"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className={styles.notificationBadge} id="top-notification-unread-count">
                    {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <>
                  <div
                    className={styles.dropdownBackdrop}
                    onClick={() => setIsNotificationOpen(false)}
                    aria-hidden="true"
                  />
                  <div className={styles.notificationDropdown}>
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownTitle}>Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className={styles.dropdownBadge}>{unreadNotificationsCount} New</span>
                      )}
                    </div>
                    <div className={styles.notificationList}>
                      {dropdownNotifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href="/student/notifications"
                          onClick={() => handleGoToNotifications(notif.id)}
                          className={styles.notificationItem}
                        >
                          <div className={styles.notificationItemTitle}>{notif.title}</div>
                          <div className={styles.notificationItemBody}>{notif.body}</div>
                          <div className={styles.notificationItemTime}>{notif.time}</div>
                        </Link>
                      ))}
                    </div>
                    <div className={styles.dropdownFooter}>
                      <Link
                        href="/student/notifications"
                        onClick={() => handleGoToNotifications()}
                        className={styles.dropdownFooterBtn}
                        id="view-all-notifications-btn"
                      >
                        <span>View All Notifications</span>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 3. Profile Icon Button & Dropdown */}
            <div className={styles.navActionGroup}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationOpen(false);
                  setIsSearchOpen(false);
                }}
                className={styles.profileBtn}
                id="top-profile-btn"
                aria-label="Student profile menu"
                aria-expanded={isProfileOpen}
                title="Profile (TN)"
              >
                <div className={styles.profileAvatar}>TN</div>
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className={styles.dropdownBackdrop}
                    onClick={() => setIsProfileOpen(false)}
                    aria-hidden="true"
                  />
                  <div className={styles.profileDropdown}>
                    <div className={styles.profileDropdownHeader}>
                      <span className={styles.dropdownUserName}>Tharun Neela</span>
                      <span className={styles.dropdownUserReg}>12204918 • Hostel BH-4</span>
                    </div>

                    <div className={styles.profileDropdownLinks}>
                      <Link
                        href="/student/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className={styles.profileDropdownLink}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Student Profile</span>
                      </Link>

                      <Link
                        href="/student/settings"
                        onClick={() => setIsProfileOpen(false)}
                        className={styles.profileDropdownLink}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>Settings</span>
                      </Link>

                      <Link
                        href="/student/change-mess"
                        onClick={() => setIsProfileOpen(false)}
                        className={styles.profileDropdownLink}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m16 3 4 4-4 4" />
                          <path d="M20 7H4" />
                          <path d="m8 21-4-4 4-4" />
                          <path d="M4 17h16" />
                        </svg>
                        <span>Change Mess</span>
                      </Link>

                      <Link
                        href="/student/history"
                        onClick={() => setIsProfileOpen(false)}
                        className={styles.profileDropdownLink}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                          <polyline points="12 7 12 12 15 15" />
                        </svg>
                        <span>Meal History</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className={styles.dropdownLogoutBtn}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
