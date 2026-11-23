"use client";

import React, { useRef } from "react";
import styles from "./diningHalls.module.css";
import { DiningHall } from "./diningHallsData";
import QRCodeDisplay from "./QRCodeDisplay";

interface EditHallModalProps {
  editingHall: DiningHall;
  formData: {
    name: string;
    status: "Active" | "Inactive";
    capacity: number | "";
    registered: number | "";
    staff: number | "";
    qrCode?: string;
  };
  nameError: string | null;
  onNameChange: (val: string) => void;
  setFormData: React.Dispatch<
    React.SetStateAction<{
      name: string;
      status: "Active" | "Inactive";
      capacity: number | "";
      registered: number | "";
      staff: number | "";
      qrCode?: string;
    }>
  >;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditHallModal({
  editingHall,
  formData,
  nameError,
  onNameChange,
  setFormData,
  onClose,
  onSubmit,
}: EditHallModalProps) {
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please upload a smaller image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, qrCode: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetQr = () => {
    setFormData((prev) => ({ ...prev, qrCode: undefined }));
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Edit Dining Hall</h3>
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

        <form onSubmit={onSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-name">
              Mess Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="edit-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              className={`${styles.formInput} ${nameError ? styles.formInputError : ""}`}
              autoFocus
            />
            {nameError && (
              <div className={styles.fieldError}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{nameError}</span>
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-status">
              Status
            </label>
            <select
              id="edit-status"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
              className={styles.formSelect}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-capacity">
              Total Student Capacity
            </label>
            <input
              id="edit-capacity"
              type="number"
              min="1"
              required
              value={formData.capacity}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  capacity: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-registered">
              Registered Students
            </label>
            <input
              id="edit-registered"
              type="number"
              min="0"
              required
              value={formData.registered}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  registered: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="edit-staff">
              Kitchen Staff Members
            </label>
            <input
              id="edit-staff"
              type="number"
              min="0"
              required
              value={formData.staff}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  staff: e.target.value === "" ? "" : Number(e.target.value),
                }))
              }
              className={styles.formInput}
            />
          </div>

          {/* Mess QR Code Upload Section */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Mess QR Code (Meal Attendance)
            </label>
            <div className={styles.qrUploadSection}>
              <div className={styles.qrPreviewBox}>
                <QRCodeDisplay
                  hall={{
                    ...editingHall,
                    name: formData.name || editingHall.name,
                    status: formData.status,
                    capacity: Number(formData.capacity) || 0,
                    registered: Number(formData.registered) || 0,
                    staff: Number(formData.staff) || 0,
                    qrCode: formData.qrCode,
                  }}
                  size={60}
                />
              </div>

              <div className={styles.qrUploadControls}>
                <div className={styles.qrUploadBtnsRow}>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleQrFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className={styles.btnUploadQr}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>{formData.qrCode ? "Replace QR Image" : "Upload Custom QR"}</span>
                  </button>

                  {formData.qrCode && (
                    <button
                      type="button"
                      onClick={handleResetQr}
                      className={styles.btnResetQr}
                    >
                      Reset to Default
                    </button>
                  )}
                </div>
                <p className={styles.qrUploadHint}>
                  {formData.qrCode
                    ? "Custom QR image loaded. Click Save Changes to apply."
                    : "Currently using default dummy QR code. Click to upload custom entrance QR image."}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnCancel}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnSubmit}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
