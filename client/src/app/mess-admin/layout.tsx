"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./messAdmin.module.css";
import PerformanceProfiler from "../../components/PerformanceProfiler";

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  badge?: number | string;
  isDanger?: boolean;
  action?: "logout";
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "main-menu",
    title: "MAIN MENU",
    items: [
      {
        label: "Dashboard",
        href: "/mess-admin/dashboard",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
          </svg>
        ),
      },
      {
        label: "Menu Management",
        href: "/mess-admin/menus",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 2v20M18 2a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3M6 2v7a3 3 0 0 0 6 0V2M9 9v13" />
          </svg>
        ),
      },
      {
        label: "Dining Halls",
        href: "/mess-admin/dining-halls",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 3l9 7H3l9-7z" />
          </svg>
        ),
      },
      {
        label: "Meal Schedules",
        href: "/mess-admin/meal-schedules",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        ),
      },
      {
        label: "Recipe Management",
        href: "/mess-admin/recipes",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        ),
      },
      {
        label: "Inventory & Stock",
        href: "/mess-admin/inventory",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        ),
      },
      {
        label: "Procurement & Suppliers",
        href: "/mess-admin/procurement",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13" rx="1" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "user-management",
    title: "USER MANAGEMENT",
    items: [
      {
        label: "Student Management",
        href: "/mess-admin/students",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        ),
      },
      {
        label: "Staff & Roles",
        href: "/mess-admin/staff",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "operations",
    title: "OPERATIONS",
    items: [
      {
        label: "Calendar & Events",
        href: "/mess-admin/calendar",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        ),
      },
      {
        label: "Waste Management",
        href: "/mess-admin/waste-management",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
            <path d="M11 19h8.2a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0 0-1.8L16.8 9.5" />
            <path d="m14 4-3.87 6.5" />
            <circle cx="12" cy="12" r="1" />
          </svg>
        ),
      },
      {
        label: "Budget & Expenses",
        href: "/mess-admin/budget",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
            <path d="M8 7h8M8 11h8M8 15h5" />
          </svg>
        ),
      },
      {
        label: "Food Safety",
        href: "/mess-admin/food-safety",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "communication-reports",
    title: "COMMUNICATION & REPORTS",
    items: [
      {
        label: "Notifications",
        href: "/mess-admin/notifications",
        badge: 3,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        ),
      },
      {
        label: "Feedback & Complaints",
        href: "/mess-admin/feedback",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        label: "Reports & Audit Logs",
        href: "/mess-admin/reports",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
            <rect x="2" y="2" width="20" height="20" rx="2" fill="none" />
          </svg>
        ),
      },
    ],
  },
  {
    id: "preferences",
    title: "PREFERENCES",
    items: [
      {
        label: "Settings",
        href: "/mess-admin/settings",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
      {
        label: "Logout",
        action: "logout",
        isDanger: true,
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        ),
      },
    ],
  },
];

interface SearchItem {
  title: string;
  category: string;
  href: string;
}

const SEARCH_OPTIONS: SearchItem[] = [
  { title: "Dashboard", category: "MAIN MENU", href: "/mess-admin/dashboard" },
  { title: "Menu Management", category: "MAIN MENU", href: "/mess-admin/menus" },
  { title: "Dining Halls", category: "MAIN MENU", href: "/mess-admin/dining-halls" },
  { title: "Meal Schedules", category: "MAIN MENU", href: "/mess-admin/meal-schedules" },
  { title: "Recipe Management", category: "MAIN MENU", href: "/mess-admin/recipes" },
  { title: "Inventory & Stock", category: "MAIN MENU", href: "/mess-admin/inventory" },
  { title: "Procurement & Suppliers", category: "MAIN MENU", href: "/mess-admin/procurement" },
  { title: "Student Management", category: "USER MANAGEMENT", href: "/mess-admin/students" },
  { title: "Staff & Roles", category: "USER MANAGEMENT", href: "/mess-admin/staff" },
  { title: "Calendar & Events", category: "OPERATIONS", href: "/mess-admin/calendar" },
  { title: "Waste Management", category: "OPERATIONS", href: "/mess-admin/waste-management" },
  { title: "Budget & Expenses", category: "OPERATIONS", href: "/mess-admin/budget" },
  { title: "Food Safety", category: "OPERATIONS", href: "/mess-admin/food-safety" },
  { title: "Notifications", category: "COMMUNICATION & REPORTS", href: "/mess-admin/notifications" },
  { title: "Feedback & Complaints", category: "COMMUNICATION & REPORTS", href: "/mess-admin/feedback" },
  { title: "Reports & Audit Logs", category: "COMMUNICATION & REPORTS", href: "/mess-admin/reports" },
  { title: "Settings", category: "PREFERENCES", href: "/mess-admin/settings" },
];

