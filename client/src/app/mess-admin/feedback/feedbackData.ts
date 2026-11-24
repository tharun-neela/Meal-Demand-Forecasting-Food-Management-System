export type MealType = "breakfast" | "lunch" | "snacks" | "dinner";
export type FeedbackStatus = "pending" | "reviewed" | "resolved";

export interface UploadedPhoto {
  id: string;
  name: string;
  size: string;
  dataUrl: string;
}

export interface StudentFeedback {
  id: string;
  studentId: string;
  studentName: string;
  studentHostel: string;
  hallId: string;
  hallName: string;
  mealType: MealType;
  mealName: string;
  dateKey: string;
  dayOfWeek: string;
  overallRating: number; // 1-5
  dishRatings: Record<string, number>;
  dishComments: Record<string, string>;
  selectedTags: string[];
  comments: string;
  photos: UploadedPhoto[];
  submittedAt: string;
  status: FeedbackStatus;
  adminReply?: string;
  repliedAt?: string;
  isFlagged?: boolean;
}

export const FEEDBACK_STORAGE_KEY = "lpu_student_meal_feedbacks";

export const INITIAL_MOCK_FEEDBACKS: StudentFeedback[] = [
  {
    id: "fb-101",
    studentId: "12104523",
    studentName: "Aarav Sharma",
    studentHostel: "BH-01, Room 314",
    hallId: "bh-01",
    hallName: "BH-01 Mess",
    mealType: "lunch",
    mealName: "Executive North Indian Lunch",
    dateKey: "2026-11-24",
    dayOfWeek: "Tuesday",
    overallRating: 5,
    dishRatings: {
      "Paneer Butter Masala": 5,
      "Dal Makhani": 5,
      "Jeera Rice": 4,
      "Tandoori Roti": 5,
      "Gulab Jamun": 5,
    },
    dishComments: {
      "Paneer Butter Masala": "Paneer was super soft and rich in gravy!",
      "Tandoori Roti": "Crispy and served smoking hot.",
    },
    selectedTags: ["Delicious Taste", "Fresh & Piping Hot", "Clean & Hygienic", "Great Portion Size"],
    comments: "Best lunch of this week! The paneer gravy had the right amount of butter and cream. Dining hall cleanliness was also top-notch today.",
    photos: [],
    submittedAt: "Today, 1:45 PM",
    status: "reviewed",
    adminReply: "Thank you Aarav! Our chef team took special care with the paneer marinade today.",
    repliedAt: "Today, 2:15 PM",
    isFlagged: false,
  },
  {
    id: "fb-102",
    studentId: "12108912",
    studentName: "Sneha Patel",
    studentHostel: "GH-01, Room 108",
    hallId: "bh-02",
    hallName: "BH-02 Mess",
    mealType: "lunch",
    mealName: "Punjabi Special Thali",
    dateKey: "2026-11-24",
    dayOfWeek: "Tuesday",
    overallRating: 2,
    dishRatings: {
      "Rajma Masala": 2,
      "Steamed Rice": 3,
      "Mixed Veg": 2,
      "Phulka": 3,
    },
    dishComments: {
      "Rajma Masala": "Kidney beans were undercooked and hard to chew.",
      "Mixed Veg": "Too oily, almost floating in oil.",
    },
    selectedTags: ["Cold Food", "Needs More Seasoning"],
    comments: "The Rajma was not boiled properly and the gravy was watery. Many students at our table left the bowl unfinished. Please ensure proper boiling time.",
    photos: [],
    submittedAt: "Today, 1:12 PM",
    status: "pending",
    isFlagged: true,
  },
  {
    id: "fb-103",
    studentId: "12115430",
    studentName: "Vikramaditya Rao",
    studentHostel: "BH-03, Room 420",
    hallId: "bh-03",
    hallName: "BH-03 Mess",
    mealType: "breakfast",
    mealName: "South Indian Breakfast",
    dateKey: "2026-11-24",
    dayOfWeek: "Tuesday",
    overallRating: 4,
    dishRatings: {
      "Masala Dosa": 5,
      "Coconut Chutney": 4,
      "Sambar": 4,
      "Boiled Eggs": 4,
    },
    dishComments: {
      "Masala Dosa": "Dosa counter was fast and crisp!",
      "Sambar": "A bit more drumsticks would be great.",
    },
    selectedTags: ["Fresh & Piping Hot", "Delicious Taste", "Clean & Hygienic"],
    comments: "Dosas were made live and crispy on the tawa. Really appreciated the fast moving queue this morning.",
    photos: [],
    submittedAt: "Today, 8:40 AM",
    status: "reviewed",
    adminReply: "Glad you enjoyed the live dosa station Vikram! We added an extra cook to keep queues fast.",
    repliedAt: "Today, 9:30 AM",
    isFlagged: false,
  },
  {
    id: "fb-104",
    studentId: "12103498",
    studentName: "Kunal Verma",
    studentHostel: "BH-04, Room 205",
    hallId: "bh-04",
    hallName: "BH-04 Mess",
    mealType: "dinner",
    mealName: "Continental Dinner",
    dateKey: "2026-11-23",
    dayOfWeek: "Monday",
    overallRating: 3,
    dishRatings: {
      "Veg Hakka Noodles": 4,
      "Manchurian Gravy": 3,
      "Fried Rice": 3,
      "Sweet Corn Soup": 2,
    },
    dishComments: {
      "Sweet Corn Soup": "Was lukewarm and very bland. Needs salt.",
    },
    selectedTags: ["Too Spicy", "Cold Food"],
    comments: "Noodles were decent but Manchurian was excessively spicy for dinner. Soup was already cold by 8:30 PM.",
    photos: [],
    submittedAt: "Yesterday, 8:50 PM",
    status: "resolved",
    adminReply: "Noted Kunal. We instructed the staff to keep the soup bain-marie on high simmer until 9:30 PM.",
    repliedAt: "Today, 10:00 AM",
    isFlagged: false,
  },
  {
    id: "fb-105",
    studentId: "12117822",
    studentName: "Ananya Deshmukh",
    studentHostel: "GH-02, Room 512",
    hallId: "bh-01",
    hallName: "BH-01 Mess",
    mealType: "snacks",
    mealName: "Evening Hi-Tea & Snacks",
    dateKey: "2026-11-23",
    dayOfWeek: "Monday",
    overallRating: 5,
    dishRatings: {
      "Samosa with Mint Chutney": 5,
      "Masala Chai": 5,
      "Biscuits": 4,
    },
    dishComments: {
      "Samosa with Mint Chutney": "Freshly fried, perfectly flaky crust!",
      "Masala Chai": "Cardamom and ginger flavor was wonderful.",
    },
    selectedTags: ["Delicious Taste", "Fresh & Piping Hot", "Perfect Salt & Spice"],
    comments: "Best samosas on campus! The chai was refreshing after long lab hours.",
    photos: [],
    submittedAt: "Yesterday, 5:15 PM",
    status: "reviewed",
    isFlagged: false,
  },
  {
    id: "fb-106",
    studentId: "12106654",
    studentName: "Taranpreet Singh",
    studentHostel: "BH-05, Room 112",
    hallId: "bh-05",
    hallName: "BH-05 Mess",
    mealType: "lunch",
    mealName: "North Indian Regular Thali",
    dateKey: "2026-11-23",
    dayOfWeek: "Monday",
    overallRating: 1,
    dishRatings: {
      "Chole": 1,
      "Bhature": 2,
      "Boondi Raita": 1,
    },
    dishComments: {
      "Chole": "Smelled sour, seemed fermented or left from previous day.",
      "Boondi Raita": "Raita curd was too sour to consume.",
    },
    selectedTags: ["Needs More Seasoning", "Cold Food"],
    comments: "Urgent issue: Chole and Raita smelled distinctly sour today. I could not eat lunch and had to buy food outside. Please inspect the cold storage immediately.",
    photos: [],
    submittedAt: "Yesterday, 1:25 PM",
    status: "resolved",
    adminReply: "Urgent inspection conducted with Quality Head Dr. Banerjee. The curd batch was quarantined and batch supplier issued a warning. Thank you for reporting.",
    repliedAt: "Yesterday, 3:00 PM",
    isFlagged: true,
  },
];

