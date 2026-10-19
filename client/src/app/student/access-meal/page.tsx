"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import jsQR from "jsqr";
import styles from "./accessMeal.module.css";

interface AttendanceRecord {
  id: string;
  mealName: string;
  messHall: string;
  timestamp: string;
  dateKey: string;
  qrPayload: string;
  verified: boolean;
}

const STORAGE_KEY = "student_meal_attendance_records";

// Helper to determine ongoing meal based on current local time
function getCurrentMealInfo(): { name: string; timing: string; id: "breakfast" | "lunch" | "snacks" | "dinner" } {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();

  // Breakfast: 07:30 (450) - 09:30 (570)
  if (mins >= 420 && mins < 630) {
    return { name: "Breakfast", timing: "07:30 AM – 09:30 AM", id: "breakfast" };
  }
  // Lunch: 11:30 (690) - 15:00 (900)
  if (mins >= 660 && mins < 930) {
    return { name: "Lunch", timing: "11:30 AM – 03:00 PM", id: "lunch" };
  }
  // Snacks: 17:00 (1020) - 18:30 (1110)
  if (mins >= 990 && mins < 1140) {
    return { name: "Evening Snacks", timing: "05:00 PM – 06:30 PM", id: "snacks" };
  }
  // Dinner: 19:30 (1170) - 21:30 (1290)
  if (mins >= 1140 && mins < 1350) {
    return { name: "Dinner", timing: "07:30 PM – 09:30 PM", id: "dinner" };
  }

  // Off-hours fallback: next upcoming service or Dinner
  if (mins < 420) {
    return { name: "Breakfast", timing: "07:30 AM – 09:30 AM (Upcoming)", id: "breakfast" };
  }
  return { name: "Dinner", timing: "07:30 PM – 09:30 PM", id: "dinner" };
}

// Crisp scanner success beep using Web Audio API
function playScanSuccessBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6 note

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (err) {
    console.warn("Audio playback not allowed:", err);
  }
}

const DEFAULT_MEAL_INFO = {
  name: "Dinner",
  timing: "07:30 PM – 09:30 PM",
  id: "dinner",
};

