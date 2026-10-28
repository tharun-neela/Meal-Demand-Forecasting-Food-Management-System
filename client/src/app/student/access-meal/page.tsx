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
const AUTHORIZED_QR_CODE = "BH1M07";

interface MealServiceStatus {
  isOpen: boolean;
  activeMeal: {
    id: "breakfast" | "lunch" | "snacks" | "dinner";
    name: string;
    timing: string;
  } | null;
  nextMeal?: {
    id: "breakfast" | "lunch" | "snacks" | "dinner";
    name: string;
    timing: string;
  } | null;
}

// Helper to determine whether mess is currently open or closed based on real time
function getCurrentMealStatus(): MealServiceStatus {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const isSunday = now.getDay() === 0;

  // Working days (Mon - Sat):
  // Breakfast: 07:30 AM (450) – 09:30 AM (570)
  // Lunch:     11:30 AM (690) – 03:00 PM (900)
  // Snacks:    05:00 PM (1020) – 06:30 PM (1110)
  // Dinner:    07:30 PM (1170) – 09:30 PM (1290)
  //
  // Sunday:
  // Breakfast: 08:00 AM (480) – 10:00 AM (600)
  // Lunch:     12:30 PM (750) – 03:00 PM (900)
  // Snacks:    05:00 PM (1020) – 06:30 PM (1110)
  // Dinner:    07:30 PM (1170) – 09:30 PM (1290)

  const bStart = isSunday ? 480 : 450;
  const bEnd = isSunday ? 600 : 570;
  const bTiming = isSunday ? "08:00 AM – 10:00 AM" : "07:30 AM – 09:30 AM";

  const lStart = isSunday ? 750 : 690;
  const lEnd = 900;
  const lTiming = isSunday ? "12:30 PM – 03:00 PM" : "11:30 AM – 03:00 PM";

  const sStart = 1020;
  const sEnd = 1110;
  const sTiming = "05:00 PM – 06:30 PM";

  const dStart = 1170;
  const dEnd = 1290;
  const dTiming = "07:30 PM – 09:30 PM";

  if (mins >= bStart && mins <= bEnd) {
    return {
      isOpen: true,
      activeMeal: { id: "breakfast", name: "Breakfast", timing: bTiming },
    };
  }
  if (mins >= lStart && mins <= lEnd) {
    return {
      isOpen: true,
      activeMeal: { id: "lunch", name: "Lunch", timing: lTiming },
    };
  }
  if (mins >= sStart && mins <= sEnd) {
    return {
      isOpen: true,
      activeMeal: { id: "snacks", name: "Evening Snacks", timing: sTiming },
    };
  }
  if (mins >= dStart && mins <= dEnd) {
    return {
      isOpen: true,
      activeMeal: { id: "dinner", name: "Dinner", timing: dTiming },
    };
  }

  // Outside all active service hours -> Mess is Closed
  let nextMeal: MealServiceStatus["nextMeal"] = null;
  if (mins < bStart) {
    nextMeal = { id: "breakfast", name: "Breakfast", timing: bTiming };
  } else if (mins < lStart) {
    nextMeal = { id: "lunch", name: "Lunch", timing: lTiming };
  } else if (mins < sStart) {
    nextMeal = { id: "snacks", name: "Evening Snacks", timing: sTiming };
  } else if (mins < dStart) {
    nextMeal = { id: "dinner", name: "Dinner", timing: dTiming };
  } else {
    nextMeal = { id: "breakfast", name: "Breakfast", timing: "07:30 AM – 09:30 AM" };
  }

  return {
    isOpen: false,
    activeMeal: null,
    nextMeal,
  };
}

// Payment-app style multi-tone chime (like Google Pay / Paytm sound)
function playPaymentAppChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    // Fast 2-step ascending chime (E5 -> B5)
    playTone(659.25, 0, 0.08);
    playTone(987.77, 0.07, 0.16);
  } catch (err) {
    console.warn("Audio playback not allowed:", err);
  }
}

// Low buzz error tone when an unauthorized QR code is scanned
function playRejectionTone() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playBuzz = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    };

    playBuzz(200, 0, 0.12);
    playBuzz(160, 0.14, 0.16);
  } catch (err) {
    console.warn("Audio playback not allowed:", err);
  }
}

