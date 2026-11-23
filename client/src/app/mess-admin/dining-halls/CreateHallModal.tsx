"use client";

import React, { useRef } from "react";
import styles from "./diningHalls.module.css";
import QRCodeDisplay from "./QRCodeDisplay";

interface CreateHallModalProps {
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

export default function CreateHallModal({
  formData,
  nameError,
  onNameChange,
  setFormData,
  onClose,
  onSubmit,
}: CreateHallModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Create New Dining Hall</h3>
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
            <label className={styles.formLabel} htmlFor="create-name">
              Mess Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="create-name"
              type="text"
              required
              placeholder="e.g. BH-06 Mess or GH-01 Mess"
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
            <label className={styles.formLabel} htmlFor="create-status">
              Initial Status
            </label>
            <select
              id="create-status"
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as "Active" | "Inactive" }))}
              className={styles.formSelect}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="create-capacity">
              Total Student Capacity
            </label>
            <input
              id="create-capacity"
              type="number"
              min="1"
              required
              placeholder="e.g. 2000"
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
            <label className={styles.formLabel} htmlFor="create-registered">
              Registered Students
            </label>
            <input
              id="create-registered"
              type="number"
              min="0"
              required
              placeholder="e.g. 1500"
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
            <label className={styles.formLabel} htmlFor="create-staff">
              Kitchen Staff Members
            </label>
            <input
              id="create-staff"
              type="number"
              min="0"
              required
              placeholder="e.g. 15"
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
                    id: "new-mess",
                    name: formData.name || "New Mess",
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
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleQrFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
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
                    ? "Custom QR image loaded. Will be shown on the mess card."
                    : "Using default dummy QR code. Click to upload your own scanner QR code image."}
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
              Create Mess
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