export function loadFeedbacks(): StudentFeedback[] {
  if (typeof window === "undefined") return INITIAL_MOCK_FEEDBACKS;

  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_FEEDBACKS));
      return INITIAL_MOCK_FEEDBACKS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_FEEDBACKS));
      return INITIAL_MOCK_FEEDBACKS;
    }

    // Merge and normalize: Ensure student fields exist
    const normalized: StudentFeedback[] = parsed.map((item, index) => {
      const defaultMock = INITIAL_MOCK_FEEDBACKS[index % INITIAL_MOCK_FEEDBACKS.length];
      return {
        id: item.id || `fb-${Date.now()}-${index}`,
        studentId: item.studentId || defaultMock.studentId || "12104523",
        studentName: item.studentName || defaultMock.studentName || "Student User",
        studentHostel: item.studentHostel || defaultMock.studentHostel || "BH-01",
        hallId: item.hallId || defaultMock.hallId || "bh-01",
        hallName: item.hallName || defaultMock.hallName || "BH-01 Mess",
        mealType: item.mealType || "lunch",
        mealName: item.mealName || "Day Meal",
        dateKey: item.dateKey || "2026-11-24",
        dayOfWeek: item.dayOfWeek || "Tuesday",
        overallRating: Number(item.overallRating) || 3,
        dishRatings: item.dishRatings || {},
        dishComments: item.dishComments || {},
        selectedTags: Array.isArray(item.selectedTags) ? item.selectedTags : [],
        comments: item.comments || "",
        photos: Array.isArray(item.photos) ? item.photos : [],
        submittedAt: item.submittedAt || "Recently",
        status: item.status || "pending",
        adminReply: item.adminReply || undefined,
        repliedAt: item.repliedAt || undefined,
        isFlagged: Boolean(item.isFlagged),
      };
    });

    return normalized;
  } catch (err) {
    console.error("Error reading feedbacks from storage", err);
    return INITIAL_MOCK_FEEDBACKS;
  }
}

export function saveFeedbacks(feedbacks: StudentFeedback[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
  } catch (err) {
    console.error("Error saving feedbacks", err);
  }
}