export default function AccessMealPage() {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isRejected, setIsRejected] = useState<boolean>(false);
  const [rejectedCode, setRejectedCode] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<{ title: string; message: string } | null>(null);
  const [scannedResult, setScannedResult] = useState<AttendanceRecord | null>(null);
  const [popupCountdown, setPopupCountdown] = useState<number>(20);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [mealStatus, setMealStatus] = useState<MealServiceStatus>({
    isOpen: false,
    activeMeal: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Concurrency & scanning state refs
  const isScanningActiveRef = useRef<boolean>(false);
  const isLockedRef = useRef<boolean>(false);
  const isCooldownRef = useRef<boolean>(false);
  const isProcessingFrameRef = useRef<boolean>(false);

  // Initialize ongoing meal and load attendance history from localStorage
  useEffect(() => {
    const updateStatus = () => {
      setMealStatus(getCurrentMealStatus());
    };
    updateStatus();
    const interval = setInterval(updateStatus, 15000);

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentRecords(JSON.parse(stored));
      } else {
        setRecentRecords([]);
      }
    } catch {
      // Ignore localStorage errors
    }

    return () => clearInterval(interval);
  }, []);

  // Dismiss modal and reset all scanning locks cleanly
  const handleDismissPopup = useCallback(() => {
    setScannedResult(null);
    setIsLocked(false);
    isLockedRef.current = false;
    isCooldownRef.current = false;
    isProcessingFrameRef.current = false;
  }, []);

  // 20-Second Auto-Closing Timer with Live Countdown Display
  useEffect(() => {
    if (!scannedResult) {
      setPopupCountdown(20);
      return;
    }

    setPopupCountdown(20);
    const timer = setInterval(() => {
      setPopupCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleDismissPopup();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [scannedResult, handleDismissPopup]);

  // Stop camera stream cleanly
  const stopCamera = useCallback(() => {
    isScanningActiveRef.current = false;
    isProcessingFrameRef.current = false;
    isLockedRef.current = false;
    isCooldownRef.current = false;

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
    setIsLocked(false);
    setIsRejected(false);
    setRejectedCode(null);
    setIsScanning(false);
    setIsRequestingPermission(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle QR scan with strict validation for BH1M07 only
  const handleScanSuccess = useCallback(
    (codeData: string) => {
      const cleanCode = codeData.trim().toUpperCase();

      // STRICT VALIDATION: ONLY approve the meal for the authorized QR code BH1M07
      if (cleanCode !== AUTHORIZED_QR_CODE) {
        if (isCooldownRef.current) return;
        isCooldownRef.current = true;

        setIsRejected(true);
        setRejectedCode(cleanCode);
        playRejectionTone();

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate([150, 80, 150]);
          } catch {
            // ignore
          }
        }

        // Auto-dismiss rejection overlay after 1.2s and immediately resume active scanning
        setTimeout(() => {
          setIsRejected(false);
          setRejectedCode(null);
          isCooldownRef.current = false;
        }, 1200);

        return;
      }

      // Approved! Authorized BH1M07 QR code detected
      isLockedRef.current = true;
      isScanningActiveRef.current = false;
      setIsLocked(true);
      setIsRejected(false);
      setRejectedCode(null);

      // Instant payment-app chime & haptic feedback
      playPaymentAppChime();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([80]);
        } catch {
          // ignore
        }
      }

      // Stop camera after visual lock feedback
      setTimeout(() => {
        stopCamera();
      }, 250);

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const status = getCurrentMealStatus();
      const mealName = status.activeMeal?.name || status.nextMeal?.name || "Dinner";

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        mealName: mealName,
        messHall: "Boys Hostel 1 • Mess Hall 07",
        timestamp: `Today, ${timeStr}`,
        dateKey: now.toISOString().split("T")[0],
        qrPayload: AUTHORIZED_QR_CODE,
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

  // High-Speed Continuous Scanning Loop (Dual-Pass: Center Viewfinder Crop + Full Frame Fallback)
  const scanFrame = useCallback(() => {
    if (!isScanningActiveRef.current || isLockedRef.current) {
      return;
    }

    const scheduleNext = () => {
      if (isScanningActiveRef.current && !isLockedRef.current) {
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    };

    // If temporarily in cooldown (e.g. invalid QR flashed red), keep scheduling without scanning
    if (isCooldownRef.current) {
      scheduleNext();
      return;
    }

    const video = videoRef.current;
    if (!video || video.readyState < video.HAVE_CURRENT_DATA || video.videoWidth === 0) {
      scheduleNext();
      return;
    }

    // Skip frame if already processing previous frame to prevent frame pileup
    if (isProcessingFrameRef.current) {
      scheduleNext();
      return;
    }

    isProcessingFrameRef.current = true;

    try {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          const vW = video.videoWidth;
          const vH = video.videoHeight;

          // Pass 1: Center-Crop Scan
          // Users point the QR code directly into the center viewfinder box.
          // Cropping the center square preserves 100% sharp pixel resolution
          // while processing a tiny fraction of pixels for ultra-fast <5ms detection.
          const cropSize = Math.round(Math.min(vW, vH) * 0.75);
          const cropX = Math.round((vW - cropSize) / 2);
          const cropY = Math.round((vH - cropSize) / 2);

          const cropTarget = Math.min(420, cropSize);

          if (canvas.width !== cropTarget || canvas.height !== cropTarget) {
            canvas.width = cropTarget;
            canvas.height = cropTarget;
          }

          ctx.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, cropTarget, cropTarget);
          const cropImgData = ctx.getImageData(0, 0, cropTarget, cropTarget);
          let code = jsQR(cropImgData.data, cropTarget, cropTarget, {
            inversionAttempts: "attemptBoth",
          });

          // Pass 2: Full-Frame Fallback (handles QR held near outer edges)
          if (!code || !code.data) {
            const fullScale = Math.min(1, 540 / Math.max(vW, vH));
            const fullW = Math.round(vW * fullScale);
            const fullH = Math.round(vH * fullScale);

            if (canvas.width !== fullW || canvas.height !== fullH) {
              canvas.width = fullW;
              canvas.height = fullH;
            }

            ctx.drawImage(video, 0, 0, fullW, fullH);
            const fullImgData = ctx.getImageData(0, 0, fullW, fullH);
            code = jsQR(fullImgData.data, fullW, fullH, {
              inversionAttempts: "attemptBoth",
            });
          }

          if (code && code.data && code.data.trim().length > 0) {
            handleScanSuccess(code.data.trim());
            return;
          }
        }
      }
    } catch (err) {
      console.warn("Scan frame error:", err);
    } finally {
      isProcessingFrameRef.current = false;
      scheduleNext();
    }
  }, [handleScanSuccess]);

  // Start the device camera & trigger permission request
  const startCamera = async () => {
    setCameraError(null);
    setScannedResult(null);
    setIsLocked(false);
    setIsRejected(false);
    setRejectedCode(null);
    isLockedRef.current = false;
    isCooldownRef.current = false;
    isProcessingFrameRef.current = false;
    isScanningActiveRef.current = false;
    setIsRequestingPermission(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsRequestingPermission(false);
      setCameraError({
        title: "Camera Not Supported",
        message: "Your browser does not support camera access or the page is not running in a secure (HTTPS) context.",
      });
      return;
    }

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      // Request optimized camera stream with continuous focus and high frame rate
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });

      // Apply mobile continuous autofocus if supported
      try {
        const track = stream.getVideoTracks()[0];
        const caps = track.getCapabilities?.() as any;
        if (caps && caps.focusMode && caps.focusMode.includes("continuous")) {
          await track.applyConstraints({
            advanced: [{ focusMode: "continuous" } as any],
          });
        }
      } catch {
        // Ignore constraint errors
      }

      streamRef.current = stream;
      setIsScanning(true);
      setIsRequestingPermission(false);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();

        isScanningActiveRef.current = true;
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
        }
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      setIsRequestingPermission(false);
      setIsScanning(false);
      isScanningActiveRef.current = false;

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

  return (
    <div className={styles.pageContainer}>
      {/* Active Service Context Pill */}
      <div className={styles.headerContext}>
        {mealStatus.isOpen && mealStatus.activeMeal ? (
          <div className={styles.mealServicePill}>
            <span className={styles.livePulseDot} />
            <span>Active Service: {mealStatus.activeMeal.name}</span>
            <span style={{ opacity: 0.6 }}>&bull;</span>
            <span>{mealStatus.activeMeal.timing}</span>
          </div>
        ) : (
          <div className={styles.mealClosedPill}>
            <span className={styles.closedDot} />
            <span>Mess is Closed</span>
          </div>
        )}
      </div>

      {/* Main Scanner Card (Faithfully matching sample photo) */}
      <div className={styles.scannerCard}>
        {/* Instruction Title matching sample photo */}
        <h2 className={styles.instructionTitle}>
          Scan the QR code to Access your meal
        </h2>

        {/* Viewfinder Outer with 4 Corner Brackets (Green for Approved, Red for Rejected) */}
        <div
          className={`${styles.viewfinderOuter} ${
            isScanning ? styles.cornersScanning : ""
          } ${isLocked ? styles.cornersLocked : ""} ${
            isRejected ? styles.cornersRejected : ""
          }`}
        >
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
              className={styles.scannerVideo}
              style={{ display: isScanning && !isRequestingPermission ? "block" : "none" }}
              muted
              playsInline
            />

            {/* Active Scanning Visuals (Laser Beam & Target Reticle) */}
            {isScanning && !isRequestingPermission && !isRejected && (
              <>
                <div className={styles.targetReticle} />
                <div className={styles.laserBeam} />
              </>
            )}

            {/* 3. Rejection Notice when an unauthorized QR is scanned */}
            {isRejected && rejectedCode && (
              <div className={styles.invalidScanOverlay}>
                <div className={styles.invalidScanIcon}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div className={styles.invalidScanTitle}>Access Denied</div>
                <div className={styles.invalidScanText}>
                  Unauthorized QR code. Meal attendance is only approved for the official BH1M07 mess QR.
                </div>
                <span className={styles.invalidScanBadge}>Scanned: {rejectedCode}</span>
              </div>
            )}

            {/* 4. Idle QR Code Graphic matching sample photo */}
            {!isScanning && !isRequestingPermission && !scannedResult && !isRejected && (
              <div className={styles.idleQrPlaceholder}>
                <svg
                  className={styles.idleQrSvg}
                  viewBox="0 0 120 120"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="10" y="10" width="35" height="35" rx="4" fill="#94a3b8" />
                  <rect x="17" y="17" width="21" height="21" rx="2" fill="#ffffff" />
                  <rect x="23" y="23" width="9" height="9" fill="#94a3b8" />

                  <rect x="75" y="10" width="35" height="35" rx="4" fill="#94a3b8" />
                  <rect x="82" y="17" width="21" height="21" rx="2" fill="#ffffff" />
                  <rect x="88" y="23" width="9" height="9" fill="#94a3b8" />

                  <rect x="10" y="75" width="35" height="35" rx="4" fill="#94a3b8" />
                  <rect x="17" y="82" width="21" height="21" rx="2" fill="#ffffff" />
                  <rect x="23" y="88" width="9" height="9" fill="#94a3b8" />

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

        {/* Hidden Canvas used for high-speed frame sampling */}
        <canvas ref={canvasRef} className={styles.hiddenCanvas} />

        {/* Primary Action Button (Warm Even Orange Pill Button) */}
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
            <span>Scan</span>
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
            </div>
          </div>
        )}

        {/* Success Modal Overlay with 20-Second Countdown Timer */}
        {scannedResult && (
          <div className={styles.successOverlay}>
            <div className={styles.successIconWrapper}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Meal Access Approved!</h3>
            <p className={styles.successSubtitle}>Your meal access has been successfully authenticated.</p>

            {/* 20-Second Live Timer Display */}
            <div className={styles.countdownBanner}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Auto-closing in <span className={styles.countdownTimerDigits}>{popupCountdown}s</span></span>
            </div>

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
                <span className={styles.attendanceLabel}>QR Token:</span>
                <span className={styles.attendanceValue} style={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  {scannedResult.qrPayload}
                </span>
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
              <Link href="/student/feedback" className={styles.feedbackSuccessBtn} id="popup-give-feedback-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>Give Feedback</span>
              </Link>
              <Link href="/student/history" className={styles.historySuccessBtn} id="popup-view-history-btn">
                View Meal History &rarr;
              </Link>
              <button
                type="button"
                className={styles.closePopupTextBtn}
                onClick={handleDismissPopup}
                id="popup-dismiss-btn"
              >
                Dismiss now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Feedback Card Redirecting to Feedbacks Page */}
      <div className={styles.feedbackBannerCard}>
        <div className={styles.feedbackBannerLeft}>
          <div className={styles.feedbackBannerIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <div className={styles.feedbackBannerTitle}>Have feedback on your meal?</div>
            <div className={styles.feedbackBannerSubtitle}>Rate taste, hygiene, or submit feedback to the mess team</div>
          </div>
        </div>
        <Link href="/student/feedback" className={styles.feedbackBannerBtn} id="give-feedback-btn">
          <span>Give Feedback</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
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
