import styles from "../student.module.css";

export default function StudentMenuPage() {
  return (
    <div className={styles.blankPageWrapper}>
      <div className={styles.blankHeader}>
        <h1 className={styles.pageTitle}>Menu</h1>
        <p className={styles.pageSubtitle}>Daily &amp; weekly mess meal schedule</p>
      </div>
      <div className={styles.blankCanvas} />
    </div>
  );
}
