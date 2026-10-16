"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import styles from "./student.module.css";

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

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("lpu_mess_jwt");
      localStorage.removeItem("lpu_mess_jwt");
    }
    router.push("/");
  };

  return (
    <div className={styles.studentContainer}>
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
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileDrawerOpen(false)}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                title={item.label}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {(!isCollapsed || isMobileDrawerOpen) && (
                  <span className={styles.navLabel}>{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard} title="Tharun Neela (Reg: 12204918)">
            <div className={styles.userAvatar}>TN</div>
            {(!isCollapsed || isMobileDrawerOpen) && (
              <div className={styles.userInfo}>
                <span className={styles.userName}>Tharun Neela</span>
                <span className={styles.userRole}>Reg: 12204918</span>
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

      {/* Main Content Area: Pure White Blank Pages */}
      <main className={styles.contentArea}>
        {children}
      </main>
    </div>
  );
}
