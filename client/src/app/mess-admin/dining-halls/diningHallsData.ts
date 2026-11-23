export interface DiningHall {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  capacity: number;
  registered: number;
  staff: number;
  qrCode?: string; // Base64 data URL or image URL; falls back to dummy QR
}

export const DEFAULT_DINING_HALLS: DiningHall[] = [
  {
    id: "bh-01",
    name: "BH-01 Mess",
    status: "Active",
    capacity: 2000,
    registered: 1500,
    staff: 15,
  },
  {
    id: "bh-02",
    name: "BH-02 Mess",
    status: "Active",
    capacity: 1500,
    registered: 1200,
    staff: 12,
  },
  {
    id: "bh-03",
    name: "BH-03 Mess",
    status: "Active",
    capacity: 1800,
    registered: 1100,
    staff: 14,
  },
  {
    id: "bh-04",
    name: "BH-04 Mess",
    status: "Active",
    capacity: 2500,
    registered: 1950,
    staff: 18,
  },
  {
    id: "bh-05",
    name: "BH-05 Mess",
    status: "Active",
    capacity: 2200,
    registered: 1400,
    staff: 16,
  },
];

export const DINING_HALLS_STORAGE_KEY = "mess_admin_dining_halls";

export function loadDiningHalls(): DiningHall[] {
  if (typeof window === "undefined") return DEFAULT_DINING_HALLS;
  try {
    const stored = localStorage.getItem(DINING_HALLS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(DINING_HALLS_STORAGE_KEY, JSON.stringify(DEFAULT_DINING_HALLS));
  } catch {
    // ignore storage errors
  }
  return DEFAULT_DINING_HALLS;
}