const ADMIN_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Menu Update Approved",
    body: "Weekly dinner rotation schedule has been verified for all dining halls.",
    timestamp: "10m ago",
  },
  {
    id: "notif-2",
    title: "Supply Restock Notice",
    body: "Fresh produce delivery scheduled for Central Mess tomorrow at 06:00 AM.",
    timestamp: "1h ago",
  },
  {
    id: "notif-3",
    title: "Food Waste Report Generated",
    body: "Daily audit summary is available for review in Waste Management.",
    timestamp: "3h ago",
  },
];

const PAGE_TITLES: Record<string, string> = {
  "/mess-admin": "Dashboard",
  "/mess-admin/dashboard": "Dashboard",
  "/mess-admin/menus": "Menu Management",
  "/mess-admin/dining-halls": "Dining Halls",
  "/mess-admin/units": "Dining Halls",
  "/mess-admin/meal-schedules": "Meal Schedules",
  "/mess-admin/recipes": "Recipe Management",
  "/mess-admin/inventory": "Inventory & Stock",
  "/mess-admin/procurement": "Procurement & Suppliers",
  "/mess-admin/students": "Student Management",
  "/mess-admin/staff": "Staff & Roles",
  "/mess-admin/calendar": "Calendar & Events",
  "/mess-admin/waste-management": "Waste Management",
  "/mess-admin/analytics": "Waste Management",
  "/mess-admin/budget": "Budget & Expenses",
  "/mess-admin/food-safety": "Food Safety",
  "/mess-admin/notifications": "Notifications",
  "/mess-admin/feedback": "Feedback & Complaints",
  "/mess-admin/reports": "Reports & Audit Logs",
  "/mess-admin/settings": "Settings",
};

