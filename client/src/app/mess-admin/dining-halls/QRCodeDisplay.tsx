"use client";

import React, { useMemo } from "react";
import { DiningHall } from "./diningHallsData";

interface QRCodeDisplayProps {
  hall: DiningHall;
  size?: number;
  className?: string;
}

// Generate realistic deterministic 25x25 QR code matrix from text
export function generateQRMatrix(text: string): boolean[][] {
  const size = 25;
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // 1. Finder patterns (7x7) with 3x3 solid center
  const addFinder = (startRow: number, startCol: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isBorder || isCore) {
          matrix[startRow + r][startCol + c] = true;
        }
      }
    }
  };

  addFinder(0, 0);       // Top-left
  addFinder(0, 18);      // Top-right
  addFinder(18, 0);      // Bottom-left

  // 2. Timing patterns on row 6 and col 6
  for (let i = 8; i < 17; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Alignment pattern at (18, 18) (5x5)
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isAlignBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isAlignCore = r === 0 && c === 0;
      if (isAlignBorder || isAlignCore) {
        matrix[18 + r][18 + c] = true;
      }
    }
  }

  // Hash string
  let hash = 5381;
  const str = text || "Mess QR";
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0;
  }

  // 4. Fill data modules deterministically
  let bitCounter = 0;
  for (let c = size - 1; c >= 0; c--) {
    for (let r = 0; r < size; r++) {
      // Reserved zones
      const inFinderTL = r <= 7 && c <= 7;
      const inFinderTR = r <= 7 && c >= 17;
      const inFinderBL = r >= 17 && c <= 7;
      const inTiming = r === 6 || c === 6;
      const inAlign = r >= 16 && r <= 20 && c >= 16 && c <= 20;

      if (!inFinderTL && !inFinderTR && !inFinderBL && !inTiming && !inAlign) {
        const bit = ((hash ^ (r * 33 + c * 19) ^ (bitCounter * 7)) & 1) === 1;
        matrix[r][c] = bit;
        bitCounter++;
      }
    }
  }

  return matrix;
}

// Global cache for generated QR matrices to avoid re-calculating on render
const matrixCache = new Map<string, boolean[][]>();

export function getCachedQRMatrix(key: string): boolean[][] {
  const cached = matrixCache.get(key);
  if (cached) return cached;
  const matrix = generateQRMatrix(key);
  matrixCache.set(key, matrix);
  return matrix;
}

function QRCodeDisplayComponent({ hall, size = 68, className }: QRCodeDisplayProps) {
  const matrix = useMemo(
    () => getCachedQRMatrix(hall.id + "-" + hall.name),
    [hall.id, hall.name]
  );

  // If a custom image was uploaded by admin
  if (hall.qrCode) {
    return (
      <img
        src={hall.qrCode}
        alt={`${hall.name} QR Code`}
        width={size}
        height={size}
        className={className}
        style={{
          width: size,
          height: size,
          objectFit: "contain",
          borderRadius: 6,
          display: "block",
        }}
      />
    );
  }

  // Built-in Dummy SVG QR Code with quiet-zone margin (viewBox 0 0 29 29)
  return (
    <svg
      viewBox="0 0 29 29"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`${hall.name} QR Code`}
      style={{
        width: size,
        height: size,
        display: "block",
        borderRadius: 4,
      }}
    >
      <rect width="29" height="29" fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c + 2}
              y={r + 2}
              width="1"
              height="1"
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  );
}

const QRCodeDisplay = React.memo(QRCodeDisplayComponent);
export default QRCodeDisplay;

// Helper to download the QR code as PNG image
export function downloadQRCodeImage(hall: DiningHall) {
  if (typeof window === "undefined") return;

  const canvas = document.createElement("canvas");
  const canvasSize = 400;
  canvas.width = canvasSize;
  canvas.height = canvasSize + 80; // Extra room for hall name banner
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // If custom uploaded image
  if (hall.qrCode) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 40, 30, canvasSize - 80, canvasSize - 80);

      // Label below
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(hall.name, canvasSize / 2, canvasSize - 10);

      ctx.fillStyle = "#64748b";
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.fillText("Student Meal Attendance QR Code", canvasSize / 2, canvasSize + 22);

      const link = document.createElement("a");
      link.download = `${hall.name.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = hall.qrCode;
    return;
  }

  // Draw SVG Matrix onto Canvas
  const matrix = generateQRMatrix(hall.id + "-" + hall.name);
  const padding = 40;
  const qrSize = canvasSize - padding * 2;
  const cellSize = qrSize / 29; // 29 modules with quiet zone

  ctx.fillStyle = "#0f172a";
  for (let r = 0; r < 25; r++) {
    for (let c = 0; c < 25; c++) {
      if (matrix[r][c]) {
        ctx.fillRect(
          padding + (c + 2) * cellSize,
          padding + (r + 2) * cellSize,
          cellSize + 0.5,
          cellSize + 0.5
        );
      }
    }
  }

  // Label below
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(hall.name, canvasSize / 2, canvasSize + 20);

  ctx.fillStyle = "#64748b";
  ctx.font = "14px system-ui, -apple-system, sans-serif";
  ctx.fillText("Student Meal Attendance QR Code", canvasSize / 2, canvasSize + 48);

  const link = document.createElement("a");
  link.download = `${hall.name.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
