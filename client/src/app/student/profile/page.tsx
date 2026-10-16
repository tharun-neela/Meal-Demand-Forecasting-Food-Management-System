import styles from "../student.module.css";

export default function StudentProfilePage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Profile</h1>
        <p className={styles.pageSubtitle}>Student information, hostel details, and active mess allotment</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
