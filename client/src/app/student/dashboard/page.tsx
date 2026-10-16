import styles from "../student.module.css";

export default function StudentDashboardPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>Student overview and meal services</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
