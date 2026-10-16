import styles from "../student.module.css";

export default function AccessMealPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Access Meal</h1>
        <p className={styles.pageSubtitle}>Digital meal entry token &amp; QR verification</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
