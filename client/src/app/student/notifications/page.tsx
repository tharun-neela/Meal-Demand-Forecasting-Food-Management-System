import styles from "../student.module.css";

export default function NotificationsPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
        <p className={styles.pageSubtitle}>Mess announcements, special meal alerts, and updates</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
