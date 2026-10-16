"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

type UserRole =
  | "Student"
  | "Kitchen Staff"
  | "Mess Manager"
  | "Mess Administrator"
  | "Finance Officer"
  | "Administrator";

const ROLES: UserRole[] = [
  "Student",
  "Kitchen Staff",
  "Mess Manager",
  "Mess Administrator",
  "Finance Officer",
  "Administrator",
];

const ROLE_DETAILS: Record<UserRole, { placeholder: string; defaultId: string }> = {
  Student: {
    placeholder: "Enter Student Registration Number",
    defaultId: "12204918",
  },
  "Kitchen Staff": {
    placeholder: "Enter Kitchen Staff ID",
    defaultId: "KS-304",
  },
  "Mess Manager": {
    placeholder: "Enter Mess Manager ID",
    defaultId: "MM-108",
  },
  "Mess Administrator": {
    placeholder: "Enter Mess Administrator ID",
    defaultId: "MA-201",
  },
  "Finance Officer": {
    placeholder: "Enter Finance Officer ID",
    defaultId: "FO-502",
  },
  Administrator: {
    placeholder: "Enter System Administrator Username",
    defaultId: "admin",
  },
};

interface AuthenticatedSession {
  userId: string;
  name: string;
  role: UserRole;
  token: string;
}

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("Student");
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);

  // Authenticated state
  const [loggedInUser, setLoggedInUser] = useState<AuthenticatedSession | null>(null);

  const router = useRouter();
  const roleSelectId = useId();
  const userIdInputId = useId();
  const passwordInputId = useId();

  // Role selection change helper
  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setErrorMessage(null);
  };

  // Password paste handler: blocks copying/pasting as requested
  const handlePasswordPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setPasteNotice("Copy-pasting passwords is restricted for security. Please type your password.");
    setTimeout(() => setPasteNotice(null), 3500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId.trim()) {
      setErrorMessage("Please enter your User ID.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your account password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          password,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed.");
      }

      // Store JWT token for subsequent RBAC requests
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem("lpu_mess_jwt", data.token);
        } else {
          sessionStorage.setItem("lpu_mess_jwt", data.token);
        }
      }

      if (data.user.role === "Student") {
        router.push("/student/dashboard");
        return;
      }

      setLoggedInUser({
        userId: data.user.userId,
        name: data.user.name,
        role: data.user.role,
        token: data.token,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication error occurred.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("lpu_mess_jwt");
    localStorage.removeItem("lpu_mess_jwt");
    setLoggedInUser(null);
    setPassword("");
    setErrorMessage(null);
  };

  // Requirement 2: Post-login blank screen with simple text
  if (loggedInUser) {
    return (
      <main className={styles.blankLoggedScreen} aria-label="Authenticated Screen">
        <p className={styles.loggedText}>
          You are successfully logged in as {loggedInUser.role} ({loggedInUser.userId}).
        </p>
        <button
          onClick={handleLogout}
          className={styles.logoutBtn}
          id="logout-button"
        >
          Logout
        </button>
      </main>
    );
  }

  const currentRoleConfig = ROLE_DETAILS[selectedRole];

  return (
    <div className={styles.pageContainer}>
      {/* Left Half: Blank Canvas ready for sliding pictures of dishes, platters, and thalis */}
      <section
        className={styles.leftSection}
        id="dishes-showcase-slider"
        aria-label="Mess Dishes and Thalis Showcase"
      >
        <div className={styles.leftBlankCanvas}>
          <p className={styles.leftCanvasTitle}>Food &amp; Dining Showcase</p>
          <p className={styles.leftCanvasSub}>
            Sliding pictures of dishes, platters, and thalis will be displayed here.
          </p>
        </div>
      </section>

      {/* Right Half: Professional Institutional Login Form */}
      <main className={styles.rightSection} aria-label="LPU Mess Login Portal">
        <div className={styles.formCard}>
          {/* Header & Official LPU Crest */}
          <div className={styles.headerBlock}>
            <div className={styles.institutionHeader}>
              <Image
                src="/lpu-round-logo.png"
                alt="Lovely Professional University Official Logo"
                width={72}
                height={72}
                priority
                className={styles.logoImage}
              />
              <div className={styles.institutionText}>
                <span className={styles.portalBadge}>LPU Mess Management</span>
                <span className={styles.institutionName}>Lovely Professional University</span>
              </div>
            </div>

            <h1 className={styles.mainTitle}>Login</h1>
            <p className={styles.subtitle}>
              Access the Demand Forecasting &amp; Food-Waste Management System.
            </p>
          </div>

          {/* Form */}
          <form className={styles.form} onSubmit={handleLoginSubmit} noValidate>
            {/* 1. Role Selection Dropdown (placed above User ID and Password) */}
            <div className={styles.fieldGroup}>
              <label htmlFor={roleSelectId} className={styles.fieldLabel}>
                <span>
                  Select Role <span className={styles.requiredStar}>*</span>
                </span>
              </label>

              <div className={styles.selectWrapper}>
                <select
                  id={roleSelectId}
                  className={styles.selectField}
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  required
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <span className={styles.selectChevron}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </div>

            {/* 2. User ID Field (Bracketed helper removed as requested) */}
            <div className={styles.fieldGroup}>
              <label htmlFor={userIdInputId} className={styles.fieldLabel}>
                <span>
                  User ID <span className={styles.requiredStar}>*</span>
                </span>
              </label>

              <input
                id={userIdInputId}
                type="text"
                className={styles.inputField}
                placeholder={currentRoleConfig.placeholder}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {/* 3. Password Field */}
            <div className={styles.fieldGroup}>
              <label htmlFor={passwordInputId} className={styles.fieldLabel}>
                <span>
                  Password <span className={styles.requiredStar}>*</span>
                </span>
              </label>

              <div className={styles.passwordWrapper}>
                <input
                  id={passwordInputId}
                  type={showPassword ? "text" : "password"}
                  className={`${styles.inputField} ${styles.passwordInput}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onPaste={handlePasswordPaste}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" y1="2" x2="22" y2="22" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Paste Security Warning */}
            {pasteNotice && (
              <div className={`${styles.feedbackMessage} ${styles.feedbackWarning}`} role="alert">
                {pasteNotice}
              </div>
            )}

            {/* Auxiliary Row: Remember Me & Forgot Password */}
            <div className={styles.auxRow}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <a
                href="https://ums.lpu.in/lpuums/forgetpassword.aspx"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.forgotLink}
              >
                Forgot password?
              </a>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className={`${styles.feedbackMessage} ${styles.feedbackError}`} role="alert">
                {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitButton}
              id="login-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging In..." : `Login as ${selectedRole}`}
            </button>
          </form>

          {/* Institutional Footer */}
          <footer className={styles.footerArea}>
            <p>Lovely Professional University &bull; Jalandhar - Delhi G.T. Road, Phagwara, Punjab</p>
            <p className={styles.footerContact}>
              Technical Support: <a href="mailto:mess.support@lpu.co.in">mess.support@lpu.co.in</a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
