import styles from "../student.module.css";

export default function MealAnalyticsPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Meal Analytics</h1>
        <p className={styles.pageSubtitle}>Personal attendance patterns &amp; food-waste statistics</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
