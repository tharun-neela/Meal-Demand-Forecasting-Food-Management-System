export interface MealCategory {
  category: string;
  items: string[];
}

export interface MealService {
  id: "breakfast" | "lunch" | "snacks" | "dinner";
  name: string;
  timing: string;
  highlight: string;
  sections: MealCategory[];
}

export interface DayMenu {
  dayName: string; // "Sunday", "Monday", etc.
  dayShort: string; // "SUN", "MON", etc.
  weekNumber: 1 | 2;
  title: string; // "Sunday 1", "Saturday 1", etc.
  meals: {
    breakfast: MealService;
    lunch: MealService;
    snacks: MealService;
    dinner: MealService;
  };
}

export interface MessTimingsInfo {
  workingDays: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
  sundaysHolidays: {
    breakfast: string;
    lunch: string;
    snacks: string;
    dinner: string;
  };
  notes: string[];
}

export const MESS_TIMINGS_INFO: MessTimingsInfo = {
  workingDays: {
    breakfast: "07:30 AM – 09:30 AM",
    lunch: "11:30 AM – 03:00 PM",
    snacks: "05:00 PM – 06:30 PM",
    dinner: "07:30 PM – 09:30 PM",
  },
  sundaysHolidays: {
    breakfast: "08:00 AM – 10:00 AM",
    lunch: "12:30 PM – 03:00 PM",
    snacks: "05:00 PM – 06:30 PM",
    dinner: "07:30 PM – 09:30 PM",
  },
  notes: [
    "This menu is approved through the Mess Student Representative Committee.",
    "The mess menu is flexible and subject to change periodically based on feedback from the committee.",
    "In case of non-availability of any particular item, an alternate item will be prepared after informing DVCM and Warden.",
    "Hot beverages (tea & coffee) are served with evening snacks as per winter schedule.",
  ],
};

