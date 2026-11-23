"use client";

import React, { memo } from "react";
import styles from "./diningHalls.module.css";
import { DiningHall } from "./diningHallsData";
import QRCodeDisplay from "./QRCodeDisplay";

interface DiningHallCardProps {
  hall: DiningHall;
  isKebabOpen: boolean;
  onToggleKebab: (id: string, e: React.MouseEvent) => void;
  onToggleStatus: (id: string) => void;
  onOpenEdit: (hall: DiningHall) => void;
  onOpenDelete: (hall: DiningHall) => void;
  onViewQr: (hall: DiningHall) => void;
}

function DiningHallCardComponent({
  hall,
  isKebabOpen,
  onToggleKebab,
  onToggleStatus,
  onOpenEdit,
  onOpenDelete,
  onViewQr,
}: DiningHallCardProps) {
  const occupancy = hall.capacity > 0 ? Math.round((hall.registered / hall.capacity) * 100) : 0;

  return (
    <div
      className={`${styles.hallCard} ${hall.status === "Inactive" ? styles.hallCardInactive : ""}`}
      onClick={() => onOpenEdit(hall)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if ((e.target as HTMLElement).tagName !== "BUTTON") {
            e.preventDefault();
            onOpenEdit(hall);
          }
        }
      }}
      title="Click mess card to edit details and upload QR code"
    >
      {/* Header: Name, Active Badge & Kebab Menu */}
      <div>
        <div className={styles.cardHeader}>
          <div className={styles.cardTitleGroup}>
            <h3 className={styles.cardTitle}>{hall.name}</h3>
            <span
              className={hall.status === "Active" ? styles.activeBadge : styles.inactiveBadge}
            >
              {hall.status}
            </span>
          </div>

          {/* Kebab 3-Dots Button */}
          <div className={styles.kebabWrapper}>
            <button
              type="button"
              onClick={(e) => onToggleKebab(hall.id, e)}
              className={`${styles.kebabBtn} ${isKebabOpen ? styles.kebabBtnActive : ""}`}
              aria-label={`Options for ${hall.name}`}
              aria-expanded={isKebabOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1.3" fill="currentColor" />
                <circle cx="12" cy="5" r="1.3" fill="currentColor" />
                <circle cx="12" cy="19" r="1.3" fill="currentColor" />
              </svg>
            </button>

            {/* Dropdown Menu (Deactivate, Delete, Edit) */}
            {isKebabOpen && (
              <div className={styles.kebabDropdown}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(hall.id);
                  }}
                  className={styles.kebabItem}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {hall.status === "Active" ? (
                      <circle cx="12" cy="12" r="10" />
                    ) : (
                      <polygon points="5 3 19 12 5 21 5 3" />
                    )}
                  </svg>
                  <span>{hall.status === "Active" ? "Deactivate" : "Activate"}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDelete(hall);
                  }}
                  className={`${styles.kebabItem} ${styles.kebabItemDanger}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenEdit(hall);
                  }}
                  className={styles.kebabItem}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                  </svg>
                  <span>Edit</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.cardDivider} />

        {/* Middle Section: Details on Left + QR Code Container on Right */}
        <div className={styles.cardBody}>
          <div className={styles.cardDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Capacity:</span>
              <span className={styles.detailValue}>
                {hall.capacity.toLocaleString()} students
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Registered students:</span>
              <span className={styles.detailValue}>
                {hall.registered.toLocaleString()}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Kitchen staff:</span>
              <span className={styles.detailValue}>
                {hall.staff} members
              </span>
            </div>
          </div>

          {/* QR Code Container on Card */}
          <div
            className={styles.qrCodeThumbnail}
            onClick={(e) => {
              e.stopPropagation();
              onViewQr(hall);
            }}
            title="Click to view QR code"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onViewQr(hall);
              }
            }}
          >
            <QRCodeDisplay hall={hall} size={68} />
          </div>
        </div>
      </div>

      {/* Occupancy Progress Bar & Badge */}
      <div className={styles.progressSection}>
        <div className={styles.progressBarTrack} title={`${occupancy}% Occupied`}>
          <div
            className={styles.progressBarFill}
            style={{ width: `${Math.min(occupancy, 100)}%` }}
          />
        </div>
        <span className={styles.occupancyBadge}>{occupancy}% Occupied</span>
      </div>
    </div>
  );
}

export const DiningHallCard = memo(DiningHallCardComponent);
export default DiningHallCard;
