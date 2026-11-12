"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./messAdmin.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// Consistent Title Case navigation items for Mess Administrator portal
const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/mess-admin/dashboard",
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
    label: "Mess Units",
    href: "/mess-admin/units",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        <path d="M9 9h1" />
        <path d="M9 13h1" />
        <path d="M9 17h1" />
        <path d="M14 9h1" />
        <path d="M14 13h1" />
        <path d="M14 17h1" />
      </svg>
    ),
  },
  {
    label: "Academic Calendar",
    href: "/mess-admin/calendar",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Menu Management",
    href: "/mess-admin/menus",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  {
    label: "Dish Suggestions",
    href: "/mess-admin/suggestions",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" />
        <line x1="9" y1="21" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    label: "Waste & Attendance",
    href: "/mess-admin/analytics",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
        <circle cx="19" cy="9" r="1" />
      </svg>
    ),
  },
  {
    label: "Student Feedback",
    href: "/mess-admin/feedback",
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
    label: "Announcements",
    href: "/mess-admin/notifications",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/mess-admin/profile",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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
  { title: "Dashboard Overview", category: "Overview", href: "/mess-admin/dashboard", keywords: ["summary", "home", "stats", "campus"] },
  { title: "Mess Units", category: "Operations", href: "/mess-admin/units", keywords: ["hostel", "bh-01", "bh-02", "bh-03", "central mess", "gh-01", "gh-02", "capacity"] },
  { title: "Academic Calendar", category: "Planning", href: "/mess-admin/calendar", keywords: ["holidays", "exams", "schedule", "term", "overrides"] },
  { title: "Menu Management", category: "Dining", href: "/mess-admin/menus", keywords: ["weekly menu", "breakfast", "lunch", "dinner", "rotations", "thali"] },
  { title: "Dish Suggestions", category: "Students", href: "/mess-admin/suggestions", keywords: ["recommendations", "student dishes", "review", "approve"] },
  { title: "Waste & Attendance Analytics", category: "Reports", href: "/mess-admin/analytics", keywords: ["waste", "food waste", "attendance", "trends", "reduction"] },
  { title: "Student Feedback", category: "Quality", href: "/mess-admin/feedback", keywords: ["ratings", "reviews", "hygiene", "taste", "complaints"] },
  { title: "Announcements & Notices", category: "Broadcast", href: "/mess-admin/notifications", keywords: ["alerts", "notices", "broadcast", "updates"] },
  { title: "Admin Profile", category: "Account", href: "/mess-admin/profile", keywords: ["neeraj verma", "account", "settings", "credentials"] },
];

const PAGE_TITLES: Record<string, string> = {
  "/mess-admin": "Dashboard",
  "/mess-admin/dashboard": "Dashboard",
  "/mess-admin/units": "Mess Units",
  "/mess-admin/calendar": "Academic Calendar",
  "/mess-admin/menus": "Menu Management",
  "/mess-admin/suggestions": "Dish Suggestions",
  "/mess-admin/analytics": "Waste & Attendance",
  "/mess-admin/feedback": "Student Feedback",
  "/mess-admin/notifications": "Announcements",
  "/mess-admin/profile": "Admin Profile",
};

interface SearchItemResult {
  id?: string;
  title: string;
  category: string;
  subtitle?: string;
  href: string;
  type: "page" | "notification";
}

interface AdminNotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  category: string;
}

const DEFAULT_ADMIN_NOTIFS: AdminNotificationItem[] = [
  {
    id: "notif-adm-1",
    title: "14 New Dish Suggestions",
    body: "Students submitted 14 new dish recommendations from the dashboard.",
    timestamp: "10 min ago",
    isRead: false,
    category: "Suggestions",
  },
  {
    id: "notif-adm-2",
    title: "Weekend Prep Adjustment Needed",
    body: "Hostel BH-02 forecasted attendance is 12% lower due to campus event.",
    timestamp: "1 hour ago",
    isRead: false,
    category: "Operations",
  },
  {
    id: "notif-adm-3",
    title: "Monthly Wastage Audit Report Ready",
    body: "October food waste dropped by 18.4% across all 6 mess halls.",
    timestamp: "1 day ago",
    isRead: true,
    category: "Analytics",
  },
  {
    id: "notif-adm-4",
    title: "Central Mess Pest Control",
    body: "Routine sanitization scheduled for upcoming Sunday afternoon.",
    timestamp: "2 days ago",
    isRead: true,
    category: "Maintenance",
  },
];

