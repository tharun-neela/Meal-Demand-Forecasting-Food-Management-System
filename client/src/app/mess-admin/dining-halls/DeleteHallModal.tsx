"use client";

import React from "react";
import styles from "./diningHalls.module.css";
import { DiningHall } from "./diningHallsData";

interface DeleteHallModalProps {
  hall: DiningHall;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteHallModal({ hall, onClose, onConfirm }: DeleteHallModalProps) {
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Delete Dining Hall</h3>
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

        <p className={styles.deleteWarningText}>
          Are you sure you want to permanently delete <strong>{hall.name}</strong>?
          This will remove its enrollment records and kitchen staff assignments.
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            className={styles.btnCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={styles.btnDelete}
          >
            Delete Mess
          </button>
        </div>
      </div>
    </div>
  );
}