export default function MessAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  // Notifications unread indicator state
  const [hasUnread, setHasUnread] = useState<boolean>(true);

  useEffect(() => {
    if (pathname === "/mess-admin/notifications") {
      setHasUnread(false);
    }
  }, [pathname]);

  const pageHeading = PAGE_TITLES[pathname] || "Dashboard";

  // Filtered search items
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return SEARCH_OPTIONS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const onSelectSearchItem = useCallback((targetItem: SearchItem) => {
    setSearchQuery("");
    setIsSearchOpen(false);
    setHighlightedIndex(-1);
    router.push(targetItem.href);
  }, [router]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
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
  }, [isSearchOpen, filteredSearchItems, highlightedIndex, onSelectSearchItem]);

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
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("lpu_mess_jwt");
    localStorage.removeItem("lpu_mess_jwt");
    localStorage.removeItem("lpu_mess_remember");
    document.cookie = "lpu_mess_jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/");
  }, [router]);

  return (
    <PerformanceProfiler id="MessAdminLayout">
      <div className={styles.portalContainer}>
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawerOpen && (
        <div
          className={styles.mobileBackdrop}
          onClick={() => setIsMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar - Executive Dark Side Panel */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ""} ${isMobileDrawerOpen ? styles.mobileDrawerOpen : ""}`}
        aria-label="Mess Administrator Navigation"
      >
        {/* Profile Header (Dr. Neeraj Kumar, Mess Administrator) */}
        <div className={styles.profileHeader}>
          <div className={styles.profileInfoGroup}>
            <div className={styles.profileAvatarCircle} title="Dr. Neeraj Kumar">
              NV
            </div>
            {(!isCollapsed || isMobileDrawerOpen) && (
              <div className={styles.profileMetaText}>
                <span className={styles.profileAdminName}>Dr. Neeraj Kumar</span>
                <span className={styles.profileAdminRole}>Mess Administrator</span>
              </div>
            )}
          </div>

          {/* Desktop/Tablet Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`${styles.toggleBtn} ${styles.desktopOnlyToggle}`}
            id="collapse-admin-sidebar"
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {isCollapsed ? (
                <polyline points="9 18 15 12 9 6" />
              ) : (
                <polyline points="15 18 9 12 15 6" />
              )}
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
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Categorized Navigation List */}
        <nav className={styles.navSection}>
          {NAV_GROUPS.map((group, groupIdx) => (
            <div key={group.id} className={styles.navGroupContainer}>
              {groupIdx > 0 && <div className={styles.groupDivider} />}

              {(!isCollapsed || isMobileDrawerOpen) && (
                <div className={styles.sectionTitle}>{group.title}</div>
              )}

              {group.items.map((item) => {
                const isActive = item.href ? pathname === item.href : false;

                if (item.action === "logout") {
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        handleLogout();
                      }}
                      className={`${styles.panelItem} ${styles.panelItemDanger}`}
                      title={item.label}
                    >
                      <span className={styles.panelIcon}>{item.icon}</span>
                      {(!isCollapsed || isMobileDrawerOpen) && (
                        <span className={styles.panelLabel}>{item.label}</span>
                      )}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href || "#"}
                    prefetch={true}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`${styles.panelItem} ${isActive ? styles.panelItemActive : ""}`}
                    title={item.label}
                  >
                    <span className={styles.panelIcon}>{item.icon}</span>
                    {(!isCollapsed || isMobileDrawerOpen) && (
                      <span className={styles.panelLabel}>{item.label}</span>
                    )}
                    {item.badge !== undefined && (
                      <span className={styles.navBlueBadge}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={styles.contentArea}>
        {/* Top Navigation Bar */}
        <header className={styles.topNavbar}>
          {/* Left: Active Page Heading */}
          <div className={styles.topNavLeft}>
            <h1 className={styles.topNavPageTitle}>{pageHeading}</h1>
          </div>

          {/* Right: Search, Sun Theme Toggle, Notification Bell, Divider, University Info & Logo */}
          <div className={styles.topNavRight}>
            {/* Search Input Bar */}
            <div className={styles.searchBarWrapper}>
              <span className={styles.searchIcon} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
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
                aria-label="Search"
                id="admin-top-search-input"
              />
              <span className={styles.searchShortcutPill}>Ctrl K</span>

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

            {/* Sun / Theme Toggle Button */}
            <button
              type="button"
              className={styles.topNavIconButton}
              aria-label="Toggle display theme"
              title="Light theme active"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            </button>

            {/* Notification Bell Link with Orange Unread Dot */}
            <div className={styles.navActionGroup}>
              <Link
                href="/mess-admin/notifications"
                className={styles.topNavIconButton}
                aria-label="Notifications"
                title="Notifications"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {hasUnread && <span className={styles.notificationDot} />}
              </Link>
            </div>

            {/* Vertical Divider */}
            <div className={styles.topNavDivider} aria-hidden="true" />

            {/* University & Portal Name with Round LPU Logo */}
            <div className={styles.topNavInstitution}>
              <div className={styles.institutionInfoText}>
                <span className={styles.institutionUniversityName}>Lovely Professional University</span>
                <span className={styles.institutionPortalRole}>Mess Admin</span>
              </div>
              <Image
                src="/lpu-round-logo.png"
                alt="Lovely Professional University Crest"
                width={36}
                height={36}
                priority
                className={styles.topNavRoundLogo}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
          {children}
        </div>
      </main>
    </div>
    </PerformanceProfiler>
  );
}
