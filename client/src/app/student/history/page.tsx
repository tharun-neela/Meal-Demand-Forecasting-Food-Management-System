import styles from "../student.module.css";

export default function MealHistoryPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Meal History</h1>
        <p className={styles.pageSubtitle}>Past dining attendance and served meals</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
