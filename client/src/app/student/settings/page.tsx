import styles from "../student.module.css";

export default function StudentSettingsPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Settings</h1>
        <p className={styles.pageSubtitle}>Preferences, notification toggles, and account security</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
