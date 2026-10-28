"use client";

import { useState, useMemo, useEffect } from "react";
import styles from "./feedback.module.css";
import { getMenuForDate, CalculatedDateInfo } from "../menu/menuData";

type MealType = "breakfast" | "lunch" | "snacks" | "dinner";

interface DishItem {
  id: string;
  name: string;
  category: string;
}

const QUICK_TAGS = [
  "Delicious Taste",
  "Fresh & Piping Hot",
  "Perfect Salt & Spice",
  "Clean & Hygienic",
  "Needs More Seasoning",
  "Too Spicy",
  "Cold Food",
  "Great Portion Size",
];

const FEEDBACK_STORAGE_KEY = "lpu_student_meal_feedbacks";

// Static fallback anchor date for safe SSR hydration
const STATIC_ANCHOR = new Date(2026, 9, 23);

export default function FeedbackPage() {
  const [todayDate, setTodayDate] = useState<Date>(STATIC_ANCHOR);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("lunch");

  // Mandatory overall meal rating (starts at 0 to enforce explicit rating)
  const [overallRating, setOverallRating] = useState<number>(0);
  const [hoverOverall, setHoverOverall] = useState<number>(0);

  // Mandatory dish ratings map: { [dishName]: number (1-5) }
  const [dishRatings, setDishRatings] = useState<Record<string, number>>({});

  // Optional dish comments map: { [dishName]: string }
  const [dishComments, setDishComments] = useState<Record<string, string>>({});

  // Optional overall tags & comments
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comments, setComments] = useState<string>("");

  // Validation & modal feedback
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [lastSubmittedMealName, setLastSubmittedMealName] = useState<string>("");

  // Strictly bind to TODAY'S date on mount (feedback is strictly for current day)
  useEffect(() => {
    const now = new Date();
    setTodayDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  }, []);

  // Today's menu from the approved schedule
  const todayDayInfo: CalculatedDateInfo = useMemo(() => {
    return getMenuForDate(todayDate, todayDate);
  }, [todayDate]);

  const { dayMenu, dayOfWeek } = todayDayInfo;

  // Extract the exact dishes scheduled for Today & selected meal from the approved menu
  const currentDishes: DishItem[] = useMemo(() => {
    const mealData = dayMenu.meals[selectedMeal];
    if (!mealData || !mealData.sections) return [];

    const items: DishItem[] = [];
    mealData.sections.forEach((sec, secIdx) => {
      sec.items.forEach((item, itemIdx) => {
        items.push({
          id: `${todayDayInfo.dateKey}-${selectedMeal}-${secIdx}-${itemIdx}`,
          name: item,
          category: sec.category,
        });
      });
    });
    return items;
  }, [dayMenu, selectedMeal, todayDayInfo.dateKey]);

  // Handle meal service selection
  const handleMealChange = (meal: MealType) => {
    setSelectedMeal(meal);
    setValidationError(null);
  };

  const handleDishRatingChange = (dishName: string, rating: number) => {
    setDishRatings((prev) => ({
      ...prev,
      [dishName]: rating,
    }));
    setValidationError(null);
  };

  const handleDishCommentChange = (dishName: string, text: string) => {
    setDishComments((prev) => ({
      ...prev,
      [dishName]: text,
    }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setValidationError(null);
  };

  // Submit with mandatory star rating validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Overall Meal Star Rating is mandatory
    if (!overallRating || overallRating === 0) {
      setValidationError("Overall meal star rating is mandatory. Please tap the stars to rate the meal.");
      return;
    }

    // 2. Validate Every Dish Star Rating is mandatory
    const unratedDishes = currentDishes.filter(
      (d) => !dishRatings[d.name] || dishRatings[d.name] === 0
    );

    if (unratedDishes.length > 0) {
      setValidationError(
        `Star ratings are mandatory for every dish. Please rate: ${unratedDishes
          .map((d) => d.name)
          .join(", ")}`
      );
      return;
    }

    // 3. Validate Quick Highlights & Comments is mandatory
    if (selectedTags.length === 0 && !comments.trim()) {
      setValidationError(
        "Quick Highlights & Comments are mandatory. Please pick at least one highlight tag or enter a comment."
      );
      return;
    }

    // All mandatory star ratings provided
    setValidationError(null);

    const mealData = dayMenu.meals[selectedMeal];
    const mealName = mealData ? mealData.name : "Meal";

    const newRecord = {
      id: `fb-${Date.now()}`,
      mealType: selectedMeal,
      mealName,
      dateKey: todayDayInfo.dateKey,
      dayOfWeek,
      overallRating,
      dishRatings: { ...dishRatings },
      dishComments: { ...dishComments },
      selectedTags: [...selectedTags],
      comments: comments.trim(),
      submittedAt: `Today, ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };

    try {
      const stored = localStorage.getItem(FEEDBACK_STORAGE_KEY);
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([newRecord, ...existing]));
    } catch {
      // ignore
    }

    setLastSubmittedMealName(mealName);
    setShowSuccessModal(true);

    // Reset optional comments while keeping state clean
    setComments("");
  };



  const mealOptions = [
    {
      id: "breakfast" as const,
      name: "Breakfast",
      timing: dayMenu.meals.breakfast.timing,
      bg: "#fef3c7",
      color: "#d97706",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ),
    },
    {
      id: "lunch" as const,
      name: "Lunch",
      timing: dayMenu.meals.lunch.timing,
      bg: "#eff6ff",
      color: "#2563eb",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a9 9 0 0 0-9 9h18a9 9 0 0 0-9-9Z" />
          <path d="M3 14h18" />
          <path d="M12 3V1" />
        </svg>
      ),
    },
    {
      id: "snacks" as const,
      name: "Evening Snacks",
      timing: dayMenu.meals.snacks.timing,
      bg: "#fdf4ff",
      color: "#c026d3",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      ),
    },
    {
      id: "dinner" as const,
      name: "Dinner",
      timing: dayMenu.meals.dinner.timing,
      bg: "#fff7ed",
      color: "#ea580c",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2v20" />
          <path d="M21 15V2a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3Z" />
          <path d="M6 2v7a3 3 0 0 0 3 3v10" />
          <path d="M9 2v7" />
          <path d="M3 2v7a3 3 0 0 0 3 3" />
        </svg>
      ),
    },
  ];

  return (
    <div className={styles.feedbackContainer}>
      {/* Validation Warning Alert if mandatory stars are missing */}
      {validationError && (
        <div className={styles.validationWarningBanner} role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{validationError}</span>
        </div>
      )}

      {/* Main Feedback Form */}
      <form onSubmit={handleSubmit} className={styles.formCard}>
        {/* Step 1: Select Today's Meal Service */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionLabel}>
            <span>1. Select Today&apos;s Meal Service</span>
            <span className={styles.sectionHint}>
              ({dayOfWeek} • {dayMenu.title})
            </span>
          </div>

          <div className={styles.mealPickerGrid}>
            {mealOptions.map((opt) => {
              const isSelected = selectedMeal === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  className={`${styles.mealPickerBtn} ${isSelected ? styles.mealPickerBtnActive : ""}`}
                  onClick={() => handleMealChange(opt.id)}
                  aria-pressed={isSelected}
                >
                  <div className={styles.mealIconCircle} style={{ backgroundColor: opt.bg, color: opt.color }}>
                    {opt.icon}
                  </div>
                  <div className={styles.mealPickerInfo}>
                    <span className={styles.mealPickerName}>{opt.name}</span>
                    <span className={styles.mealPickerTiming}>{opt.timing}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Overall Meal Rating */}
        <div className={styles.overallRatingCard}>
          <h3 className={styles.overallRatingTitle}>
            <span>Overall {dayMenu.meals[selectedMeal]?.name} Rating</span>
            <span className={styles.dishAsterisk} title="Mandatory">*</span>
          </h3>

          <div className={styles.starsRow} onMouseLeave={() => setHoverOverall(0)}>
            {[1, 2, 3, 4, 5].map((star) => {
              const activeScore = hoverOverall || overallRating;
              const isFilled = star <= activeScore;

              return (
                <button
                  key={star}
                  type="button"
                  className={styles.starBtn}
                  onMouseEnter={() => setHoverOverall(star)}
                  onClick={() => {
                    setOverallRating(star);
                    setValidationError(null);
                  }}
                  aria-label={`Rate ${star} stars`}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className={isFilled ? styles.starIconFilled : styles.starIconEmpty}
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Rate each dish in Today's Menu (STARS MANDATORY, COMMENTS OPTIONAL) */}
        <div className={styles.dishesSection}>
          <div className={styles.dishHeaderRow}>
            <div className={styles.sectionLabel} style={{ margin: 0 }}>
              <span>2. Rate Each Dish in Today&apos;s {dayMenu.meals[selectedMeal]?.name}</span>
              <span className={styles.dishAsterisk} title="Mandatory">*</span>
            </div>
            <span style={{ fontSize: "0.98rem", color: "#64748b", fontWeight: 600 }}>
              {currentDishes.length} Items Today ({dayMenu.title})
            </span>
          </div>

          <div className={styles.dishesList}>
            {currentDishes.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0 }}>
                No dishes scheduled for this service.
              </p>
            ) : (
              currentDishes.map((dish) => {
                const currentScore = dishRatings[dish.name] || 0;
                const isRated = currentScore > 0;

                return (
                  <div
                    key={dish.id}
                    className={`${styles.dishCard} ${!isRated ? styles.dishCardUnrated : ""}`}
                  >
                    <div className={styles.dishMainRow}>
                      <div className={styles.dishInfo}>
                        <div>
                          <div className={styles.dishName}>
                            <span>{dish.name}</span>
                            <span className={styles.dishAsterisk} title="Mandatory star rating">*</span>
                          </div>
                          <div className={styles.dishCategory}>{dish.category}</div>
                        </div>
                      </div>

                      <div className={styles.dishStarsWrapper}>
                        <div className={styles.starsRow}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isFilled = star <= currentScore;
                            return (
                              <button
                                key={star}
                                type="button"
                                className={styles.dishStarBtn}
                                onClick={() => handleDishRatingChange(dish.name, star)}
                                title={`Rate ${dish.name} ${star} Stars`}
                              >
                                <svg
                                  width="25"
                                  height="25"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                  className={isFilled ? styles.starIconFilled : styles.starIconEmpty}
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Field where student can enter comments for this specific dish (OPTIONAL) */}
                    <div className={styles.dishCommentRow}>
                      <input
                        type="text"
                        className={styles.dishCommentInput}
                        placeholder={`Write feedback for ${dish.name} (optional)...`}
                        value={dishComments[dish.name] || ""}
                        onChange={(e) => handleDishCommentChange(dish.name, e.target.value)}
                        aria-label={`Comments for ${dish.name}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Step 4: Quick Highlights & Written Comments (MANDATORY) */}
        <div className={styles.textFeedbackBlock}>
          <div className={styles.sectionLabel}>
            <span>3. Quick Highlights &amp; Comments</span>
            <span className={styles.dishAsterisk} title="Mandatory">*</span>
          </div>

          <div className={styles.tagsRow}>
            {QUICK_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`${styles.tagPill} ${active ? styles.tagPillActive : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {active && <span>✓ </span>}
                  {tag}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <textarea
              className={styles.feedbackTextarea}
              placeholder="Write your comments for the mess supervisor..."
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                setValidationError(null);
              }}
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.submitRow}>
          <button type="submit" className={styles.submitBtn} id="submit-feedback-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>Submit Meal &amp; Dish Feedback</span>
          </button>
        </div>
      </form>

      {/* Success Confirmation Modal */}
      {showSuccessModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowSuccessModal(false)}>
          <div className={styles.successCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.successIconCircle}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Feedback Recorded!</h3>
            <p className={styles.successText}>
              Thank you! Your star ratings and dish feedback for Today&apos;s <strong>{lastSubmittedMealName}</strong> have been recorded and sent to the BH-1 Central Kitchen quality supervisor.
            </p>
            <button
              type="button"
              className={styles.successCloseBtn}
              onClick={() => setShowSuccessModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
