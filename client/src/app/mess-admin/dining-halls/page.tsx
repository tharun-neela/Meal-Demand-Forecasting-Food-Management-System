"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import styles from "./diningHalls.module.css";
import {
  DiningHall,
  DEFAULT_DINING_HALLS,
  DINING_HALLS_STORAGE_KEY,
  loadDiningHalls,
} from "./diningHallsData";
import DiningHallCard from "./DiningHallCard";
import PerformanceProfiler from "../../../components/PerformanceProfiler";

// Code splitting via Next.js Dynamic Imports: Modals only load when triggered
const CreateHallModal = dynamic(() => import("./CreateHallModal"), { ssr: false });
const EditHallModal = dynamic(() => import("./EditHallModal"), { ssr: false });
const ViewQrModal = dynamic(() => import("./ViewQrModal"), { ssr: false });
const DeleteHallModal = dynamic(() => import("./DeleteHallModal"), { ssr: false });

export type { DiningHall };

export default function DiningHallsPage() {
  const [halls, setHalls] = useState<DiningHall[]>(DEFAULT_DINING_HALLS);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingHall, setEditingHall] = useState<DiningHall | null>(null);
  const [deletingHall, setDeletingHall] = useState<DiningHall | null>(null);
  const [viewingQrHall, setViewingQrHall] = useState<DiningHall | null>(null);

  // Form State & Validation
  const [nameError, setNameError] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    status: "Active" | "Inactive";
    capacity: number | "";
    registered: number | "";
    staff: number | "";
    qrCode?: string;
  }>({
    name: "",
    status: "Active",
    capacity: "",
    registered: "",
    staff: "",
    qrCode: undefined,
  });

  const kebabRef = useRef<HTMLDivElement>(null);

  // Load from localStorage on client mount & listen for external changes
  useEffect(() => {
    setHalls(loadDiningHalls());

    const handleSync = () => {
      setHalls(loadDiningHalls());
    };

    window.addEventListener("diningHallsUpdated", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener("diningHallsUpdated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Save changes to localStorage and notify other tabs/components
  const persistHalls = useCallback((updatedList: DiningHall[]) => {
    setHalls(updatedList);
    try {
      localStorage.setItem(DINING_HALLS_STORAGE_KEY, JSON.stringify(updatedList));
      window.dispatchEvent(new Event("diningHallsUpdated"));
    } catch {
      // ignore storage error
    }
  }, []);

  // Close kebab menu on outside click or Escape
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (openKebabId && kebabRef.current && !kebabRef.current.contains(e.target as Node)) {
        setOpenKebabId(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenKebabId(null);
        setIsCreateModalOpen(false);
        setEditingHall(null);
        setDeletingHall(null);
        setViewingQrHall(null);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [openKebabId]);

  // Check if a mess name is unique across existing halls
  const checkIsNameUnique = useCallback(
    (name: string, excludeId?: string) => {
      const trimmed = name.trim().toLowerCase();
      if (!trimmed) return true;
      return !halls.some(
        (h) => h.id !== excludeId && h.name.trim().toLowerCase() === trimmed
      );
    },
    [halls]
  );

  const handleNameChange = useCallback(
    (val: string, excludeId?: string) => {
      setFormData((prev) => ({ ...prev, name: val }));
      if (nameError) {
        if (checkIsNameUnique(val, excludeId)) {
          setNameError(null);
        }
      }
    },
    [nameError, checkIsNameUnique]
  );

  // Kebab toggle with useCallback to prevent re-creating function on every render
  const handleToggleKebab = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenKebabId((prev) => (prev === id ? null : id));
  }, []);

  // Open Create Modal
  const handleOpenCreate = useCallback(() => {
    setFormData({
      name: "",
      status: "Active",
      capacity: "",
      registered: "",
      staff: "",
      qrCode: undefined,
    });
    setNameError(null);
    setOpenKebabId(null);
    setIsCreateModalOpen(true);
  }, []);

  // Open Edit Modal
  const handleOpenEdit = useCallback((hall: DiningHall) => {
    setEditingHall(hall);
    setFormData({
      name: hall.name,
      status: hall.status,
      capacity: hall.capacity,
      registered: hall.registered,
      staff: hall.staff,
      qrCode: hall.qrCode,
    });
    setNameError(null);
    setOpenKebabId(null);
  }, []);

  // Open Delete Modal
  const handleOpenDelete = useCallback((hall: DiningHall) => {
    setDeletingHall(hall);
    setOpenKebabId(null);
  }, []);

  // View QR Code Modal
  const handleViewQr = useCallback((hall: DiningHall) => {
    setViewingQrHall(hall);
  }, []);

  // Toggle Active / Deactivate
  const handleToggleStatus = useCallback(
    (hallId: string) => {
      const updated = halls.map((hall) => {
        if (hall.id === hallId) {
          return {
            ...hall,
            status: (hall.status === "Active" ? "Inactive" : "Active") as "Active" | "Inactive",
          };
        }
        return hall;
      });
      persistHalls(updated);
      setOpenKebabId(null);
    },
    [halls, persistHalls]
  );

  // Submit Create with Uniqueness Validation
  const handleCreateSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = formData.name.trim();
      if (!trimmedName) return;

      if (!checkIsNameUnique(trimmedName)) {
        setNameError(`A dining hall named "${trimmedName}" already exists. Please enter a unique name.`);
        return;
      }

      const newHall: DiningHall = {
        id: `dh-${Date.now()}`,
        name: trimmedName,
        status: formData.status,
        capacity: Number(formData.capacity) || 0,
        registered: Number(formData.registered) || 0,
        staff: Number(formData.staff) || 0,
        qrCode: formData.qrCode,
      };

      persistHalls([...halls, newHall]);
      setIsCreateModalOpen(false);
    },
    [formData, checkIsNameUnique, halls, persistHalls]
  );

  // Submit Edit with Uniqueness Validation
  const handleEditSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingHall) return;
      const trimmedName = formData.name.trim();
      if (!trimmedName) return;

      if (!checkIsNameUnique(trimmedName, editingHall.id)) {
        setNameError(`A dining hall named "${trimmedName}" already exists. Please enter a unique name.`);
        return;
      }

      const updated = halls.map((hall) => {
        if (hall.id === editingHall.id) {
          return {
            ...hall,
            name: trimmedName,
            status: formData.status,
            capacity: Number(formData.capacity) || 0,
            registered: Number(formData.registered) || 0,
            staff: Number(formData.staff) || 0,
            qrCode: formData.qrCode,
          };
        }
        return hall;
      });

      persistHalls(updated);
      setEditingHall(null);
    },
    [editingHall, formData, checkIsNameUnique, halls, persistHalls]
  );

  // Confirm Delete
  const handleConfirmDelete = useCallback(() => {
    if (!deletingHall) return;
    const updated = halls.filter((hall) => hall.id !== deletingHall.id);
    persistHalls(updated);
    setDeletingHall(null);
  }, [deletingHall, halls, persistHalls]);

  return (
    <PerformanceProfiler id="DiningHallsPage">
      <div className={styles.pageContainer}>
        {/* 3-Column Dining Halls Grid */}
        <div className={styles.hallsGrid} ref={kebabRef}>
          {halls.map((hall) => (
            <DiningHallCard
              key={hall.id}
              hall={hall}
              isKebabOpen={openKebabId === hall.id}
              onToggleKebab={handleToggleKebab}
              onToggleStatus={handleToggleStatus}
              onOpenEdit={handleOpenEdit}
              onOpenDelete={handleOpenDelete}
              onViewQr={handleViewQr}
            />
          ))}

          {/* Create New Mess Card (Dashed Card matching screenshot) */}
          <div
            className={styles.createCard}
            onClick={handleOpenCreate}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleOpenCreate();
              }
            }}
            aria-label="Create New Mess"
          >
            <div className={styles.createIcon}>+</div>
            <h3 className={styles.createTitle}>Create New Mess</h3>
            <p className={styles.createSubtitle}>
              Click to add a new dining hall and enter capacity, enrollment, and staff details.
            </p>
          </div>
        </div>

        {/* Code-Split Dynamic Modals (only loaded into bundle when triggered) */}
        {isCreateModalOpen && (
          <CreateHallModal
            formData={formData}
            nameError={nameError}
            onNameChange={(val) => handleNameChange(val)}
            setFormData={setFormData}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateSubmit}
          />
        )}

        {editingHall && (
          <EditHallModal
            editingHall={editingHall}
            formData={formData}
            nameError={nameError}
            onNameChange={(val) => handleNameChange(val, editingHall.id)}
            setFormData={setFormData}
            onClose={() => setEditingHall(null)}
            onSubmit={handleEditSubmit}
          />
        )}

        {viewingQrHall && (
          <ViewQrModal
            hall={viewingQrHall}
            onClose={() => setViewingQrHall(null)}
            onEdit={(hall) => {
              setViewingQrHall(null);
              handleOpenEdit(hall);
            }}
          />
        )}

        {deletingHall && (
          <DeleteHallModal
            hall={deletingHall}
            onClose={() => setDeletingHall(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </div>
    </PerformanceProfiler>
  );
}