// ==========================================
// WEEK 1 MENU DATA (with Oct Seasonal Veg)
// ==========================================
export const WEEK_1_MENU: Record<string, DayMenu> = {
  Sunday: {
    dayName: "Sunday",
    dayShort: "SUN",
    weekNumber: 1,
    title: "Sunday - 1",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "08:00 AM – 10:00 AM",
        highlight: "Stuffed Mix Prantha, Cold Sandwich, Mysore Bonda",
        sections: [
          { category: "North Indian", items: ["Stuffed Mix Prantha", "Packed Curd"] },
          { category: "South Indian", items: ["Mysore Bonda", "South Tomato Chutney"] },
          { category: "Continental & Breads", items: ["Cold Sandwich with Tomato Ketchup", "White Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "12:30 PM – 03:00 PM",
        highlight: "Pindi Chhole, Aloo Pyaz Masaledar, Puliyodharai, Boondi Raita",
        sections: [
          { category: "South Indian", items: ["Kara Kuzhambu", "Cabbage Poriyal", "Puliyodharai"] },
          { category: "North Indian", items: ["Pindi Chhole", "Aloo Pyaz Masaledar", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Boondi Raita"] },
          { category: "Breads & Accompaniments", items: ["Roti and Bhatura", "Pickled Onion"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Hot Kulcha with Nutri Gravy, Tea & Coffee",
        sections: [
          { category: "Snacks", items: ["Kulcha with Nutri Gravy"] },
          { category: "Beverages", items: ["Tea", "Coffee"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Mysore Sambhar, Matar Nutri, Moong Chilka Dal, Gulab Jamun",
        sections: [
          { category: "South Indian", items: ["Mysore Sambhar", "Zimikand Pulusu (Seasonal)", "Plain Rice"] },
          { category: "North Indian", items: ["Moong Chilka Dal", "Matar Nutri", "Bhuna Onion Pulao"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Fryums"] },
          { category: "Dessert", items: ["Gulab Jamun"] },
        ],
      },
    },
  },

  Monday: {
    dayName: "Monday",
    dayShort: "MON",
    weekNumber: 1,
    title: "Monday - 1",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Aloo Prantha, Idli with Sambhar, Veg. Stuffed Toast",
        sections: [
          { category: "North Indian", items: ["Aloo Prantha", "Pickle"] },
          { category: "South Indian", items: ["Idli with Sambhar", "Coconut Chutney"] },
          { category: "Healthy & Continental", items: ["Milk Dalia", "Veg. Stuffed Toast", "Brown Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Dal Milijuli, Bhindi Masala, Tomato Meal Maker, Veg Pulao",
        sections: [
          { category: "South Indian", items: ["Mudha Pappu", "Tomato Meal Maker", "Plain Rice"] },
          { category: "North Indian", items: ["Dal Milijuli", "Bhindi Masala (Seasonal)", "Veg Pulao"] },
          { category: "Curd & Raita", items: ["Plain Curd"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Fryums"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Crispy Bread Roll with Ketchup, Tea & Lemon Water",
        sections: [
          { category: "Snacks", items: ["Bread Roll with Tomato Ketchup"] },
          { category: "Beverages", items: ["Tea", "Lemon Water"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Palak Paneer / Kadai Paneer, Soya Biryani, Seviyan Kheer",
        sections: [
          { category: "South Indian", items: ["Majjiga Pulusu", "Donda Kaya Fry", "Soya Biryani"] },
          { category: "North Indian", items: ["Yellow Moong Dal", "Palak Paneer / Kadai Paneer", "Plain Rice"] },
          { category: "Breads & Accompaniments", items: ["Roti and Missi Roti", "Green Salad"] },
          { category: "Dessert", items: ["Seviyan Kheer"] },
        ],
      },
    },
  },

  Tuesday: {
    dayName: "Tuesday",
    dayShort: "TUE",
    weekNumber: 1,
    title: "Tuesday - 1",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Poori with Aloo Curry, Tomato Bath, Fresh Banana",
        sections: [
          { category: "North Indian", items: ["Poori with Aloo Curry", "Black Chana Masala"] },
          { category: "South Indian", items: ["Tomato Bath", "Peanut Chutney"] },
          { category: "Breads & Fruits", items: ["White Bread & Jam", "Fresh Banana"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Rajma, Mix Veg, Lemon Rice, Fruit Raita",
        sections: [
          { category: "South Indian", items: ["Vaskaya Curry", "Mor Kuzhambu", "Lemon Rice"] },
          { category: "North Indian", items: ["Rajma", "Mix Veg", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Fruit Raita"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Mumbai Vada Pav with Ketchup, Tea & Coffee",
        sections: [
          { category: "Snacks", items: ["Vada Pav with Tomato Ketchup"] },
          { category: "Beverages", items: ["Tea", "Coffee"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Sabut Masoor Dal, Mushroom Matar, Veg Dum Biryani, Besan Burfi",
        sections: [
          { category: "South Indian", items: ["Beerakaya Pappu", "Vada Curry", "Plain Rice"] },
          { category: "North Indian", items: ["Sabut Masoor Dal", "Mushroom Matar / Methi Malai Matar", "Veg Dum Biryani"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
          { category: "Dessert", items: ["Besan Burfi"] },
        ],
      },
    },
  },

  Wednesday: {
    dayName: "Wednesday",
    dayShort: "WED",
    weekNumber: 1,
    title: "Wednesday - 1",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Kulcha with Chana/Matar Gravy, Mix Veg Uthappam, Ragi Porridge",
        sections: [
          { category: "North Indian", items: ["Kulcha (Toasted)", "Chana/Matar Gravy"] },
          { category: "South Indian", items: ["Mix Veg Uthappam", "Coconut Chutney"] },
          { category: "Healthy & Continental", items: ["Ragi Porridge", "Vermicelli Upma", "Brown Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Tomato Pappu, Veg 65 / Mirchi Bajji, Bisi Bele Bath, Lauki Mint Raita",
        sections: [
          { category: "South Indian", items: ["Tomato Pappu", "Veg 65 / Mirchi Bajji", "Bisi Bele Bath"] },
          { category: "North Indian", items: ["Yellow Dal Fry", "Lauki / Tori Lahsun (Seasonal)", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Lauki Mint Raita"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Fryums"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Bombay Grilled Sandwich with Ketchup, Tea & Rooh Afza",
        sections: [
          { category: "Snacks", items: ["Bombay Sandwich with Tomato Ketchup"] },
          { category: "Beverages", items: ["Tea", "Rooh Afza"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Mash Ki Dal, Aloo Baingan Chokha, Jeera Rice, Rasgulla",
        sections: [
          { category: "South Indian", items: ["Tamarind Rasam", "Potato Peas Poriyal", "Plain Rice"] },
          { category: "North Indian", items: ["Mash Ki Dal", "Aloo Baingan Chokha", "Jeera Rice"] },
          { category: "Breads & Accompaniments", items: ["Roti / Lisi", "Fryums"] },
          { category: "Dessert", items: ["Rasgulla"] },
        ],
      },
    },
  },

  Thursday: {
    dayName: "Thursday",
    dayShort: "THU",
    weekNumber: 1,
    title: "Thursday - 1",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Plain Prantha with Aloo Bhujia, Minapa Punugulu, Macaroni",
        sections: [
          { category: "North Indian", items: ["Plain Prantha with Aloo Bhujia"] },
          { category: "South Indian", items: ["Minapa Punugulu", "South Tomato Chutney"] },
          { category: "Continental", items: ["Vegetable Macaroni with Tomato Ketchup", "White Bread & Jam"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Punjabi Kadhi Pakoda, Aloo Matar Gravy, Mix Veg Poriyal, Jeera Onion Pulao",
        sections: [
          { category: "South Indian", items: ["Pachi Pulusu", "Mix Veg Poriyal (Seasonal)", "Curd Rice"] },
          { category: "North Indian", items: ["Punjabi Kadhi Pakoda", "Aloo Matar Gravy", "Jeera Onion Pulao"] },
          { category: "Curd & Raita", items: ["Majjiga Pulusu"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Vegetable Hakka Noodles with Tomato Ketchup, Tea & Coffee",
        sections: [
          { category: "Snacks", items: ["Hakka Noodles with Tomato Ketchup"] },
          { category: "Beverages", items: ["Tea", "Coffee"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Dal Palak, Paneer Do Pyaza, Kandhi Pappu, Moong Dal Halwa",
        sections: [
          { category: "South Indian", items: ["Kandhi Pappu", "Meal Maker Curry", "Plain Rice"] },
          { category: "North Indian", items: ["Dal Palak", "Paneer Do Pyaza", "Matar Pulao"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
          { category: "Dessert", items: ["Moong Dal Halwa / Ice Cream"] },
        ],
      },
    },
  },

  Friday: {
    dayName: "Friday",
    dayShort: "FRI",
    weekNumber: 1,
    title: "Friday - 1",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Stuffed Mooli/Onion Prantha, Vegetable Rawa Upma, Mix Dal Sprouts",
        sections: [
          { category: "North Indian", items: ["Stuffed Mooli/Onion Prantha", "Packed Curd"] },
          { category: "South Indian", items: ["Vegetable Rawa Upma", "Tomato Gojju"] },
          { category: "Healthy & Fruits", items: ["Mix Dal Sprouts", "Fresh Cut Fruits", "Aloo Bonda", "Brown Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Sambhar, Bagara Baingan, Black Chana, Mix Veg Kofta, Veg Pulao",
        sections: [
          { category: "South Indian", items: ["Sambhar", "Bagara Baingan", "Plain Rice"] },
          { category: "North Indian", items: ["Black Chana", "Mix Veg Kofta", "Veg Pulao"] },
          { category: "Curd & Raita", items: ["Mix-Veg Raita"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Pickled Onion"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Crispy Bread Pakoda with Ketchup, Tea & Aam Panna",
        sections: [
          { category: "Snacks", items: ["Bread Pakoda with Tomato Ketchup"] },
          { category: "Beverages", items: ["Tea", "Aam Panna"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Arhar Dal, Bhindi Pulusu, Mix Veg, Tomato Rice, Balushahi",
        sections: [
          { category: "South Indian", items: ["Tomato Rasam", "Bhindi Pulusu (Seasonal)", "Tomato Rice"] },
          { category: "North Indian", items: ["Arhar Dal", "Mix Veg", "Plain Rice"] },
          { category: "Breads & Accompaniments", items: ["Roti and Ajwain Roti", "Fryums"] },
          { category: "Dessert", items: ["Balushahi"] },
        ],
      },
    },
  },

  Saturday: {
    dayName: "Saturday",
    dayShort: "SAT",
    weekNumber: 1,
    title: "Saturday - 1",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Soya Paneer Prantha, Indori Poha, Medu Vada with Sambhar",
        sections: [
          { category: "North Indian", items: ["Soya Paneer Prantha", "Pickle", "Indori Poha with Tomato Ketchup"] },
          { category: "South Indian", items: ["Medu Vada with Sambhar", "Peanut Chutney"] },
          { category: "Breads & Accompaniments", items: ["White Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Paruppu Urundai Kulambu, Matar Paneer, Khuska, Dahi Bhalla",
        sections: [
          { category: "South Indian", items: ["Senaga Pappu", "Paruppu Urundai Kulambu", "Khuska"] },
          { category: "North Indian", items: ["Matar Paneer / Mixed Mushroom", "Arbi Ajwaini Masala (Seasonal)", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Dahi Bhalla"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad and Imly Chutney"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Crispy Punjabi Samosa with Ketchup, Tea & Coffee",
        sections: [
          { category: "Snacks", items: ["Samosa with Tomato Ketchup"] },
          { category: "Beverages", items: ["Tea", "Coffee"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Vengaya Sambhar, Rajma, Soya & Matar Dum Biryani, Kheer",
        sections: [
          { category: "South Indian", items: ["Vengaya Sambhar (Onion)", "Artikai Vepudu", "Soya & Matar Dum Biryani"] },
          { category: "North Indian", items: ["Rajma", "Aloo Shimla", "Plain Rice"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
          { category: "Dessert", items: ["Kheer"] },
        ],
      },
    },
  },
};

// ==========================================
// WEEK 2 MENU DATA (with Oct Seasonal Veg)
// ==========================================
export const WEEK_2_MENU: Record<string, DayMenu> = {
  Sunday: {
    dayName: "Sunday",
    dayShort: "SUN",
    weekNumber: 2,
    title: "Sunday - 2",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "08:00 AM – 10:00 AM",
        highlight: "Stuffed Mix Prantha, Mangalore Bajji, Hot Pongal",
        sections: [
          { category: "North Indian", items: ["Stuffed Mix Prantha", "Pickle"] },
          { category: "South Indian", items: ["Hot Pongal", "Vegetable Sambhar", "Mangalore Bajji with Coriander Coconut Chutney"] },
          { category: "Continental & Breads", items: ["Brown Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "12:30 PM – 03:00 PM",
        highlight: "Pindi Chhole, Khatta Meetha Petha, Gutti Vankaya, Tomato Rice",
        sections: [
          { category: "South Indian", items: ["Garlic Pepper Rasam", "Gutti Vankaya", "Tomato Rice"] },
          { category: "North Indian", items: ["Pindi Chhole", "Khatta Meetha Petha", "Jeera Rice"] },
          { category: "Curd & Raita", items: ["Plain Curd"] },
          { category: "Breads & Accompaniments", items: ["Roti and Bhatura", "Pickled Onion"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Veg Coleslaw Sandwich with Green Chutney, Tea & Tang",
        sections: [
          { category: "Snacks", items: ["Veg Coleslaw Sandwich with Green Chutney"] },
          { category: "Beverages", items: ["Tea", "Tang"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Hari Moong Dal, Nutri Chilly, Beans Poriyal, Sooji Halwa",
        sections: [
          { category: "South Indian", items: ["Thakkali Sambhar", "Beans Poriyal (Seasonal)", "Plain Rice"] },
          { category: "North Indian", items: ["Hari Moong Dal", "Nutri Chilly", "Veg Pulao"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Fryums"] },
          { category: "Dessert", items: ["Sooji Halwa (Saji Halwa)"] },
        ],
      },
    },
  },

  Monday: {
    dayName: "Monday",
    dayShort: "MON",
    weekNumber: 2,
    title: "Monday - 2",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Stuffed Aloo/Mooli Methi Prantha, Minapa Punugulu, Moong Sprouts",
        sections: [
          { category: "North Indian", items: ["Stuffed Aloo/Mooli Methi Prantha", "Packed Curd"] },
          { category: "South Indian", items: ["Minapa Punugulu", "South Tomato Chutney"] },
          { category: "Healthy & Continental", items: ["Moong Sprouts", "Vermicelli Upma", "Fresh Banana", "White Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Dal Makhni, Bhindi Do Pyaza, Vegetable Sagu, Curd Rice",
        sections: [
          { category: "South Indian", items: ["Chamagadda Pulusu", "Vegetable Sagu", "Curd Rice"] },
          { category: "North Indian", items: ["Dal Makhni", "Bhindi Do Pyaza (Seasonal)", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Cucumber/Ghiya Raita"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Hot Veg Bajji with Green Chutney, Tea & Coffee",
        sections: [
          { category: "Snacks", items: ["Veg Bajji with Green Chutney"] },
          { category: "Beverages", items: ["Tea", "Coffee"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Tomato Pappu, Aloo Parwal / Shimla Mirch, Chitranna Rice, Coconut Laddu",
        sections: [
          { category: "South Indian", items: ["Tomato Pappu", "Aloo Gadda Vepudu", "Chitranna Rice"] },
          { category: "North Indian", items: ["Yellow Moong Dal", "Aloo Parwal / Shimla Mirch (Seasonal)", "Plain Rice"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
          { category: "Dessert", items: ["Coconut Laddu"] },
        ],
      },
    },
  },

  Tuesday: {
    dayName: "Tuesday",
    dayShort: "TUE",
    weekNumber: 2,
    title: "Tuesday - 2",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Plain Prantha with Hing Jeera Aloo, Masala Vegetable Idli, Sweet Dalia",
        sections: [
          { category: "North Indian", items: ["Plain Prantha with Hing Jeera Aloo (Dry)", "Sweet Dalia"] },
          { category: "South Indian", items: ["Masala Vegetable Idli", "Coconut Chutney"] },
          { category: "Breads", items: ["Brown Bread & Jam"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Lobia Dal, Potato 65, Drum Stick Sambhar, Coconut Rice",
        sections: [
          { category: "South Indian", items: ["Drum Stick Sambhar", "Potato 65", "Coconut Rice"] },
          { category: "North Indian", items: ["Lobia Dal", "Mix Veg", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Mix-Veg Raita"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Crispy Bhel Poori with Imly Chutney, Tea & Lemon Water",
        sections: [
          { category: "Snacks", items: ["Bhel Poori with Imly Chutney"] },
          { category: "Beverages", items: ["Tea", "Lemon Water"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Paneer Butter Masala, Hyderabadi Biryani, Spinach Roti, Gulab Jamun",
        sections: [
          { category: "South Indian", items: ["Beerakaya Pappu", "Vegetable Kurma", "Hyderabadi Biryani"] },
          { category: "North Indian", items: ["Mash Chana Dal", "Paneer Butter Masala", "Plain Rice"] },
          { category: "Breads & Accompaniments", items: ["Roti and Spinach Roti", "Green Salad"] },
          { category: "Dessert", items: ["Gulab Jamun"] },
        ],
      },
    },
  },

  Wednesday: {
    dayName: "Wednesday",
    dayShort: "WED",
    weekNumber: 2,
    title: "Wednesday - 2",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Poori with Aloo Chana Curry, Vegetable Rawa Upma, Soyaseed Sprouts",
        sections: [
          { category: "North Indian", items: ["Poori with Aloo Chana Curry", "Cold Sandwich with Pickled Onion"] },
          { category: "South Indian", items: ["Vegetable Rawa Upma", "Tomato Chutney"] },
          { category: "Healthy & Continental", items: ["Soyaseed Sprouts", "White Bread & Jam"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Mushroom Chettinad Curry, Nutri Keema Matar, Pudina Rice, Boondi Raita",
        sections: [
          { category: "South Indian", items: ["Tamarind Rasam", "Mushroom Chettinad Curry", "Pudina Rice"] },
          { category: "North Indian", items: ["Sabut Masoor Dal", "Nutri Keema Matar (Seasonal)", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Boondi Raita"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Fryums"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Mumbai Pav Bhaji with Fresh Butter Bhaji, Tea & Coffee",
        sections: [
          { category: "Snacks", items: ["Pav Bhaji with Bhaji"] },
          { category: "Beverages", items: ["Tea", "Coffee"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Rajma Rasila, Aloo Matar Dry, Puliyodharai, Besan Burfi",
        sections: [
          { category: "South Indian", items: ["Pasi Paruppu Sambhar", "Donda Kaya Fry", "Puliyodharai"] },
          { category: "North Indian", items: ["Rajma Rasila", "Aloo Matar Dry", "Veg Pulao"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Fryums"] },
          { category: "Dessert", items: ["Besan Burfi"] },
        ],
      },
    },
  },

  Thursday: {
    dayName: "Thursday",
    dayShort: "THU",
    weekNumber: 2,
    title: "Thursday - 2",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Missi Prantha, Idli with Sambhar, Vegetable Macaroni, Cut Fruits",
        sections: [
          { category: "North Indian", items: ["Missi Prantha", "Pickle"] },
          { category: "South Indian", items: ["Idli with Sambhar", "Coconut Chutney"] },
          { category: "Continental & Fruits", items: ["Vegetable Macaroni with Tomato Ketchup", "Cut Fruits", "Brown Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Punjabi Kadhi Pakoda, Dum Aloo, Beans Tomato Aloo Curry, Soya Biryani",
        sections: [
          { category: "South Indian", items: ["Pappu Charu", "Beans Tomato Aloo Curry (Seasonal)", "Soya Biryani"] },
          { category: "North Indian", items: ["Punjabi Kadhi Pakoda", "Dum Aloo", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Majjiga Pulusu"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Crispy Kachauri with Aloo Sabji, Tea & Rooh Afza",
        sections: [
          { category: "Snacks", items: ["Kachauri with Aloo Sabji"] },
          { category: "Beverages", items: ["Tea", "Rooh Afza"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "White Chana, Manchurian, Fried Rice / Noodles, Boondi Laddu",
        sections: [
          { category: "South Indian", items: ["Senaga Pappu", "Avial", "Plain Rice"] },
          { category: "North Indian", items: ["White Chana", "Manchurian", "Fried Rice / Noodles"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad"] },
          { category: "Dessert", items: ["Boondi Laddu"] },
        ],
      },
    },
  },

  Friday: {
    dayName: "Friday",
    dayShort: "FRI",
    weekNumber: 2,
    title: "Friday - 2",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Plain Prantha with Soya Paneer Bhurji, Mysore Bonda, Aloo Bonda",
        sections: [
          { category: "North Indian", items: ["Plain Prantha with Soya Paneer Bhurji", "Aloo Bonda with Ketchup"] },
          { category: "South Indian", items: ["Mysore Bonda", "Peanut Chutney"] },
          { category: "Breads & Accompaniments", items: ["White Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Dal Palak, Soya Chaap Masala, Veg 65 / Cabbage 65, Jeera Rice",
        sections: [
          { category: "South Indian", items: ["Mysore Sambhar", "Veg 65 / Cabbage 65", "Plain Rice"] },
          { category: "North Indian", items: ["Dal Palak", "Soya Chaap Masala", "Jeera Rice"] },
          { category: "Curd & Raita", items: ["Plain Curd"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Fryums"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Kutchi Dabeli with Imly Chutney, Tea & Coffee",
        sections: [
          { category: "Snacks", items: ["Dabeli with Imly Chutney"] },
          { category: "Beverages", items: ["Tea", "Coffee"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Dal Makhni, Bhindi Masala, Kerala Urulai Roast, Gajar Ka Halwa",
        sections: [
          { category: "South Indian", items: ["Meal Maker Curry", "Kerala Urulai Roast", "Plain Rice"] },
          { category: "North Indian", items: ["Dal Makhni", "Bhindi Masala (Seasonal)", "Jeera Rice"] },
          { category: "Breads & Accompaniments", items: ["Roti and Ajwain Roti", "Green Salad"] },
          { category: "Dessert", items: ["Gajar Ka Halwa / Ice Cream"] },
        ],
      },
    },
  },

  Saturday: {
    dayName: "Saturday",
    dayShort: "SAT",
    weekNumber: 2,
    title: "Saturday - 2",
    meals: {
      breakfast: {
        id: "breakfast",
        name: "Breakfast",
        timing: "07:30 AM – 09:30 AM",
        highlight: "Stuffed Gobi/Onion Prantha, Indori Poha, Medu Vada with Sambhar",
        sections: [
          { category: "North Indian", items: ["Stuffed Gobi/Onion Prantha", "Packed Curd", "Indori Poha with Tomato Ketchup"] },
          { category: "South Indian", items: ["Medu Vada with Sambhar", "Peanut Chutney"] },
          { category: "Breads & Accompaniments", items: ["Brown Bread & Jam", "Butter (One Sachet)"] },
          { category: "Hot Beverages", items: ["Masala Tea", "Coffee", "Plain Milk"] },
        ],
      },
      lunch: {
        id: "lunch",
        name: "Lunch",
        timing: "11:30 AM – 03:00 PM",
        highlight: "Kadai Paneer, Rajma, Cabbage Pappu, Andhra Veg Biryani, Dahi Bhalla",
        sections: [
          { category: "South Indian", items: ["Cabbage Pappu", "Aloo Gadda Vepudu", "Andhra Veg Biryani"] },
          { category: "North Indian", items: ["Rajma", "Kadai Paneer", "Plain Rice"] },
          { category: "Curd & Raita", items: ["Dahi Bhalla"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Green Salad and Imly Chutney"] },
        ],
      },
      snacks: {
        id: "snacks",
        name: "Evening Snacks",
        timing: "05:00 PM – 06:30 PM",
        highlight: "Vegetable Hakka Noodles, Hot Tea & Refreshing Tang",
        sections: [
          { category: "Snacks", items: ["Hakka Noodles"] },
          { category: "Beverages", items: ["Tea", "Tang"] },
        ],
      },
      dinner: {
        id: "dinner",
        name: "Dinner",
        timing: "07:30 PM – 09:30 PM",
        highlight: "Panchratani Dal, Mix Veg, Arbi Pulusu, Bisi Bele Bath, Fruit Custard",
        sections: [
          { category: "South Indian", items: ["Pepper Rasam", "Arbi Pulusu (Seasonal)", "Bisi Bele Bath"] },
          { category: "North Indian", items: ["Panchratani Dal", "Mix Veg", "Plain Rice"] },
          { category: "Breads & Accompaniments", items: ["Roti", "Fryums"] },
          { category: "Dessert", items: ["Fruit Custard"] },
        ],
      },
    },
  },
};

// ==========================================
// ROTATION HELPER LOGIC
// ==========================================
// Base anchor: 2026-10-17 is Saturday - Week 1
// The week starts on Sunday. So Week 1 started on Sunday 2026-10-11.
export const BASE_WEEK_1_SUNDAY = new Date(2026, 9, 11); // October 11, 2026 (Month is 0-indexed: 9 = Oct)

export interface CalculatedDateInfo {
  date: Date;
  dateKey: string; // "YYYY-MM-DD"
  dayOfWeek: string; // "Sunday", "Monday", etc.
  dayShort: string; // "SUN", "MON", etc.
  dayOfMonth: number;
  monthName: string;
  year: number;
  weekNumber: 1 | 2;
  dayMenu: DayMenu;
  isToday: boolean;
}

export function formatDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function getMenuForDate(targetDate: Date, todayDate?: Date): CalculatedDateInfo {
  // Normalize dates to midnight UTC/local
  const normalizedTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const normalizedAnchor = new Date(BASE_WEEK_1_SUNDAY.getFullYear(), BASE_WEEK_1_SUNDAY.getMonth(), BASE_WEEK_1_SUNDAY.getDate());

  const diffTime = normalizedTarget.getTime() - normalizedAnchor.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // 14 days cycle: 0..6 is Week 1, 7..13 is Week 2
  const cycleIndex = ((diffDays % 14) + 14) % 14;
  const weekNumber: 1 | 2 = cycleIndex < 7 ? 1 : 2;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayShortNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const dayOfWeekIndex = normalizedTarget.getDay();
  const dayName = dayNames[dayOfWeekIndex];
  const dayShort = dayShortNames[dayOfWeekIndex];

  const menuWeek = weekNumber === 1 ? WEEK_1_MENU : WEEK_2_MENU;
  const dayMenu = menuWeek[dayName];

  // Compare with todayDate if provided
  const isToday = todayDate ? (
    normalizedTarget.getFullYear() === todayDate.getFullYear() &&
    normalizedTarget.getMonth() === todayDate.getMonth() &&
    normalizedTarget.getDate() === todayDate.getDate()
  ) : false;

  const dateKey = formatDateKey(normalizedTarget);

  return {
    date: normalizedTarget,
    dateKey,
    dayOfWeek: dayName,
    dayShort,
    dayOfMonth: normalizedTarget.getDate(),
    monthName: monthNames[normalizedTarget.getMonth()],
    year: normalizedTarget.getFullYear(),
    weekNumber,
    dayMenu,
    isToday,
  };
}

/**
 * Returns a 7-day or 14-day window of days around the current anchor date
 */
export function getUpcomingWeekDays(startDate: Date, count: number = 7, todayDate?: Date): CalculatedDateInfo[] {
  const result: CalculatedDateInfo[] = [];
  for (let i = 0; i < count; i++) {
    const nextDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    result.push(getMenuForDate(nextDate, todayDate));
  }
  return result;
}

// ==========================================
// LIVE MEAL TIMING & OPEN/CLOSED STATUS LOGIC
// ==========================================

export function parseTimeStringToMinutes(timeStr: string): number | null {
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3].toUpperCase();
  if (meridian === "PM" && hours !== 12) hours += 12;
  if (meridian === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function parseMealTimingRange(timingStr: string): { startMinutes: number; endMinutes: number } | null {
  const parts = timingStr.split(/[\u2013\u2014-]/);
  if (parts.length !== 2) return null;
  const startMinutes = parseTimeStringToMinutes(parts[0]);
  const endMinutes = parseTimeStringToMinutes(parts[1]);
  if (startMinutes === null || endMinutes === null) return null;
  return { startMinutes, endMinutes };
}

export type MealLiveStatus =
  | { status: "ongoing"; label: string; badgeType: "ongoing" }
  | { status: "upcoming"; label: string; badgeType: "upcoming"; minutesUntil: number }
  | { status: "closed"; label: string; badgeType: "closed" };

export function getMealLiveStatus(
  timingStr: string,
  currentMinutes: number,
  isToday: boolean
): MealLiveStatus {
  if (!isToday) {
    return { status: "closed", label: "Scheduled", badgeType: "closed" };
  }

  const range = parseMealTimingRange(timingStr);
  if (!range) {
    return { status: "closed", label: "Scheduled", badgeType: "closed" };
  }

  const { startMinutes, endMinutes } = range;

  // 1. Current time is between the timings of the meal: ONGOING
  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return {
      status: "ongoing",
      label: "Mess is Open • Meal Ongoing",
      badgeType: "ongoing",
    };
  }

  // 2. Current time is not during meal AND <= 30 min before meal start: UPCOMING
  const diffBeforeStart = startMinutes - currentMinutes;
  if (diffBeforeStart > 0 && diffBeforeStart <= 30) {
    return {
      status: "upcoming",
      label: `Upcoming Meal • Opens in ${diffBeforeStart}m`,
      badgeType: "upcoming",
      minutesUntil: diffBeforeStart,
    };
  }

  // 3. Current time is > 30 min before or after end: CLOSED
  return {
    status: "closed",
    label: "Mess is Closed",
    badgeType: "closed",
  };
}

export interface OverallMessStatus {
  status: "ongoing" | "upcoming" | "closed";
  label: string;
  activeMealName?: string;
  minutesUntil?: number;
}

export function getOverallMessStatus(
  meals: { name: string; timing: string }[],
  currentMinutes: number,
  isToday: boolean
): OverallMessStatus {
  if (!isToday) {
    return { status: "closed", label: "Scheduled Menu" };
  }

  // Check if any meal is ongoing
  for (const meal of meals) {
    const range = parseMealTimingRange(meal.timing);
    if (range && currentMinutes >= range.startMinutes && currentMinutes <= range.endMinutes) {
      return {
        status: "ongoing",
        label: `Mess is Open • ${meal.name} Ongoing`,
        activeMealName: meal.name,
      };
    }
  }

  // Check if any meal is upcoming within 30 minutes
  let nearestUpcoming: { name: string; minutesUntil: number } | null = null;
  for (const meal of meals) {
    const range = parseMealTimingRange(meal.timing);
    if (range) {
      const diff = range.startMinutes - currentMinutes;
      if (diff > 0 && diff <= 30) {
        if (!nearestUpcoming || diff < nearestUpcoming.minutesUntil) {
          nearestUpcoming = { name: meal.name, minutesUntil: diff };
        }
      }
    }
  }

  if (nearestUpcoming) {
    return {
      status: "upcoming",
      label: `Upcoming: ${nearestUpcoming.name} (Opens in ${nearestUpcoming.minutesUntil}m)`,
      activeMealName: nearestUpcoming.name,
      minutesUntil: nearestUpcoming.minutesUntil,
    };
  }

  return {
    status: "closed",
    label: "Mess is Closed",
  };
}