export default function AccessMealPage() {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<{ title: string; message: string } | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scannedResult, setScannedResult] = useState<AttendanceRecord | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [currentMeal, setCurrentMeal] = useState<{ name: string; timing: string; id: string }>(DEFAULT_MEAL_INFO);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing records from localStorage
  useEffect(() => {
    setCurrentMeal(getCurrentMealInfo());
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentRecords(JSON.parse(stored));
      } else {
        // Default sample records
        const initialSamples: AttendanceRecord[] = [
          {
            id: "att-101",
            mealName: "Dinner",
            messHall: "Central Mess Hall 2",
            timestamp: "Today, 08:15 PM",
            dateKey: new Date().toISOString().split("T")[0],
            qrPayload: "LPU-MESS|12204918|DINNER|HALL-2",
            verified: true,
          },
        ];
        setRecentRecords(initialSamples);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSamples));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    setIsRequestingPermission(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle successful QR scan
  const handleScanSuccess = useCallback(
    (codeData: string) => {
      stopCamera();
      playScanSuccessBeep();

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch {
          // ignore
        }
      }

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const meal = getCurrentMealInfo();

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        mealName: meal.name,
        messHall: "Central Mess Hall 2",
        timestamp: `Today, ${timeStr}`,
        dateKey: now.toISOString().split("T")[0],
        qrPayload: codeData,
        verified: true,
      };

      setScannedResult(newRecord);

      setRecentRecords((prev) => {
        const updated = [newRecord, ...prev.filter((r) => r.id !== newRecord.id)].slice(0, 5);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
    },
    [stopCamera]
  );

  // Scan frame loop using jsQR
  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      const width = video.videoWidth || 320;
      const height = video.videoHeight || 320;

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(video, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);

      // Decode with jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data && code.data.trim().length > 0) {
        handleScanSuccess(code.data);
        return; // stop scanning loop
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleScanSuccess]);

  // Start the device camera & trigger permission request
  const startCamera = async (overrideFacingMode?: "environment" | "user") => {
    setCameraError(null);
    setScannedResult(null);
    setIsRequestingPermission(true);

    const mode = overrideFacingMode || facingMode;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsRequestingPermission(false);
      setCameraError({
        title: "Camera Not Supported",
        message: "Your browser does not support camera access or the page is not running in a secure (HTTPS) context.",
      });
      return;
    }

    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Request camera access - prompts the browser permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setIsScanning(true);
      setIsRequestingPermission(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      setIsRequestingPermission(false);
      setIsScanning(false);

      const errorObj = err as { name?: string; message?: string };
      console.warn("Camera permission/access error:", err);

      if (errorObj?.name === "NotAllowedError" || errorObj?.name === "PermissionDeniedError") {
        setCameraError({
          title: "Camera Permission Denied",
          message:
            "Camera access was blocked. Please tap the camera icon in your browser address bar to allow permissions, then try again.",
        });
      } else if (errorObj?.name === "NotFoundError" || errorObj?.name === "DevicesNotFoundError") {
        setCameraError({
          title: "No Camera Detected",
          message: "No connected camera device was found on this system.",
        });
      } else if (errorObj?.name === "NotReadableError" || errorObj?.name === "TrackStartError") {
        setCameraError({
          title: "Camera Already in Use",
          message: "The camera is currently being used by another application or tab.",
        });
      } else {
        setCameraError({
          title: "Unable to Access Camera",
          message: errorObj?.message || "An unexpected error occurred while requesting camera permissions.",
        });
      }
    }
  };

  // Switch between front and rear cameras
  const toggleCameraFacingMode = () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    if (isScanning) {
      startCamera(nextMode);
    }
  };

  // Allow uploading an image file containing a QR code
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (event) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);
          if (code && code.data) {
            handleScanSuccess(code.data);
          } else {
            alert("No valid QR code was detected in the uploaded image. Please try another image.");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Simulate Attendance Scan for testing/demo
  const handleSimulateScan = () => {
    const meal = getCurrentMealInfo();
    const mockQR = `LPU-MESS-ACCESS|REG:12204918|STUDENT:THARUN-NEELA|MEAL:${meal.name.toUpperCase()}|HALL:CENTRAL-MESS-2|HASH:${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    handleScanSuccess(mockQR);
  };

  return (
    <div className={styles.pageContainer}>
      {/* Active Service Context Pill */}
      <div className={styles.headerContext}>
        <div className={styles.mealServicePill}>
          <span className={styles.livePulseDot} />
          <span>Active Service: {currentMeal.name}</span>
          <span style={{ opacity: 0.6 }}>&bull;</span>
          <span>{currentMeal.timing}</span>
        </div>
      </div>

      {/* Main Scanner Card (Designed from user's sample photo) */}
      <div className={styles.scannerCard}>
        {/* Instruction Title matching sample photo */}
        <h2 className={styles.instructionTitle}>
          Place QR code in the area to scan your attendance
        </h2>

        {/* Viewfinder Outer with 4 Corner Brackets */}
        <div className={`${styles.viewfinderOuter} ${isScanning ? styles.cornersScanning : ""}`}>
          <div className={styles.cornerTL} />
          <div className={styles.cornerTR} />
          <div className={styles.cornerBL} />
          <div className={styles.cornerBR} />

          {/* Viewfinder Inner Display */}
          <div className={styles.viewfinderInner}>
            {/* 1. Requesting Permission Loading State */}
            {isRequestingPermission && (
              <div className={styles.loadingView}>
                <div className={styles.spinner} />
                <p style={{ margin: 0, fontWeight: 600 }}>Requesting camera permission...</p>
                <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  Please click &ldquo;Allow&rdquo; in the browser prompt
                </span>
              </div>
            )}

            {/* 2. Live Camera Video Stream */}
            <video
              ref={videoRef}
              className={`${styles.scannerVideo} ${facingMode === "user" ? styles.videoMirrored : ""}`}
              style={{ display: isScanning && !isRequestingPermission ? "block" : "none" }}
              muted
              playsInline
            />

            {/* Laser Beam Animation when camera is scanning */}
            {isScanning && !isRequestingPermission && (
              <>
                <div className={styles.laserBeam} />
                <div className={styles.cameraControlsOverlay}>
                  <button
                    type="button"
                    onClick={toggleCameraFacingMode}
                    className={styles.cameraControlBtn}
                    title="Switch camera"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 10c0-4.4-3.6-8-8-8s-8 3.6-8 8h3l-4 4-4-4h3c0-5.5 4.5-10 10-10s10 4.5 10 10h-2z" />
                    </svg>
                    Switch
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className={styles.cameraControlBtn}
                    title="Close camera"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {/* 3. Idle QR Code Graphic matching sample photo */}
            {!isScanning && !isRequestingPermission && !scannedResult && (
              <div className={styles.idleQrPlaceholder}>
                <svg
                  className={styles.idleQrSvg}
                  viewBox="0 0 120 120"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Top-Left Position Square */}
                  <rect x="10" y="10" width="35" height="35" rx="4" fill="#94a3b8" />
                  <rect x="17" y="17" width="21" height="21" rx="2" fill="#ffffff" />
                  <rect x="23" y="23" width="9" height="9" fill="#94a3b8" />

                  {/* Top-Right Position Square */}
                  <rect x="75" y="10" width="35" height="35" rx="4" fill="#94a3b8" />
                  <rect x="82" y="17" width="21" height="21" rx="2" fill="#ffffff" />
                  <rect x="88" y="23" width="9" height="9" fill="#94a3b8" />

                  {/* Bottom-Left Position Square */}
                  <rect x="10" y="75" width="35" height="35" rx="4" fill="#94a3b8" />
                  <rect x="17" y="82" width="21" height="21" rx="2" fill="#ffffff" />
                  <rect x="23" y="88" width="9" height="9" fill="#94a3b8" />

                  {/* Stylized Center Data Dots */}
                  <rect x="52" y="15" width="8" height="8" rx="1.5" fill="#cbd5e1" />
                  <rect x="62" y="28" width="8" height="8" rx="1.5" fill="#cbd5e1" />
                  <rect x="52" y="42" width="16" height="8" rx="1.5" fill="#cbd5e1" />
                  <rect x="25" y="55" width="10" height="8" rx="1.5" fill="#cbd5e1" />
                  <rect x="42" y="55" width="8" height="15" rx="1.5" fill="#cbd5e1" />
                  <rect x="55" y="55" width="18" height="8" rx="1.5" fill="#94a3b8" />
                  <rect x="80" y="55" width="15" height="8" rx="1.5" fill="#cbd5e1" />
                  <rect x="55" y="70" width="10" height="18" rx="1.5" fill="#cbd5e1" />
                  <rect x="72" y="70" width="8" height="8" rx="1.5" fill="#94a3b8" />
                  <rect x="88" y="70" width="16" height="8" rx="1.5" fill="#cbd5e1" />
                  <rect x="72" y="86" width="18" height="18" rx="2" fill="#cbd5e1" />
                  <rect x="96" y="86" width="10" height="10" rx="1.5" fill="#94a3b8" />
                  <rect x="55" y="96" width="10" height="10" rx="1.5" fill="#94a3b8" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Canvas used by jsQR to sample frames */}
        <canvas ref={canvasRef} className={styles.hiddenCanvas} />

        {/* Primary Action Button (Matches sample photo orange pill button) */}
        {!isScanning ? (
          <button
            type="button"
            className={styles.scanButton}
            onClick={() => startCamera()}
            id="start-attendance-scan-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Scan to record attendance</span>
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.scanButton} ${styles.scanButtonStop}`}
            onClick={stopCamera}
            id="stop-attendance-scan-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            <span>Stop Camera</span>
          </button>
        )}

        {/* Secondary Actions (Upload Image / Test Demo Scan) */}
        <div className={styles.secondaryRow}>
          <button
            type="button"
            className={styles.secondaryLinkBtn}
            onClick={() => fileInputRef.current?.click()}
            title="Upload QR Code Image"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInputHidden}
            onChange={handleFileUpload}
          />

          <span style={{ color: "#cbd5e1" }}>&bull;</span>

          <button
            type="button"
            className={styles.secondaryLinkBtn}
            onClick={handleSimulateScan}
            title="Simulate attendance scan for demo"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Test Scan (Demo)</span>
          </button>
        </div>

        {/* Permission Denied or Device Error Notice */}
        {cameraError && (
          <div className={styles.errorAlertBox}>
            <div className={styles.errorAlertTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{cameraError.title}</span>
            </div>
            <p className={styles.errorAlertDesc}>{cameraError.message}</p>
            <div className={styles.errorAlertActions}>
              <button
                type="button"
                className={styles.errorActionBtn}
                onClick={() => startCamera()}
              >
                Try Again
              </button>
              <button
                type="button"
                className={styles.errorActionBtnSecondary}
                onClick={handleSimulateScan}
              >
                Use Demo Scan
              </button>
            </div>
          </div>
        )}

        {/* Success Modal Overlay when QR is scanned */}
        {scannedResult && (
          <div className={styles.successOverlay}>
            <div className={styles.successIconWrapper}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Attendance Recorded!</h3>
            <p className={styles.successSubtitle}>Your meal access has been successfully authenticated.</p>

            <div className={styles.attendanceDetailsGrid}>
              <div className={styles.attendanceRow}>
                <span className={styles.attendanceLabel}>Meal Service:</span>
                <span className={styles.attendanceValue}>{scannedResult.mealName}</span>
              </div>
              <div className={styles.attendanceRow}>
                <span className={styles.attendanceLabel}>Mess Location:</span>
                <span className={styles.attendanceValue}>{scannedResult.messHall}</span>
              </div>
              <div className={styles.attendanceRow}>
                <span className={styles.attendanceLabel}>Date & Time:</span>
                <span className={styles.attendanceValue}>{scannedResult.timestamp}</span>
              </div>
              <div className={styles.attendanceRow}>
                <span className={styles.attendanceLabel}>Student:</span>
                <span className={styles.attendanceValue}>Tharun Neela</span>
              </div>
              <div className={styles.attendanceRow}>
                <span className={styles.attendanceLabel}>Registration No:</span>
                <span className={styles.attendanceValue}>12204918</span>
              </div>
              <div className={styles.attendanceRow}>
                <span className={styles.attendanceLabel}>Status:</span>
                <span style={{ color: "#059669", fontWeight: 700 }}>VERIFIED</span>
              </div>
            </div>

            <div className={styles.successActionsRow}>
              <button
                type="button"
                className={styles.secondarySuccessBtn}
                onClick={() => {
                  setScannedResult(null);
                  startCamera();
                }}
              >
                Scan Another
              </button>
              <Link href="/student/history" className={styles.primarySuccessBtn}>
                View Meal History &rarr;
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Recent Scanned Attendance Feed */}
      {recentRecords.length > 0 && (
        <section className={styles.recentHistorySection}>
          <div className={styles.recentHistoryHeader}>
            <span className={styles.recentHistoryTitle}>Recent Attendance Scans</span>
            <Link
              href="/student/history"
              style={{ fontSize: "0.82rem", color: "#f36f21", fontWeight: 600, textDecoration: "none" }}
            >
              View Full History
            </Link>
          </div>

          {recentRecords.map((item) => (
            <div key={item.id} className={styles.recentCard}>
              <div className={styles.recentLeft}>
                <div className={styles.recentMealIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <div className={styles.recentMealName}>{item.mealName}</div>
                  <div className={styles.recentMealMeta}>
                    {item.messHall} &bull; {item.timestamp}
                  </div>
                </div>
              </div>
              <span className={styles.recentStatusVerified}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Recorded
              </span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
