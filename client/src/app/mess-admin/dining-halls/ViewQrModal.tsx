"use client";

import React from "react";
import styles from "./diningHalls.module.css";
import { DiningHall } from "./diningHallsData";
import QRCodeDisplay, { downloadQRCodeImage } from "./QRCodeDisplay";

interface ViewQrModalProps {
  hall: DiningHall;
  onClose: () => void;
  onEdit: (hall: DiningHall) => void;
}

export default function ViewQrModal({ hall, onClose, onEdit }: ViewQrModalProps) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.qrModalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.cardTitleGroup}>
            <h3 className={styles.modalTitle}>{hall.name}</h3>
            <span
              className={hall.status === "Active" ? styles.activeBadge : styles.inactiveBadge}
            >
              {hall.status}
            </span>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.qrModalContent}>
          <div className={styles.qrEnlargedBox}>
            <QRCodeDisplay hall={hall} size={200} />
          </div>

          <p className={styles.qrInstructionText}>
            Scan this QR code at the <strong>{hall.name}</strong> entrance to mark student meal attendance.
          </p>
        </div>

        <div className={styles.qrModalActions}>
          <button
            type="button"
            onClick={() => onEdit(hall)}
            className={styles.btnCancel}
          >
            Change QR
          </button>

          <button
            type="button"
            onClick={() => downloadQRCodeImage(hall)}
            className={styles.btnDownloadQr}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