export default function MessAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>(DEFAULT_ADMIN_NOTIFS);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  const pageHeading = PAGE_TITLES[pathname] || "Dashboard";

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Search filtering
  const filteredSearchItems: SearchItemResult[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    return SEARCH_OPTIONS.filter(
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
  }, [searchQuery]);

  const onSelectSearchItem = (targetItem: SearchItemResult) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    setHighlightedIndex(-1);
    router.push(targetItem.href);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen || filteredSearchItems.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSearchItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? filteredSearchItems.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const targetItem = highlightedIndex >= 0 ? filteredSearchItems[highlightedIndex] : filteredSearchItems[0];
      if (targetItem) onSelectSearchItem(targetItem);
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Keyboard shortcut Ctrl+K to focus search and Escape to dismiss popups
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        setIsProfileOpen(false);
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("lpu_mess_jwt");
    localStorage.removeItem("lpu_mess_jwt");
    localStorage.removeItem("lpu_mess_remember");
    document.cookie = "lpu_mess_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  };

  return (
    <div className={styles.portalContainer}>
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
        aria-label="Mess Administrator Navigation"
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
                  <span className={styles.brandBadge}>Mess Admin Portal</span>
                </div>
              </div>

              {/* Desktop/Tablet Collapse Toggle */}
              <button
                onClick={() => setIsCollapsed(true)}
                className={`${styles.toggleBtn} ${styles.desktopOnlyToggle}`}
                id="collapse-admin-sidebar"
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
                id="close-admin-mobile-drawer"
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
                id="expand-admin-sidebar"
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

        {/* Navigation Items in Title Case matching Student Portal */}
        <nav className={styles.navSection}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const isSuggestions = item.href === "/mess-admin/suggestions";
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                title={item.label}
              >
                <span className={styles.navIcon}>
                  {item.icon}
                  {isCollapsed && !isMobileDrawerOpen && isSuggestions && (
                    <span className={styles.sidebarCollapsedBadge}>14</span>
                  )}
                </span>
                {(!isCollapsed || isMobileDrawerOpen) && (
                  <>
                    <span className={styles.navLabel}>{item.label}</span>
                    {isSuggestions && (
                      <span className={styles.sidebarNavBadge}>14 New</span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout (Dr. Neeraj Verma, Mess Administrator) */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard} title="Dr. Neeraj Verma">
            <div className={styles.userAvatar}>NV</div>
            {(!isCollapsed || isMobileDrawerOpen) && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>Dr. Neeraj Verma</span>
                <span className={styles.userRole}>Mess Administrator</span>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setIsMobileDrawerOpen(false);
              handleLogout();
            }}
            className={styles.logoutButton}
            id="admin-logout-btn"
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
                placeholder="Search units, calendar, suggestions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) setIsSearchOpen(true);
                }}
                className={styles.searchInput}
                aria-label="Search mess administrator portal"
                id="admin-top-search-input"
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
                          key={item.href}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectSearchItem(item);
                          }}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`${styles.searchResultItem} ${highlightedIndex === idx ? styles.searchResultItemActive : ""}`}
                        >
                          <span className={styles.searchResultIcon}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className={styles.searchResultTitle}>{item.title}</div>
                            <div className={styles.searchResultCategory}>{item.category}</div>
                          </div>
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
                id="admin-top-notification-btn"
                aria-label="View notifications"
                aria-expanded={isNotificationOpen}
                title={unreadNotificationsCount > 0 ? `Notifications (${unreadNotificationsCount} unread)` : "Notifications"}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className={styles.notificationBadge} id="admin-notification-unread-count">
                    {unreadNotificationsCount}
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
                      <span className={styles.dropdownTitle}>Admin Alerts</span>
                      {unreadNotificationsCount > 0 && (
                        <span className={styles.dropdownBadge}>{unreadNotificationsCount} New</span>
                      )}
                    </div>
                    <div className={styles.notificationList}>
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={styles.notificationItem}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                            );
                          }}
                        >
                          <div className={styles.notificationItemTitle}>{notif.title}</div>
                          <div className={styles.notificationItemBody}>{notif.body}</div>
                          <div className={styles.notificationItemTime}>{notif.timestamp}</div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.dropdownFooter}>
                      <Link
                        href="/mess-admin/notifications"
                        onClick={() => setIsNotificationOpen(false)}
                        className={styles.dropdownFooterBtn}
                      >
                        View All Announcements &rarr;
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 3. User Profile Dropdown */}
            <div className={styles.navActionGroup}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationOpen(false);
                  setIsSearchOpen(false);
                }}
                className={styles.profileBtn}
                id="admin-top-profile-btn"
                aria-label="User account menu"
                aria-expanded={isProfileOpen}
              >
                <div className={styles.profileAvatar}>NV</div>
                <div className={styles.profileMeta}>
                  <span className={styles.profileName}>Dr. Neeraj Verma</span>
                  <span className={styles.profileRole}>Mess Administrator</span>
                </div>
                <span className={styles.profileChevron}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
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
                      <span className={styles.dropdownUserName}>Dr. Neeraj Verma</span>
                      <span className={styles.dropdownUserReg}>ID: MA-201 • Mess Administrator</span>
                    </div>

                    <div className={styles.profileDropdownLinks}>
                      <Link
                        href="/mess-admin/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className={styles.profileDropdownLink}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span>Admin Profile</span>
                      </Link>

                      <Link
                        href="/mess-admin/units"
                        onClick={() => setIsProfileOpen(false)}
                        className={styles.profileDropdownLink}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 21h18" />
                          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                        </svg>
                        <span>Mess Units</span>
                      </Link>

                      <Link
                        href="/mess-admin/calendar"
                        onClick={() => setIsProfileOpen(false)}
                        className={styles.profileDropdownLink}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="4" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Academic Calendar</span>
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className={styles.dropdownLogoutBtn}
                      id="admin-dropdown-logout-btn"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
