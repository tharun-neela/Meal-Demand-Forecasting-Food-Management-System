import styles from "../student.module.css";

export default function ComplaintsPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Raise Complaints</h1>
        <p className={styles.pageSubtitle}>Submit grievances directly to the mess administration</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
