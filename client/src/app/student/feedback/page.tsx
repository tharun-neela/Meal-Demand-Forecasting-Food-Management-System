import styles from "../student.module.css";

export default function FeedbackPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Feedback</h1>
        <p className={styles.pageSubtitle}>Rate food quality, taste, hygiene, and portions</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
